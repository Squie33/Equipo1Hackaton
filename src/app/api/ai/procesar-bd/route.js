import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import pool from "../../../../services/db.js";
import { evaluarReporteCiudadano } from "../../../../services/ai/aiService.js";

const MAPA_CATEGORIA_IA_ID = {
  BACHES: 1,
  ALUMBRADO: 2,
  FUGAS: 3,
  BASURA: 4,
  OTRO: 5,
};

export async function POST(request) {
  try {
    const { reporte_id, folio } = await request.json();

    if (!reporte_id && !folio) {
      return NextResponse.json({ error: "Envía 'reporte_id' o 'folio'." }, { status: 400 });
    }

    const [rows] = await pool.query(
      reporte_id ? "SELECT * FROM reportes WHERE id = ? LIMIT 1" : "SELECT * FROM reportes WHERE folio = ? LIMIT 1",
      [reporte_id || folio]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Reporte no encontrado." }, { status: 404 });
    }

    const reporte = rows[0];

    const [evidencias] = await pool.query(
      "SELECT ruta_archivo, tipo_mime FROM evidencias WHERE reporte_id = ?",
      [reporte.id]
    );

    const imagenesBase64 = [];
    let mimePrincipal = "image/jpeg";

    for (const ev of evidencias) {
      const limpia = ev.ruta_archivo.replace(/^\/+/, "");
      const rutaAbs = path.join(process.cwd(), "public", limpia);
      if (fs.existsSync(rutaAbs)) {
        imagenesBase64.push(fs.readFileSync(rutaAbs).toString("base64"));
        if (ev.tipo_mime) mimePrincipal = ev.tipo_mime;
      }
    }

    const evaluacionIA = await evaluarReporteCiudadano({
      descripcion: reporte.descripcion,
      imagenes: imagenesBase64,
      mimeType: mimePrincipal,
      reportesCercanos: 0,
    });

    const categoriaFinalId = MAPA_CATEGORIA_IA_ID[evaluacionIA.categoria] || reporte.categoria_id;
    const prioridadFinal = (evaluacionIA.prioridad_nivel || "MEDIA").toLowerCase();

    await pool.query(
      "UPDATE reportes SET categoria_id = ?, prioridad = ? WHERE id = ?",
      [categoriaFinalId, prioridadFinal, reporte.id]
    );

    await pool.query(
      `INSERT INTO analisis_ia
        (reporte_id, categoria_predicha_id, prioridad_sugerida, nivel_confianza, motivo, modelo_utilizado, resultado_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        reporte.id,
        categoriaFinalId,
        prioridadFinal,
        evaluacionIA.confianza_coincidencia || 0.9,
        evaluacionIA.motivo_validacion,
        "gemini-3-flash-preview",
        JSON.stringify(evaluacionIA),
      ]
    );

    return NextResponse.json({
      success: true,
      reporte_id: reporte.id,
      folio: reporte.folio,
      imagenes_leidas: imagenesBase64.length,
      prioridad_asignada: prioridadFinal,
      categoria_id: categoriaFinalId,
      analisis_ia: evaluacionIA,
    });
  } catch (error) {
    console.error("Error en /api/ai/procesar-bd:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
