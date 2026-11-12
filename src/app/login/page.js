
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError('');

    if (!correo.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          correo: correo.trim(),
          password: password,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || 'Credenciales incorrectas.');
        return;
      }

      if (datos.success) {
        window.location.replace('https://10.70.2.13/panel-de-control');
      } else {
        setError('No se pudo iniciar sesión.');
      }

    } catch (err) {
      console.error('Error de autenticación:', err);
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="ca-muni-page">

      {/* Barra superior */}
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
            <Link href="/seguimiento">Seguimiento</Link>
            <Link href="/login" className="ca-muni-nav-active">
              Administración
            </Link>
          </nav>

        </div>
      </header>

      {/* Formulario de inicio de sesión */}
      <section
        style={{
          minHeight: '75vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 20px',
          background: '#f1f5f9',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: '#ffffff',
            padding: '38px',
            borderRadius: '16px',
            boxShadow: '0 12px 35px rgba(0,0,0,0.10)',
          }}
        >

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>

            <div
              style={{
                width: '70px',
                height: '70px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                background: '#17365d',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '24px',
              }}
            >
              V3
            </div>

            <h1
              style={{
                color: '#17365d',
                fontSize: '27px',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              Acceso administrativo
            </h1>

            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Ingresa tus credenciales para acceder al
              panel de administración de reportes ciudadanos.
            </p>

          </div>

          <form onSubmit={iniciarSesion}>

            {/* Correo electrónico */}
            <div style={{ marginBottom: '22px' }}>
              <label
                htmlFor="correo"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#334155',
                  fontWeight: '600',
                }}
              >
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="administrador@comunidadactiva.mx"
                autoComplete="username"
                required
                style={{
                  width: '100%',
                  padding: '13px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '15px',
                  color: '#0f172a',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Contraseña */}
            <div style={{ marginBottom: '22px' }}>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#334155',
                  fontWeight: '600',
                }}
              >
                Contraseña
              </label>

              <div style={{ display: 'flex', position: 'relative' }}>
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    padding: '13px',
                    paddingRight: '85px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '15px',
                    color: '#0f172a',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                />

                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {mostrarPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div
                role="alert"
                style={{
                  background: '#fef2f2',
                  color: '#b91c1c',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}

            {/* Botón de acceso */}
            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%',
                padding: '14px',
                background: cargando ? '#64748b' : '#17365d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: cargando ? 'not-allowed' : 'pointer',
              }}
            >
              {cargando ? 'Verificando credenciales...' : 'Iniciar sesión'}
            </button>

          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
            }}
          >
            <p style={{ color: '#64748b', fontSize: '13px' }}>
              Acceso exclusivo para personal autorizado.
            </p>

            <Link
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '15px',
                color: '#2563eb',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              ← Volver al portal ciudadano
            </Link>
          </div>

        </div>
      </section>

      {/* Pie de página */}
      <footer className="ca-muni-footer">
        <div className="ca-muni-container">
          <div className="ca-muni-footer-bottom">
            <span>Portal de Atención Ciudadana</span>
            <span>© 2026 VERACRUZ360</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
