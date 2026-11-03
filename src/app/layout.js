import { Cinzel, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel'
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta'
});

export const metadata = {
  title: 'Lumina - Espacio de Paz y Esperanza',
  description: 'Consulta escrituras y cartas bíblicas según tu estado de ánimo.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${plusJakarta.variable}`}>
      <head>
        {/* Importamos FontAwesome para que carguen los iconos correctamente */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}