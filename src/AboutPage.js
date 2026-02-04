
import React, { useEffect, useState } from "react";

function AboutPage() {
  const [aboutJson, setAboutJson] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    fetch("/json/about.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load about.json");
        return res.json();
      })
      .then((data) => setAboutJson(data))
      .catch((err) => console.error(err));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!aboutJson) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontSize: '1.2rem', color: '#64748b' }}>
        Loading School History...
      </div>
    );
  }

  const { sections } = aboutJson;
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const containerStyle = {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: isMobile ? '40px 20px' : '80px 40px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#334155'
  };

  const heroStyle = {
    textAlign: 'center',
    marginBottom: isMobile ? '60px' : '100px',
    animation: 'fadeUp 0.8s ease'
  };

  const headlineStyle = {
    fontSize: isMobile ? '2.4rem' : '4rem',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.02em',
    marginBottom: '24px',
    lineHeight: '1.1'
  };

  const introDescStyle = {
    fontSize: isMobile ? '1.1rem' : '1.35rem',
    lineHeight: '1.6',
    color: '#64748b',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const sectionWrapperStyle = (reverse = false) => ({
    display: 'flex',
    flexDirection: isTablet ? 'column' : (reverse ? 'row-reverse' : 'row'),
    alignItems: 'center',
    gap: isMobile ? '32px' : '64px',
    marginBottom: isMobile ? '80px' : '120px',
    animation: 'fadeUp 1s ease'
  });

  const contentBlockStyle = {
    flex: 1,
    textAlign: isTablet ? 'center' : 'left'
  };

  const imageBlockStyle = {
    flex: 1,
    width: '100%'
  };

  const imageStyle = {
    width: '100%',
    height: isMobile ? '300px' : '450px',
    objectFit: 'cover',
    borderRadius: '32px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
    display: 'block'
  };

  const sectionTitleStyle = {
    fontSize: isMobile ? '1.8rem' : '2.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '20px',
    position: 'relative',
    display: 'inline-block'
  };

  const sectionTextStyle = {
    fontSize: '1.15rem',
    lineHeight: '1.8',
    color: '#475569'
  };

  const valuesGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '20px',
    marginTop: '32px',
    padding: 0,
    listStyle: 'none'
  };

  const valueItemStyle = {
    background: '#f8fafc',
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    fontWeight: '600',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const dotStyle = {
    width: '8px',
    height: '8px',
    background: '#FF7F50',
    borderRadius: '50%',
    flexShrink: 0
  };

  return (
    <div style={containerStyle}>
      {/* Intro Section */}
      <header style={heroStyle}>
        <h1 style={headlineStyle}>{sections.intro.headline}</h1>
        <p style={introDescStyle}>{sections.intro.description}</p>
      </header>

      {/* Mission Section */}
      <section style={sectionWrapperStyle(false)}>
        <div style={imageBlockStyle}>
          <img src={sections.mission.image} alt="Mission" style={imageStyle} />
        </div>
        <div style={contentBlockStyle}>
          <h2 style={sectionTitleStyle}>{sections.mission.title}</h2>
          <p style={sectionTextStyle}>{sections.mission.content}</p>
        </div>
      </section>

      {/* Vision Section */}
      <section style={sectionWrapperStyle(true)}>
        <div style={imageBlockStyle}>
          <img src={sections.vision.image} alt="Vision" style={imageStyle} />
        </div>
        <div style={contentBlockStyle}>
          <h2 style={sectionTitleStyle}>{sections.vision.title}</h2>
          <p style={sectionTextStyle}>{sections.vision.content}</p>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ animation: 'fadeUp 1.2s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={sectionTitleStyle}>{sections.values.title}</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', gap: '48px', alignItems: 'center' }}>
          <div style={{ flex: 1, width: '100%' }}>
            <img src={sections.values.image} alt="Values" style={{ ...imageStyle, height: isMobile ? '250px' : '400px' }} />
          </div>
          <div style={{ flex: 1.2, width: '100%' }}>
            <ul style={valuesGridStyle}>
              {sections.values.items.map((item, idx) => (
                <li key={idx} style={valueItemStyle}>
                  <div style={dotStyle}></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: '100px', textAlign: 'center', borderTop: '1px solid #e2e8f0', padding: '40px 0', color: '#94a3b8', fontSize: '0.9rem' }}>
        Modern Excellence in Education &bull; Est. 1995
      </footer>
    </div>
  );
}

export default AboutPage;
