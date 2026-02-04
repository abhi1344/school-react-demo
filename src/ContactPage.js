
import React, { useEffect, useState } from "react";

function ContactPage() {
  const [contactJson, setContactJson] = useState(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    fetch("/json/contact.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load contact.json");
        return res.json();
      })
      .then((data) => setContactJson(data))
      .catch((err) => console.error(err));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!contactJson) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: '#64748b', fontSize: '1.2rem' }}>
        Loading Contact Information...
      </div>
    );
  }

  const { sections } = contactJson;

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: isMobile ? '40px 20px' : '80px 40px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#1e293b'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: isMobile ? '40px' : '80px',
    animation: 'fadeUp 0.8s ease forwards'
  };

  const headlineStyle = {
    fontSize: isMobile ? '2.5rem' : '4rem',
    fontWeight: '900',
    letterSpacing: '-0.03em',
    marginBottom: '20px',
    color: '#0f172a',
    lineHeight: '1.1'
  };

  const introDescStyle = {
    fontSize: isMobile ? '1.1rem' : '1.3rem',
    lineHeight: '1.6',
    color: '#64748b',
    maxWidth: '700px',
    margin: '0 auto'
  };

  const mainGridStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '32px' : '48px',
    alignItems: 'stretch'
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '32px',
    padding: isMobile ? '32px' : '48px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
    flex: 1,
    animation: 'fadeUp 1s ease forwards'
  };

  const imageContainerStyle = {
    width: '100%',
    height: isMobile ? '250px' : '350px',
    borderRadius: '24px',
    overflow: 'hidden',
    marginBottom: '40px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  };

  const detailItemStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    marginBottom: '24px',
    padding: '16px',
    borderRadius: '16px',
    backgroundColor: '#f8fafc',
    transition: 'background-color 0.3s ease'
  };

  const iconCircleStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#FF7F50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1.2rem',
    flexShrink: 0
  };

  const labelStyle = {
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    display: 'block',
    marginBottom: '4px'
  };

  const valueStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    wordBreak: 'break-word'
  };

  const hoursListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0
  };

  const hourRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '1.05rem',
    fontWeight: '500'
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={headlineStyle}>{sections.intro.headline}</h1>
        <p style={introDescStyle}>{sections.intro.description}</p>
      </header>

      <div style={mainGridStyle}>
        {/* Contact Details Card */}
        <section style={cardStyle}>
          <div style={imageContainerStyle}>
            <img 
              src={`/images/${sections.details.image}`} 
              alt="Campus" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <div style={detailItemStyle}>
            <div style={iconCircleStyle}>📍</div>
            <div>
              <span style={labelStyle}>Address</span>
              <div style={valueStyle}>{sections.details.address}</div>
            </div>
          </div>

          <div style={detailItemStyle}>
            <div style={iconCircleStyle}>📞</div>
            <div>
              <span style={labelStyle}>Phone</span>
              <div style={valueStyle}>{sections.details.phone}</div>
            </div>
          </div>

          <div style={detailItemStyle}>
            <div style={iconCircleStyle}>✉️</div>
            <div>
              <span style={labelStyle}>Email</span>
              <div style={valueStyle}>{sections.details.email}</div>
            </div>
          </div>
        </section>

        {/* Office Hours Card */}
        <section style={{ ...cardStyle, animationDelay: '0.2s' }}>
          <div style={{ marginBottom: '32px' }}>
            <span style={{ color: '#FF7F50', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Availability</span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '8px', color: '#0f172a' }}>{sections.office_hours.title}</h2>
          </div>
          
          <ul style={hoursListStyle}>
            {sections.office_hours.hours.map((h, idx) => {
              const parts = h.split(':');
              const day = parts[0];
              const time = parts.slice(1).join(':');
              
              return (
                <li key={idx} style={hourRowStyle}>
                  <span style={{ color: '#64748b' }}>{day}</span>
                  <span style={{ color: '#1e293b', textAlign: 'right' }}>{time || 'Closed'}</span>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: '48px', padding: '24px', backgroundColor: '#fff7f4', borderRadius: '20px', border: '1px dashed #FF7F50' }}>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#854d0e', lineHeight: '1.5' }}>
              <strong>Note:</strong> Campus visits are strictly by appointment only. Please call or email to schedule a tour of our facilities.
            </p>
          </div>
        </section>
      </div>

      <footer style={{ marginTop: '80px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
        &copy; 2026 Modern School Group &bull; Built for Global Leadership
      </footer>
    </div>
  );
}

export default ContactPage;

