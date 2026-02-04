
import React, { useState, useEffect } from 'react';

const HomePageRenderer = ({ json }) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Handle responsive design via state
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hero carousel autoplay and preloading
  useEffect(() => {
    const slides = json.sections.hero.slides;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    // Preload next image
    const nextIndex = (heroIndex + 1) % slides.length;
    const nextSlide = slides[nextIndex];
    const img = new Image();
    const isMobile = windowWidth < 768;
    img.src = (isMobile ? nextSlide.background_image.responsive?.mobile : nextSlide.background_image.responsive?.desktop) || nextSlide.background_image.fallback;

    return () => clearInterval(interval);
  }, [heroIndex, json.sections.hero.slides, windowWidth]);

  const isMobile = windowWidth < 768;
  const colors = json.design_system.colors;

  // Renderer: Hero Section
  const renderHero = () => {
    const hero = json.sections.hero;
    const slide = hero.slides[heroIndex];
    const layout = isMobile ? hero.mobile_layout : hero.desktop_layout;
    const bgImage = (isMobile ? slide.background_image.responsive?.mobile : slide.background_image.responsive?.desktop) || slide.background_image.fallback;

    const heroStyle = {
      position: 'relative',
      width: '100%',
      height: layout?.height || '85vh',
      minHeight: '500px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#000',
      overflow: 'hidden',
    };

    const backgroundStyle = {
      position: 'absolute',
      inset: 0,
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, transparent 100%), url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      transition: 'background-image 1s ease-in-out',
      zIndex: 0,
    };

    const contentWrapperStyle = {
      position: 'relative',
      zIndex: 10,
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '0 24px' : '0 48px',
      width: '100%',
    };

    const titleStyle = {
      color: '#fff',
      fontSize: isMobile ? '2.5rem' : '4.5rem',
      fontWeight: '900',
      lineHeight: '1.1',
      marginBottom: '1.5rem',
      maxWidth: '800px',
      textShadow: '0 2px 10px rgba(0,0,0,0.3)',
    };

    const subtextStyle = {
      color: 'rgba(255,255,255,0.9)',
      fontSize: isMobile ? '1.1rem' : '1.35rem',
      lineHeight: '1.6',
      marginBottom: '2.5rem',
      maxWidth: '600px',
    };

    const buttonStyle = {
      padding: '16px 32px',
      backgroundColor: colors.primary,
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1.1rem',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 10px 20px rgba(255,127,80,0.3)',
      transition: 'all 0.2s ease',
    };

    return (
      <section style={heroStyle}>
        <div style={backgroundStyle} />
        <div style={contentWrapperStyle}>
          <div style={{ animation: 'fadeUp 0.8s ease forwards' }}>
            <h1 style={titleStyle}>{slide.headline}</h1>
            <p style={subtextStyle}>{slide.subtext}</p>
            <button 
              style={buttonStyle}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Explore Our School
            </button>
          </div>
        </div>
      </section>
    );
  };

  // Renderer: About Section
  const renderAbout = () => {
    const about = json.sections.about_school;
    const isMobileView = windowWidth < 1024;
    
    const sectionStyle = {
      padding: isMobileView ? '60px 24px' : '100px 48px',
      backgroundColor: '#f8fafc',
    };

    const containerStyle = {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: isMobileView ? '1fr' : '1fr 1fr',
      gap: '60px',
      alignItems: 'center',
    };

    const textSideStyle = {
      order: isMobileView ? 2 : 1,
    };

    const imageSideStyle = {
      order: isMobileView ? 1 : 2,
      position: 'relative',
    };

    const imageStyle = {
      width: '100%',
      borderRadius: '30px',
      boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
      border: '8px solid #fff',
    };

    return (
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <div style={textSideStyle}>
            <span style={{ color: colors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', display: 'block', marginBottom: '12px' }}>
              Academic Excellence
            </span>
            <h2 style={{ fontSize: isMobile ? '2.2rem' : '3.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '24px', lineHeight: '1.2' }}>
              Preparing Students for a <span style={{ color: colors.primary }}>Global Future</span>
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#475569', lineHeight: '1.8', marginBottom: '32px' }}>
              {about.content}
            </p>
            <div style={{ display: 'grid', gap: '16px' }}>
              {about.highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '10px', height: '10px', background: colors.primary, borderRadius: '50%' }} />
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{h}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={imageSideStyle}>
            <img src={about.supporting_visual.placeholder} alt={about.supporting_visual.description} style={imageStyle} />
          </div>
        </div>
      </section>
    );
  };

  // Renderer: Highlights (Grid)
  const renderHighlights = () => {
    const highlights = json.sections.highlights;
    const cols = isMobile ? 1 : 4;

    const sectionStyle = {
      padding: '100px 24px',
      backgroundColor: '#fff',
    };

    const gridStyle = {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '24px',
    };

    const cardStyle = {
      padding: '32px',
      borderRadius: '24px',
      background: '#f1f5f9',
      transition: 'all 0.3s ease',
      textAlign: 'center',
    };

    return (
      <section style={sectionStyle}>
        <div style={{ maxWidth: '800px', margin: '0 auto 60px', textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: '800', marginBottom: '16px' }}>{highlights.section_intro.headline}</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>{highlights.section_intro.description}</p>
        </div>
        <div style={gridStyle}>
          {highlights.items.map((item, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ marginBottom: '24px', borderRadius: '16px', overflow: 'hidden', height: '180px' }}>
                <img src={item.visual.placeholder} alt={item.visual.description} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>{item.title}</h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6' }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Renderer: CTA
  const renderCTA = () => {
    const cta = json.sections.cta;
    const sectionStyle = {
      padding: isMobile ? '60px 24px' : '100px 48px',
      backgroundColor: '#f8fafc',
    };

    const bannerStyle = {
      maxWidth: '1200px',
      margin: '0 auto',
      borderRadius: '40px',
      padding: isMobile ? '60px 30px' : '100px',
      backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.7)), url(${cta.background_image.placeholder})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: '#fff',
      textAlign: 'center',
      boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
    };

    return (
      <section style={sectionStyle}>
        <div style={bannerStyle}>
          <h2 style={{ fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: '900', marginBottom: '24px' }}>{cta.headline}</h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px', opacity: '0.9' }}>{cta.subtext}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            {cta.buttons.map((btn, i) => (
              <button 
                key={i}
                style={{
                  padding: '16px 40px',
                  borderRadius: '16px',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: btn.type === 'primary' ? colors.primary : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  backdropFilter: btn.type !== 'primary' ? 'blur(10px)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {renderHero()}
      {renderAbout()}
      {renderHighlights()}
      {renderCTA()}
      <footer style={{ padding: '60px 24px', textAlign: 'center', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          © 2026 Modern School Excellence Group. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePageRenderer;
