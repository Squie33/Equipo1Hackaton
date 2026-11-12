import { GoogleGenAI } from "@google/genai";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, unlink } from "node:fs/promises";
import crypto from "node:crypto";
import pool from "../../../../services/db.js";

const execFileAsync = promisify(execFile);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === (process.env.WHATSAPP_VERIFY_TOKEN || "veracruz360_verify")) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

async function analizarAudioConRespaldo(prompt, base64Audio, cleanMime) {
  const modelos = [
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview",
  ];
  let ultimoError;

  for (const modeloActual of modelos) {
    try {
      const res = await ai.models.generateContent({
        model: modeloActual,
        contents: [
          { text: prompt },
          { inlineData: { data: base64Audio, mimeType: cleanMime } },
        ],
        config: { responseMimeType: "application/json" },
      });
      return { res, modeloUsado: modeloActual };
    } catch (err) {
      ultimoError = err;
      const status = err?.status || err?.code;
      console.warn(`Modelo ${modeloActual} no disponible (status ${status}), probando siguiente respaldo...`);
      if (status === 404 || status === 503 || status === 429) {
        continue;
      }
      throw err;
    }
  }
  throw ultimoError;
}

async function procesarNotaDeVoz(message) {
  let conexion;
  try {
    const remitente = message.from;
    const mediaId = message.audio.id;
    const mimeType = message.audio.mime_type || "audio/ogg";

    const metaMediaRes = await fetch(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    });
    const metaMediaData = await metaMediaRes.json();

    const audioBinRes = await fetch(metaMediaData.url, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
    });
    const audioBuffer = Buffer.from(await audioBinRes.arrayBuffer());

    const [categoriasRows] = await pool.query("SELECT id, nombre FROM categorias ORDER BY id ASC");
    const listaCategorias = categoriasRows.map((c) => `${c.id}: ${c.nombre}`).join(" | ");
    const defaultCatId = categoriasRows[0]?.id || 1;

    const prompt = `
      Eres el asistente ciudadano de VERACRUZ360. Escucha esta nota de voz enviada por una persona adulta mayor.
      Catálogo de categorías disponibles (ID: Nombre): ${listaCategorias}
      Extrae los datos del reporte urbano y responde ÚNICAMENTE con un JSON válido con esta estructura:
      {
        "es_reporte_valido": true,
        "categoria_id": ${defaultCatId},
        "titulo": "Resumen breve del problema (máx 60 caracteres)",
        "descripcion": "Descripción clara basada en lo que dijo la persona",
        "direccion": "Calle, colonia o referencia mencionada (si no dijo, pon 'Ubicación reportada por voz - Veracruz, Ver.')",
        "prioridad": "alta | media | baja",
        "confianza": 0.92,
        "respuesta_voz": "Mensaje corto, cálido, respetuoso y muy claro (máximo 35 palabras) confirmando que ya se registró su reporte, mencionando el problema y qué área lo atenderá."
      }
      Si el audio no se entiende o no es un reporte ciudadano, pon "es_reporte_valido": false y en "respuesta_voz" pídele amablemente que vuelva a enviar su nota de voz indicando qué problema hay y en qué calle o colonia se encuentra.
    `;

    const { res: aiRes, modeloUsado } = await analizarAudioConRespaldo(
      prompt,
      audioBuffer.toString("base64"),
      mimeType.split(";")[0]
    );

    const datos = JSON.parse(aiRes.text);
    let textoFinalVoz = datos.respuesta_voz;

    if (datos.es_reporte_valido) {
      const sufijo = Math.floor(1000 + Math.random() * 9000);
      const folio = `VER-VOZ-${sufijo}`;
      const codigoPlano = crypto.randomBytes(4).toString("hex").toUpperCase();
      const codigoHash = crypto.createHash("sha256").update(codigoPlano).digest("hex");

      const catValida = categoriasRows.some((c) => c.id === Number(datos.categoria_id))
        ? Number(datos.categoria_id)
        : defaultCatId;

      const prioridadValida = ["alta", "media", "baja"].includes(datos.prioridad)
        ? datos.prioridad
        : "media";

      const descripcionCompleta = `[Reporte por Nota de Voz WhatsApp] ${datos.titulo}: ${datos.descripcion}`;

      conexion = await pool.getConnection();
      await conexion.beginTransaction();

      const [resultado] = await conexion.execute(
        `INSERT INTO reportes
          (
            folio,
            codigo_seguimiento_hash,
            correo_reportante,
            telefono_reportante,
            descripcion,
            categoria_id,
            estado_id,
            prioridad,
            latitud,
            longitud,
            direccion,
            consentimiento_whatsapp,
            fecha_consentimiento_whatsapp
          )
         VALUES (?, ?, NULL, ?, ?, ?, 1, ?, 19.2006, -96.1385, ?, 1, NOW())`,
        [
          folio,
          codigoHash,
          `+${remitente}`,
          descripcionCompleta,
          catValida,
          prioridadValida,
          datos.direccion || "Reportado por voz - Veracruz, Ver.",
        ]
      );

      await conexion.execute(
        `INSERT INTO analisis_ia
          (
            reporte_id,
            categoria_predicha_id,
            prioridad_sugerida,
            nivel_confianza,
            motivo,
            modelo_utilizado,
            resultado_json
          )
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          resultado.insertId,
          catValida,
          prioridadValida,
          datos.confianza || 0.9,
          "Clasificación multimodal desde nota de voz ciudadana (WhatsApp)",
          modeloUsado,
          JSON.stringify(datos),
        ]
      );

      await conexion.commit();
      conexion.release();
      conexion = null;

      textoFinalVoz = `Hola, muchas gracias por comunicarse con Veracruz 360. ${datos.respuesta_voz} Su número de folio es ${folio.replace(/-/g, " ")}.`;
      console.log(`Reporte por voz guardado con éxito: ${folio} (modelo: ${modeloUsado})`);
    }

    const rutaMp3 = `/tmp/resp_${Date.now()}.mp3`;
    await execFileAsync("/home/raul/.local/bin/edge-tts", [
      "--voice",
      "es-MX-DaliaNeural",
      "--text",
      textoFinalVoz,
      "--write-media",
      rutaMp3,
    ]);

    const mp3Buffer = await readFile(rutaMp3);
    await unlink(rutaMp3).catch(() => {});

    const formData = new FormData();
    formData.append("messaging_product", "whatsapp");
    formData.append("file", new Blob([mp3Buffer], { type: "audio/mpeg" }), "respuesta.mp3");

    const uploadRes = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
        body: formData,
      }
    );
    const uploadData = await uploadRes.json();
    console.log("Respuesta upload media Meta:", JSON.stringify(uploadData));
    if (!uploadData.id) throw new Error("Error subiendo audio a Meta: " + JSON.stringify(uploadData));

    const enviarAudioA = async (numeroDestino) => {
      const r = await fetch(
        `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: numeroDestino,
            type: "audio",
            audio: { id: uploadData.id },
          }),
        }
      );
      return r.json();
    };

    let sendData = await enviarAudioA(remitente);
    if (sendData?.error?.code === 131030 && remitente.startsWith("521")) {
      const sinUno = "52" + remitente.slice(3);
      console.warn(`Reintentando envío sin '1' móvil (${sinUno})...`);
      sendData = await enviarAudioA(sinUno);
    }
    console.log("Respuesta envío mensaje Meta:", JSON.stringify(sendData));
  } catch (error) {
    if (conexion) {
      await conexion.rollback().catch(() => {});
      conexion.release();
    }
    console.error("Error procesando audio WhatsApp:", error);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message || message.type !== "audio") {
      return Response.json({ status: "ignored" }, { status: 200 });
    }

    // Responder 200 OK de inmediato a Meta y procesar en segundo plano
    procesarNotaDeVoz(message);
    return Response.json({ status: "processing" }, { status: 200 });
  } catch (error) {
    console.error("Error parseando payload webhook:", error);
    return Response.json({ status: "error" }, { status: 200 });
  }
}
