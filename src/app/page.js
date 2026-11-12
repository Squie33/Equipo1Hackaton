'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

async function compressPhoto(file) {
  const bitmap = await createImageBitmap(file);

  const maxDimension = 1440;
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height)
  );

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.75);
  });

  if (!blob) {
    throw new Error('No se pudo preparar la fotografía.');
  }

  return new File([blob], 'evidencia.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Selecciona una fotografía válida.');
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage('La fotografía original no debe superar los 10 MB.');
      event.target.value = '';
      return;
    }

    setProcessing(true);
    setMessage('');

    try {
      const optimizedPhoto = await compressPhoto(file);
      setPhoto(optimizedPhoto);
      setPreview(URL.createObjectURL(optimizedPhoto));
    } catch (error) {
      setMessage(error.message || 'No fue posible procesar la fotografía.');
    } finally {
      setProcessing(false);
      event.target.value = '';
    }
  };

  const continueToReport = () => {
    if (!photo || processing) return;

    setProcessing(true);
    setMessage('');

    const reader = new FileReader();

    reader.onload = () => {
      try {
        sessionStorage.setItem(
          'ca-report-photo',
          JSON.stringify({
            dataUrl: reader.result,
            name: photo.name,
            type: photo.type,
          })
        );

        router.push('/reportar');
      } catch {
        setMessage('No se pudo transferir la fotografía. Prueba con otra imagen.');
        setProcessing(false);
      }
    };

    reader.onerror = () => {
      setMessage('Ocurrió un error al preparar la fotografía.');
      setProcessing(false);
    };

    reader.readAsDataURL(photo);
  };

  return (
    <main className="ca-muni-page">

      {/* Barra institucional superior */}
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
            <Link href="/" className="ca-muni-nav-active">
              Inicio
            </Link>

            <Link href="/seguimiento">
              Seguimiento
            </Link>

            <Link href="/login" className="ca-muni-admin">
              Acceso administrativo
            </Link>
          </nav>

        </div>
      </header>

      {/* Encabezado principal */}
      <section className="ca-muni-hero">
        <div className="ca-muni-container ca-muni-hero-content">

          <div className="ca-muni-hero-label">
            <span></span>
            ATENCIÓN A LA CIUDADANÍA
          </div>

          <h1>
            Construyamos juntos
            <br />
            <strong>una mejor comunidad.</strong>
          </h1>

          <p>
            Reporta los problemas que afectan tus espacios públicos.
            Tu participación nos ayuda a identificar necesidades,
            organizar la atención y dar seguimiento a cada incidencia.
          </p>

          <div className="ca-muni-hero-note">
            <span className="ca-muni-note-icon">i</span>
            <span>
              Tu reporte contribuye a mejorar los servicios y espacios
              de nuestra comunidad.
            </span>
          </div>

        </div>
      </section>

      {/* Área principal de acciones */}
      <section className="ca-muni-main">
        <div className="ca-muni-container">

          <div className="ca-muni-section-heading">
            <span>TRÁMITES Y SERVICIOS</span>
            <h2>¿Cómo podemos ayudarte?</h2>
            <p>
              Selecciona una opción para realizar tu reporte
              o consultar su estado.
            </p>
          </div>

          {/* Tarjeta para crear un reporte */}
          <div className="ca-muni-report-card">

            <div className="ca-muni-report-title">
              <div className="ca-muni-number">01</div>

              <div>
                <h3>Realizar un reporte ciudadano</h3>
                <p>
                  Toma una fotografía del problema que deseas reportar.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="ca-muni-file-input"
              onChange={handlePhoto}
            />

            <button
              type="button"
              className={`ca-muni-camera ${preview ? 'ca-muni-camera-preview' : ''}`}
              onClick={openCamera}
              disabled={processing}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Vista previa de la incidencia" />
                  <span className="ca-muni-change-photo">
                    Cambiar fotografía
                  </span>
                </>
              ) : (
                <div className="ca-muni-camera-content">

                  <div className="ca-muni-camera-icon">
                    <svg
                      width="54"
                      height="54"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M14 5h-4L8 8H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-3l-2-3Z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>

                  <strong>TOMAR FOTOGRAFÍA</strong>

                  <span>
                    Selecciona esta opción para abrir la cámara
                    o elegir una imagen de tu dispositivo.
                  </span>

                  <small>JPG, PNG o WEBP · Máximo 10 MB</small>
                </div>
              )}
            </button>

            {photo && (
              <div className="ca-muni-photo-success">
                <span>✓ Fotografía seleccionada correctamente</span>
                <small>{photo.name}</small>
              </div>
            )}

            {message && (
              <div className="alert alert-danger mt-3 mb-0">
                {message}
              </div>
            )}

            <button
              type="button"
              className="ca-muni-continue"
              disabled={!photo || processing}
              onClick={continueToReport}
            >
              {processing
                ? 'Preparando fotografía...'
                : 'Continuar con el reporte →'}
            </button>

            <p className="ca-muni-privacy">
              La fotografía servirá como evidencia para describir
              la incidencia en el siguiente paso.
            </p>

          </div>

          {/* Seguimiento */}
          <div className="ca-muni-tracking">

            <div className="ca-muni-tracking-icon">
              <svg
                width="31"
                height="31"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
                <path d="M11 7v4l2 2" />
              </svg>
            </div>

            <div className="ca-muni-tracking-text">
              <strong>¿Ya tienes un reporte?</strong>
              <span>
                Consulta su estado utilizando tus datos de seguimiento.
              </span>
            </div>

            <Link
              href="/seguimiento"
              className="ca-muni-tracking-button"
            >
              Consultar seguimiento →
            </Link>

          </div>

          {/* Categorías de problemas */}
          <div className="ca-muni-categories">
            <div className="ca-muni-categories-heading">
              <span>INCIDENCIAS COMUNITARIAS</span>
              <h2>¿Qué puedes reportar?</h2>
            </div>

            <div className="ca-muni-category-grid">
              <div className="ca-muni-category">
                <span>01</span>
                <strong>Alumbrado público</strong>
                <small>Luminarias apagadas o dañadas</small>
              </div>

              <div className="ca-muni-category">
                <span>02</span>
                <strong>Calles y vialidades</strong>
                <small>Baches y daños en pavimento</small>
              </div>

              <div className="ca-muni-category">
                <span>03</span>
                <strong>Agua y drenaje</strong>
                <small>Fugas y problemas de drenaje</small>
              </div>

              <div className="ca-muni-category">
                <span>04</span>
                <strong>Limpieza pública</strong>
                <small>Basura y espacios descuidados</small>
              </div>
            </div>
          </div>

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
