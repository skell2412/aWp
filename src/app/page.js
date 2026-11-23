'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

const TARJETAS_RESPALDO = [
  {
    id: 'fallback-1',
    badge: 'VERSÍCULO POPULAR',
    subtitulo: 'FORTALEZA Y FE',
    titulo: 'CAMINO Y VERDAD',
    descripcion:
      'Mensaje de aliento y seguridad para no desmayar ante las pruebas, recordando presencia, respaldo y fuerza renovada en el camino.',
    referencia: 'ISAÍAS 41:10',
    imagen_url:
      'https://images.pexels.com/photos/267559/pexels-photo-267559.jpeg?auto=compress&cs=tinysrgb&w=800',
    pie_tarjeta: 'PROFETAS Y ENSEÑANZAS DE ESPERANZA',
  },
  {
    id: 'fallback-2',
    badge: 'PASAJE DESTACADO',
    subtitulo: 'SERENIDAD INTERIOR',
    titulo: 'PAZ QUE GUARDA',
    descripcion:
      'Una calma profunda que sostiene el corazón y el pensamiento incluso cuando las circunstancias alrededor son cambiantes.',
    referencia: 'FILIPENSES 4:7',
    imagen_url:
      'https://images.pexels.com/photos/1612861/pexels-photo-1612861.jpeg?auto=compress&cs=tinysrgb&w=800',
    pie_tarjeta: 'REFLEXIONES DE PAZ Y ESPERANZA',
  },
];

const ESTADOS_RAPIDOS = ['Paz', 'Fortaleza', 'Consuelo', 'Gratitud'];

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [tarjetas, setTarjetas] = useState(TARJETAS_RESPALDO);
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('lumina-theme');
    const isDark = saved ? saved === 'dark' : document.body.classList.contains('dark-mode');
    setDarkMode(isDark);
    document.body.classList.toggle('dark-mode', isDark);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle('dark-mode', next);
    try {
      localStorage.setItem('lumina-theme', next ? 'dark' : 'light');
    } catch (e) {}
  };

  useEffect(() => {
    let active = true;

    async function cargarDestacados() {
      const { data, error } = await supabase
        .from('versiculos')
        .select('*')
        .eq('destacado', true)
        .order('created_at', { ascending: false });

      if (!active || error || !Array.isArray(data) || data.length === 0) {
        return;
      }

      const normalizadas = data.map((item) => ({
        id: item.id,
        badge: item.badge || 'PASAJE DESTACADO',
        subtitulo: item.subtitulo || 'ESPACIO DE PAZ',
        titulo: item.titulo || 'LUMINA',
        descripcion: item.descripcion || '',
        referencia: item.referencia || '',
        imagen_url:
          item.imagen_url ||
          'https://images.pexels.com/photos/1612861/pexels-photo-1612861.jpeg?auto=compress&cs=tinysrgb&w=800',
        pie_tarjeta: item.referencia
          ? `${item.referencia} · LUMINA`
          : 'PROFETAS Y ENSEÑANZAS DE ESPERANZA',
      }));

      setTarjetas(normalizadas);
      setIndiceActual(0);
    }

    cargarDestacados();

    return () => {
      active = false;
    };
  }, []);

  const tarjetaActiva = tarjetas[indiceActual] || TARJETAS_RESPALDO[0];

  const siguienteTarjeta = () => {
    setIndiceActual((prev) => (prev + 1) % tarjetas.length);
  };

  return (
    <main className="lumina-page-shell">
      <header className="app-header">
        <a href="/" className="header-brand-link">
          LUMINA
        </a>
        <a href="/" className="header-logo-badge" title="Inicio">
          <span style={{ fontSize: '1.2rem', color: 'var(--gold-accent)' }}>
            ✝
          </span>
        </a>
        <nav className="header-nav-icons">
          <a href="/" className="nav-icon-link active" title="Inicio">
            <i className="fa-solid fa-house"></i>
          </a>
          <a href="/buscador" className="nav-icon-link" title="Buscador">
            <i className="fa-solid fa-magnifying-glass"></i>
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="nav-icon-btn"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <a href="/login" className="nav-icon-link" title="Panel Admin">
            <i className="fa-solid fa-user-shield"></i>
          </a>
        </nav>
      </header>

      <section className="home-hero-wrapper">
        <article className="home-featured-grid">
          <div
            className="home-media-pane"
            style={{ backgroundImage: `url("${tarjetaActiva.imagen_url}")` }}
          >
            <span className="home-media-badge">{tarjetaActiva.badge}</span>
          </div>

          <div className="home-content-pane">
            <div>
              <p className="welcome-subtitle">{tarjetaActiva.subtitulo}</p>
              <h1 className="title-lumina" style={{ fontSize: '1.9rem', marginTop: '0.25rem' }}>
                {tarjetaActiva.titulo}
              </h1>

              <p className="home-quote-text">{tarjetaActiva.descripcion}</p>
              {tarjetaActiva.referencia && (
                <p className="home-quote-ref">{tarjetaActiva.referencia}</p>
              )}
            </div>

            <div>
              <div className="home-mood-row">
                {ESTADOS_RAPIDOS.map((estado) => (
                  <a
                    key={estado}
                    href={`/buscador?estado=${encodeURIComponent(estado)}`}
                    className="mood-chip"
                    style={{ textDecoration: 'none' }}
                  >
                    {estado}
                  </a>
                ))}
              </div>

              <div className="home-actions-row" style={{ marginTop: '1.15rem' }}>
                <a
                  href="/buscador"
                  className="btn-primary"
                  style={{ textDecoration: 'none' }}
                >
                  EXPLORAR ESCRITURAS
                </a>

                {tarjetas.length > 1 && (
                  <button
                    type="button"
                    onClick={siguienteTarjeta}
                    className="home-next-btn"
                    title="Siguiente pasaje destacado"
                    aria-label="Siguiente pasaje destacado"
                  >
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                )}
              </div>

              <p className="home-footer-note">{tarjetaActiva.pie_tarjeta}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}