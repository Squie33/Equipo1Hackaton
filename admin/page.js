
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const ESTADOS = ['Recibido', 'En atención', 'Resuelto'];

export default function AdminPage() {
  const [reportes, setReportes] = useState([]);
  const [resumen, setResumen] = useState({
    total: 0,
    pendientes: 0,
    en_atencion: 0,
    resueltos: 0,
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const mapaRef = useRef(null);
  const marcadoresRef = useRef(null);
  const leafletRef = useRef(null);

  // Cargar Leaflet desde CDN
  useEffect(() => {
    const cssId = 'leaflet-css';
    const scriptId = 'leaflet-js';

    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href =
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    function iniciarMapa() {
      if (!window.L || mapaRef.current) return;

      const L = window.L;
      leafletRef.current = L;

      const mapa = L.map('mapa-admin').setView(
        [19.1738, -96.1342],
        12
      );

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }
      ).addTo(mapa);

      mapaRef.current = mapa;
      marcadoresRef.current = L.layerGroup().addTo(mapa);

      setTimeout(() => mapa.invalidateSize(), 200);
    }

    if (window.L) {
      iniciarMapa();
    } else {
      let script = document.getElementById(scriptId);

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src =
          'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.body.appendChild(script);
      }

      script.addEventListener('load', iniciarMapa);

      return () => {
        script.removeEventListener('load', iniciarMapa);

        if (mapaRef.current) {
          mapaRef.current.remove();
          mapaRef.current = null;
          marcadoresRef.current = null;
        }
      };
    }

    return () => {
      if (mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current = null;
        marcadoresRef.current = null;
      }
    };
  }, []);

  // Consultar los reportes
  async function cargarReportes() {
    try {
      setError('');

      const respuesta = await fetch('/api/reportes', {
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (!respuesta.ok) {
        throw new Error(
          'No se pudieron obtener los reportes.'
        );
      }

      const datos = await respuesta.json();

      if (!Array.isArray(datos)) {
        throw new Error('Formato de reportes incorrecto.');
      }

      setReportes(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  // Consultar las estadísticas
  async function cargarResumen() {
    try {
      const respuesta = await fetch('/api/reportes/resumen', {
        cache: 'no-store',
        credentials: 'same-origin',
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo cargar el resumen.');
      }

      const datos = await respuesta.json();

      setResumen({
        total: Number(datos.total) || 0,
        pendientes:
          Number(datos.pendientes ?? datos.recibidos) || 0,
        en_atencion: Number(datos.en_atencion) || 0,
        resueltos: Number(datos.resueltos) || 0,
      });
    } catch (err) {
      console.error('Error en estadísticas:', err);
    }
  }

  useEffect(() => {
    cargarReportes();
    cargarResumen();
  }, []);

  // Colocar los marcadores en el mapa
  useEffect(() => {
    if (!leafletRef.current || !marcadoresRef.current) {
      return;
    }

    const L = leafletRef.current;
    const grupo = marcadoresRef.current;

    grupo.clearLayers();

    reportes.forEach((reporte) => {
      const lat = Number(reporte.latitud);
      const lng = Number(reporte.longitud);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        reporte.latitud == null ||
        reporte.longitud == null
      ) {
        return;
      }

      const marcador = L.marker([lat, lng]);

      // Crear contenido seguro sin insertar HTML del usuario
      const contenido = document.createElement('div');

      const titulo = document.createElement('strong');
      titulo.textContent = reporte.folio || 'Reporte';

      const categoria = document.createElement('p');
      categoria.textContent =
        `Categoría: ${reporte.categoria || 'Sin categoría'}`;

      const estado = document.createElement('p');
      estado.textContent =
        `Estado: ${reporte.estado || 'Sin estado'}`;

      const descripcion = document.createElement('p');
      descripcion.textContent =
        reporte.descripcion ||
        reporte.comentario ||
        'Sin descripción';

      contenido.append(
        titulo,
        categoria,
        estado,
        descripcion
      );

      marcador.bindPopup(contenido);
      grupo.addLayer(marcador);
    });
  }, [reportes]);

  // Cambiar el estado de un reporte
  async function actualizarEstado(id, nuevoEstado) {
    if (!ESTADOS.includes(nuevoEstado)) return;

    setActualizando(id);
    setError('');

    try {
      const respuesta = await fetch(
        `/api/reportes/${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            estado: nuevoEstado,
          }),
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          'No se pudo actualizar el estado del reporte.'
        );
      }

      await Promise.all([
        cargarReportes(),
        cargarResumen(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setActualizando(null);
    }
  }

  const reportesFiltrados = reportes.filter((reporte) => {
    const texto = [
      reporte.folio,
      reporte.titulo,
      reporte.categoria,
      reporte.ubicacion,
      reporte.estado,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <div className="admin-container admin-topbar-inner">
          <span>PORTAL DE ATENCIÓN CIUDADANA</span>
          <span>PARTICIPACIÓN · SERVICIO · COMUNIDAD</span>
        </div>
      </div>

      <header className="admin-header">
        <div className="admin-container admin-header-inner">
          <Link href="/" className="admin-brand">
            <div className="admin-logo">V3</div>

            <div className="admin-brand-text">
              <strong>VERACRUZ360</strong>
              <span>
                Portal Municipal de Atención Ciudadana
              </span>
            </div>
          </Link>

          <nav className="admin-nav">
            <Link href="/">Inicio</Link>
            <Link href="/seguimiento">Seguimiento</Link>
            <span className="admin-active">
              Panel administrativo
            </span>
          </nav>
        </div>
      </header>

      <section className="admin-hero">
        <div className="admin-container">
          <span className="admin-eyebrow">
            GESTIÓN DE INCIDENCIAS
          </span>

          <h1>
            Panel de <strong>administración</strong>
          </h1>

          <p>
            Consulta, supervisa y actualiza los reportes
            ciudadanos desde un solo lugar.
          </p>
        </div>
      </section>

      <section className="admin-content">
        <div className="admin-container">

          <div className="admin-section-title">
            <span>RESUMEN GENERAL</span>
            <h2>Estado de los reportes ciudadanos</h2>
          </div>

          <div className="admin-metrics">
            <div className="admin-metric">
              <span>TOTAL DE REPORTES</span>
              <strong>{resumen.total}</strong>
              <small>Incidencias registradas</small>
            </div>

            <div className="admin-metric">
              <span>PENDIENTES</span>
              <strong>{resumen.pendientes}</strong>
              <small>Reportes recibidos</small>
            </div>

            <div className="admin-metric">
              <span>EN ATENCIÓN</span>
              <strong>{resumen.en_atencion}</strong>
              <small>Incidencias en proceso</small>
            </div>

            <div className="admin-metric">
              <span>RESUELTOS</span>
              <strong>{resumen.resueltos}</strong>
              <small>Reportes finalizados</small>
            </div>
          </div>

          {error && (
            <div className="admin-error" role="alert">
              {error}
            </div>
          )}

          <div className="admin-grid">

            <div className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span>CONTROL DE INCIDENCIAS</span>
                  <h2>Gestión de reportes</h2>
                </div>

                <button
                  type="button"
                  className="admin-refresh"
                  onClick={() => {
                    cargarReportes();
                    cargarResumen();
                  }}
                >
                  Actualizar
                </button>
              </div>

              <input
                type="search"
                className="admin-search"
                placeholder="Buscar por folio, categoría o ubicación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Categoría</th>
                      <th>Prioridad</th>
                      <th>Estado</th>
                      <th>Dependencia</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cargando ? (
                      <tr>
                        <td colSpan="6">
                          Cargando reportes...
                        </td>
                      </tr>
                    ) : reportesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          No se encontraron reportes.
                        </td>
                      </tr>
                    ) : (
                      reportesFiltrados.map((reporte) => (
                        <tr key={reporte.id}>
                          <td className="admin-folio">
                            {reporte.folio}
                          </td>

                          <td>{reporte.categoria}</td>

                          <td>
                            <span
                              className={`admin-priority ${
                                reporte.prioridad === 'Urgente'
                                  ? 'priority-urgent'
                                  : ''
                              }`}
                            >
                              {reporte.prioridad}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`admin-status ${
                                reporte.estado === 'Resuelto'
                                  ? 'status-resuelto'
                                  : reporte.estado === 'En atención'
                                    ? 'status-atencion'
                                    : 'status-recibido'
                              }`}
                            >
                              {reporte.estado}
                            </span>
                          </td>

                          <td>
                            {reporte.dependencia_asignada ||
                              'Sin asignar'}
                          </td>

                          <td>
                            <select
                              aria-label={`Cambiar estado de ${reporte.folio}`}
                              value={reporte.estado}
                              disabled={actualizando === reporte.id}
                              onChange={(e) =>
                                actualizarEstado(
                                  reporte.id,
                                  e.target.value
                                )
                              }
                            >
                              {ESTADOS.map((estado) => (
                                <option
                                  key={estado}
                                  value={estado}
                                >
                                  {estado}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span>UBICACIÓN GEOGRÁFICA</span>
                  <h2>Mapa de incidencias</h2>
                </div>
              </div>

              <div id="mapa-admin" />

              <p className="admin-map-note">
                Selecciona un marcador para consultar los
                detalles de una incidencia.
              </p>
            </div>

          </div>
        </div>
      </section>

      <footer className="admin-footer">
        <div className="admin-container admin-footer-inner">
          <span>VERACRUZ360</span>
          <span>© 2026 Portal de Atención Ciudadana</span>
        </div>
      </footer>

      <style jsx global>{`
        .admin-page {
          --azul: #142e50;
          --azul-secundario: #1e4773;
          --dorado: #c7a45b;
          --fondo: #f3f5f8;
          --texto: #26364a;
          --gris: #6b7787;
          min-height: 100vh;
          background: var(--fondo);
          color: var(--texto);
          font-family: Arial, Helvetica, sans-serif;
        }

        .admin-page * {
          box-sizing: border-box;
        }

        .admin-container {
          width: min(1180px, 92%);
          margin: 0 auto;
        }

        .admin-topbar {
          background: #10243d;
          color: #e1e6ed;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .admin-topbar-inner {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 12px 0;
        }

        .admin-header {
          background: #fff;
          border-bottom: 1px solid #e1e6ed;
        }

        .admin-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          min-height: 90px;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 13px;
          text-decoration: none;
          color: var(--azul);
        }

        .admin-logo {
          width: 48px;
          height: 48px;
          border: 2px solid var(--dorado);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 16px;
          outline: 1px solid var(--dorado);
          outline-offset: -6px;
        }

        .admin-brand-text {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .admin-brand-text strong {
          font-size: 16px;
          letter-spacing: .4px;
        }

        .admin-brand-text span {
          color: var(--gris);
          font-size: 11px;
        }

        .admin-nav {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .admin-nav a {
          color: var(--azul);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }

        .admin-active {
          background: var(--azul);
          color: #fff;
          padding: 13px 17px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
        }

        .admin-hero {
          background: linear-gradient(
            115deg,
            #192f4a,
            #294e78
          );
          padding: 65px 0;
          color: #fff;
        }

        .admin-eyebrow {
          color: #e4c783;
          font-size: 11px;
          letter-spacing: 2px;
          font-weight: 700;
        }

        .admin-hero h1 {
          font-size: clamp(30px, 4vw, 43px);
          font-weight: 400;
          margin: 22px 0 16px;
        }

        .admin-hero h1 strong {
          color: #e5c98e;
          font-weight: 800;
        }

        .admin-hero p {
          max-width: 630px;
          line-height: 1.8;
          font-size: 14px;
          color: #e0e8f1;
        }

        .admin-content {
          padding: 60px 0 85px;
        }

        .admin-section-title {
          text-align: center;
          margin-bottom: 30px;
        }

        .admin-section-title span,
        .admin-panel-heading span {
          font-size: 10px;
          letter-spacing: 1.5px;
          color: #a47b2f;
          font-weight: 800;
        }

        .admin-section-title h2 {
          margin-top: 12px;
          color: var(--azul);
          font-size: 26px;
        }

        .admin-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 30px;
        }

        .admin-metric {
          background: #fff;
          border: 1px solid #e1e6ed;
          border-top: 4px solid var(--dorado);
          border-radius: 6px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(16,36,61,.04);
        }

        .admin-metric > span {
          display: block;
          color: var(--gris);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .5px;
        }

        .admin-metric strong {
          display: block;
          font-size: 36px;
          color: var(--azul);
          margin: 12px 0;
        }

        .admin-metric small {
          color: var(--gris);
          font-size: 12px;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 20px;
          align-items: start;
        }

        .admin-panel {
          background: #fff;
          border: 1px solid #e1e6ed;
          border-top: 4px solid var(--dorado);
          border-radius: 6px;
          padding: 23px;
          min-width: 0;
          box-shadow: 0 4px 15px rgba(16,36,61,.04);
        }

        .admin-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .admin-panel-heading h2 {
          color: var(--azul);
          font-size: 19px;
          margin-top: 8px;
        }

        .admin-refresh {
          border: 1px solid var(--azul);
          color: var(--azul);
          background: #fff;
          border-radius: 4px;
          padding: 9px 12px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .admin-refresh:hover {
          background: #f3f5f8;
        }

        .admin-search {
          width: 100%;
          border: 1px solid #d5dce5;
          border-radius: 5px;
          padding: 12px;
          margin-bottom: 17px;
          font-size: 13px;
          color: var(--texto);
          background: #fff;
        }

        .admin-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          white-space: nowrap;
        }

        .admin-table th {
          background: var(--azul);
          color: #fff;
          padding: 13px 10px;
          text-align: left;
          font-size: 10px;
          letter-spacing: .4px;
        }

        .admin-table td {
          padding: 14px 10px;
          border-bottom: 1px solid #e1e6ed;
          color: var(--texto);
        }

        .admin-table tbody tr:hover {
          background: #f8fafc;
        }

        .admin-folio {
          font-weight: 800;
          color: var(--azul) !important;
        }

        .admin-status,
        .admin-priority {
          display: inline-block;
          border-radius: 4px;
          padding: 6px 9px;
          font-size: 11px;
          font-weight: 700;
        }

        .status-recibido {
          background: #f5f0e5;
          color: #795d24;
        }

        .status-atencion {
          background: #e8f0f9;
          color: #1e4773;
        }

        .status-resuelto {
          background: #142e50;
          color: #fff;
        }

        .admin-priority {
          background: #f1f3f6;
          color: #334155;
        }

        .priority-urgent {
          background: #fee2e2;
          color: #991b1b;
        }

        .admin-table select {
          border: 1px solid #ccd5df;
          border-radius: 4px;
          padding: 8px;
          background: #fff;
          color: var(--azul);
          cursor: pointer;
          font-size: 11px;
        }

        #mapa-admin {
          width: 100%;
          height: 420px;
          border-radius: 5px;
          border: 1px solid #e1e6ed;
          z-index: 0;
        }

        .admin-map-note {
          color: var(--gris);
          font-size: 12px;
          margin-top: 15px;
          line-height: 1.6;
        }

        .admin-error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 20px;
        }

        .admin-footer {
          background: #10243d;
          color: #dce5ef;
          padding: 27px 0;
        }

        .admin-footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          font-size: 12px;
        }

        @media (max-width: 1050px) {
          .admin-grid {
            grid-template-columns: 1fr;
          }

          .admin-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .admin-topbar-inner span:last-child {
            display: none;
          }

          .admin-header-inner {
            flex-direction: column;
            padding: 20px 0;
          }

          .admin-nav {
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px;
          }

          .admin-hero {
            padding: 45px 0;
          }

          .admin-metrics {
            grid-template-columns: 1fr;
          }

          .admin-panel {
            padding: 15px;
          }

          .admin-footer-inner {
            flex-direction: column;
            text-align: center;
          }

          #mapa-admin {
            height: 340px;
          }
        }
      `}</style>
    </main>
  );
}
