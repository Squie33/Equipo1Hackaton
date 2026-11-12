'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

const STATUS_STEPS = [
  'Recibido',
  'En revisión',
  'En atención',
  'Resuelto',
];

function firstValue(object, keys, fallback = null) {
  for (const key of keys) {
    const value = object?.[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return fallback;
}

function asText(value, fallback = 'No disponible') {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'object') {
    return firstValue(
      value,
      ['nombre', 'name', 'direccion', 'address', 'descripcion', 'label'],
      fallback
    );
  }

  return String(value);
}

function formatDate(value) {
  if (!value) return 'Fecha no disponible';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeStatus(status) {
  return String(status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getStatusInfo(status) {
  const value = normalizeStatus(status);

  if (
    value.includes('resuelto') ||
    value.includes('completado') ||
    value.includes('finalizado')
  ) {
    return {
      index: 3,
      label: 'Resuelto',
      className: 'resolved',
    };
  }

  if (
    value.includes('atencion') ||
    value.includes('proceso') ||
    value.includes('mantenimiento')
  ) {
    return {
      index: 2,
      label: status || 'En atención',
      className: 'attention',
    };
  }

  if (
    value.includes('revision') ||
    value.includes('evaluacion') ||
    value.includes('asignado')
  ) {
    return {
      index: 1,
      label: status || 'En revisión',
      className: 'review',
    };
  }

  if (
    value.includes('cancelado') ||
    value.includes('rechazado')
  ) {
    return {
      index: -1,
      label: status,
      className: 'cancelled',
    };
  }

  return {
    index: 0,
    label: status || 'Recibido',
    className: 'received',
  };
}

function getImageUrl(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    return value;
  }

  return firstValue(value, ['url', 'src', 'ruta', 'path'], null);
}

function getLocationCoordinates(report) {
  const location =
    typeof report?.ubicacion === 'object'
      ? report.ubicacion
      : {};

  const latitude = Number(
    firstValue(report, ['latitud', 'latitude', 'lat'], location.latitud ?? location.latitude ?? location.lat)
  );

  const longitude = Number(
    firstValue(report, ['longitud', 'longitude', 'lng', 'lon'], location.longitud ?? location.longitude ?? location.lng ?? location.lon)
  );

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return { latitude, longitude };
}

function getHistory(report) {
  const history = firstValue(
    report,
    [
      'historial',
      'historialEstados',
      'historial_estados',
      'history',
      'movimientos',
      'eventos',
    ],
    []
  );

  return Array.isArray(history) ? history : [];
}

function getHistoryDate(event) {
  return firstValue(
    event,
    [
      'fecha',
      'createdAt',
      'created_at',
      'fechaCambio',
      'fecha_cambio',
      'timestamp',
    ],
    null
  );
}

function getHistoryStatus(event) {
  return asText(
    firstValue(event, ['estado', 'status', 'estatus', 'titulo'], null),
    'Actualización del reporte'
  );
}

function getHistoryDescription(event) {
  return asText(
    firstValue(
      event,
      [
        'observacionPublica',
        'observacion_publica',
        'observacion',
        'comentario',
        'descripcion',
        'description',
        'detalle',
      ],
      null
    ),
    'Se registró un movimiento en el reporte.'
  );
}

export default function SeguimientoPage() {
  const [folio, setFolio] = useState('');
  const [codigo, setCodigo] = useState('');

  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const initialLookupStarted = useRef(false);

  // Consultar el reporte en la API existente.
  const searchReport = useCallback(
    async (folioValue = folio, codigoValue = codigo) => {
      if (!folioValue.trim() || !codigoValue.trim()) {
        setMessage('Ingresa tu folio y código de seguimiento.');
        setReport(null);
        return;
      }

      setLoading(true);
      setMessage('');
      setReport(null);

      try {
        const response = await fetch('/api/reportes/seguimiento', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            folio: folioValue.trim(),
            codigo: codigoValue.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message ||
            data.error ||
            'No se encontró un reporte con los datos proporcionados.'
          );
        }

        const foundReport =
          data.reporte ||
          data.data?.reporte ||
          data;

        if (
          !foundReport ||
          typeof foundReport !== 'object' ||
          Array.isArray(foundReport)
        ) {
          throw new Error(
            'No fue posible recuperar la información del reporte.'
          );
        }

        setReport(foundReport);
      } catch (error) {
        setMessage(
          error.message ||
          'Ocurrió un error al consultar el reporte.'
        );
      } finally {
        setLoading(false);
      }
    },
    [folio, codigo]
  );

  // Permitir llegar desde el formulario con folio y código.
  useEffect(() => {
    if (initialLookupStarted.current) return;

    initialLookupStarted.current = true;

    const params = new URLSearchParams(window.location.search);
    const savedFolio = params.get('folio');
    const savedCode = params.get('codigo');

    if (savedFolio && savedCode) {
      setFolio(savedFolio);
      setCodigo(savedCode);
      searchReport(savedFolio, savedCode);
    }
  }, [searchReport]);

  const handleSubmit = (event) => {
    event.preventDefault();
    searchReport();
  };

  const resetSearch = () => {
    setReport(null);
    setMessage('');
    setFolio('');
    setCodigo('');
  };

  const refreshReport = () => {
    searchReport(folio, codigo);
  };

  const currentStatus = firstValue(
    report,
    ['estado', 'status', 'estatus'],
    'Recibido'
  );

  const statusInfo = getStatusInfo(currentStatus);

  const reportFolio = asText(
    firstValue(report, ['folio', 'numero_folio', 'id'], folio),
    folio
  );

  const reportTitle = asText(
    firstValue(report, ['title', 'titulo', 'asunto']),
    'Reporte ciudadano'
  );

  const reportCategory = asText(
    firstValue(report, ['category', 'categoria']),
    'No especificada'
  );

  const reportDescription = asText(
    firstValue(report, ['description', 'descripcion']),
    'No hay una descripción disponible.'
  );

  const reportLocation = asText(
    firstValue(report, ['location', 'ubicacion', 'direccion']),
    'Ubicación no especificada'
  );

  const reportDate = firstValue(
    report,
    [
      'createdAt',
      'created_at',
      'fecha_creacion',
      'fechaRegistro',
      'fecha',
    ],
    null
  );

  const priority = firstValue(
    report,
    ['prioridad', 'priority'],
    null
  );

  const department = firstValue(
    report,
    [
      'departamento',
      'areaResponsable',
      'area_responsable',
      'area',
      'dependencia',
    ],
    null
  );

  const responsible = firstValue(
    report,
    ['responsable', 'assignedTo', 'asignadoA'],
    null
  );

  const originalPhoto = getImageUrl(
    firstValue(
      report,
      [
        'fotoUrl',
        'foto_url',
        'imagenUrl',
        'imagen_url',
        'evidenciaUrl',
        'evidencia_url',
        'photoUrl',
        'imageUrl',
        'fotografia',
        'fotografiaUrl',
        'evidencia',
      ],
      null
    )
  );

  const resolutionPhoto = getImageUrl(
    firstValue(
      report,
      [
        'fotoResolucion',
        'foto_resolucion',
        'evidenciaResolucion',
        'evidencia_resolucion',
        'imagenFinal',
        'imagen_final',
      ],
      null
    )
  );

  const history = getHistory(report);
  const coordinates = getLocationCoordinates(report);

  const publicObservations = firstValue(
    report,
    [
      'observacionesPublicas',
      'observaciones_publicas',
      'ultimaObservacion',
      'ultima_observacion',
    ],
    null
  );

  const mapUrl = coordinates
    ? `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=17/${coordinates.latitude}/${coordinates.longitude}`
    : null;

  return (
    <main className="ca-muni-page">

      {/* BARRA INSTITUCIONAL */}
      <div className="ca-muni-topbar">
        <div className="ca-muni-container ca-muni-topbar-content">
          <span>PORTAL DE ATENCIÓN CIUDADANA</span>
          <span>PARTICIPACIÓN · SERVICIO · COMUNIDAD</span>
        </div>
      </div>

      {/* ENCABEZADO */}
      <header className="ca-muni-header">
        <div className="ca-muni-container ca-muni-header-content">

          <Link href="/" className="ca-muni-brand">
            <div className="ca-muni-seal">
              <span>V3</span>
            </div>

            <div className="ca-muni-brand-text">
              <strong>VERACRUZ360</strong>
              <span>Portal Municipal de Atención Ciudadana</span>
            </div>
          </Link>

          <nav className="ca-muni-nav">
            <Link href="/">Inicio</Link>

            <Link
              href="/seguimiento"
              className="ca-muni-nav-active"
            >
              Seguimiento
            </Link>

            <Link href="/login" className="ca-muni-admin">
              Acceso administrativo
            </Link>
          </nav>

        </div>
      </header>

      {/* PORTADA */}
      <section className="ca-muni-hero ca-track-pro-hero">
        <div className="ca-muni-container ca-muni-hero-content">

          <div className="ca-muni-hero-label">
            <span></span>
            CONSULTA CIUDADANA
          </div>

          <h1>
            Seguimiento de
            <br />
            <strong>reportes ciudadanos.</strong>
          </h1>

          <p>
            Consulta el estado de tu incidencia, conoce las acciones
            registradas y revisa la información de atención.
          </p>

        </div>
      </section>

      {/* CONTENIDO */}
      <section className="ca-muni-main ca-track-pro-main">
        <div className="ca-muni-container">

          {/* FORMULARIO DE BÚSQUEDA */}
          <section className="ca-track-pro-search">

            <div className="ca-track-pro-section-title">
              <div className="ca-muni-number">01</div>

              <div>
                <h2>Consultar una incidencia</h2>
                <p>
                  Ingresa los datos proporcionados al registrar tu reporte.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="ca-track-pro-fields">

                <div className="ca-track-pro-field">
                  <label htmlFor="tracking-folio">
                    Folio del reporte
                  </label>

                  <input
                    id="tracking-folio"
                    type="text"
                    placeholder="Ej. CA-2026-001"
                    value={folio}
                    onChange={(event) => setFolio(event.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="ca-track-pro-field">
                  <label htmlFor="tracking-code">
                    Código de seguimiento
                  </label>

                  <input
                    id="tracking-code"
                    type="text"
                    placeholder="Ingresa tu código"
                    value={codigo}
                    onChange={(event) => setCodigo(event.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>

              </div>

              {message && (
                <div className="ca-track-pro-error" role="alert">
                  <strong>No fue posible realizar la consulta</strong>
                  <span>{message}</span>
                </div>
              )}

              <div className="ca-track-pro-search-actions">

                <button
                  type="submit"
                  className="ca-track-pro-primary"
                  disabled={loading}
                >
                  {loading ? 'Consultando...' : 'Consultar incidencia →'}
                </button>

              </div>

            </form>

            <p className="ca-track-pro-security">
              Tu folio y código permiten consultar la información del
              reporte. Evita compartirlos con personas desconocidas.
            </p>

          </section>

          {/* EXPEDIENTE DEL REPORTE */}
          {report && (
            <section className="ca-track-pro-record">

              {/* ENCABEZADO DEL EXPEDIENTE */}
              <div className="ca-track-pro-record-header">

                <div>
                  <span className="ca-track-pro-eyebrow">
                    EXPEDIENTE DE ATENCIÓN CIUDADANA
                  </span>

                  <h2>{reportTitle}</h2>

                  <p>
                    Folio de identificación: <strong>{reportFolio}</strong>
                  </p>
                </div>

                <span
                  className={`ca-track-pro-status ${statusInfo.className}`}
                >
                  {statusInfo.label}
                </span>

              </div>

              {/* ACCIONES DEL EXPEDIENTE */}
              <div className="ca-track-pro-toolbar">

                <button
                  type="button"
                  onClick={refreshReport}
                  disabled={loading}
                  className="ca-track-pro-secondary"
                >
                  ↻ {loading ? 'Actualizando...' : 'Actualizar consulta'}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="ca-track-pro-secondary"
                >
                  Imprimir expediente
                </button>

              </div>

              {/* RESUMEN */}
              <section className="ca-track-pro-card">

                <div className="ca-track-pro-card-heading">
                  <span>02</span>
                  <div>
                    <h3>Resumen de la incidencia</h3>
                    <p>Datos generales del reporte registrado.</p>
                  </div>
                </div>

                <div className="ca-track-pro-summary-grid">

                  <div className="ca-track-pro-data">
                    <span>Folio</span>
                    <strong>{reportFolio}</strong>
                  </div>

                  <div className="ca-track-pro-data">
                    <span>Categoría</span>
                    <strong>{reportCategory}</strong>
                  </div>

                  <div className="ca-track-pro-data">
                    <span>Fecha de registro</span>
                    <strong>{formatDate(reportDate)}</strong>
                  </div>

                  <div className="ca-track-pro-data">
                    <span>Prioridad</span>
                    <strong>{asText(priority)}</strong>
                  </div>

                  <div className="ca-track-pro-data ca-track-pro-wide">
                    <span>Descripción</span>
                    <strong>{reportDescription}</strong>
                  </div>

                </div>

              </section>

              {/* ESTADO Y PROGRESO */}
              <section className="ca-track-pro-card">

                <div className="ca-track-pro-card-heading">
                  <span>03</span>
                  <div>
                    <h3>Estado y avance</h3>
                    <p>Etapa actual de atención de la incidencia.</p>
                  </div>
                </div>

                <div className={`ca-track-pro-current ${statusInfo.className}`}>
                  <div className="ca-track-pro-current-dot"></div>

                  <div>
                    <span>ESTADO ACTUAL</span>
                    <strong>{statusInfo.label}</strong>
                  </div>
                </div>

                {statusInfo.index >= 0 ? (
                  <div className="ca-track-pro-progress">

                    {STATUS_STEPS.map((step, index) => {
                      const completed = index <= statusInfo.index;
                      const current = index === statusInfo.index;

                      return (
                        <div
                          key={step}
                          className={`ca-track-pro-progress-step ${
                            completed ? 'completed' : ''
                          } ${current ? 'current' : ''}`}
                        >
                          <div className="ca-track-pro-progress-marker">
                            {completed ? '✓' : index + 1}
                          </div>

                          <span>{step}</span>
                        </div>
                      );
                    })}

                  </div>
                ) : (
                  <p className="ca-track-pro-empty">
                    Este reporte tiene un estado especial. Consulta
                    las observaciones del expediente para conocer más.
                  </p>
                )}

                <p className="ca-track-pro-hint">
                  La barra representa la etapa correspondiente al estado
                  actual. Las fechas de cada movimiento se muestran
                  únicamente cuando están registradas en el historial.
                </p>

              </section>

              {/* UBICACIÓN */}
              <section className="ca-track-pro-card">

                <div className="ca-track-pro-card-heading">
                  <span>04</span>
                  <div>
                    <h3>Ubicación de la incidencia</h3>
                    <p>Lugar indicado al registrar el reporte.</p>
                  </div>
                </div>

                <div className="ca-track-pro-location">

                  <div className="ca-track-pro-location-icon">
                    <span>⌖</span>
                  </div>

                  <div className="ca-track-pro-location-info">
                    <span>DIRECCIÓN O REFERENCIA</span>
                    <strong>{reportLocation}</strong>

                    {coordinates && (
                      <small>
                        Coordenadas: {coordinates.latitude}, {coordinates.longitude}
                      </small>
                    )}
                  </div>

                </div>

                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ca-track-pro-map-link"
                  >
                    Ver ubicación en el mapa ↗
                  </a>
                )}

                {!coordinates && (
                  <p className="ca-track-pro-hint">
                    No hay coordenadas geográficas disponibles para
                    mostrar un marcador en el mapa.
                  </p>
                )}

              </section>

              {/* EVIDENCIA FOTOGRÁFICA */}
              <section className="ca-track-pro-card">

                <div className="ca-track-pro-card-heading">
                  <span>05</span>
                  <div>
                    <h3>Evidencia fotográfica</h3>
                    <p>Imágenes asociadas a la incidencia.</p>
                  </div>
                </div>

                <div className="ca-track-pro-evidence-grid">

                  <div className="ca-track-pro-evidence">
                    <div className="ca-track-pro-evidence-label">
                      <strong>Fotografía original</strong>
                      <span>Antes de la atención</span>
                    </div>

                    {originalPhoto ? (
                      <a
                        href={originalPhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={originalPhoto}
                          alt="Fotografía original de la incidencia"
                        />
                      </a>
                    ) : (
                      <div className="ca-track-pro-no-image">
                        <span>▧</span>
                        <strong>Sin fotografía disponible</strong>
                        <small>
                          La consulta no recibió una imagen original.
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="ca-track-pro-evidence">
                    <div className="ca-track-pro-evidence-label">
                      <strong>Evidencia de resolución</strong>
                      <span>Después de la atención</span>
                    </div>

                    {resolutionPhoto ? (
                      <a
                        href={resolutionPhoto}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={resolutionPhoto}
                          alt="Evidencia de resolución de la incidencia"
                        />
                      </a>
                    ) : (
                      <div className="ca-track-pro-no-image">
                        <span>▧</span>
                        <strong>Sin evidencia de resolución</strong>
                        <small>
                          No se ha proporcionado una imagen final.
                        </small>
                      </div>
                    )}
                  </div>

                </div>

              </section>

              {/* ÁREA RESPONSABLE */}
              <section className="ca-track-pro-card">

                <div className="ca-track-pro-card-heading">
                  <span>06</span>
                  <div>
                    <h3>Área responsable</h3>
                    <p>Información de la unidad encargada de la atención.</p>
                  </div>
                </div>

                <div className="ca-track-pro-responsible-grid">

                  <div className="ca-track-pro-data">
                    <span>Departamento o dependencia</span>
                    <strong>{asText(department)}</strong>
                  </div>

                  <div className="ca-track-pro-data">
                    <span>Responsable asignado</span>
                    <strong>{asText(responsible)}</strong>
                  </div>

                </div>

              </section>

              {/* HISTORIAL */}
              <section className="ca-track-pro-card">

                <div className="ca-track-pro-card-heading">
                  <span>07</span>
                  <div>
                    <h3>Historial de atención</h3>
                    <p>Movimientos registrados durante el seguimiento.</p>
                  </div>
                </div>

                {history.length > 0 ? (
                  <div className="ca-track-pro-history">

                    {history.map((event, index) => (
                      <article
                        key={event.id || event._id || index}
                        className="ca-track-pro-history-item"
                      >

                        <div className="ca-track-pro-history-marker">
                          {index + 1}
                        </div>

                        <div className="ca-track-pro-history-content">

                          <span className="ca-track-pro-history-date">
                            {formatDate(getHistoryDate(event))}
                          </span>

                          <strong>{getHistoryStatus(event)}</strong>

                          <p>{getHistoryDescription(event)}</p>

                        </div>

                      </article>
                    ))}

                  </div>
                ) : (
                  <div className="ca-track-pro-empty">
                    <strong>Aún no hay movimientos detallados.</strong>
                    <p>
                      El sistema no recibió un historial de cambios
                      para este reporte. Cuando existan movimientos
                      registrados, aparecerán en esta sección.
                    </p>
                  </div>
                )}

              </section>

              {/* OBSERVACIONES */}
              <section className="ca-track-pro-card">

                <div className="ca-track-pro-card-heading">
                  <span>08</span>
                  <div>
                    <h3>Observaciones de atención</h3>
                    <p>Comunicaciones públicas relacionadas con el reporte.</p>
                  </div>
                </div>

                {publicObservations ? (
                  <div className="ca-track-pro-observation">
                    {Array.isArray(publicObservations) ? (
                      publicObservations.map((item, index) => (
                        <p key={item.id || index}>
                          {typeof item === 'string'
                            ? item
                            : getHistoryDescription(item)}
                        </p>
                      ))
                    ) : (
                      <p>{asText(publicObservations)}</p>
                    )}
                  </div>
                ) : (
                  <div className="ca-track-pro-empty">
                    <strong>Sin observaciones publicadas.</strong>
                    <p>
                      La administración todavía no ha registrado
                      una comunicación pública para esta incidencia.
                    </p>
                  </div>
                )}

              </section>

              {/* ACCIONES FINALES */}
              <div className="ca-track-pro-bottom-actions">

                <button
                  type="button"
                  className="ca-track-pro-secondary"
                  onClick={resetSearch}
                >
                  ← Consultar otro reporte
                </button>

                <Link
                  href="/"
                  className="ca-track-pro-primary"
                >
                  Volver al inicio
                </Link>

              </div>

            </section>
          )}

          {!report && (
            <div className="ca-track-pro-help">
              <div className="ca-track-pro-help-icon">i</div>

              <div>
                <strong>¿Dónde encuentro mis datos?</strong>
                <p>
                  El folio y el código de seguimiento se proporcionan
                  al finalizar el registro de una incidencia.
                  Conserva ambos para consultar el expediente.
                </p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* PIE INSTITUCIONAL */}
      <footer className="ca-muni-footer">
        <div className="ca-muni-container">

          <div className="ca-muni-footer-main">
            <div>
              <strong>VERACRUZ360</strong>
              <p>
                Una comunidad que participa es una comunidad
                que puede mejorar.
              </p>
            </div>

            <div className="ca-muni-footer-links">
              <Link href="/">Inicio</Link>
              <Link href="/seguimiento">Seguimiento</Link>
              <Link href="/login">Administración</Link>
            </div>
          </div>

          <div className="ca-muni-footer-bottom">
            <span>Portal de Atención Ciudadana</span>
            <span>© 2026 VERACRUZ360</span>
          </div>

        </div>
      </footer>

    </main>
  );
}
