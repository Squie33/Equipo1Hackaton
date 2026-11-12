
import { randomBytes, createHash } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import pool from "../../../services/db.js";
import { evaluarReporteCiudadano } from "../../../services/ai/aiService.js";
import { enviarCorreoConfirmacion, enviarWhatsAppConfirmacion } from "../../../services/notificaciones.js";

export const runtime = "nodejs";

const categorias = {
  "Alumbrado público": 2,
  "Baches y vialidades": 1,
  "Agua y drenaje": 3,
  "Limpieza pública": 4,
  "Espacios públicos": 5,
  "Señalización": 5,
  "Otro": 5,
};

const MAPA_CATEGORIA_IA_ID = {
  BACHES: 1,
  ALUMBRADO: 2,
  FUGAS: 3,
  BASURA: 4,
  OTRO: 5,
};

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANO_MAXIMO = 20 * 1024 * 1024;

export async function POST(request) {
  let conexion;
  let rutaArchivo;

  try {
    const formData = await request.formData();

    const title = String(formData.get("title") || "").trim();
    const category = String(formData.get("category") || "");
    const description = String(formData.get("description") || "").trim();
    const location = String(formData.get("location") || "").trim();

// Datos de contacto del ciudadano
const email = String(formData.get("email") || "").trim();
const telefono = String(formData.get("phone") || "").trim();
const whatsappConsent = formData.get("whatsapp_consent") === "1";

    const latitudTexto = formData.get("latitud");
    const longitudTexto = formData.get("longitud");
    const foto = formData.get("photo");

    // Validar campos obligatorios.
    if (!title || !description || !location || !categorias[category]) {
      return Response.json(
        { error: "Completa todos los campos obligatorios." },
        { status: 400 }
      );
    }

    // Validar correo electrónico.
    if (
      email.length > 150 ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      return Response.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // Validar teléfono en formato internacional E.164.
    if (
      telefono.length > 20 ||
      (telefono && !/^\+[1-9]\d{7,14}$/.test(telefono))
    ) {
      return Response.json(
        { error: "El teléfono debe incluir el código de país. Ejemplo: +522291234567." },
        { status: 400 }
      );
    }

    // No permitir consentimiento sin un teléfono válido.
    if (whatsappConsent && !telefono) {
      return Response.json(
        { error: "Debes proporcionar un teléfono para recibir notificaciones por WhatsApp." },
        { status: 400 }
      );
    }

    if (title.length > 100 || description.length > 1500 || location.length > 250) {
      return Response.json(
        { error: "Uno de los campos supera la longitud permitida." },
        { status: 400 }
      );
    }

    if (!foto || typeof foto.arrayBuffer !== "function" || foto.size === 0) {
      return Response.json(
        { error: "Debes adjuntar una fotografía del problema." },
        { status: 400 }
      );
    }

    if (!TIPOS_PERMITIDOS.includes(foto.type)) {
      return Response.json(
        { error: "La fotografía debe ser JPG, PNG o WEBP." },
        { status: 400 }
      );
    }

    if (foto.size > TAMANO_MAXIMO) {
      return Response.json(
        { error: "La fotografía no puede superar los 5 MB." },
        { status: 400 }
      );
    }

    let latitud = null;
    let longitud = null;

    if (latitudTexto !== null && longitudTexto !== null) {
      latitud = Number(latitudTexto);
      longitud = Number(longitudTexto);

      if (
        !Number.isFinite(latitud) ||
        !Number.isFinite(longitud) ||
        latitud < -90 ||
        latitud > 90 ||
        longitud < -180 ||
        longitud > 180
      ) {
        return Response.json(
          { error: "Las coordenadas GPS no son válidas." },
          { status: 400 }
        );
      }
    }

    const buffer = Buffer.from(await foto.arrayBuffer());
    const descripcionCompleta = `${title}\n\n${description}`;

    const evaluacionIA = await evaluarReporteCiudadano({
      descripcion: descripcionCompleta,
      imagenes: [buffer.toString("base64")],
      mimeType: foto.type,
      reportesCercanos: 0,
    });

    if (evaluacionIA.es_valido === false || evaluacionIA.coincide_imagen_texto === false) {
      return Response.json(
        {
          success: false,
          rechazado_por_ia: true,
          error: evaluacionIA.motivo_validacion || "La imagen no corresponde con la descripción del reporte.",
          analisis_ia: evaluacionIA,
        },
        { status: 422 }
      );
    }

    const folio = `C360-${Date.now()}-${randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const codigo = randomBytes(4).toString("hex").toUpperCase();
    const codigoHash = createHash("sha256").update(codigo).digest("hex");

    const extension = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    }[foto.type];

    const nombreArchivo = `${randomBytes(16).toString("hex")}${extension}`;
    const directorio = path.join(process.cwd(), "public", "imagenes");
    rutaArchivo = path.join(directorio, nombreArchivo);

    await mkdir(directorio, { recursive: true });
    await writeFile(rutaArchivo, buffer, { flag: "wx" });

    const categoriaFinalId = MAPA_CATEGORIA_IA_ID[evaluacionIA.categoria] || categorias[category];
    const prioridadFinal = (evaluacionIA.prioridad_nivel || "MEDIA").toLowerCase();

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
   VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, IF(?, NOW(), NULL))`,
  [
    folio,
    codigoHash,
    email || null,
    telefono || null,
    descripcionCompleta,
    categoriaFinalId,
    prioridadFinal,
    latitud,
    longitud,
    location,
    whatsappConsent ? 1 : 0,
    whatsappConsent ? 1 : 0,
  ]
);

    await conexion.execute(
      `INSERT INTO evidencias
        (reporte_id, ruta_archivo, nombre_archivo, tipo_mime)
       VALUES (?, ?, ?, ?)`,
      [
        resultado.insertId,
        `/imagenes/${nombreArchivo}`,
        foto.name || nombreArchivo,
        foto.type,
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
        categoriaFinalId,
        prioridadFinal,
        evaluacionIA.confianza_coincidencia || 0.9,
        evaluacionIA.motivo_validacion,
        "gemini-3-flash-preview",
        JSON.stringify(evaluacionIA),
      ]
    );

    await conexion.commit();

    try {
      const resultadosNotif = await Promise.allSettled([
        email
          ? enviarCorreoConfirmacion({
              to: email,
              folio,
              codigo,
              titulo: title,
              categoria: category,
              prioridad: prioridadFinal,
              ubicacion: location,
            })
          : Promise.resolve(),
        whatsappConsent && telefono
          ? enviarWhatsAppConfirmacion({
              to: telefono,
              folio,
              codigo,
              categoria: category,
              prioridad: prioridadFinal,
              ubicacion: location,
            })
          : Promise.resolve(),
      ]);
    } catch (notifErr) {
      console.error("Error al despachar notificaciones:", notifErr);
    }

    return Response.json(
      {
        success: true,
        mensaje: evaluacionIA.mensaje_para_ciudadano || "Reporte validado y registrado correctamente.",
        id: resultado.insertId,
        folio,
        codigo,
        prioridad: prioridadFinal,
        categoria_id: categoriaFinalId,
        evidencia: `/imagenes/${nombreArchivo}`,
        ubicacion: {
          latitud,
          longitud,
        },
        analisis_ia: evaluacionIA,
      },
      { status: 201 }
    );
  } catch (error) {
    if (conexion) {
      try {
        await conexion.rollback();
      } catch (rollbackError) {
        console.error("Error al revertir transacción:", rollbackError);
      }
    }

    if (rutaArchivo) {
      try {
        await unlink(rutaArchivo);
      } catch {
        // El archivo puede no haberse creado.
      }
    }

    console.error("Error al registrar reporte:", error);

    return Response.json(
      { error: "No fue posible registrar el reporte." },
      { status: 500 }
    );
  } finally {
    if (conexion) conexion.release();
  }
}
