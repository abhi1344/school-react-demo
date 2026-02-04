
function PanelsPagee({ setPage }) {
  const containerStyle = {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f8fafc'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '60px',
  };

  const titleStyle = {
    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: '-0.03em',
    marginBottom: '16px'
  };

  const subtitleStyle = {
    fontSize: '1.2rem',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    width: '100%',
    maxWidth: '1100px'
  };

  const baseCardStyle = {
    all: 'unset',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px',
    borderRadius: '32px',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    textAlign: 'left'
  };

  const cardTitleStyle = {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const cardDescStyle = {
    fontSize: '1rem',
    color: '#64748b',
    lineHeight: '1.5'
  };

  const disabledCardStyle = {
    ...baseCardStyle,
    cursor: 'not-allowed',
    opacity: '0.6',
    backgroundColor: '#f1f5f9'
  };

  const activeBadgeStyle = {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: '999px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    marginBottom: '16px',
    display: 'inline-block'
  };

  const comingSoonBadgeStyle = {
    ...activeBadgeStyle,
    backgroundColor: '#f1f5f9',
    color: '#64748b'
  };

  return (
    <div style={containerStyle} className="animate-fade-up">
      <div style={headerStyle}>
        <h1 style={titleStyle}>System Access</h1>
        <p style={subtitleStyle}>
          Select your destination to manage campus activities, student records, and academic settings.
        </p>
      </div>

      <div style={gridStyle}>
        {/* Admin Card */}
        <button
          style={baseCardStyle}
          className="panel-card"
          onClick={() => setPage("admin")}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
            e.currentTarget.style.borderColor = '#FF7F50';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)';
            e.currentTarget.style.borderColor = '#f1f5f9';
          }}
        >
          <span style={activeBadgeStyle}>Full Access</span>
          <h2 style={cardTitleStyle}>
            <span style={{ fontSize: '1.5em' }}>🛠️</span> Admin Panel
          </h2>
          <p style={cardDescStyle}>Comprehensive control over users, class schedules, site notices, and system configuration.</p>
        </button>

        {/* Teacher Card */}
        <button 
          style={baseCardStyle} 
          className="panel-card"
          disabled
        >
          <span style={activeBadgeStyle}>Full Acces</span>
          <h2 style={cardTitleStyle}>
            <span style={{ fontSize: '1.5em' }}>🎓</span> Teacher Panel
          </h2>
          <p style={cardDescStyle}>Module for grading, lesson planning, and student performance tracking. Currently under development.</p>
        </button>

        {/* Student Card */}
        <button 
          style={disabledCardStyle} 
          className="panel-card" 
          disabled
        >
          <span style={comingSoonBadgeStyle}>Development</span>
          <h2 style={cardTitleStyle}>
            <span style={{ fontSize: '1.5em' }}>📚</span> Student Panel
          </h2>
          <p style={cardDescStyle}>Access to coursework, exam results, and academic resources. Coming in the next system update.</p>
        </button>
      </div>

      <footer style={{ marginTop: '80px', color: '#94a3b8', fontSize: '0.9rem' }}>
        Modern School Core v4.2.0 &bull; Secure Session
      </footer>
    </div>
  );
}

export default PanelsPagee;
