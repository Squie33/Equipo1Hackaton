'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ReportarPage() {
  const [step, setStep] = useState('loading');

  // Fotografía inicial
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // Información del reporte
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
// Datos de contacto del ciudadano
const [email, setEmail] = useState('');
const [phone, setPhone] = useState('');
const [whatsappConsent, setWhatsappConsent] = useState(false);

  // Ubicación GPS
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');

  // Envío del reporte
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Recuperar la fotografía seleccionada en Inicio.
  useEffect(() => {
    let cancelled = false;

    async function restorePhoto() {
      const savedPhoto = sessionStorage.getItem('ca-report-photo');

      if (!savedPhoto) {
        if (!cancelled) {
          setStep('missing');
        }
        return;
      }

      try {
        const saved = JSON.parse(savedPhoto);

        if (!saved.dataUrl) {
          throw new Error('No se encontró la fotografía.');
        }

        const response = await fetch(saved.dataUrl);
        const blob = await response.blob();

        const file = new File(
          [blob],
          saved.name || 'evidencia.jpg',
          {
            type: saved.type || blob.type || 'image/jpeg',
          }
        );

        if (cancelled) return;

        setPhotoFile(file);
        setPhotoPreview(saved.dataUrl);
        setStep('form');

      } catch (error) {
        console.error('Error recuperando fotografía:', error);

        if (!cancelled) {
          setMessage(
            'No se pudo recuperar la fotografía. Regresa al inicio y selecciónala nuevamente.'
          );

          setStep('missing');
        }
      }
    }

    restorePhoto();

    return () => {
      cancelled = true;
    };
  }, []);

  // Obtener ubicación GPS del dispositivo.
  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setGpsMessage(
        'Tu navegador no permite obtener la ubicación.'
      );
      return;
    }

    setGpsLoading(true);
    setGpsMessage('Obteniendo ubicación GPS...');

    // Limpiar coordenadas anteriores.
    setLatitud(null);
    setLongitud(null);
    setGpsAccuracy(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        setLatitud(latitude);
        setLongitud(longitude);
        setGpsAccuracy(accuracy);

        setGpsMessage(
          'Ubicación obtenida correctamente. Comprueba las coordenadas antes de enviar tu reporte.'
        );

        setGpsLoading(false);
      },

      (error) => {
        const mensajes = {
          1: 'Debes permitir el acceso a tu ubicación.',
          2: 'No fue posible determinar tu ubicación.',
          3: 'Se agotó el tiempo para obtener tu ubicación.',
        };

        setGpsMessage(
          mensajes[error.code] ||
          'No se pudo obtener la ubicación GPS.'
        );

        setGpsLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // Enviar los datos del reporte a la API.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!photoFile) {
      setMessage('No se encontró la fotografía inicial.');
      return;
    }

    if (
      !title.trim() ||
      !category ||
      !description.trim()
    ) {
      setMessage('Completa todos los campos para continuar.');
      return;
    }

    if (latitud === null || longitud === null) {
      setGpsMessage(
        'Debes obtener tu ubicación GPS antes de enviar el reporte.'
      );
      return;
    }

// Validar correo si fue proporcionado.
if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
  setMessage('Ingresa un correo electrónico válido.');
  return;
}

// Normalizar teléfono.
const telefonoNormalizado = phone.replace(/[\s()-]/g, '');

// Si acepta WhatsApp, debe proporcionar un número válido.
if (whatsappConsent && !/^\+[1-9]\d{7,14}$/.test(telefonoNormalizado)) {
  setMessage('Para recibir WhatsApp, ingresa un número válido con código de país. Ejemplo: +522291234567.');
  return;
}

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();

      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());

// Datos de contacto.
formData.append('email', email.trim());
formData.append('phone', telefonoNormalizado);
formData.append('whatsapp_consent', whatsappConsent ? '1' : '0');

      // Mantener compatibilidad con el campo location del backend.
      formData.append(
        'location',
        `Ubicación GPS: ${latitud}, ${longitud}`
      );

      // Coordenadas geográficas.
      formData.append('latitud', String(latitud));
      formData.append('longitud', String(longitud));

      // Fotografía inicial.
      formData.append('photo', photoFile);

      const response = await fetch('/api/reportes', {
        method: 'POST',
        body: formData,
      });

      const rawText = await response.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("Respuesta no JSON (HTTP " + response.status + "): " + rawText.slice(0, 120));
  }

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
          data.error ||
          'No fue posible registrar el reporte.'
        );
      }

      const reportData =
        data.reporte ||
        data.data?.reporte ||
        data.data ||
        data;

      const folio =
        data.folio ||
        data.numeroFolio ||
        reportData.folio ||
        reportData.numero_folio ||
        null;

      const codigo =
        data.codigo ||
        data.codigoSeguimiento ||
        reportData.codigo ||
        reportData.codigoSeguimiento ||
        reportData.codigo_seguimiento ||
        null;

      setResult({
        folio,
        codigo,
        title: title.trim(),
        category,
      });

      // Eliminar fotografía temporal después del registro.
      sessionStorage.removeItem('ca-report-photo');

      setStep('done');

    } catch (error) {
      setMessage(
        error.message ||
        'Ocurrió un error al enviar el reporte. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de carga.
  if (step === 'loading') {
    return (
      <main className="ca-muni-page">
        <div className="ca-muni-topbar">
          <div className="ca-muni-container ca-muni-topbar-content">
            <span>PORTAL DE ATENCIÓN CIUDADANA</span>
          </div>
        </div>

        <div className="ca-report-loading">
          <div className="ca-report-spinner"></div>
          <p>Preparando el formulario de reporte...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="ca-muni-page">

      {/* Barra institucional */}
      <div className="ca-muni-topbar">
        <div className="ca-muni-container ca-muni-topbar-content">
          <span>PORTAL DE ATENCIÓN CIUDADANA</span>
          <span>PARTICIPACIÓN · SERVICIO · COMUNIDAD</span>
        </div>
      </div>

      {/* Encabezado */}
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

            <Link href="/seguimiento">
              Seguimiento
            </Link>

            <Link href="/login" className="ca-muni-admin">
              Acceso administrativo
            </Link>
          </nav>

        </div>
      </header>

      {/* Portada */}
      <section className="ca-muni-hero ca-report-hero">
        <div className="ca-muni-container ca-muni-hero-content">

          <div className="ca-muni-hero-label">
            <span></span>
            REGISTRO DE INCIDENCIAS
          </div>

          <h1>
            Reporta una incidencia
            <br />
            <strong>de tu comunidad.</strong>
          </h1>

          <p>
            Proporciona los detalles del problema para que pueda
            ser identificado y canalizado para su atención.
          </p>

        </div>
      </section>

      {/* Formulario */}
      <section className="ca-muni-main ca-report-main">
        <div className="ca-muni-container">

          {/* Fotografía no encontrada */}
          {step === 'missing' && (
            <div className="ca-report-missing">

              <div className="ca-report-missing-icon">!</div>

              <h2>No encontramos tu fotografía</h2>

              <p>
                Para generar un reporte primero debes tomar o seleccionar
                una fotografía desde la página principal.
              </p>

              {message && (
                <div className="ca-track-error">
                  {message}
                </div>
              )}

              <Link href="/" className="ca-report-return-button">
                ← Regresar al inicio y tomar fotografía
              </Link>

            </div>
          )}

          {/* Formulario principal */}
          {step === 'form' && (
            <div className="ca-report-card">

              {/* Encabezado */}
              <div className="ca-report-heading">
                <div className="ca-muni-number">01</div>

                <div>
                  <h2>Datos de la incidencia</h2>
                  <p>
                    Completa la información del problema que deseas reportar.
                  </p>
                </div>
              </div>

              {/* Fotografía recuperada */}
              <div className="ca-report-photo-section">

                <div className="ca-report-photo-heading">
                  <div>
                    <span className="ca-report-section-label">
                      EVIDENCIA FOTOGRÁFICA
                    </span>

                    <h3>Fotografía del problema</h3>

                    <p>
                      Esta es la imagen que seleccionaste al iniciar
                      tu reporte. No necesitas tomar otra fotografía.
                    </p>
                  </div>

                  <span className="ca-report-photo-status">
                    ✓ Seleccionada
                  </span>
                </div>

                <div className="ca-report-photo-preview">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Fotografía de la incidencia"
                    />
                  )}
                </div>

                <div className="ca-report-photo-filename">
                  <span>Archivo de evidencia</span>
                  <strong>
                    {photoFile?.name || 'evidencia.jpg'}
                  </strong>
                </div>

              </div>

              {/* Datos del reporte */}
              <form onSubmit={handleSubmit} className="ca-report-form">

                <div className="ca-report-form-heading">
                  <div className="ca-muni-number">02</div>

                  <div>
                    <h3>Descripción del problema</h3>
                    <p>
                      Indica qué situación necesita atención.
                    </p>
                  </div>
                </div>

                {/* Título */}
                <div className="ca-report-field">
                  <label htmlFor="report-title">
                    Título del reporte *
                  </label>

                  <input
                    id="report-title"
                    type="text"
                    placeholder="Ej. Luminaria apagada en la colonia"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                {/* Categoría */}
                <div className="ca-report-field">
                  <label htmlFor="report-category">
                    Tipo de incidencia *
                  </label>

                  <select
                    id="report-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    required
                  >
                    <option value="">
                      Selecciona una categoría
                    </option>

                    <option value="Alumbrado público">
                      Alumbrado público
                    </option>

                    <option value="Baches y vialidades">
                      Baches y vialidades
                    </option>

                    <option value="Agua y drenaje">
                      Agua y drenaje
                    </option>

                    <option value="Limpieza pública">
                      Limpieza pública
                    </option>

                    <option value="Espacios públicos">
                      Espacios públicos
                    </option>

                    <option value="Señalización">
                      Señalización
                    </option>

                    <option value="Otro">
                      Otro
                    </option>
                  </select>
                </div>

                {/* Descripción */}
                <div className="ca-report-field">
                  <label htmlFor="report-description">
                    Descripción detallada *
                  </label>

                  <textarea
                    id="report-description"
                    placeholder="Explica qué está sucediendo, desde cuándo observas el problema y cómo afecta a la comunidad..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={5}
                    maxLength={1500}
                    required
                  />

                  <small>
                    {description.length}/1500 caracteres
                  </small>
                </div>

                {/* Ubicación GPS */}
                <div className="ca-report-field">

                  <label>
                    Ubicación de la incidencia *
                  </label>

                  <p className="ca-location-description">
                    Obtén tu ubicación actual mediante GPS.
                    Esta información permitirá identificar dónde
                    se encuentra el problema.
                  </p>

                  <button
                    type="button"
                    onClick={obtenerUbicacion}
                    disabled={gpsLoading}
                    className="ca-report-submit ca-location-gps-button"
                  >
                    {gpsLoading
                      ? 'Obteniendo ubicación...'
                      : '📍 Obtener mi ubicación GPS'}
                  </button>

                  {gpsMessage && (
                    <p className="ca-location-message" role="status">
                      {gpsMessage}
                    </p>
                  )}

                  {/* Coordenadas */}
                  {latitud !== null && longitud !== null && (
                    <div className="ca-location-result">

                      <div className="ca-location-result-heading">
                        <span>✓</span>
                        <strong>Ubicación registrada</strong>
                      </div>

                      <div className="ca-location-coordinates">
                        <div>
                          <span>LATITUD</span>
                          <strong>{latitud.toFixed(7)}</strong>
                        </div>

                        <div>
                          <span>LONGITUD</span>
                          <strong>{longitud.toFixed(7)}</strong>
                        </div>
                      </div>

                      {gpsAccuracy !== null && (
                        <small>
                          Precisión aproximada: {Math.round(gpsAccuracy)} metros.
                        </small>
                      )}

                      <a
                        href={`https://www.openstreetmap.org/?mlat=${latitud}&mlon=${longitud}#map=18/${latitud}/${longitud}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ca-location-map-link"
                      >
                        Ver ubicación en el mapa ↗
                      </a>

                    </div>
                  )}

                </div>


{/* Datos de contacto */}
<div className="ca-report-form-heading">
  <div className="ca-muni-number">03</div>
  <div>
    <h3>Datos de contacto</h3>
    <p>Recibe actualizaciones sobre el estado de tu reporte.</p>
  </div>
</div>

<div className="ca-report-field">
  <label htmlFor="report-email">Correo electrónico (opcional)</label>
  <input
    id="report-email"
    type="email"
    placeholder="tucorreo@ejemplo.com"
    value={email}
    onChange={(event) => setEmail(event.target.value)}
    maxLength={150}
  />
</div>

<div className="ca-report-field">
  <label htmlFor="report-phone">Número de WhatsApp (opcional)</label>
  <input
    id="report-phone"
    type="tel"
    placeholder="+522291234567"
    value={phone}
    onChange={(event) => setPhone(event.target.value)}
    maxLength={20}
  />
  <small>Incluye el código de país. Para México utiliza +52.</small>
</div>

<div className="ca-report-field">
  <label>
    <input
      type="checkbox"
      checked={whatsappConsent}
      onChange={(event) => setWhatsappConsent(event.target.checked)}
    />
    Acepto recibir notificaciones de mi reporte por WhatsApp.
  </label>
  <small>
    Solo utilizaremos tu número para enviarte actualizaciones relacionadas
    con este reporte.
  </small>
</div>


                {/* Mensaje de error */}
                {message && (
                  <div className="ca-track-error" role="alert">
                    <strong>No se pudo enviar el reporte</strong>
                    <span>{message}</span>
                  </div>
                )}

                {/* Acciones */}
                <div className="ca-report-form-actions">

                  <Link
                    href="/"
                    className="ca-report-cancel"
                  >
                    Cancelar
                  </Link>

                  <button
                    type="submit"
                    className="ca-report-submit"
                    disabled={
                      loading ||
                      gpsLoading ||
                      !photoFile ||
                      latitud === null ||
                      longitud === null
                    }
                  >
                    {loading
                      ? 'Registrando reporte...'
                      : 'Enviar reporte ciudadano →'}
                  </button>

                </div>

                <p className="ca-report-required-note">
                  * Todos los campos son obligatorios.
                  Debes permitir el acceso al GPS para continuar.
                </p>

              </form>

            </div>
          )}

          {/* Confirmación */}
          {step === 'done' && (
            <div className="ca-report-success">

              <div className="ca-report-success-icon">
                ✓
              </div>

              <span className="ca-report-section-label">
                REGISTRO COMPLETADO
              </span>

              <h2>Tu reporte fue registrado</h2>

              <p>
                Gracias por participar. Conserva tus datos de seguimiento
                para consultar el estado de tu incidencia.
              </p>

              <div className="ca-report-credentials">

                <div>
                  <span>Folio de tu reporte</span>
                  <strong>
                    {result?.folio || 'No proporcionado por el servidor'}
                  </strong>
                </div>

                <div>
                  <span>Código de seguimiento</span>
                  <strong>
                    {result?.codigo || 'No proporcionado por el servidor'}
                  </strong>
                </div>

              </div>

              <div className="ca-report-success-actions">

                {result?.folio && result?.codigo ? (
                  <Link
                    href={`/seguimiento?folio=${encodeURIComponent(result.folio)}&codigo=${encodeURIComponent(result.codigo)}`}
                    className="ca-report-submit"
                  >
                    Consultar estado del reporte →
                  </Link>
                ) : (
                  <Link
                    href="/seguimiento"
                    className="ca-report-submit"
                  >
                    Ir a seguimiento →
                  </Link>
                )}

                <Link href="/" className="ca-report-cancel">
                  Volver al inicio
                </Link>

              </div>

            </div>
          )}

        </div>
      </section>

      {/* Pie institucional */}
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
