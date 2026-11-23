'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ESTADOS_ANIMO = ['Paz', 'Fortaleza', 'Consuelo', 'Gratitud'];

const FORMULARIO_VACIO = {
  titulo: '',
  subtitulo: 'ESPACIO DE PAZ',
  badge: 'PASAJE DESTACADO',
  descripcion: '',
  referencia: '',
  estado_animo: 'Paz',
  imagen_url:
    'https://images.pexels.com/photos/1612861/pexels-photo-1612861.jpeg?auto=compress&cs=tinysrgb&w=800',
  destacado: true,
};

export default function AdminPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [autorizado, setAutorizado] = useState(false);

  const [versiculos, setVersiculos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  const [form, setForm] = useState(FORMULARIO_VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function cargarVersiculos() {
    setCargandoLista(true);
    const { data, error } = await supabase
      .from('versiculos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      setVersiculos(data);
    }
    setCargandoLista(false);
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
    }

    verificarAcceso();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUsuario(session.user);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function empezarEdicion(item) {
    setEditandoId(item.id);
    setErrorMsg('');
    setMensaje('');
    setForm({
      titulo: item.titulo || '',
      subtitulo: item.subtitulo || 'ESPACIO DE PAZ',
      badge: item.badge || 'PASAJE DESTACADO',
      descripcion: item.descripcion || '',
      referencia: item.referencia || '',
      estado_animo: item.estado_animo || 'Paz',
      imagen_url:
        item.imagen_url ||
        'https://images.pexels.com/photos/1612861/pexels-photo-1612861.jpeg?auto=compress&cs=tinysrgb&w=800',
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
      setErrorMsg('Título, descripción/versículo y referencia son obligatorios.');
      return;
    }

    setGuardando(true);

    const payload = {
      titulo: form.titulo.trim(),
      subtitulo: form.subtitulo.trim() || 'ESPACIO DE PAZ',
      badge: form.badge.trim() || 'PASAJE DESTACADO',
      descripcion: form.descripcion.trim(),
      referencia: form.referencia.trim(),
      estado_animo: form.estado_animo,
      imagen_url:
        form.imagen_url.trim() ||
        'https://images.pexels.com/photos/1612861/pexels-photo-1612861.jpeg?auto=compress&cs=tinysrgb&w=800',
      destacado: Boolean(form.destacado),
    };

    try {
      if (editandoId) {
        const { error } = await supabase
          .from('versiculos')
          .update(payload)
          .eq('id', editandoId);

        if (error) throw error;
        setMensaje('Versículo actualizado correctamente.');
      } else {
        const { error } = await supabase.from('versiculos').insert([payload]);
        if (error) throw error;
        setMensaje('Nuevo versículo añadido a Lumina.');
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

  async function handleEliminar(id) {
    setErrorMsg('');
    setMensaje('');

    const { error } = await supabase.from('versiculos').delete().eq('id', id);

    if (error) {
      setErrorMsg(error.message || 'No se pudo eliminar el versículo.');
      return;
    }

    if (editandoId === id) {
      cancelarEdicion();
    }
    setMensaje('Versículo eliminado.');
    await cargarVersiculos();
  }

  async function handleCerrarSesion() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (!autorizado) {
    return (
      <main className="app-container" style={{ paddingTop: '3rem' }}>
        <p>Verificando sesión de administrador...</p>
      </main>
    );
  }

  return (
    <main className="app-container" style={{ paddingBottom: '4rem' }}>
      <header className="app-header">
        <a href="/" className="header-brand-link">
          LUMINA
        </a>
        <nav className="header-nav-icons">
          <a href="/" className="nav-icon-link" title="Inicio">
            <i className="fa-solid fa-house"></i>
          </a>
          <a href="/buscador" className="nav-icon-link" title="Buscador">
            <i className="fa-solid fa-magnifying-glass"></i>
          </a>
          <button
            onClick={handleCerrarSesion}
            className="nav-icon-btn"
            title="Cerrar sesión"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
          </button>
        </nav>
      </header>

      <section style={{ marginTop: '1.5rem' }}>
        <p className="welcome-subtitle">
          SESIÓN ACTIVA: {usuario?.email || 'ADMINISTRADOR'}
        </p>
        <h1 className="title-lumina" style={{ fontSize: '1.8rem' }}>
          PANEL DE ADMINISTRACIÓN
        </h1>
        <p style={{ opacity: 0.85, marginTop: '0.25rem' }}>
          Añade, modifica o elimina versículos y decide cuáles aparecen en el inicio.
        </p>

        {/* Formulario Crear / Editar */}
        <form
          onSubmit={handleGuardar}
          style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            borderRadius: '14px',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            background: 'rgba(255, 255, 255, 0.03)',
            display: 'grid',
            gap: '0.9rem',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', margin: 0 }}>
            {editandoId ? 'Editar versículo' : 'Añadir nuevo versículo'}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.8rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Ej. PAZ EN LA TORMENTA"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Subtítulo
              </label>
              <input
                type="text"
                name="subtitulo"
                value={form.subtitulo}
                onChange={handleChange}
                placeholder="Ej. CALMA PARA TU CORAZÓN"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Estado de ánimo
              </label>
              <select
                name="estado_animo"
                value={form.estado_animo}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: '#18181b',
                  color: '#fff',
                }}
              >
                {ESTADOS_ANIMO.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Etiqueta (Badge)
              </label>
              <input
                type="text"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="Ej. PASAJE DESTACADO"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'inherit',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              Texto del versículo o descripción *
            </label>
            <textarea
              name="descripcion"
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Escribe aquí el versículo o mensaje..."
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.05)',
                color: 'inherit',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.8rem',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Referencia / Pie de tarjeta *
              </label>
              <input
                type="text"
                name="referencia"
                value={form.referencia}
                onChange={handleChange}
                placeholder="Ej. JUAN 14:27 · RVR1909"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'inherit',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                URL de imagen
              </label>
              <input
                type="text"
                name="imagen_url"
                value={form.imagen_url}
                onChange={handleChange}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'inherit',
                }}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              name="destacado"
              checked={form.destacado}
              onChange={handleChange}
            />
            Mostrar como tarjeta destacada en la página de inicio
          </label>

          {errorMsg && (
            <p style={{ color: '#f87171', fontSize: '0.9rem', margin: 0 }}>
              {errorMsg}
            </p>
          )}
          {mensaje && (
            <p style={{ color: '#4ade80', fontSize: '0.9rem', margin: 0 }}>
              {mensaje}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="submit" disabled={guardando} className="btn-primary">
              {guardando
                ? 'Guardando...'
                : editandoId
                ? 'GUARDAR CAMBIOS'
                : 'AÑADIR VERSÍCULO'}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="mood-chip"
                style={{ cursor: 'pointer' }}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>

        {/* Lista de versículos existentes */}
        <div style={{ marginTop: '2.2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            Versículos registrados ({versiculos.length})
          </h2>

          {cargandoLista ? (
            <p>Cargando versículos...</p>
          ) : versiculos.length === 0 ? (
            <p style={{ opacity: 0.75 }}>Aún no hay versículos registrados.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              {versiculos.map((item) => (
                <article
                  key={item.id}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      opacity: 0.8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      Estado: <strong>{item.estado_animo}</strong> ·{' '}
                      {item.destacado ? '★ Destacado en inicio' : 'Solo buscador'}
                    </span>
                    <span>{item.referencia}</span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{item.titulo}</h3>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{item.descripcion}</p>

                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => empezarEdicion(item)}
                      className="mood-chip"
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fa-solid fa-pen" /> Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEliminar(item.id)}
                      className="mood-chip"
                      style={{
                        cursor: 'pointer',
                        borderColor: 'rgba(248, 113, 113, 0.5)',
                        color: '#f87171',
                      }}
                    >
                      <i className="fa-solid fa-trash" /> Eliminar
                    </button>
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