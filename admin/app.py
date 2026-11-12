
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_mysqldb import MySQL
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "ciudad360-clave-local")

# Configuración MySQL
app.config["MYSQL_HOST"] = os.getenv("DB_HOST", "localhost")
app.config["MYSQL_USER"] = os.getenv("DB_USER", "ciudad360_app")
app.config["MYSQL_PASSWORD"] = os.getenv("DB_PASSWORD")
app.config["MYSQL_DB"] = os.getenv("DB_NAME", "ciudad360")
app.config["MYSQL_CURSORCLASS"] = "DictCursor"

mysql = MySQL(app)

ESTADOS = ["Recibido", "En atención", "Resuelto"]


# Panel principal
@app.route("/")
def dashboard():
    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT * FROM reportes
        ORDER BY fecha_creacion DESC
    """)
    reportes = cur.fetchall()

    cur.execute("""
        SELECT
            COUNT(*) AS total,
            SUM(estado = 'Recibido') AS recibidos,
            SUM(estado = 'En atención') AS en_atencion,
            SUM(estado = 'Resuelto') AS resueltos,
            SUM(prioridad = 'Urgente') AS urgentes
        FROM reportes
    """)
    estadisticas = cur.fetchone()

    cur.close()

    return render_template(
        "dashboard.html",
        reportes=reportes,
        estadisticas=estadisticas
    )


# Actualizar estado de un reporte
@app.route("/actualizar/<int:id>", methods=["POST"])
def actualizar(id):
    nuevo_estado = request.form.get("estado")

    if nuevo_estado not in ESTADOS:
        flash("Estado no válido", "error")
        return redirect(url_for("dashboard"))

    cur = mysql.connection.cursor()

    cur.execute(
        "UPDATE reportes SET estado = %s WHERE id = %s",
        (nuevo_estado, id)
    )

    mysql.connection.commit()
    cur.close()

    flash("Reporte actualizado correctamente", "success")

    return redirect(url_for("dashboard"))


# Consultar estadísticas en formato JSON
@app.route("/api/estadisticas")
def api_estadisticas():
    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT
            estado,
            COUNT(*) AS total
        FROM reportes
        GROUP BY estado
    """)

    datos = cur.fetchall()
    cur.close()

    return jsonify(datos)


# Consultar reportes en formato JSON
@app.route("/api/reportes")
def api_reportes():
    cur = mysql.connection.cursor()

    cur.execute("""
        SELECT id, folio, titulo, categoria,
               prioridad, estado, ubicacion,
               latitud, longitud, fecha_creacion
        FROM reportes
        ORDER BY fecha_creacion DESC
    """)

    reportes = cur.fetchall()
    cur.close()

    return jsonify(reportes)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
