import { Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

export const metadata = {
  title: 'Lumina - Espacio de Paz y Esperanza',
  description: 'PWA de pasajes bíblicos, estados de ánimo y reflexión diaria.',
  manifest: '/manifest.json',
};

const themeInitScript = `
  try {
    var saved = localStorage.getItem('lumina-theme');
    if (saved === 'dark') {
      document.body.classList.add('dark-mode');
    } else if (saved === 'light') {
      document.body.classList.remove('dark-mode');
    }
  } catch (e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
<body suppressHydrationWarning>
  <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
  {children}
</body>
    </html>
  );
}