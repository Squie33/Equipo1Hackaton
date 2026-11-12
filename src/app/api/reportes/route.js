import { randomBytes, createHash } from "node:crypto";
import pool from "../../../services/db.js";

export const runtime = "nodejs";

const categorias = {
  "Alumbrado público": 2,
  "Baches y vialidades": 1,
  "Fugas de agua": 3,
  "Recolección de basura": 4,
  "Espacios públicos": 5,
  "Otro problema": 5,
};

export async function POST(request) {
  let conexion;

  try {
    const body = await request.json();

    const { title, category, description, location } = body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !location?.trim() ||
      !categorias[category]
    ) {
      return Response.json(
        { error: "Completa todos los campos obligatorios." },
        { status: 400 }
      );
    }

    if (title.length > 100 || description.length > 1000 || location.length > 200) {
      return Response.json(
        { error: "Uno de los campos supera la longitud permitida." },
        { status: 400 }
      );
    }

    const folio = `C360-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
    const codigoSeguimiento = randomBytes(16).toString("hex");

    const codigoHash = createHash("sha256")
      .update(codigoSeguimiento)
      .digest("hex");

    const descripcionCompleta = `${title.trim()}\n\n${description.trim()}`;

    conexion = await pool.getConnection();
    await conexion.beginTransaction();

    const [resultado] = await conexion.execute(
      `INSERT INTO reportes
        (folio, codigo_seguimiento_hash, descripcion,
         categoria_id, estado_id, prioridad, direccion)
       VALUES (?, ?, ?, ?, 1, 'media', ?)`,
      [
        folio,
        codigoHash,
        descripcionCompleta,
        categorias[category],
        location.trim(),
      ]
    );

    await conexion.commit();

    return Response.json(
      {
        mensaje: "Reporte registrado correctamente.",
        folio,
        codigoSeguimiento,
        id: resultado.insertId,
      },
      { status: 201 }
    );

  } catch (error) {
    if (conexion) {
      await conexion.rollback();
    }

    console.error("Error al registrar reporte:", error);

    return Response.json(
      { error: "No fue posible registrar el reporte." },
      { status: 500 }
    );

  } finally {
    if (conexion) {
      conexion.release();
    }
  }
}
