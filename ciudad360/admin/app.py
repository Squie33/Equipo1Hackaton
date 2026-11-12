import os
import math
from flask import Flask, jsonify, request, send_from_directory, redirect
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

app = Flask(__name__)
CORS(app)

app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'ciudad360_app')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', '1234')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'ciudad360')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

IMAGENES_DIR = '/var/www/html/Hackaton/public/imagenes'

mysql = MySQL(app)

def borrar_archivo_fisico(ruta_archivo):
    if not ruta_archivo:
        return
    nombre_archivo = os.path.basename(ruta_archivo)
    ruta_fisica = os.path.join(IMAGENES_DIR, nombre_archivo)
    if os.path.isfile(ruta_fisica):
        try:
            os.remove(ruta_fisica)
        except Exception as e:
            print(f"No se pudo borrar {ruta_fisica}: {e}")

def calcular_distancia_metros(lat1, lon1, lat2, lon2):
    radio_tierra_m = 6371000.0
    phi1 = math.radians(float(lat1))
    phi2 = math.radians(float(lat2))
    dphi = math.radians(float(lat2) - float(lat1))
    dlambda = math.radians(float(lon2) - float(lon1))
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return radio_tierra_m * c

@app.route('/')
def inicio_redirigir():
    return redirect('/panel-de-control', code=302)

@app.route('/panel-de-control')
@app.route('/panel de control')
def panel_de_control():
    mapa_dir = os.path.abspath(os.path.join(BASE_DIR, '..', 'mapa'))
    return send_from_directory(mapa_dir, 'mapa.html')

@app.route('/imagenes/<path:filename>')
def servir_imagen(filename):
    return send_from_directory(IMAGENES_DIR, filename)

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
                r.id,
                r.folio,
                COALESCE(c.nombre, 'Sin Categoría') AS categoria,
                r.prioridad AS prioridad_original,
                r.estado_id,
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
        reportes = list(cur.fetchall())

        # Calcular densidad de puntos en un radio de 30 metros
        for r in reportes:
            if r.get('latitud') is not None and r.get('longitud') is not None:
                cercanos = 0
                for otro in reportes:
                    if otro.get('latitud') is not None and otro.get('longitud') is not None:
                        # Contar puntos activos (no resueltos) dentro de 30 metros
                        if otro.get('estado_id') != 3 or otro['id'] == r['id']:
                            dist = calcular_distancia_metros(r['latitud'], r['longitud'], otro['latitud'], otro['longitud'])
                            if dist <= 100.0:
                                cercanos += 1
                r['reportes_cercanos_30m'] = cercanos
                if cercanos >= 16:
                    r['prioridad'] = 'Prioritario'
                    r['nivel_prioridad'] = 'alta'
                elif cercanos >= 6:
                    r['prioridad'] = 'Medio prioritario'
                    r['nivel_prioridad'] = 'media'
                elif cercanos >= 3:
                    r['prioridad'] = 'Poco prioritario'
                    r['nivel_prioridad'] = 'baja'
                else:
                    r['prioridad'] = 'Poco prioritario'
                    r['nivel_prioridad'] = 'baja'
            else:
                r['reportes_cercanos_30m'] = 1
                r['prioridad'] = 'Poco prioritario'
                r['nivel_prioridad'] = 'baja'

        # Ordenar primero los más prioritarios y luego por fecha más reciente
        orden_nivel = {'alta': 1, 'media': 2, 'baja': 3}
        reportes.sort(key=lambda x: orden_nivel.get(x['nivel_prioridad'], 3))

        try:
            cur.execute("SELECT id, reporte_id, ruta_archivo FROM evidencias ORDER BY id ASC")
            evidencias = cur.fetchall()
            fotos_por_reporte = {}
            for ev in evidencias:
                rid = ev.get('reporte_id')
                ruta = ev.get('ruta_archivo')
                if rid and ruta:
                    fotos_por_reporte.setdefault(rid, []).append(ruta)

            for r in reportes:
                lista_fotos = fotos_por_reporte.get(r['id'], [])
                r['foto_url'] = lista_fotos[0] if lista_fotos else None
                r['todas_las_fotos'] = '||'.join(lista_fotos)
        except Exception:
            for r in reportes:
                r['foto_url'] = None
                r['todas_las_fotos'] = ''

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

@app.route('/api/reportes/<string:folio>/eliminar-foto', methods=['DELETE'])
def eliminar_foto_reporte(folio):
    try:
        datos = request.get_json(silent=True) or {}
        ruta_objetivo = datos.get('ruta_archivo')

        cur = mysql.connection.cursor()
        cur.execute("SELECT id FROM reportes WHERE folio = %s", (folio,))
        rep = cur.fetchone()
        if not rep:
            cur.close()
            return jsonify({"error": "Reporte no encontrado"}), 404

        reporte_id = rep['id']

        if ruta_objetivo:
            cur.execute("SELECT id, ruta_archivo FROM evidencias WHERE reporte_id = %s AND ruta_archivo = %s", (reporte_id, ruta_objetivo))
        else:
            cur.execute("SELECT id, ruta_archivo FROM evidencias WHERE reporte_id = %s", (reporte_id,))

        evidencias = cur.fetchall()
        for ev in evidencias:
            borrar_archivo_fisico(ev.get('ruta_archivo'))
            cur.execute("DELETE FROM evidencias WHERE id = %s", (ev['id'],))

        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Fotografía eliminada correctamente de la raíz y la base de datos"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reportes/<string:folio>', methods=['DELETE'])
def eliminar_reporte_completo(folio):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT id FROM reportes WHERE folio = %s", (folio,))
        rep = cur.fetchone()
        if not rep:
            cur.close()
            return jsonify({"error": "Reporte no encontrado"}), 404

        reporte_id = rep['id']

        cur.execute("SELECT id, ruta_archivo FROM evidencias WHERE reporte_id = %s", (reporte_id,))
        evidencias = cur.fetchall()
        for ev in evidencias:
            borrar_archivo_fisico(ev.get('ruta_archivo'))

        cur.execute("DELETE FROM evidencias WHERE reporte_id = %s", (reporte_id,))

        for tabla_hija in ['historial_reportes', 'seguimiento_reportes', 'comentarios_reporte']:
            try:
                cur.execute(f"DELETE FROM {tabla_hija} WHERE reporte_id = %s", (reporte_id,))
            except Exception:
                pass

        cur.execute("DELETE FROM reportes WHERE id = %s", (reporte_id,))
        mysql.connection.commit()
        cur.close()

        return jsonify({"message": f"Reporte {folio} y sus archivos fueron eliminados permanentemente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
