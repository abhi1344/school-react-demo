
import React, { useEffect, useState } from "react";
import { processFormData } from "../dataAdapter/index.js";

// --- Icon Helper for Lucide ---
const Icon = ({ name, className = "" }) => {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [name]);

  const lucideName = name ? name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : "circle";
  return <i data-lucide={lucideName} className={className}></i>;
};

const AdminDashboard = () => {
  const [config, setConfig] = useState(null);
  const [rules, setRules] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // L2: In-memory store for table sections
  const [localData, setLocalData] = useState({});

  useEffect(() => {
    // Load Configuration and Rules in parallel
    Promise.all([
      fetch("/json/adminDashboard.json").then(res => res.json()),
      fetch("/json/adapter.rules.json").then(res => res.json())
    ])
    .then(([data, adapterRules]) => {
      setConfig(data);
      setRules(adapterRules);
      
      const initialData = {};
      Object.values(data.pages).forEach(page => {
        page.sections.forEach(section => {
          if (section.type === "table") {
            initialData[section.id] = section.data || [];
          }
        });
      });
      setLocalData(initialData);

      if (data.navigation && data.navigation.length > 0) {
        setActiveTab(data.navigation[0].id);
      }
      setLoading(false);
    })
    .catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  // L3: Form Submission Logic - Decoupled via Adapter
  const handleFormSubmit = (e, sectionId) => {
    e.preventDefault();
    if (!rules) return;

    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    
    // CALL ADAPTER: Transform UI values into Schema values
    const { tableId, record } = processFormData(sectionId, values, rules);

    if (tableId) {
      setLocalData(prev => ({
        ...prev,
        [tableId]: [...(prev[tableId] || []), record]
      }));
      e.target.reset();
    }
  };

  if (loading) return <div className="empty-state">Loading portal configuration...</div>;
  if (error) return <div className="empty-state">Error: {error}</div>;
  if (!config) return null;

  const activePage = config.pages[activeTab];

  // RENDERER FUNCTIONS (REMAIN UNCHANGED)
  const renderSection = (section) => {
    switch (section.type) {
      case "stats":
        return (
          <div className="stats-card" key={section.id}>
            <div className="stats-grid">     
              {section.data.map((stat, idx) => (
                <div className="stat-card" key={idx}>
                  <p className="stat-label">{stat.label}</p>
                  <div className="stat-value">
                    <span>{stat.value}</span>
                    <span className={`stat-trend ${stat.trend.includes("+") ? "trend-up" : "trend-neutral"}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "table":
        return (
          <div className="table-card" key={section.id}>
            <h3 className="section-title">{section.title}</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {section.columns.map((col) => (
                      <th key={col.key}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(section.data || []).map((row, idx) => (
                    <tr key={idx}>
                      {section.columns.map((col) => (
                        <td key={col.key}>
                          {col.key === "status" ? (
                            <span className={`status-pill status-${(row[col.key] || 'active').toLowerCase()}`}>
                              {row[col.key]}
                            </span>
                          ) : (
                            row[col.key] || "-"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "form":
        return (
          <div className="form-card" key={section.id}>
            <h3 className="section-title">{section.title}</h3>
            <form onSubmit={(e) => handleFormSubmit(e, section.id)}>
              <div className="form-grid">
                {section.fields.map((field) => (
                  <div key={field.name} className={`form-field ${field.type === "textarea" ? "full-width" : ""}`}>
                    <label className="form-label">
                      {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select className="select" name={field.name} required={field.required}>
                        <option value="">Select option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea className="textarea" name={field.name} placeholder={field.placeholder} required={field.required} />
                    ) : (
                      <input name={field.name} type={field.type} className="input" placeholder={field.placeholder} required={field.required} />
                    )}
                  </div>
                ))}
              </div>
              <div className="button-group">
                <button type="reset" className="button-secondary">Reset</button>
                <button type="submit" className="button-primary">Save Changes</button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Icon name="GraduationCap" className="text-primary" />
          <span>{config.portalTitle}</span>
        </div>
        <nav className="nav-group">
          <p className="nav-label">Navigation</p>
          {config.navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon name={item.icon} className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div style={{ marginTop: 'auto' }}>
           <button className="nav-item">
              <Icon name="Settings" className="w-4 h-4" />
              <span>Settings</span>
           </button>
           <button className="nav-item">
              <Icon name="LogOut" className="w-4 h-4" />
              <span>Sign Out</span>
           </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{activePage.title}</h2>
          </div>
          
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div className="search-box">
              <Icon name="Search" className="text-muted" style={{ width: '16px', height: '16px' }} />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="button-secondary">Export</button>
            <button className="button-primary">Generate Report</button>
          </div>
        </header>

        <div className="content-body">
          {activePage.sections.map((section) => {
            const displaySection = section.type === "table" 
              ? { ...section, data: localData[section.id] || section.data } 
              : section;
            return renderSection(displaySection);
          })}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
