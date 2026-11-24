'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

const ESTADOS_ANIMO = ['Paz', 'Fortaleza', 'Consuelo', 'Gratitud'];

const OPCIONES_VERSION_SELECT = [
  { label: 'Reina-Valera', valor: 'REINA-VALERA' },
  { label: 'Reina-Valera Gómez', valor: 'REINA-VALERA GÓMEZ' },
  { label: 'Palabra de Dios para ti', valor: 'PALABRA DE DIOS PARA TI' },
  { label: 'Nueva Biblia Viva', valor: 'NUEVA BIBLIA VIVA' },
  { label: 'Sagradas Escrituras', valor: 'SAGRADAS ESCRITURAS' },
  { label: 'Versículo del día', valor: 'VERSÍCULO DEL DÍA' },
];

const MAPA_VERSIONES = {
  todas: { etiqueta: 'Todas las versiones', claves: [] },
  rvr1909: { etiqueta: 'Reina-Valera 1909', claves: ['RVR1909', 'REINA-VALERA', 'REINA VALERA'] },
  rvg: { etiqueta: 'Reina-Valera Gómez', claves: ['RVG', 'REINA-VALERA GÓMEZ', 'REINA VALERA GOMEZ', 'GÓMEZ', 'GOMEZ'] },
  pdt: { etiqueta: 'Palabra de Dios para ti', claves: ['PDT', 'PALABRA DE DIOS PARA TI'] },
  'onbv-es': { etiqueta: 'Open Nueva Biblia Viva', claves: ['ONBV-ES', 'NUEVA BIBLIA VIVA'] },
  sev: { etiqueta: 'Sagradas Escrituras 1569', claves: ['SEV', 'SAGRADAS ESCRITURAS'] },
};

function coincideConVersion(item, codigoVersion) {
  if (!codigoVersion || codigoVersion === 'todas') return true;
  const info = MAPA_VERSIONES[codigoVersion];
  if (!info || !info.claves.length) return true;

  const textoComparar = `${item.badge || ''} ${item.subtitulo || ''} ${item.referencia || ''}`.toUpperCase();
  return info.claves.some((clave) => textoComparar.includes(clave.toUpperCase()));
}

function limpiarAutor(valorSubtitulo) {
  if (!valorSubtitulo) return '';
  return valorSubtitulo.split('·')[0].trim();
}

function extraerYouTubeId(url) {
  if (!url) return '';
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : '';
}

const FORMULARIO_VACIO = {
  titulo: '',
  subtitulo: 'PABLO',
  badge: 'REINA-VALERA',
  descripcion: '',
  referencia: '',
  estado_animo: 'Paz',
  imagen_url: 'https://images.pexels.com/photos/1612861/pexels-photo-1612861.jpeg?auto=compress&cs=tinysrgb&w=800',
  destacado: false,
};

export default function AdminPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [autorizado, setAutorizado] = useState(false);

  const [versiculos, setVersiculos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  const [videosAdmin, setVideosAdmin] = useState([]);
  const [nuevoVideoTitulo, setNuevoVideoTitulo] = useState('');
  const [nuevoVideoUrl, setNuevoVideoUrl] = useState('');
  const [guardandoVideo, setGuardandoVideo] = useState(false);
  const [cargandoVideos, setCargandoVideos] = useState(true);

  const [filtroAdmin, setFiltroAdmin] = useState('Todos');
  const [versionFiltro, setVersionFiltro] = useState('todas');
  const [busquedaAdmin, setBusquedaAdmin] = useState('');

  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    try { localStorage.setItem('lumina-theme', next ? 'dark' : 'light'); } catch (e) {}
  };

  async function cargarVersiculos() {
    setCargandoLista(true);
    const { data, error } = await supabase.from('versiculos').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) setVersiculos(data);
    setCargandoLista(false);
  }

  async function cargarVideos() {
    setCargandoVideos(true);
    const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) setVideosAdmin(data);
    setCargandoVideos(false);
  }

  useEffect(() => {
    let active = true;

    async function verificarAcceso() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      const session = data?.session;
      if (!session) {
        router.replace('/login');
        return;
      }

      setUsuario(session.user);
      setAutorizado(true);
      await cargarVersiculos();
      await cargarVideos();
    }

    verificarAcceso();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
      else setUsuario(session.user);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  function empezarEdicion(item) {
    setEditandoId(item.id);
    setErrorMsg('');
    setMensaje('');
    const badgeActual = item.badge || 'REINA-VALERA';
    const coincideOpcion = OPCIONES_VERSION_SELECT.some((op) => op.valor.toUpperCase() === badgeActual.toUpperCase());

    setForm({
      titulo: item.titulo || '',
      subtitulo: limpiarAutor(item.subtitulo),
      badge: coincideOpcion ? badgeActual.toUpperCase() : badgeActual,
      descripcion: item.descripcion || '',
      referencia: item.referencia || '',
      estado_animo: item.estado_animo || 'Paz',
      imagen_url: item.imagen_url || 'https://images.pexels.com/photos/1612861/pexels-photo-1612861.jpeg?auto=compress&cs=tinysrgb&w=800',
      destacado: Boolean(item.destacado),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(FORMULARIO_VACIO);
    setErrorMsg('');
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setErrorMsg('');
    setMensaje('');

    if (!form.titulo.trim() || !form.descripcion.trim() || !form.referencia.trim()) {
      setErrorMsg('Pasaje/Título, explicación breve y libro/cita son obligatorios.');
      return;
    }

    setGuardando(true);
    const autorLimpio = limpiarAutor(form.subtitulo) || 'AUTOR BÍBLICO';

    const payload = {
      titulo: form.titulo.trim(),
      subtitulo: autorLimpio.toUpperCase(),
      badge: form.badge.trim() || 'REINA-VALERA',
      descripcion: form.descripcion.trim(),
      referencia: form.referencia.trim(),
      estado_animo: form.estado_animo,
      imagen_url: form.imagen_url.trim() || 'https://images.pexels.com/photos/1612861/pexels-photo-1612861.jpeg?auto=compress&cs=tinysrgb&w=800',
      destacado: Boolean(form.destacado),
    };

    try {
      if (editandoId) {
        const { error } = await supabase.from('versiculos').update(payload).eq('id', editandoId);
        if (error) throw error;
        setMensaje('Versículo actualizado correctamente.');
      } else {
        const { error } = await supabase.from('versiculos').insert([payload]);
        if (error) throw error;
        setMensaje('Nuevo versículo guardado en Lumina.');
      }

      setForm(FORMULARIO_VACIO);
      setEditandoId(null);
      await cargarVersiculos();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo guardar el versículo.');
    } finally {
      setGuardando(false);
    }
  }

  async function handleGuardarVideo(e) {
    e.preventDefault();
    const tituloLimpio = nuevoVideoTitulo.trim();
    const urlLimpia = nuevoVideoUrl.trim();

    if (!tituloLimpio || !urlLimpia) {
      alert('Por favor, llena ambos campos.');
      return;
    }

    const videoId = extraerYouTubeId(urlLimpia);
    if (!videoId) {
      alert('Ingresa un enlace válido de YouTube (youtube.com/watch?v=... o youtu.be/...).');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('No hay una sesión activa. Por favor, inicia sesión de nuevo.');
      return;
    }

    setGuardandoVideo(true);
    const { data, error } = await supabase
      .from('videos')
      .insert([{ titulo: tituloLimpio, url: urlLimpia }])
      .select();

    if (error) {
      alert('Error al guardar el video: ' + error.message);
    } else if (!data || data.length === 0) {
      alert('Error: El video no se guardó en la base de datos. Revisa las políticas RLS de la tabla "videos" en Supabase.');
    } else {
      alert('¡Video añadido con éxito!');
      setNuevoVideoTitulo('');
      setNuevoVideoUrl('');
      setVideosAdmin([data[0], ...videosAdmin]);
    }
    setGuardandoVideo(false);
  }

  async function handleEliminarVideo(id) {
    if (!confirm('¿Seguro que quieres eliminar este video?')) return;

    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      setVideosAdmin(videosAdmin.filter((v) => v.id !== id));
    }
  }

  async function handleAlternarDestacado(item) {
    setErrorMsg('');
    setMensaje('');
    const nuevoEstado = !item.destacado;

    const { error } = await supabase.from('versiculos').update({ destacado: nuevoEstado }).eq('id', item.id);

    if (error) {
      setErrorMsg(error.message || 'No se pudo actualizar el estado en portada.');
      return;
    }

    setMensaje(nuevoEstado ? `"${item.titulo}" ahora aparece en la página de inicio.` : `"${item.titulo}" se quitó de la página de inicio (sigue guardado en tu catálogo).`);
    await cargarVersiculos();
  }

  async function handleEliminar(id) {
    setErrorMsg('');
    setMensaje('');

    const { error } = await supabase.from('versiculos').delete().eq('id', id);

    if (error) {
      setErrorMsg(error.message || 'No se pudo eliminar el versículo.');
      return;
    }

    if (editandoId === id) cancelarEdicion();
    setMensaje('Versículo eliminado permanentemente.');
    await cargarVersiculos();
  }

  async function handleCerrarSesion() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const destacadosEnInicio = versiculos.filter((item) => Boolean(item.destacado));

  const versiculosFiltrados = versiculos.filter((item) => {
    const coincideFiltro = filtroAdmin === 'Todos' ? true : filtroAdmin === 'Destacados' ? Boolean(item.destacado) : (item.estado_animo || '').toLowerCase() === filtroAdmin.toLowerCase();
    const coincideVersion = coincideConVersion(item, versionFiltro);
    const termino = busquedaAdmin.trim().toLowerCase();
    const coincideTexto = !termino || (item.titulo || '').toLowerCase().includes(termino) || (item.referencia || '').toLowerCase().includes(termino) || (item.descripcion || '').toLowerCase().includes(termino) || (item.badge || '').toLowerCase().includes(termino) || (item.subtitulo || '').toLowerCase().includes(termino);
    return coincideFiltro && coincideVersion && coincideTexto;
  });

  const tieneValorPersonalizado = !OPCIONES_VERSION_SELECT.some((op) => op.valor.toUpperCase() === (form.badge || '').toUpperCase());

  if (!autorizado) {
    return (
      <main className="lumina-page-shell" style={{ paddingTop: '3rem' }}>
        <p className="section-subcopy">Verificando sesión de administrador...</p>
      </main>
    );
  }

  return (
    <main className="lumina-page-shell">
      <header className="app-header">
        <Link href="/" className="header-brand-link">LUMINA</Link>
        <Link href="/" className="header-logo-badge" title="Inicio"><span style={{ fontSize: '1.2rem', color: 'var(--gold-accent)' }}>✝</span></Link>
        <nav className="header-nav-icons">
          <Link href="/" className="nav-icon-link" title="Inicio"><i className="fa-solid fa-house"></i></Link>
          <Link href="/buscador" className="nav-icon-link" title="Buscador"><i className="fa-solid fa-magnifying-glass"></i></Link>
          <button type="button" onClick={toggleTheme} className="nav-icon-btn" title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
          <button type="button" onClick={handleCerrarSesion} className="nav-icon-btn" title="Cerrar sesión">
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </nav>
      </header>

      <section className="section-shell">
        <div className="lumina-panel">
          <p className="welcome-subtitle">SESIÓN ACTIVA: {usuario?.email || 'ADMINISTRADOR'}</p>
          <h1 className="title-lumina" style={{ fontSize: '1.85rem' }}>PANEL DE ADMINISTRACIÓN</h1>
          <p className="section-subcopy">Crea, edita o elimina versículos y controla cuáles aparecen destacados en la portada.</p>

          <form onSubmit={handleGuardar} className="section-shell">
            <h2 className="verse-card-title" style={{ fontSize: '1.15rem', marginBottom: '1.1rem' }}>
              {editandoId ? 'Editar versículo seleccionado' : 'Añadir nuevo versículo'}
            </h2>

            <div className="admin-form-grid">
              <div className="admin-field">
                <label htmlFor="titulo">Pasaje / Título *</label>
                <input id="titulo" type="text" name="titulo" className="lumina-input" value={form.titulo} onChange={handleChange} placeholder="Ej. Ten paz en medio de la prueba..." required />
              </div>

              <div className="admin-field">
                <label htmlFor="subtitulo">Autor</label>
                <input id="subtitulo" type="text" name="subtitulo" className="lumina-input" value={form.subtitulo} onChange={handleChange} placeholder="Ej. PABLO, DAVID, JUAN..." />
              </div>

              <div className="admin-field">
                <label htmlFor="estado_animo">Estado de ánimo</label>
                <select id="estado_animo" name="estado_animo" className="lumina-select" value={form.estado_animo} onChange={handleChange}>
                  {ESTADOS_ANIMO.map((estado) => (<option key={estado} value={estado}>{estado}</option>))}
                </select>
              </div>

              <div className="admin-field">
                <label htmlFor="badge">Versión / Etiqueta (Badge)</label>
                <select id="badge" name="badge" className="lumina-select" value={form.badge} onChange={handleChange}>
                  {tieneValorPersonalizado && form.badge && (<option value={form.badge}>{form.badge}</option>)}
                  {OPCIONES_VERSION_SELECT.map((opcion) => (<option key={opcion.valor} value={opcion.valor}>{opcion.label}</option>))}
                </select>
              </div>
            </div>

            <div className="admin-field" style={{ marginTop: '1.1rem' }}>
              <label htmlFor="descripcion">Explicación breve del pasaje *</label>
              <textarea id="descripcion" name="descripcion" className="lumina-textarea" value={form.descripcion} onChange={handleChange} placeholder="Explica brevemente lo que significa o aporta este pasaje..." required />
            </div>

            <div className="admin-form-grid" style={{ marginTop: '1.1rem' }}>
              <div className="admin-field">
                <label htmlFor="referencia">Libro y cita *</label>
                <input id="referencia" type="text" name="referencia" className="lumina-input" value={form.referencia} onChange={handleChange} placeholder="Ej. JUAN 14:27" required />
              </div>

              <div className="admin-field">
                <label htmlFor="imagen_url">URL de imagen</label>
                <input id="imagen_url" type="text" name="imagen_url" className="lumina-input" value={form.imagen_url} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', marginTop: '1.15rem', cursor: 'pointer' }}>
              <input type="checkbox" name="destacado" checked={form.destacado} onChange={handleChange} />
              Mostrar como tarjeta destacada en la página de inicio
            </label>

            {errorMsg && <p className="feedback-error">{errorMsg}</p>}
            {mensaje && <p className="feedback-ok">{mensaje}</p>}

            <div className="admin-actions-row">
              <button type="submit" disabled={guardando} className="btn-primary">
                {guardando ? 'GUARDANDO...' : editandoId ? 'GUARDAR CAMBIOS' : 'AÑADIR VERSÍCULO'}
              </button>
              {editandoId && (
                <button type="button" onClick={cancelarEdicion} className="mood-chip mood-filter-chip">Cancelar edición</button>
              )}
            </div>
          </form>
        </div>

        <div className="section-shell">
          <div className="lumina-panel">
            <h2 className="title-lumina" style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>
              GESTIÓN DE VIDEOS
            </h2>

            <form onSubmit={handleGuardarVideo} className="admin-form-grid" style={{ marginBottom: '2rem' }}>
              <div className="admin-field">
                <label>Título del video *</label>
                <input
                  type="text"
                  className="lumina-input"
                  value={nuevoVideoTitulo}
                  onChange={(e) => setNuevoVideoTitulo(e.target.value)}
                  placeholder="Ej. Reflexión de la mañana"
                  required
                />
              </div>
              <div className="admin-field">
                <label>URL de YouTube *</label>
                <input
                  type="url"
                  className="lumina-input"
                  value={nuevoVideoUrl}
                  onChange={(e) => setNuevoVideoUrl(e.target.value)}
                  placeholder="https://youtu.be/..."
                  required
                />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" disabled={guardandoVideo} className="btn-primary">
                  <i className="fa-solid fa-video"></i> {guardandoVideo ? 'Guardando...' : 'AÑADIR VIDEO'}
                </button>
              </div>
            </form>

            <h3 className="verse-card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              Videos publicados ({videosAdmin.length})
            </h3>

            {cargandoVideos ? (
              <p className="section-subcopy">Cargando videos...</p>
            ) : videosAdmin.length === 0 ? (
              <p className="section-subcopy" style={{ margin: 0 }}>Aún no hay videos subidos.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {videosAdmin.map((video) => (
                  <div key={video.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px' }}>
                    <div style={{ overflow: 'hidden' }}>
                      <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.2rem' }}>{video.titulo}</strong>
                      <a href={video.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--gold-accent)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                        {video.url}
                      </a>
                    </div>
                    <button
                      onClick={() => handleEliminarVideo(video.id)}
                      className="mood-chip btn-danger-outline"
                      style={{ flexShrink: 0, marginLeft: '1rem' }}
                      title="Eliminar video"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="section-shell">
          <div className="lumina-panel">
            <div className="section-heading-row" style={{ marginBottom: '0.9rem' }}>
              <div>
                <h2 className="title-lumina" style={{ fontSize: '1.35rem', margin: 0 }}>
                  DESTACADOS EN PORTADA ({destacadosEnInicio.length})
                </h2>
                <p className="section-subcopy" style={{ margin: '0.25rem 0 0' }}>
                  Pasajes activos en la página principal. Puedes quitarlos sin eliminarlos de tu catálogo.
                </p>
              </div>
            </div>

            {cargandoLista ? (
              <p className="section-subcopy">Cargando destacados...</p>
            ) : destacadosEnInicio.length === 0 ? (
              <p className="section-subcopy" style={{ margin: 0 }}>No hay ningún pasaje marcado en portada.</p>
            ) : (
              <div className="verses-grid">
                {destacadosEnInicio.map((item) => (
                  <article key={item.id} className="verse-card">
                    <div>
                      <div className="verse-card-meta">
                        <span>{item.badge || 'REINA-VALERA'}</span>
                        <span>{item.estado_animo || 'Paz'}</span>
                      </div>
                      <h3 className="verse-card-title">{item.titulo}</h3>
                      <p className="verse-card-body" style={{ marginTop: '0.6rem' }}>{item.descripcion}</p>
                    </div>

                    <div>
                      <div className="verse-card-footer">
                        <span>{item.referencia}</span>
                        <span>{limpiarAutor(item.subtitulo)}</span>
                      </div>
                      <div className="admin-actions-row" style={{ marginTop: '0.85rem' }}>
                        <button type="button" onClick={() => handleAlternarDestacado(item)} className="mood-chip mood-filter-chip">
                          <i className="fa-solid fa-eye-slash"></i> Quitar de inicio
                        </button>
                        <button type="button" onClick={() => empezarEdicion(item)} className="mood-chip mood-filter-chip">
                          <i className="fa-solid fa-pen"></i> Editar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="section-shell">
          <div className="section-heading-row">
            <div>
              <h2 className="title-lumina" style={{ fontSize: '1.35rem', margin: 0 }}>
                CATÁLOGO COMPLETO ({versiculosFiltrados.length})
              </h2>
              <p className="section-subcopy" style={{ margin: '0.25rem 0 0' }}>
                Filtra por versión bíblica, estado de ánimo o busca por cita, autor o palabra clave.
              </p>
            </div>
          </div>

          <div className="lumina-panel" style={{ marginBottom: '1.25rem' }}>
            <div className="admin-form-grid">
              <input
                type="text"
                className="lumina-input"
                value={busquedaAdmin}
                onChange={(e) => setBusquedaAdmin(e.target.value)}
                placeholder="Buscar por cita, autor, versión o palabra clave..."
              />

              <select
                className="lumina-select"
                value={versionFiltro}
                onChange={(e) => setVersionFiltro(e.target.value)}
                aria-label="Filtrar catálogo por versión"
              >
                <option value="todas">Todas las versiones</option>
                <option value="rvr1909">Reina-Valera 1909</option>
                <option value="rvg">Reina-Valera Gómez</option>
                <option value="pdt">Palabra de Dios para ti</option>
                <option value="onbv-es">Open Nueva Biblia Viva</option>
                <option value="sev">Sagradas Escrituras 1569</option>
              </select>
            </div>

            <div className="mood-filter-bar">
              {['Todos', 'Destacados', ...ESTADOS_ANIMO].map((filtro) => {
                const activo = filtroAdmin === filtro;
                return (
                  <button
                    key={filtro}
                    type="button"
                    onClick={() => setFiltroAdmin(filtro)}
                    className={`mood-chip mood-filter-chip ${activo ? 'is-active' : ''}`}
                  >
                    {filtro}
                  </button>
                );
              })}
            </div>
          </div>

          {cargandoLista ? (
            <p className="section-subcopy">Cargando versículos...</p>
          ) : versiculosFiltrados.length === 0 ? (
            <div className="lumina-panel">
              <p className="section-subcopy" style={{ margin: 0 }}>
                No hay versículos que coincidan con ese filtro.
              </p>
            </div>
          ) : (
            <div className="verses-grid">
              {versiculosFiltrados.map((item) => (
                <article key={item.id} className="verse-card">
                  <div>
                    <div className="verse-card-meta">
                      <span>{item.badge || 'REINA-VALERA'}</span>
                      <span>{item.estado_animo || 'Paz'}</span>
                    </div>
                    <h3 className="verse-card-title">{item.titulo}</h3>
                    <p className="verse-card-body" style={{ marginTop: '0.6rem' }}>
                      {item.descripcion}
                    </p>
                  </div>

                  <div>
                    <div className="verse-card-footer">
                      <span>{item.referencia}</span>
                      <span>{limpiarAutor(item.subtitulo)}</span>
                    </div>
                    <div className="admin-actions-row" style={{ marginTop: '0.85rem' }}>
                      <button
                        type="button"
                        onClick={() => handleAlternarDestacado(item)}
                        className={`mood-chip mood-filter-chip ${item.destacado ? 'is-active' : ''}`}
                      >
                        <i className={`fa-solid ${item.destacado ? 'fa-star' : 'fa-arrow-up-from-bracket'}`}></i>{' '}
                        {item.destacado ? 'Quitar de inicio' : 'Destacar en inicio'}
                      </button>
                      <button
                        type="button"
                        onClick={() => empezarEdicion(item)}
                        className="mood-chip mood-filter-chip"
                      >
                        <i className="fa-solid fa-pen"></i> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminar(item.id)}
                        className="mood-chip btn-danger-outline"
                      >
                        <i className="fa-solid fa-trash"></i> Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}