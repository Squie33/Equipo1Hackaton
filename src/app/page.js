
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [photo, setPhoto] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Alumbrado público');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [folio, setFolio] = useState('');
  const [searchFolio, setSearchFolio] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [reportResult, setReportResult] = useState(null);
  const [message, setMessage] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Selecciona un archivo de imagen válido.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('La fotografía no puede superar los 5 MB.');
      event.target.value = '';
      return;
    }

    setMessage('');
    setPhoto(URL.createObjectURL(file));
  };

  const generateReport = async (event) => {
  event.preventDefault();

  setMessage("Registrando reporte...");

  try {
    const response = await fetch("/api/reportes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        category,
        description,
        location,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo registrar el reporte.");
    }

    const report = {
      folio: data.folio,
      title,
      category,
      description,
      location,
      status: "Recibido",
      date: new Date().toLocaleDateString("es-MX"),
      photoAttached: Boolean(photo),
    };

    setFolio(data.folio);
    setSearchFolio(data.folio);
    setReportResult(report);
    setMessage("¡Reporte guardado correctamente en CIUDAD 360!");

    setTitle("");
    setCategory("Alumbrado público");
    setDescription("");
    setLocation("");
    setPhoto(null);

    event.target.reset();

  } catch (error) {
    setMessage(error.message || "Error al registrar el reporte.");
  }
};

  const searchReport = async (event) => {
  event.preventDefault();
  setReportResult(null);

  try {
    const response = await fetch("/api/reportes/seguimiento", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folio: searchFolio,
        codigo: searchCode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo consultar el reporte.");
    }

    setReportResult(data.reporte);

  } catch (error) {
    setReportResult(false);
    console.error("Error en seguimiento:", error);
  }
};

  return (
    <main>
      {/* ENCABEZADO INSTITUCIONAL */}
      <header className="ca-header">
        <div className="container d-flex justify-content-between align-items-center">
          <a href="#inicio" className="ca-brand">
            <span className="ca-logo">CA</span>
            <span>
              <strong>COMUNIDAD ACTIVA</strong>
              <small>Portal de Atención Ciudadana</small>
            </span>
          </a>

          <nav className="ca-nav">
            <a href="#inicio">Inicio</a>
            <a href="#reportar">Reportar problema</a>
            <a href="#seguimiento">Seguimiento</a>
            <button
              className="btn-login"
              onClick={() => setLoginOpen(true)}
            >
              Iniciar sesión
            </button>
          </nav>
        </div>
      </header>

      {/* SECCIÓN PRINCIPAL */}
      <section id="inicio" className="ca-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <span className="ca-label">
                PARTICIPACIÓN CIUDADANA
              </span>

              <h1>
                Tu comunidad,
                <br />
                <span>nuestra responsabilidad.</span>
              </h1>

              <p className="ca-hero-text">
                Reporta los problemas de tu comunidad y contribuye
                a mejorar los espacios públicos. Queremos escuchar
                tu voz y facilitar el seguimiento de cada incidencia.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <a href="#reportar" className="btn-primary-ca">
                  Generar reporte
                </a>

                <a href="#seguimiento" className="btn-outline-ca">
                  Seguimiento de reportes
                </a>
              </div>
            </div>

            <div className="col-lg-5 mt-5 mt-lg-0">
              <div className="ca-hero-card">
                <div className="ca-hero-icon">🏛️</div>
                <h3>Una comunidad que participa</h3>
                <p>
                  Tu participación permite identificar necesidades
                  y construir mejores espacios para todos.
                </p>
                <div className="ca-divider"></div>
                <div className="d-flex justify-content-between">
                  <span>Reportes ciudadanos</span>
                  <strong>Comunidad Activa</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMACIÓN DE SERVICIO */}
      <section className="ca-info">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-4">
              <div className="ca-info-item">
                <span>01</span>
                <h5>Identifica</h5>
                <p>Localiza un problema en tu comunidad.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="ca-info-item">
                <span>02</span>
                <h5>Reporta</h5>
                <p>Describe la incidencia y adjunta una fotografía.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="ca-info-item">
                <span>03</span>
                <h5>Da seguimiento</h5>
                <p>Consulta el estado de tu reporte mediante un folio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO DE REPORTE */}
      <section id="reportar" className="ca-section">
        <div className="container">
          <div className="ca-section-heading text-center">
            <span className="ca-label-blue">ATENCIÓN CIUDADANA</span>
            <h2>Generar un reporte</h2>
            <p>
              Proporciona los datos del problema para registrar
              una nueva incidencia.
            </p>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="ca-form-card">
                <form onSubmit={generateReport}>
                  <div className="mb-4">
                    <label className="form-label">
                      Tipo de problema
                    </label>

                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Alumbrado público</option>
                      <option>Baches y vialidades</option>
                      <option>Fugas de agua</option>
                      <option>Recolección de basura</option>
                      <option>Espacios públicos</option>
                      <option>Otro problema</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Título del reporte
                    </label>

                    <input
                      className="form-control"
                      type="text"
                      placeholder="Ej. Luminaria apagada en mi colonia"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Descripción del problema
                    </label>

                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Explica qué sucede y desde cuándo..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={1000}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      Ubicación del problema
                    </label>

                    <input
                      className="form-control"
                      type="text"
                      placeholder="Calle, colonia o referencia"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      maxLength={200}
                      required
                    />
                  </div>

                  {/* FOTOGRAFÍA */}
                  <div className="mb-4">
                    <label className="form-label">
                      Evidencia fotográfica
                    </label>

                    <label htmlFor="photo-upload" className="ca-upload">
                      {photo ? (
                        <img
                          src={photo}
                          alt="Vista previa del problema"
                          className="ca-photo-preview"
                        />
                      ) : (
                        <>
                          <span className="ca-camera">📷</span>
                          <strong>Tomar o cargar fotografía</strong>
                          <small>
                            Selecciona una imagen desde tu dispositivo.
                            Máximo 5 MB.
                          </small>
                        </>
                      )}
                    </label>

                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="d-none"
                      onChange={handlePhoto}
                    />

                    {photo && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger mt-2"
                        onClick={() => {
                          setPhoto(null);
                          document.getElementById('photo-upload').value = '';
                        }}
                      >
                        Quitar fotografía
                      </button>
                    )}
                  </div>

                  {message && (
                    <div className="alert alert-info">
                      {message}
                    </div>
                  )}

                  <button className="btn-submit-ca" type="submit">
                    Generar reporte →
                  </button>
                </form>

                {folio && (
                  <div className="ca-folio-success mt-4">
                    <strong>Reporte registrado en esta demostración.</strong>
                    <p className="mb-1">Tu número de folio es:</p>
                    <h3>{folio}</h3>
                    <small>Guarda este número para consultar tu reporte.</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEGUIMIENTO */}
      <section id="seguimiento" className="ca-tracking">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="ca-tracking-card">
                <div className="text-center">
                  <span className="ca-label-blue">
                    CONSULTA CIUDADANA
                  </span>

                  <h2>Seguimiento de reportes</h2>

                  <p>
                    Consulta el estado de tu incidencia utilizando
                    el número de folio que recibiste al reportar.
                  </p>
                </div>

                <form onSubmit={searchReport}>
                  <label className="form-label">
                    Número de folio
                  </label>

                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej. CA-12345678"
                      value={searchFolio}
                      onChange={(e) => {
                        setSearchFolio(e.target.value);
                        setReportResult(null);
                      }}
                      required
                    />

                    <button className="btn-search-ca" type="submit">
                      Consultar
                    </button>
                  </div>
                                   <label className="form-label mt-3">
                    Código privado de seguimiento
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ingresa tu código de seguimiento"
                    value={searchCode}
                    onChange={(e) => {
                      setSearchCode(e.target.value);
                      setReportResult(null);
                    }}
                    required
                  />
                </form>

                {reportResult === false && (
                  <div className="alert alert-warning mt-3 mb-0">
                    No encontramos ese folio en los reportes
                    registrados en este navegador.
                  </div>
                )}

                {reportResult && reportResult !== false && (
                  <div className="ca-result mt-4">
                    <span className="badge text-bg-success">
                      {reportResult.status}
                    </span>

                    <h5 className="mt-3">
                      {reportResult.title}
                    </h5>

                    <p><strong>Folio:</strong> {reportResult.folio}</p>
                    <p><strong>Categoría:</strong> {reportResult.category}</p>
                    <p><strong>Ubicación:</strong> {reportResult.location}</p>
                    <p><strong>Fecha:</strong> {reportResult.date}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PIE DE PÁGINA */}
      <footer className="ca-footer">
        <div className="container text-center">
          <strong>COMUNIDAD ACTIVA</strong>
          <p>Participación ciudadana para mejores espacios públicos.</p>
          <small>Plataforma de atención ciudadana · 2026</small>
        </div>
      </footer>

      {/* VENTANA DE INICIO DE SESIÓN */}
      {loginOpen && (
        <div className="ca-modal-overlay" onClick={() => setLoginOpen(false)}>
          <div className="ca-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="ca-modal-close"
              onClick={() => setLoginOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </button>

            <span className="ca-label-blue">ACCESO AL SISTEMA</span>
            <h3>Iniciar sesión</h3>
            <p>
              El acceso de usuarios estará disponible cuando
              integremos el módulo de autenticación.
            </p>

            <button
              className="btn-submit-ca"
              onClick={() => setLoginOpen(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
