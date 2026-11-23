'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  obtenerVersiculoMidvash,
  obtenerVersiculoDelDiaMidvash,
} from '@/lib/midvash';

const ESTADOS_ANIMO = ['Todos', 'Paz', 'Fortaleza', 'Consuelo', 'Gratitud'];

export default function BuscadorPage() {
  const [busqueda, setBusqueda] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Todos');
  const [versionBiblia, setVersionBiblia] = useState('rvr1909');

  const [versiculosDb, setVersiculosDb] = useState([]);
  const [cargandoDb, setCargandoDb] = useState(true);

  const [resultadoBiblia, setResultadoBiblia] = useState(null);
  const [cargandoBiblia, setCargandoBiblia] = useState(false);
  const [errorBiblia, setErrorBiblia] = useState('');

  useEffect(() => {
    async function cargarVersiculos() {
      setCargandoDb(true);
      const { data, error } = await supabase
        .from('versiculos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        setVersiculosDb(data);
      }
      setCargandoDb(false);
    }

    cargarVersiculos();
  }, []);

  const versiculosFiltrados = versiculosDb.filter((item) => {
    const coincideEstado =
      estadoSeleccionado === 'Todos' ||
      (item.estado_animo || '').toLowerCase() ===
        estadoSeleccionado.toLowerCase();

    const termino = busqueda.trim().toLowerCase();
    const coincideTexto =
      !termino ||
      (item.titulo || '').toLowerCase().includes(termino) ||
      (item.descripcion || '').toLowerCase().includes(termino) ||
      (item.referencia || '').toLowerCase().includes(termino) ||
      (item.estado_animo || '').toLowerCase().includes(termino);

    return coincideEstado && coincideTexto;
  });

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
      const versiculo = await obtenerVersiculoMidvash(busqueda, versionBiblia);
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
      const votd = await obtenerVersiculoDelDiaMidvash(versionBiblia);
      setResultadoBiblia(votd);
    } catch (err) {
      setErrorBiblia(err.message || 'No se pudo cargar el versículo del día.');
    } finally {
      setCargandoBiblia(false);
    }
  }

  return (
    <main className="app-container" style={{ paddingBottom: '4rem' }}>
      <header className="app-header">
        <a href="/" className="header-brand-link">
          LUMINA
        </a>
        <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a href="/" className="nav-pill-btn">
            <i className="fa-solid fa-house" /> Inicio
          </a>
          <a href="/login" className="nav-pill-btn">
            <i className="fa-solid fa-user-shield" /> Admin
          </a>
        </nav>
      </header>

      <section style={{ marginTop: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>
          Buscador y Escrituras
        </h1>
        <p style={{ opacity: 0.85, marginTop: '0.25rem' }}>
          Filtra pasajes por estado de ánimo o consulta citas bíblicas en
          español.
        </p>

        {/* Barra de búsqueda y filtro por estado de ánimo */}
        <form
          onSubmit={handleBuscarCitaBiblica}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.6rem',
            marginTop: '1.25rem',
          }}
        >
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder='Busca palabra clave o cita (ej. "Juan 3:16", "paz", "fe")...'
            style={{
              flex: '1 1 240px',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'inherit',
            }}
          />

          <select
            value={versionBiblia}
            onChange={(e) => setVersionBiblia(e.target.value)}
            aria-label="Versión de la Biblia"
            style={{
              padding: '0.75rem 0.9rem',
              borderRadius: '10px',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              background: '#18181b',
              color: '#fff',
            }}
          >
            <option value="rvr1909">Reina-Valera 1909</option>
            <option value="rvg">Reina-Valera Gómez</option>
            <option value="pdt">Palabra de Dios para ti</option>
            <option value="onbv-es">Open Nueva Biblia Viva</option>
            <option value="sev">Sagradas Escrituras 1569</option>
          </select>

          <button type="submit" className="action-gold-btn">
            <i className="fa-solid fa-book-bible" /> Buscar cita
          </button>

          <button
            type="button"
            onClick={handleVersiculoDelDia}
            className="nav-pill-btn"
          >
            <i className="fa-solid fa-sun" /> Versículo del día
          </button>
        </form>

        {/* Chips de estado de ánimo */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '1rem',
          }}
        >
          {ESTADOS_ANIMO.map((estado) => {
            const activo = estadoSeleccionado === estado;
            return (
              <button
                key={estado}
                type="button"
                onClick={() => setEstadoSeleccionado(estado)}
                className="nav-pill-btn"
                style={{
                  borderColor: activo
                    ? 'var(--gold-accent, #d4af37)'
                    : undefined,
                  fontWeight: activo ? 700 : 400,
                }}
              >
                {estado}
              </button>
            );
          })}
        </div>
      </section>

      {/* Resultado directo de Midvash API */}
      {(cargandoBiblia || errorBiblia || resultadoBiblia) && (
        <section style={{ marginTop: '1.75rem' }}>
          {cargandoBiblia && <p>Consultando escritura...</p>}
          {errorBiblia && (
            <p style={{ color: '#f87171', fontSize: '0.95rem' }}>
              {errorBiblia}
            </p>
          )}
          {resultadoBiblia && (
            <article
              style={{
                padding: '1.25rem',
                borderRadius: '14px',
                border: '1px solid rgba(212, 175, 55, 0.45)',
                background: 'rgba(212, 175, 55, 0.08)',
              }}
            >
              <small style={{ letterSpacing: '0.08em', opacity: 0.8 }}>
                {resultadoBiblia.badge} · {resultadoBiblia.subtitulo}
              </small>
              <h2 style={{ marginTop: '0.35rem', fontSize: '1.3rem' }}>
                {resultadoBiblia.titulo}
              </h2>
              <p style={{ marginTop: '0.65rem', lineHeight: 1.6 }}>
                “{resultadoBiblia.descripcion}”
              </p>
              <p
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.8rem',
                  opacity: 0.75,
                }}
              >
                {resultadoBiblia.referencia}
              </p>
            </article>
          )}
        </section>
      )}

      {/* Pasajes guardados en Supabase */}
      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.9rem' }}>
          Pasajes en Lumina ({versiculosFiltrados.length})
        </h2>

        {cargandoDb ? (
          <p>Cargando pasajes desde la base de datos...</p>
        ) : versiculosFiltrados.length === 0 ? (
          <p style={{ opacity: 0.75 }}>
            No hay pasajes que coincidan con ese filtro.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {versiculosFiltrados.map((item) => (
              <article
                key={item.id}
                style={{
                  padding: '1.15rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  background: 'rgba(255, 255, 255, 0.03)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    opacity: 0.8,
                  }}
                >
                  <span>{item.badge || 'PASAJE'}</span>
                  <span>Estado: {item.estado_animo || 'Paz'}</span>
                </div>
                <h3 style={{ marginTop: '0.35rem', fontSize: '1.15rem' }}>
                  {item.titulo}
                </h3>
                <p style={{ marginTop: '0.5rem', lineHeight: 1.55 }}>
                  {item.descripcion}
                </p>
                <p
                  style={{
                    marginTop: '0.6rem',
                    fontSize: '0.82rem',
                    opacity: 0.75,
                  }}
                >
                  {item.referencia}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}