'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [modoRegistro, setModoRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    async function revisarSesion() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (data?.session) {
        router.replace('/admin');
        return;
      }
      setVerificandoSesion(false);
    }

    revisarSesion();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setMensaje('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Completa tu correo y contraseña.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);

    try {
      if (modoRegistro) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data?.session) {
          router.replace('/admin');
        } else {
          setMensaje(
            'Cuenta creada. Revisa tu correo para confirmar o desactiva "Confirm email" en Supabase si deseas entrar directo.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        router.replace('/admin');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al autenticar.');
    } finally {
      setCargando(false);
    }
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
        </nav>
      </header>

      <section
        className="main-content"
        style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}
      >
        <div
          className="hero-card"
          style={{
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            display: 'block',
          }}
        >
          <p className="welcome-subtitle">ACCESO RESTRINGIDO</p>
          <h1
            className="title-lumina"
            style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}
          >
            {modoRegistro ? 'REGISTRAR ADMIN' : 'INICIAR SESIÓN'}
          </h1>
          <p className="hero-description" style={{ marginBottom: '1.25rem' }}>
            {modoRegistro
              ? 'Crea una cuenta de administrador para gestionar los versículos de Lumina.'
              : 'Ingresa con tu cuenta de administrador para añadir, editar o eliminar pasajes.'}
          </p>

          {verificandoSesion ? (
            <p>Verificando sesión...</p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
            >
              <div>
                <label
                  htmlFor="admin-email"
                  style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}
                >
                  Correo electrónico
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lumina.app"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'inherit',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.9rem' }}
                >
                  Contraseña
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.9rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'inherit',
                  }}
                />
              </div>

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

              <button
                type="submit"
                disabled={cargando}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.35rem' }}
              >
                {cargando
                  ? 'Procesando...'
                  : modoRegistro
                  ? 'CREAR CUENTA ADMIN'
                  : 'ENTRAR AL PANEL'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setModoRegistro(!modoRegistro);
                setErrorMsg('');
                setMensaje('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.9rem',
                opacity: 0.85,
              }}
            >
              {modoRegistro
                ? '¿Ya tienes cuenta? Inicia sesión aquí'
                : '¿Primera vez? Registra tu cuenta de administrador'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}