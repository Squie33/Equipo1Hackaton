import { createHash, timingSafeEqual } from "node:crypto";
import pool from "../../../../services/db.js";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const folio = body.folio?.trim();
    const codigo = body.codigo?.trim();

    if (!folio || !codigo || folio.length > 50 || codigo.length > 100) {
      return Response.json(
        { error: "Ingresa un folio y un código válidos." },
        { status: 400 }
      );
    }

    const codigoHash = createHash("sha256")
      .update(codigo)
      .digest("hex");

    const [rows] = await pool.execute(
  `SELECT
    r.folio,
    r.descripcion,
    r.prioridad,
    r.direccion,
    r.fecha_creacion,
    e.nombre AS estado,
    c.nombre AS categoria
   FROM reportes r
   INNER JOIN estados_reporte e ON e.id = r.estado_id
   LEFT JOIN categorias c ON c.id = r.categoria_id
   WHERE r.folio = ?
   LIMIT 1`,
  [folio]
);

    if (rows.length === 0) {
      return Response.json(
        { error: "Folio o código de seguimiento incorrectos." },
        { status: 404 }
      );
    }

    const [hashRows] = await pool.execute(
      `SELECT codigo_seguimiento_hash
       FROM reportes
       WHERE folio = ?
       LIMIT 1`,
      [folio]
    );

    const hashGuardado = Buffer.from(
      hashRows[0].codigo_seguimiento_hash,
      "hex"
    );

    const hashRecibido = Buffer.from(codigoHash, "hex");

    if (
      hashGuardado.length !== hashRecibido.length ||
      !timingSafeEqual(hashGuardado, hashRecibido)
    ) {
      return Response.json(
        { error: "Folio o código de seguimiento incorrectos." },
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
        date: rows[0].fecha_creacion,
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
