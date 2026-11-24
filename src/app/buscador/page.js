'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import {
  obtenerVersiculoMidvash,
  obtenerVersiculoDelDiaMidvash,
} from '@/app/lib/midvash';

const ESTADOS_ANIMO = ['Todos', 'Paz', 'Fortaleza', 'Consuelo', 'Gratitud'];

const MAPA_VERSIONES = {
  rvr1909: { etiqueta: 'Reina-Valera 1909', claves: ['RVR1909', 'REINA-VALERA', 'REINA VALERA'] },
  rvg: { etiqueta: 'Reina-Valera Gómez', claves: ['RVG', 'REINA-VALERA GÓMEZ', 'REINA VALERA GOMEZ', 'GÓMEZ', 'GOMEZ'] },
  pdt: { etiqueta: 'Palabra de Dios para ti', claves: ['PDT', 'PALABRA DE DIOS PARA TI'] },
  'onbv-es': { etiqueta: 'Open Nueva Biblia Viva', claves: ['ONBV-ES', 'NUEVA BIBLIA VIVA'] },
  sev: { etiqueta: 'Sagradas Escrituras 1569', claves: ['SEV', 'SAGRADAS ESCRITURAS'] },
};

function coincideConVersion(item, codigoVersion) {
  if (!codigoVersion || codigoVersion === 'todas') return true;
  const info = MAPA_VERSIONES[codigoVersion];
  if (!info) return true;
  const textoComparar = `${item.badge || ''} ${item.subtitulo || ''} ${item.referencia || ''}`.toUpperCase();
  return info.claves.some((clave) => textoComparar.includes(clave.toUpperCase()));
}

function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/
  );
  if (!match || !match[1]) return '';
  return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1`;
}

function BuscadorContenido() {
  const searchParams = useSearchParams();
  const estadoInicial = searchParams.get('estado');

  const [darkMode, setDarkMode] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Todos');
  const [versionBiblia, setVersionBiblia] = useState('todas');

  const [versiculosDb, setVersiculosDb] = useState([]);
  const [cargandoDb, setCargandoDb] = useState(true);

  const [videosDb, setVideosDb] = useState([]);
  const [cargandoVideos, setCargandoVideos] = useState(true);

  const [resultadoBiblia, setResultadoBiblia] = useState(null);
  const [cargandoBiblia, setCargandoBiblia] = useState(false);
  const [errorBiblia, setErrorBiblia] = useState('');

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
    } catch (e) { }
  };

  useEffect(() => {
    if (!estadoInicial) return;
    const match = ESTADOS_ANIMO.find((e) => e.toLowerCase() === estadoInicial.toLowerCase());
    if (match) setEstadoSeleccionado(match);
  }, [estadoInicial]);

  useEffect(() => {
    async function cargarVersiculos() {
      setCargandoDb(true);
      const { data, error } = await supabase
        .from('versiculos')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) setVersiculosDb(data);
      setCargandoDb(false);
    }
    cargarVersiculos();
  }, []);

  useEffect(() => {
    async function cargarVideos() {
      setCargandoVideos(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) setVideosDb(data);
      setCargandoVideos(false);
    }
    cargarVideos();
  }, []);

  const versiculosFiltrados = versiculosDb.filter((item) => {
    const coincideEstado =
      estadoSeleccionado === 'Todos' ||
      (item.estado_animo || '').toLowerCase() === estadoSeleccionado.toLowerCase();
    const coincideVersion = coincideConVersion(item, versionBiblia);
    const termino = busqueda.trim().toLowerCase();
    const coincideTexto =
      !termino ||
      (item.titulo || '').toLowerCase().includes(termino) ||
      (item.descripcion || '').toLowerCase().includes(termino) ||
      (item.referencia || '').toLowerCase().includes(termino) ||
      (item.subtitulo || '').toLowerCase().includes(termino) ||
      (item.badge || '').toLowerCase().includes(termino) ||
      (item.estado_animo || '').toLowerCase().includes(termino);
    return coincideEstado && coincideVersion && coincideTexto;
  });

  const versionApiEfectiva = versionBiblia === 'todas' ? 'rvr1909' : versionBiblia;

  async function handleBuscarCitaBiblica(e) {
    e.preventDefault();
    setErrorBiblia('');
    setResultadoBiblia(null);
    if (!busqueda.trim()) {
      setErrorBiblia('Escribe una cita como "Juan 3:16" o "Salmos 23:1".');
      return;
    }
    setCargandoBiblia(true);
    try {
      const versiculo = await obtenerVersiculoMidvash(busqueda, versionApiEfectiva);
      setResultadoBiblia(versiculo);
    } catch (err) {
      setErrorBiblia(err.message || 'No se pudo consultar la cita.');
    } finally {
      setCargandoBiblia(false);
    }
  }

  async function handleVersiculoDelDia() {
    setErrorBiblia('');
    setResultadoBiblia(null);
    setCargandoBiblia(true);
    try {
      const personalizado = versiculosDb.find((item) => {
        const badgeTexto = (item.badge || '').toUpperCase();
        const tituloTexto = (item.titulo || '').toUpperCase();
        return (
          badgeTexto.includes('VERSÍCULO DEL DÍA') ||
          badgeTexto.includes('VERSICULO DEL DIA') ||
          tituloTexto.includes('VERSÍCULO DEL DÍA') ||
          tituloTexto.includes('VERSICULO DEL DIA')
        );
      });
      if (personalizado) {
        setResultadoBiblia({
          titulo: personalizado.titulo,
          subtitulo: personalizado.subtitulo || personalizado.estado_animo || 'REFLEXIÓN LUMINA',
          badge: personalizado.badge || 'VERSÍCULO DEL DÍA',
          descripcion: personalizado.descripcion || '',
          referencia: personalizado.referencia || 'LUMINA · CATÁLOGO',
        });
        return;
      }
      const votd = await obtenerVersiculoDelDiaMidvash(versionApiEfectiva);
      const textoLimpio = (votd?.descripcion || '').trim();
      if (!textoLimpio) {
        setResultadoBiblia({
          titulo: votd?.titulo || 'VERSÍCULO DEL DÍA',
          subtitulo: votd?.subtitulo || 'REFLEXIÓN DIARIA',
          badge: 'VERSÍCULO DEL DÍA',
          descripcion:
            'El versículo diario se gestiona desde el panel de administración y no devolvió texto externo en esta consulta.',
          referencia: votd?.referencia || `VERSIÓN ${versionApiEfectiva.toUpperCase()}`,
        });
        return;
      }
      setResultadoBiblia(votd);
    } catch (err) {
      setErrorBiblia(err.message || 'No se pudo cargar el versículo del día.');
    } finally {
      setCargandoBiblia(false);
    }
  }

  const etiquetaVersionActual =
    versionBiblia === 'todas'
      ? 'Todas las versiones'
      : MAPA_VERSIONES[versionBiblia]?.etiqueta || versionBiblia;

  return (
    <main className="lumina-page-shell">
      <header className="app-header">
        <Link href="/" className="header-brand-link">
          LUMINA
        </Link>
        <Link href="/" className="header-logo-badge" title="Inicio">
          <span style={{ fontSize: '1.2rem', color: 'var(--gold-accent)' }}>✝</span>
        </Link>
        <nav className="header-nav-icons">
          <Link href="/" className="nav-icon-link" title="Inicio">
            <i className="fa-solid fa-house"></i>
          </Link>
          <Link href="/buscador" className="nav-icon-link active" title="Buscador">
            <i className="fa-solid fa-magnifying-glass"></i>
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="nav-icon-btn"
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <Link href="/login" className="nav-icon-link" title="Panel Admin">
            <i className="fa-solid fa-user-shield"></i>
          </Link>
        </nav>
      </header>

      <section className="section-shell">
        <div className="lumina-panel">
          <p className="welcome-subtitle">EXPLORACIÓN Y ESCRITURAS</p>
          <h1 className="title-lumina" style={{ fontSize: '1.85rem' }}>
            BUSCADOR LUMINA
          </h1>
          <p className="section-subcopy">
            Filtra pasajes por estado de ánimo o versión, o busca por libro, autor o cita directa.
          </p>

          <form onSubmit={handleBuscarCitaBiblica} className="search-toolbar">
            <input
              type="text"
              className="lumina-input"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder='Busca por libro, autor o cita (ej. "Juan", "Salmos", "Juan 3:16")...'
            />
            <select
              className="lumina-select"
              value={versionBiblia}
              onChange={(e) => setVersionBiblia(e.target.value)}
              aria-label="Versión de la Biblia"
            >
              <option value="todas">Todas las versiones</option>
              <option value="rvr1909">Reina-Valera 1909</option>
              <option value="rvg">Reina-Valera Gómez</option>
              <option value="pdt">Palabra de Dios para ti</option>
              <option value="onbv-es">Open Nueva Biblia Viva</option>
              <option value="sev">Sagradas Escrituras 1569</option>
            </select>
            <button type="submit" className="btn-primary">
              <i className="fa-solid fa-book-bible"></i> BUSCAR CITA
            </button>
            <button
              type="button"
              onClick={handleVersiculoDelDia}
              className="mood-chip mood-filter-chip"
            >
              <i className="fa-solid fa-sun"></i> Versículo del día
            </button>
          </form>

          <div className="mood-filter-bar">
            {ESTADOS_ANIMO.map((estado) => {
              const activo = estadoSeleccionado === estado;
              return (
                <button
                  key={estado}
                  type="button"
                  onClick={() => setEstadoSeleccionado(estado)}
                  className={`mood-chip mood-filter-chip ${activo ? 'is-active' : ''}`}
                >
                  {estado}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {(cargandoBiblia || errorBiblia || resultadoBiblia) && (
        <section className="section-shell">
          {cargandoBiblia && <p className="section-subcopy">Consultando escritura...</p>}
          {errorBiblia && <p className="feedback-error">{errorBiblia}</p>}
          {resultadoBiblia && (
            <article className="lumina-panel" style={{ marginTop: '0.75rem' }}>
              <div className="verse-card-meta">
                <span>{resultadoBiblia.badge}</span>
                <span>{resultadoBiblia.subtitulo}</span>
              </div>
              <h2 className="verse-card-title" style={{ fontSize: '1.35rem', marginTop: '0.45rem' }}>
                {resultadoBiblia.titulo}
              </h2>
              <p className="verse-card-body" style={{ marginTop: '0.7rem' }}>
                “{resultadoBiblia.descripcion}”
              </p>
              <p className="section-subcopy" style={{ fontSize: '0.82rem', marginBottom: 0 }}>
                {resultadoBiblia.referencia}
              </p>
            </article>
          )}
        </section>
      )}

      <section className="section-shell">
        <div className="section-heading-row">
          <div>
            <h2 className="title-lumina" style={{ fontSize: '1.35rem', margin: 0 }}>
              PASAJES DISPONIBLES ({versiculosFiltrados.length})
            </h2>
            <p className="section-subcopy" style={{ margin: '0.25rem 0 0' }}>
              Estado: <strong>{estadoSeleccionado}</strong> · Versión:{' '}
              <strong>{etiquetaVersionActual}</strong>
            </p>
          </div>
        </div>

        {cargandoDb ? (
          <p className="section-subcopy">Cargando pasajes desde la base de datos...</p>
        ) : versiculosFiltrados.length === 0 ? (
          <div className="lumina-panel">
            <p className="section-subcopy" style={{ margin: 0 }}>
              No hay pasajes que coincidan con el filtro actual.
            </p>
          </div>
        ) : (
          <div className="verses-grid">
            {versiculosFiltrados.map((item) => (
              <article key={item.id} className="verse-card">
                <div>
                  <div className="verse-card-meta">
                    <span>{item.badge || 'PASAJE'}</span>
                    <span>{item.estado_animo || 'Paz'}</span>
                  </div>
                  <h3 className="verse-card-title">{item.titulo}</h3>
                  <p className="verse-card-body" style={{ marginTop: '0.6rem' }}>
                    {item.descripcion}
                  </p>
                </div>
                <div className="verse-card-footer">
                  <span>{item.referencia}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section-shell" style={{ paddingBottom: '4rem' }}>
        <div className="section-heading-row">
          <div>
            <h2 className="title-lumina" style={{ fontSize: '1.35rem', margin: 0 }}>
              VIDEOS Y REFLEXIONES
            </h2>
            <p className="section-subcopy" style={{ margin: '0.25rem 0 0' }}>
              Contenido audiovisual seleccionado para acompañar tu estudio.
            </p>
          </div>
        </div>

        {cargandoVideos ? (
          <p className="section-subcopy">Cargando videos...</p>
        ) : videosDb.length === 0 ? (
          <div className="lumina-panel">
            <p className="section-subcopy" style={{ margin: 0 }}>
              Aún no hay videos disponibles.
            </p>
          </div>
        ) : (
          <div className="verses-grid">
            {videosDb.map((video) => {
              const embedUrl = getYouTubeEmbedUrl(video.url);
              if (!embedUrl) return null;

              return (
                <article
                  key={video.id}
                  className="verse-card"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16 / 9',
                      flexShrink: 0,
                      backgroundColor: '#0e0f14',
                    }}
                  >
                    <iframe
                      src={embedUrl}
                      title={video.titulo || 'Video de Lumina'}
                      referrerPolicy="strict-origin-when-cross-origin"
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        display: 'block',
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <h3 className="verse-card-title" style={{ fontSize: '1.1rem', margin: 0 }}>
                      {video.titulo}
                    </h3>
                    {video.url && (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--gold-accent)',
                          textDecoration: 'underline',
                        }}
                      >
                        ¿El video no carga? Abrir en YouTube
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <footer style={{
        backgroundColor: 'rgba(10, 10, 12, 0.95)',
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        padding: '4rem 2rem 2rem',
        color: '#a0a0a0',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>

          <div>
            <h3 style={{ color: 'var(--gold-accent, #d4af37)', fontFamily: 'Cinzel, serif', fontSize: '1.5rem', marginBottom: '1rem' }}>
              LUMINA <span style={{ fontSize: '0.8rem', verticalAlign: 'super' }}>®</span>
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              Iluminando tu día con la palabra y la fe. Una plataforma dedicada a acercarte a las escrituras de forma moderna.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: '1.2rem', fontSize: '1rem', letterSpacing: '0.05em' }}>Contacto</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', lineHeight: '2' }}>
              <li>📧 correo@lumina.com</li>
              <li>📞 +52 123 456 7890</li>
              <li>📍 Av. Reforma #123, CDMX</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', marginBottom: '1.2rem', fontSize: '1rem', letterSpacing: '0.05em' }}>Datos de la Empresa</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', lineHeight: '2' }}>
              <li>Lumina Tech S.A. de C.V.</li>
              <li>RUC / NIT: 123456789-0</li>
              <li>Horario: Lun - Vie 9:00 - 18:00</li>
            </ul>
          </div>
        </div>

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem'
        }}>
          <p style={{ margin: 0 }}>
            &copy; {new Date().getFullYear()} LUMINA. Todos los derechos reservados. Marca Registrada ®.
          </p>
          <p style={{ margin: 0, marginTop: '0.5rem' }}>
            Hecho con fe y tecnología.
          </p>
        </div>
      </footer>

    </main>



  );
}

export default function BuscadorPage() {
  return (
    <Suspense
      fallback={
        <main className="lumina-page-shell">
          <p>Cargando buscador...</p>
        </main>
      }
    >
      <BuscadorContenido />
    </Suspense>
  );
}