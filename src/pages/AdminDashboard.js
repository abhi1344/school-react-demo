import React, { useEffect, useState, useRef } from "react";
import { processFormData } from "../dataAdapter/index.js";
import { supabase } from "../supabaseClient.js";

// --- Entity-to-Database Mapping (Strict requirement) ---
/*const ENTITY_CONFIG = {
  students: { pk: "student_id", uiPk: "studentCode", formId: "addStudentForm" },
  teachers: { pk: "staff_id", uiPk: "staffCode", formId: "addTeacherForm" },
  classes: { pk: "class_ref", uiPk: "classCode", formId: "addClassForm" },
  notices: { pk: "notice_id", uiPk: "noticeCode", formId: "addNoticeForm" }
};
*/
const ENTITY_CONFIG = {
  students: { pk: "studentCode", uiPk: "studentCode", formId: "addStudentForm" },
  teachers: { pk: "staffCode", uiPk: "staffCode", formId: "addTeacherForm" },
  classes: { pk: "classCode", uiPk: "classCode", formId: "addClassForm" },
  notices: { pk: "noticeCode", uiPk: "noticeCode", formId: "addNoticeForm" }
};

// --- Icon Helper for Lucide ---
const Icon = ({ name, className = "", style = {} }) => {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [name]);

 // const lucideName = name ? name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : "circle";
 const lucideName = name
  ? name
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/(\D)(\d)/g, "$1-$2") // ← CRITICAL FIX
      .toLowerCase()
  : "circle";
  return <i data-lucide={lucideName} className={className} style={style}></i>;
};

const AdminDashboard = () => {
  const [config, setConfig] = useState(null);
  const [rules, setRules] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localData, setLocalData] = useState({});
  const [liveStats, setLiveStats] = useState(null);

  // Edit State
  const [editingItem, setEditingItem] = useState(null); // { formId, tableId, row, pkValue }
  const formRef = useRef(null);

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
        
        const initialData = {};
        if (adapterRules.system_contract.persistence === "supabase_remote_state") {
          const uiMap = adapterRules.adapter_logic.ui_section_mapping;
          const tableNames = Object.keys(uiMap);

          const [fetchResults, countResults] = await Promise.all([
            Promise.all(tableNames.map(tableName => supabase.from(tableName).select("*"))),
            Promise.all(tableNames.map(tableName => supabase.from(tableName).select('*', { count: 'exact', head: true })))
          ]);

       /*   fetchResults.forEach((res, index) => {
            const tableName = tableNames[index];
            const uiSectionId = uiMap[tableName];
            initialData[uiSectionId] = res.data || [];
          });
             */
          fetchResults.forEach((res, index) => {
            const tableName = tableNames[index];
            const uiSectionId = uiMap[tableName];
          
            if (res.data?.length && !("id" in res.data[0])) {
              console.error(`FATAL: ${tableName} table missing 'id' primary key`);
            }
          
            initialData[uiSectionId] = res.data || [];
          });
          
          const counts = {};
          tableNames.forEach((name, i) => {
            counts[name] = countResults[i].count || 0;
          });
          setLiveStats(counts);
        }

        setLocalData(initialData);
        if (data.navigation?.length > 0) setActiveTab(data.navigation[0].id);
        setLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setLoading(false);
      }
    };
    initPortal();
  }, []);

  // --- DELETE LOGIC ---
  const handleDelete = async (row, uiSectionId) => {
    const tableId = Object.keys(rules.adapter_logic.ui_section_mapping).find(
      t => rules.adapter_logic.ui_section_mapping[t] === uiSectionId
    );
    const pkName = ENTITY_CONFIG[tableId]?.pk;
    const uiPk = ENTITY_CONFIG[tableId]?.uiPk;
    //const pkValue = row[pkName] || row[uiPk];
    const pkValue = row[pkName];
    if (!pkValue) {
      alert("Error: Record ID missing. Database primary key not found.");
      return;
    }
    

    //if (!pkName || !pkValue) return alert("Error: Primary key context missing.");
    if (!window.confirm(`Permanently delete this ${tableId} record?`)) return;

    try {
      const { error: dbError } = await supabase.from(tableId).delete().eq(pkName, pkValue);
      if (dbError) throw dbError;

      // Update local state immediately
      setLocalData(prev => ({
        ...prev,
        [uiSectionId]: prev[uiSectionId].filter(item => (item[pkName] || item[uiPk]) !== pkValue)
      }));

      // Update local counts
      if (liveStats && liveStats[tableId] !== undefined) {
        setLiveStats(prev => ({ ...prev, [tableId]: Math.max(0, prev[tableId] - 1) }));
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  // --- EDIT TRIGGER ---
  const handleEdit = (row, uiSectionId) => {
    const tableId = Object.keys(rules.adapter_logic.ui_section_mapping).find(
      t => rules.adapter_logic.ui_section_mapping[t] === uiSectionId
    );
    const configEntry = ENTITY_CONFIG[tableId];
    if (!configEntry) return;

    setEditingItem({
      formId: configEntry.formId,
      tableId: tableId,
      pkName: configEntry.pk,
      pkValue: row[configEntry.pk] || row[configEntry.uiPk],
      data: row
    });

    // Jump to the form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- SUBMIT LOGIC ---
  const handleFormSubmit = async (e, sectionId) => {
    e.preventDefault();
    if (!rules || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    
    const isEdit = editingItem && editingItem.formId === sectionId;
    const options = isEdit ? { mode: "update", primaryKey: editingItem.pkName } : { mode: "create" };

    const { tableId, uiSectionId, record } = processFormData(sectionId, values, rules, options);

    if (!tableId) {
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEdit) {
        const { error: dbError } = await supabase
          .from(tableId)
          .update(record)
          .eq(editingItem.pkName, editingItem.pkValue);
        
        if (dbError) throw dbError;

        setLocalData(prev => ({
          ...prev,
          [uiSectionId]: prev[uiSectionId].map(item => {
       //     const itemPk = item[editingItem.pkName] || item[ENTITY_CONFIG[tableId].uiPk];
       const itemPk = item[editingItem.pkName];

            return itemPk === editingItem.pkValue ? { ...item, ...record } : item;
          })
        }));
        setEditingItem(null);
      } else {
        const { error: dbError } = await supabase.from(tableId).insert([record]);
        if (dbError) throw dbError;

        setLocalData(prev => ({
          ...prev,
          [uiSectionId]: [...(prev[uiSectionId] || []), record]
        }));

        if (liveStats && liveStats[tableId] !== undefined) {
          setLiveStats(prev => ({ ...prev, [tableId]: (prev[tableId] || 0) + 1 }));
        }
      }
      e.target.reset();
    } catch (err) {
      alert(`Operation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const tableSection = config.pages[activeTab].sections.find(s => s.type === "table");
    if (!tableSection) return;
    const data = localData[tableSection.id] || [];
    if (!data.length) return alert("No data to export.");

    const headers = tableSection.columns.map(col => col.header).join(",");
    const rows = data.map(row => 
      tableSection.columns.map(col => `"${String(row[col.key] || "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tableSection.id}.csv`;
    link.click();
  };

  if (loading) return <div className="empty-state">Loading eduAdmin portal...</div>;
  if (!config) return null;

  const activePage = config.pages[activeTab];

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
        const tableData = localData[section.id] || [];
        const filteredData = searchTerm.trim() 
          ? tableData.filter(row => section.columns.some(col => String(row[col.key] || "").toLowerCase().includes(searchTerm.toLowerCase())))
          : tableData;

        return (
          <div className="table-card" key={section.id}>
            <h3 className="section-title">{section.title}</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {section.columns.map(col => <th key={col.key}>{col.header}</th>)}
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr key={idx}>
                      {section.columns.map(col => (
                        <td key={col.key}>
                          {col.key === "status" ? (
                            <span className={`status-pill status-${(row[col.key] || 'active').toLowerCase()}`}>{row[col.key]}</span>
                          ) : (row[col.key] || "-")}
                        </td>
                      ))}
                      <td style={{ textAlign: "right" }}>
                        <div className="action-buttons" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
  className="btn-icon edit"
  onClick={() => handleEdit(row, section.id)}
  title="Edit Record"
>
  <Icon name="Edit2" /> 
</button>

<button
  className="btn-icon delete"
  onClick={() => handleDelete(row, section.id)}
  title="Delete Record"
>
  <Icon name="Trash2" />
</button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "form":
        const isEditing = editingItem && editingItem.formId === section.id;
        return (
          <div className="form-card" key={section.id} ref={section.id === editingItem?.formId ? formRef : null}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="section-title" style={{ margin: 0 }}>
                {isEditing ? `Modify Record` : section.title}
              </h3>
              {isEditing && (
                <button 
                  className="button-secondary" 
                  style={{ padding: '0.4rem 1rem' }}
                  onClick={() => setEditingItem(null)}
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form onSubmit={(e) => handleFormSubmit(e, section.id)} key={isEditing ? editingItem.pkValue : 'create'}>
              <div className="form-grid">
                {section.fields.map((field) => (
                  <div key={field.name} className={`form-field ${field.type === "textarea" ? "full-width" : ""}`}>
                    <label className="form-label">
                      {field.label} {field.required && <span style={{ color: "red" }}>*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select 
                        className="select" 
                        name={field.name} 
                        required={field.required} 
                        disabled={isSubmitting}
                        defaultValue={isEditing ? editingItem.data[field.name] : ""}
                      >
                        <option value="">Select option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea 
                        className="textarea" 
                        name={field.name} 
                        placeholder={field.placeholder} 
                        required={field.required} 
                        disabled={isSubmitting}
                        defaultValue={isEditing ? editingItem.data[field.name] : ""}
                      />
                    ) : (
                      <input 
                        name={field.name} 
                        type={field.type} 
                        className="input" 
                        placeholder={field.placeholder} 
                        required={field.required} 
                        disabled={isSubmitting}
                        defaultValue={isEditing ? editingItem.data[field.name] : ""}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="button-group">
                {!isEditing && <button type="reset" className="button-secondary" disabled={isSubmitting}>Reset</button>}
                <button type="submit" className="button-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : (isEditing ? "Save Updates" : "Add Entry")}
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
                setSearchTerm("");
                setIsSidebarOpen(false);
                setEditingItem(null);
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
            <button className="mobile-toggle" onClick={() => setIsSidebarOpen(true)}><Icon name="Menu" /></button>
            <h2 className="header-title">{activePage.title}</h2>
          </div>
          <div className="header-controls">
            <div className="search-box">
              <Icon name="Search" className="text-muted" style={{ width: '16px' }} />
              <input 
                type="text" 
                placeholder="Search currently viewing..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="button-secondary" onClick={handleExportCSV}>Export</button>
          </div>
        </header>

        <div className="content-body">
          {activePage.sections.map((section) => {
            let displaySection = { ...section };

            // Inject Live Stats
            if (section.type === "stats" && liveStats) {
              displaySection.data = section.data.map(stat => {
                let liveValue = stat.value;
                if (stat.label === "Total Students") liveValue = liveStats.students?.toLocaleString();
                if (stat.label === "Active Teachers") liveValue = liveStats.teachers?.toLocaleString();
                if (stat.label === "Open Classes") liveValue = liveStats.classes?.toLocaleString();
                if (stat.label === "New Notices") liveValue = liveStats.notices?.toLocaleString();
                return { ...stat, value: liveValue || stat.value };
              });
            }

            return renderSection(displaySection);
          })}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;


