
import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/json/adminDashboard.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load dashboard configuration.");
        return res.json();
      })
      .then((data) => {
        setConfig(data);
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

  if (loading) return <div className="empty-state">Loading portal configuration...</div>;
  if (error) return <div className="empty-state">Error: {error}</div>;
  if (!config) return null;

  const activePage = config.pages[activeTab];

  const renderSection = (section) => {
    switch (section.type) {
      case "stats":
        return (
          <div className="stats-grid" key={section.id}>
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
        );

      case "table":
        return (
          <div className="card" key={section.id}>
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
                  {section.data.map((row, idx) => (
                    <tr key={idx}>
                      {section.columns.map((col) => (
                        <td key={col.key}>
                          {col.key === "status" ? (
                            <span className={`status-pill status-${row[col.key].toLowerCase()}`}>
                              {row[col.key]}
                            </span>
                          ) : (
                            row[col.key]
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
          <div className="card" key={section.id}>
            <h3 className="section-title">{section.title}</h3>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid">
                {section.fields.map((field) => (
                  <div key={field.name} className={`form-field ${field.type === "textarea" ? "full-width" : ""}`}>
                    <label className="form-label">
                      {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select className="select">
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea className="textarea" placeholder={field.placeholder} />
                    ) : (
                      <input type={field.type} className="input" placeholder={field.placeholder} required={field.required} />
                    )}
                  </div>
                ))}
              </div>
              <div className="button-group">
                <button type="button" className="button-secondary">Reset</button>
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
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h2 className="section-title" style={{ margin: 0 }}>{activePage.title}</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="button-secondary">Export</button>
            <button className="button-primary">Generate Report</button>
          </div>
        </header>

        <div className="content-body">
          {activePage.sections.map((section) => renderSection(section))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
