
import pool from "../../../../services/db.js";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const folio = body.folio?.trim();

    if (!folio || folio.length > 50) {
      return Response.json(
        { error: "Ingresa un folio válido." },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `SELECT
        r.folio,
        r.descripcion,
        r.prioridad,
        r.direccion,
        r.fecha_creacion,
        e.nombre AS estado,
        c.nombre AS categoria,
        (
          SELECT ev.ruta_archivo
          FROM evidencias ev
          WHERE ev.reporte_id = r.id
          ORDER BY ev.fecha_creacion DESC, ev.id DESC
          LIMIT 1
        ) AS evidencia
       FROM reportes r
       INNER JOIN estados_reporte e ON e.id = r.estado_id
       LEFT JOIN categorias c ON c.id = r.categoria_id
       WHERE r.folio = ?
       LIMIT 1`,
      [folio]
    );

    if (rows.length === 0) {
      return Response.json(
        { error: "No se encontró un reporte con ese folio." },
        { status: 404 }
      );
    }

    return Response.json({
      reporte: {
        folio: rows[0].folio,
        title: rows[0].descripcion.split("\n\n")[0],
        description: rows[0].descripcion,
        location: rows[0].direccion,
        status: rows[0].estado,
        priority: rows[0].prioridad,
        category: rows[0].categoria,
        date: rows[0].fecha_creacion,
        evidencia: rows[0].evidencia,
      },
    });

  } catch (error) {
    console.error("Error al consultar seguimiento:", error);

    return Response.json(
      { error: "No fue posible consultar el reporte." },
      { status: 500 }
    );
  }
}
