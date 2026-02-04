import React, { useEffect, useState } from "react";
import { processFormData } from "../dataAdapter/index.js";
import { supabase } from "../supabaseClient.js";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // UI State for responsiveness
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // localData acts as our Reactive Cache for the locked renderer
  const [localData, setLocalData] = useState({});
  
  // Level-5 State Management
  const [liveStats, setLiveStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const initPortal = async () => {
      try {
        const [configRes, rulesRes] = await Promise.all([
          fetch("/json/adminDashboard.json"),
          fetch("/json/adapter.rules.json")
        ]);
        
        if (!configRes.ok || !rulesRes.ok) throw new Error("Failed to load configuration files.");
        
        const data = await configRes.json();
        const adapterRules = await rulesRes.json();
        
        setConfig(data);
        setRules(adapterRules);
        
        // 1. Initial configuration: Seed from JSON defaults
        const initialData = {};
        Object.values(data.pages).forEach(page => {
          page.sections.forEach(section => {
            if (section.type === "table") {
              initialData[section.id] = section.data || [];
            }
          });
        });

        // 2. READ Hydration: Fetch live data from Supabase to replace/augment static data
        if (adapterRules.system_contract.persistence === "supabase_remote_state") {
          const uiMap = adapterRules.adapter_logic.ui_section_mapping;
          const tableNames = Object.keys(uiMap);

          // Fetch all relevant table data and exact counts in parallel
          const [fetchResults, countResults] = await Promise.all([
            Promise.all(tableNames.map(tableName => supabase.from(tableName).select("*"))),
            Promise.all(tableNames.map(tableName => supabase.from(tableName).select('*', { count: 'exact', head: true })))
          ]);

          // Map Table Data
          fetchResults.forEach((res, index) => {
            if (!res.error && res.data && res.data.length > 0) {
              const tableName = tableNames[index];
              const uiSectionId = uiMap[tableName];
              initialData[uiSectionId] = res.data;
            }
          });

          // Map Counts for Live Stats (Level-5A)
          const counts = {};
          tableNames.forEach((name, i) => {
            counts[name] = countResults[i].count || 0;
          });
          setLiveStats(counts);
        }

        setLocalData(initialData);

        if (data.navigation && data.navigation.length > 0) {
          setActiveTab(data.navigation[0].id);
        }
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Initialization Error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    initPortal();
  }, []);

  // Level-5C: CSV Export Utility
  const handleExportCSV = () => {
    const activePage = config.pages[activeTab];
    const tableSection = activePage.sections.find(s => s.type === "table");
    
    if (!tableSection) {
      alert("No data table available for export on this page.");
      return;
    }

    const data = localData[tableSection.id] || tableSection.data || [];
    if (data.length === 0) {
      alert("No records found to export.");
      return;
    }

    // Follow column order defined in adminDashboard.json
    const headers = tableSection.columns.map(col => col.header).join(",");
    const rows = data.map(row => 
      tableSection.columns.map(col => {
        const val = row[col.key] || "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",")
    ).join("\n");

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${tableSection.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // L4: Write-Flow via Supabase
  const handleFormSubmit = async (e, sectionId) => {
    e.preventDefault();
    if (!rules || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    
    // 1. ADAPTER: Resolve DB Table, UI Section, and Normalized Record
    const { tableId, uiSectionId, record } = processFormData(sectionId, values, rules);

    if (!tableId) {
      console.error("Adapter failed to resolve target table for:", sectionId);
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. REMOTE PERSISTENCE: Write to Supabase
      if (rules.system_contract.persistence === "supabase_remote_state") {
        const { error: dbError } = await supabase
          .from(tableId)
          .insert([record]);

        if (dbError) throw dbError;
      }

      // 3. UI SYNC: Update Local Cache for the locked renderer
      const targetStateKey = uiSectionId || tableId;
      setLocalData(prev => ({
        ...prev,
        [targetStateKey]: [...(prev[targetStateKey] || []), record]
      }));

      // Update Live Stats counts locally for reactivity
      if (liveStats && liveStats[tableId] !== undefined) {
        setLiveStats(prev => ({ ...prev, [tableId]: (prev[tableId] || 0) + 1 }));
      }

      e.target.reset();
      console.log("Persistence successful.");
    } catch (err) {
      console.error("Supabase Submission Error:", err.message);
      alert(`Submission failed: ${err.message}. Data preserved in console.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="empty-state">Loading portal configuration...</div>;
  if (error) return <div className="empty-state">Error: {error}</div>;
  if (!config) return null;

  const activePage = config.pages[activeTab];

  // RENDERER FUNCTIONS (LOCKED - MUST NOT BE MODIFIED)
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
                      <select className="select" name={field.name} required={field.required} disabled={isSubmitting}>
                        <option value="">Select option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea className="textarea" name={field.name} placeholder={field.placeholder} required={field.required} disabled={isSubmitting} />
                    ) : (
                      <input name={field.name} type={field.type} className="input" placeholder={field.placeholder} required={field.required} disabled={isSubmitting} />
                    )}
                  </div>
                ))}
              </div>
              <div className="button-group">
                <button type="reset" className="button-secondary" disabled={isSubmitting}>Reset</button>
                <button type="submit" className="button-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
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
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
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
              onClick={() => {
                setActiveTab(item.id);
                setSearchTerm(""); // Reset search on navigation
                setIsSidebarOpen(false); // Close sidebar on mobile after selection
              }}
            >
              <Icon name={item.icon} className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-left">
            <button 
              className="mobile-toggle" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Menu"
            >
              <Icon name={isSidebarOpen ? "X" : "Menu"} />
            </button>
            <h2 className="header-title">{activePage.title}</h2>
          </div>
          <div className="header-controls">
            <div className="search-box">
              <Icon name="Search" className="text-muted" style={{ width: '16px', height: '16px' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="action-buttons">
              <button className="button-secondary" onClick={handleExportCSV}>Export CSV</button>
              <button
                className="button-primary"
                onClick={() => {
                  alert("Report generation coming soon (PDF / Analytics).");
                }}
              >
                Report
              </button>
            </div>
          </div>
        </header>

        <div className="content-body">
          {activePage.sections.map((section) => {
            // Level-5 Prep Data: Intercept section data before passing to Locked Renderer
            let displaySection = { ...section };

            // Level-5A: Inject Live Stats counts into Overview page
            if (section.type === "stats" && section.id === "quickStats" && liveStats) {
              displaySection.data = section.data.map(stat => {
                let liveValue = stat.value;
                if (stat.label === "Total Students") liveValue = liveStats.students?.toLocaleString();
                if (stat.label === "Active Teachers") liveValue = liveStats.teachers?.toLocaleString();
                if (stat.label === "Open Classes") liveValue = liveStats.classes?.toLocaleString();
                if (stat.label === "New Notices") liveValue = liveStats.notices?.toLocaleString();
                return { ...stat, value: liveValue || stat.value };
              });
            }

            // Level-5B: Table Search (Client-Side) - Scan all whitelisted column keys
            if (section.type === "table") {
              const rawData = localData[section.id] || section.data || [];
              if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                displaySection.data = rawData.filter(row => 
                  section.columns.some(col => 
                    String(row[col.key] || "").toLowerCase().includes(term)
                  )
                );
              } else {
                displaySection.data = rawData;
              }
            }

            return renderSection(displaySection);
          })}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;