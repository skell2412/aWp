'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verificandoSesion, setVerificandoSesion] = useState(true);
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) {
        router.replace('/admin');
      } else {
        setVerificandoSesion(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

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
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      router.replace('/admin');
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al autenticar. Verifica tus credenciales.');
      setCargando(false);
    }
  }

  return (
    <main className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          padding: '2rem 1rem',
        }}
      >
        <div
          className="hero-card"
          style={{
            maxWidth: '420px',
            width: '100%',
            padding: '2.5rem 2rem 2rem 2rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <p className="welcome-subtitle" style={{ marginBottom: '0.5rem' }}>
            ACCESO RESTRINGIDO
          </p>
          <h1
            className="title-lumina"
            style={{ fontSize: '1.75rem', marginBottom: '0.5rem', letterSpacing: '1px' }}
          >
            INICIAR SESIÓN
          </h1>
          <p className="hero-description" style={{ marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Ingresa con tu cuenta de administrador para añadir, editar o eliminar pasajes.
          </p>

          {verificandoSesion ? (
            <p style={{ textAlign: 'center', opacity: 0.7 }}>Verificando sesión...</p>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
            >
              <div>
                <label
                  htmlFor="admin-email"
                  style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}
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
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}
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
                    padding: '0.8rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>

              {errorMsg && (
                <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: '0.5rem',
                  padding: '0.8rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                {cargando ? 'Procesando...' : 'ENTRAR AL PANEL'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '2.5rem', textAlign: 'center', opacity: 0.5 }}>
            <p style={{ fontSize: '0.75rem', margin: 0, letterSpacing: '0.5px' }}>
              &copy; {new Date().getFullYear()} LUMINA. Solo personal autorizado.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}