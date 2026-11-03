'use client';
import { useState } from 'react';

export default function BuscadorPage() {
    const [darkMode, setDarkMode] = useState(false);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
    };

    return (
        <main className="app-container">
            {/* Cabecera con la misma barra de navegación */}
            <header className="app-header">
                <a href="/" className="header-brand-link">LUMINA</a>
                <a href="/" className="header-logo-badge" title="Inicio">
                    <span style={{ fontSize: '1.2rem', color: 'var(--gold-accent)' }}>✝</span>
                </a>
                <nav className="header-nav-icons">
                    <a href="/" className="nav-icon-link" title="Inicio">
                        <i className="fa-solid fa-house"></i>
                    </a>
                    <a href="/buscador" className="nav-icon-link active" title="Buscador">
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </a>
                    <button onClick={toggleTheme} className="nav-icon-btn" title="Cambiar tema">
                        <i className={`fa-solid ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
                    </button>
                </nav>
            </header>

            {/* Contenido del Buscador Inteligente */}
            <section className="main-content">
                <div style={{ textAlign: 'center', padding: '3rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold-accent)', fontSize: '2.2rem', marginBottom: '1rem' }}>
                        Buscador Inteligente
                    </h2>
                    <p style={{ color: 'var(--text-desc)', marginBottom: '2rem' }}>
                        Encuentra respuestas a tus situaciones actuales seleccionando tu estado de ánimo o buscando palabras clave.
                    </p>
                    <input
                        type="text"
                        placeholder="Ej: Paz, Ansiedad, Mateo 6:33..."
                        style={{
                            padding: '1rem 1.8rem',
                            width: '100%',
                            border: '1px solid var(--border-gold)',
                            borderRadius: '30px',
                            fontSize: '1rem',
                            background: 'var(--bg-card)',
                            color: 'var(--dark-brown)',
                            boxShadow: 'var(--card-shadow)',
                            outline: 'none'
                        }}
                    />
                </div>
            </section>
        </main>
    );
}