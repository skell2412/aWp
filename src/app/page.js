'use client';

import { useEffect, useState } from 'react';

const TARJETA_RESPALDO = {
  id: 'fallback-evangelio',
  badge: 'EVANGELIO DEL DÍA',
  subtitulo: 'PALABRA Y LITURGIA',
  titulo: 'EVANGELIO DE HOY',
  descripcion:
    'La palabra cotidiana ofrece guía, serenidad y esperanza para caminar con firmeza en cada jornada.',
  referencia: 'PALABRA DEL SEÑOR',
};

async function cargarEvangelioVaticano() {
  try {
    const res = await fetch('/api/evangelio');
    const data = await res.json();

    if (data?.success && data?.lecturas?.evangelio?.lectura) {
      const { evangelio, indicacionLiturgica } = data.lecturas;

      return {
        id: 'vatican-evangelio-hoy',
        badge: 'EVANGELIO DEL DÍA',
        subtitulo: indicacionLiturgica || 'TIEMPO LITÚRGICO',
        titulo: evangelio.cita || 'EVANGELIO DE HOY',
        descripcion: evangelio.lectura.trim(),
        referencia: 'PALABRA DEL SEÑOR',
      };
    }
  } catch (err) {
    console.warn('No se pudo cargar el evangelio del día:', err);
  }
  return null;
}

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [tarjetaActiva, setTarjetaActiva] = useState(TARJETA_RESPALDO);

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

    async function cargarEvangelioDelDia() {
      const evangelioHoy = await cargarEvangelioVaticano();
      if (active && evangelioHoy) {
        setTarjetaActiva(evangelioHoy);
      }
    }

    cargarEvangelioDelDia();

    return () => {
      active = false;
    };
  }, []);

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
        <article
          className="home-featured-grid"
          style={{
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <div
            className="home-media-pane"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(212, 175, 55, 0.22) 0%, rgba(36, 29, 16, 0.72) 48%, rgba(14, 15, 20, 0.98) 100%)',
              position: 'relative',
              minHeight: '420px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            <span
              className="home-media-badge"
              style={{
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                letterSpacing: '0.08em',
              }}
            >
              {tarjetaActiva.badge}
            </span>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '104px',
                  height: '104px',
                  borderRadius: '999px',
                  border: '1px solid rgba(212, 175, 55, 0.45)',
                  background: 'rgba(212, 175, 55, 0.08)',
                  boxShadow: '0 0 40px rgba(212, 175, 55, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="46"
                  height="58"
                  viewBox="0 0 46 58"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Cruz cristiana"
                >
                  <path
                    d="M23 3V55M9 17H37"
                    stroke="#E5C158"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <span
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(245, 224, 158, 0.82)',
                }}
              >
                LUMINA · FE Y PALABRA
              </span>
            </div>
          </div>

          <div
            className="home-content-pane"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '2.25rem 2.5rem',
            }}
          >
            <div>
              <p
                className="welcome-subtitle"
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  opacity: 0.8,
                }}
              >
                {tarjetaActiva.subtitulo}
              </p>

              <h1
                className="title-lumina"
                style={{
                  fontSize: '2rem',
                  marginTop: '0.4rem',
                  marginBottom: '1rem',
                  lineHeight: 1.2,
                }}
              >
                {tarjetaActiva.titulo}
              </h1>

              <div
                style={{
                  width: '48px',
                  height: '2px',
                  background: 'var(--gold-accent, #d4af37)',
                  opacity: 0.75,
                  marginBottom: '1.15rem',
                }}
              />

              <div
                style={{
                  maxHeight: '260px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <p
                  className="home-quote-text"
                  style={{
                    fontSize: '0.98rem',
                    lineHeight: 1.75,
                    marginBottom: 0,
                  }}
                >
                  {tarjetaActiva.descripcion}
                </p>
              </div>

              {tarjetaActiva.referencia && (
                <p
                  className="home-quote-ref"
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    opacity: 0.85,
                    marginBottom: 0,
                  }}
                >
                  — {tarjetaActiva.referencia}
                </p>
              )}
            </div>

            <div
              className="home-actions-row"
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <a
                href="/buscador"
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                EXPLORAR ESCRITURAS
              </a>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}