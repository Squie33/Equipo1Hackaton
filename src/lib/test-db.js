import pool from "./db.js";
async function testConnection() {
  try {
    const [rows] = await pool.execute(
      "SELECT DATABASE() AS base_datos, NOW() AS fecha"
    );

    console.log("Conexión exitosa:", rows[0]);
  } catch (error) {
    console.error("Error de conexión:", error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
