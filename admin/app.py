import os
from flask import Flask, jsonify, request, send_from_directory
from flask_mysqldb import MySQL
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

app = Flask(__name__)

app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'ciudad360_app')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', '1234')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'ciudad360')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

@app.route('/')
def index():
    mapa_dir = os.path.abspath(os.path.join(BASE_DIR, '..', 'mapa'))
    return send_from_directory(mapa_dir, 'mapa.html')

@app.route('/api/healthcheck', methods=['GET'])
def healthcheck():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT 1 AS status")
        result = cur.fetchone()
        cur.close()
        return jsonify({"status": "OK", "message": "Conexión a MariaDB ciudad360 exitosa", "db_response": result}), 200
    except Exception as e:
        return jsonify({"status": "Error", "message": str(e)}), 500

@app.route('/api/reportes/resumen', methods=['GET'])
def obtener_resumen():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT 
                COUNT(*) AS total,
                SUM(CASE WHEN estado_id = 1 THEN 1 ELSE 0 END) AS pendientes,
                SUM(CASE WHEN estado_id = 2 THEN 1 ELSE 0 END) AS en_atencion,
                SUM(CASE WHEN estado_id = 3 THEN 1 ELSE 0 END) AS resueltos
            FROM reportes
        """)
        resumen = cur.fetchone()
        cur.close()
        return jsonify(resumen), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reportes', methods=['GET'])
def obtener_reportes():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT 
                r.folio, 
                COALESCE(c.nombre, 'Sin Categoría') AS categoria, 
                r.prioridad, 
                COALESCE(e.nombre, 'Pendiente') AS estado, 
                r.fecha_creacion AS fecha, 
                r.latitud, 
                r.longitud,
                COALESCE(d.nombre, 'Sin Asignar') AS dependencia_asignada,
                r.descripcion AS comentario
            FROM reportes r
            LEFT JOIN categorias c ON r.categoria_id = c.id
            LEFT JOIN estados_reporte e ON r.estado_id = e.id
            LEFT JOIN dependencias d ON r.dependencia_actual_id = d.id
            ORDER BY r.fecha_creacion DESC
        """)
        reportes = cur.fetchall()
        cur.close()
        return jsonify(reportes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reportes/<string:folio>', methods=['PUT'])
def actualizar_reporte(folio):
    try:
        datos = request.get_json()
        nuevo_estado_id = datos.get('estado_id')

        cur = mysql.connection.cursor()
        cur.execute("""
            UPDATE reportes 
            SET estado_id = %s
            WHERE folio = %s
        """, (nuevo_estado_id, folio))
        mysql.connection.commit()
        cur.close()
        
        return jsonify({"message": f"Reporte {folio} actualizado correctamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
