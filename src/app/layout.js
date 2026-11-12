import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

export const metadata = {
  title: 'VERACRUZ360 | Portal de Atención Ciudadana',
  description:
    'Plataforma ciudadana para reportar problemas comunitarios y consultar su seguimiento.',
  applicationName: 'VERACRUZ360',
};

// Configuración para dispositivos móviles
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
