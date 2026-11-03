'use client';
import { useState } from 'react';

const featuredCards = [
  {
    subtitle: "BIENVENIDOS A TU ESPACIO DE PAZ",
    title: "LUZ Y ESPERANZA",
    badge: "PASAJE DESTACADO",
    image: "https://images.pexels.com/photos/1612861/pexels-photo-1612861.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "Encuentra la palabra perfecta para cada momento. Consulta escrituras y cartas bíblicas según tu estado de ánimo, disponibles en todo momento y sin internet.",
    caption: "JESÚS DE NAZARET, JESUCRISTO O CRISTO; BELÉN, H. 6 A. C. - JERUSALÉN, H. 30 D. C."
  },
  {
    subtitle: "FORTALEZA Y FE",
    title: "CAMINO Y VERDAD",
    badge: "VERSÍCULO POPULAR",
    image: "https://images.pexels.com/photos/267559/pexels-photo-267559.jpeg?auto=compress&cs=tinysrgb&w=800",
    description: "«No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo.» — Isaías 41:10",
    caption: "PROFETAS Y ENSEÑANZAS DE ESPERANZA"
  }
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentData = featuredCards[currentIndex];

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const nextPassage = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredCards.length);
  };

  return (
    <main className="app-container">
      {/* Cabecera idéntica al diseño original */}
      <header className="app-header">
        <a href="/" className="header-brand-link">LUMINA</a>
        <a href="/" className="header-logo-badge" title="Inicio">
          <span style={{ fontSize: '1.2rem', color: 'var(--gold-accent)' }}>✝</span>
        </a>
        <nav className="header-nav-icons">
          <a href="/" className="nav-icon-link" title="Inicio">
            <i className="fa-solid fa-house"></i>
          </a>
          <a href="/buscador" className="nav-icon-link" title="Buscador">
            <i className="fa-solid fa-magnifying-glass"></i>
          </a>
          <button onClick={toggleTheme} className="nav-icon-btn" title="Cambiar tema">
            <i className={`fa-solid ${darkMode ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
        </nav>
      </header>

      {/* Tarjeta Principal */}
      <section className="main-content">
        <div className="hero-card" id="interactive-hero">
          <div className="hero-image-container">
            <span className="image-badge">{currentData.badge}</span>
            <img src={currentData.image} alt="Lectura Bíblica" className="hero-image" />
          </div>

          <div className="hero-content">
            <div>
              <p className="welcome-subtitle">{currentData.subtitle}</p>
              <h2 className="title-lumina" style={{ fontSize: '2rem', letterSpacing: '2px' }}>
                {currentData.title}
              </h2>

              <p className="hero-description">
                {currentData.description}
              </p>

              <div className="mood-chips-container">
                <a href="/buscador" className="mood-chip" style={{ textDecoration: 'none' }}>Paz</a>
                <a href="/buscador" className="mood-chip" style={{ textDecoration: 'none' }}>Fortaleza</a>
                <a href="/buscador" className="mood-chip" style={{ textDecoration: 'none' }}>Consuelo</a>
                <a href="/buscador" className="mood-chip" style={{ textDecoration: 'none' }}>Gratitud</a>
              </div>

              <div className="hero-actions">
                <a href="/buscador" className="btn-primary">EXPLORAR ESCRITURAS</a>
                <button onClick={nextPassage} className="btn-secondary-icon" title="Cambiar historia">
                  <i className="fa-solid fa-arrow-right-long"></i>
                </button>
              </div>
            </div>

            <div className="character-footer-caption">
              {currentData.caption}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}