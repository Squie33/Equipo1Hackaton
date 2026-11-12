
"use client";

import { useState } from "react";

export default function ReportePage() {
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [direccion, setDireccion] = useState("");
  const [imagenes, setImagenes] = useState([]);
  const [mensaje, setMensaje] = useState("");

  function obtenerUbicacion() {
    if (!navigator.geolocation) {
      setMensaje("Tu navegador no permite obtener la ubicación.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitud(position.coords.latitude.toFixed(7));
        setLongitud(position.coords.longitude.toFixed(7));
        setMensaje("Ubicación obtenida correctamente.");
      },
      () => setMensaje("No se pudo obtener tu ubicación.")
    );
  }

  function seleccionarImagenes(e) {
    const archivos = Array.from(e.target.files || []);
    const validos = archivos.filter(
      (file) =>
        ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
        file.size <= 5 * 1024 * 1024
    );

    if (validos.length !== archivos.length) {
      setMensaje("Solo se permiten JPG, PNG o WebP de máximo 5 MB.");
    }

    setImagenes(validos.slice(0, 5));
  }

  function enviarReporte(e) {
    e.preventDefault();
    setMensaje(
      "Formulario preparado. La conexión con el servidor se integrará próximamente."
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-[#102D50] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <a href="/" className="text-xl font-bold tracking-wide">
            CIUDAD <span className="text-cyan-300">360</span>
          </a>
          <a href="/" className="text-sm text-slate-200 hover:text-white">
            Volver al inicio
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
            Participación ciudadana
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Realiza un reporte
          </h1>
          <p className="mt-3 text-slate-600">
            Ayúdanos a mejorar tu ciudad. Describe el problema y proporciona
            su ubicación para que podamos atenderlo.
          </p>
        </div>

        <form
          onSubmit={enviarReporte}
          className="space-y-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              01. Información del problema
            </h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">
              Cuéntanos qué sucede en tu comunidad.
            </p>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Categoría del problema *
            </label>
            <select
              required
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Selecciona una categoría</option>
              <option value="Baches">Baches y pavimento</option>
              <option value="Alumbrado">Alumbrado público</option>
              <option value="Fugas de agua">Fugas de agua</option>
              <option value="Basura">Basura y limpieza</option>
              <option value="Otros">Otros problemas</option>
            </select>

            <label className="mb-2 mt-5 block text-sm font-semibold text-slate-700">
              Descripción del problema *
            </label>
            <textarea
              required
              minLength={15}
              maxLength={1500}
              rows={5}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe qué ocurrió, dónde se encuentra y desde cuándo..."
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {descripcion.length}/1500 caracteres
            </p>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900">
              02. Ubicación del incidente
            </h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">
              Indica dónde se encuentra el problema.
            </p>

            <button
              type="button"
              onClick={obtenerUbicacion}
              className="w-full rounded-lg border border-blue-700 px-4 py-3 font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              Obtener mi ubicación actual
            </button>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Latitud
                </label>
                <input
                  value={latitud}
                  onChange={(e) => setLatitud(e.target.value)}
                  placeholder="Ej. 19.1738"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Longitud
                </label>
                <input
                  value={longitud}
                  onChange={(e) => setLongitud(e.target.value)}
                  placeholder="Ej. -96.1342"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <label className="mb-2 mt-4 block text-sm font-semibold text-slate-700">
              Dirección o referencia
            </label>
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Calle, colonia o punto de referencia"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />

            <p className="mt-3 text-xs text-slate-500">
              Próximamente podrás seleccionar el punto exacto directamente
              desde un mapa interactivo.
            </p>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900">
              03. Evidencias fotográficas
            </h2>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Puedes adjuntar hasta cinco fotografías del problema.
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={seleccionarImagenes}
              className="block w-full rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-800"
            />

            {imagenes.length > 0 && (
              <p className="mt-3 text-sm text-slate-600">
                {imagenes.length} fotografía(s) seleccionada(s).
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900">
              04. Datos del ciudadano
            </h2>
            <p className="mb-5 mt-1 text-sm text-slate-500">
              Tus datos son opcionales. También puedes realizar un reporte
              anónimo.
            </p>

            <label className="mb-5 flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={anonimo}
                onChange={(e) => setAnonimo(e.target.checked)}
                className="h-4 w-4 accent-blue-700"
              />
              Deseo realizar este reporte de forma anónima.
            </label>

            {!anonimo && (
              <div className="space-y-4">
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre completo (opcional)"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Correo electrónico (opcional)"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Teléfono (opcional)"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>
            )}
          </div>

          {mensaje && (
            <div
              role="status"
              className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800"
            >
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#173B65] px-6 py-4 font-bold text-white transition hover:bg-[#102D50]"
          >
            Enviar reporte
          </button>

          <p className="text-center text-xs text-slate-400">
            Los campos marcados con * son obligatorios.
          </p>
        </form>
      </section>
    </main>
  );
}
