import React, { useEffect, useState, useRef } from "react";
import { processFormData } from "../dataAdapter/index.js";
import { supabase } from "../supabaseClient.js";
import "../design-teacher.css";

/**
 * TeacherDashboard Component
 * Purely JSON-driven Faculty Interface.
 * Consumes /json/teacherDashboard.json
 */

const Icon = ({ name, className = "", style = {} }) => {
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, [name]);

  const lucideName = name
    ? name
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/(\D)(\d)/g, "$1-$2")
        .toLowerCase()
    : "circle";
  return <i data-lucide={lucideName} className={className} style={style}></i>;
};

const TeacherDashboard = () => {
  const [config, setConfig] = useState(null);
  const [rules, setRules] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localData, setLocalData] = useState({});

  // Edit State (Strictly using 'uid' for updates)
  const [editingItem, setEditingItem] = useState(null); // { formId, tableId, rowUid, data }
  const formRef = useRef(null);

  useEffect(() => {
    const initTeacherPortal = async () => {
      try {
        const [configRes, rulesRes] = await Promise.all([
          fetch("/json/teacherDashboard.json"),
          fetch("/json/adapter.rules.json")
        ]);
        
        if (!configRes.ok || !rulesRes.ok) throw new Error("Portal configuration files missing.");
        
        const data = await configRes.json();
        const adapterRules = await rulesRes.json();
        
        setConfig(data);
        setRules(adapterRules);
        
        const initialData = {};
        if (adapterRules.system_contract.persistence === "supabase_remote_state") {
          // Identify all tables needed for teacher view
          const tablesToFetch = ["students", "teachers", "classes", "notices", "assignments"];

          const fetchResults = await Promise.all(
            tablesToFetch.map(async (tableName) => {
              try {
                const { data, error } = await supabase.from(tableName).select("*");
                if (error) throw error;
                return { data };
              } catch (err) {
                console.warn(`Failed to fetch ${tableName}:`, err);
                return { data: [] };
              }
            })
          );
          
          // Map fetched data to section IDs defined in teacherDashboard.json
          fetchResults.forEach((res, index) => {
            const tableName = tablesToFetch[index];
            const sectionId = tableName === "assignments" ? "assignmentTable" : `${tableName.slice(0, -1)}Table`;
            // Special cases for notice and student table IDs in JSON
            const mappedId = tableName === "notices" ? "noticeTable" : 
                            tableName === "students" ? "studentTable" :
                            tableName === "classes" ? "classTable" : sectionId;
            
            initialData[mappedId] = res.data || [];
          });
        }

        setLocalData(initialData);
        if (data.navigation?.length > 0) setActiveTab(data.navigation[0].id);
        setLoading(false);
      } catch (err) {
        console.error("Teacher Portal Initialization Error:", err);
        setLoading(false);
      }
    };
    initTeacherPortal();
  }, []);

  const handleDelete = async (row, uiSectionId) => {
    // Constraint: Students are read-only for teachers
    if (uiSectionId === "studentTable") {
      alert("Faculty Notice: Student records are read-only.");
      return;
    }

    if (!row.uid) return alert("System Error: Record identifier (uid) missing.");
    
    // Resolve target table from adapter rules
    const tableId = Object.keys(rules.adapter_logic.ui_section_mapping).find(
      t => rules.adapter_logic.ui_section_mapping[t] === uiSectionId
    ) || (uiSectionId === "assignmentTable" ? "assignments" : null);

    if (!tableId) return;
    if (!window.confirm(`Are you sure you want to delete this ${tableId} entry?`)) return;

    try {
      const { error: dbError } = await supabase.from(tableId).delete().eq("uid", row.uid);
      if (dbError) throw dbError;

      setLocalData(prev => ({
        ...prev,
        [uiSectionId]: prev[uiSectionId].filter(item => item.uid !== row.uid)
      }));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleEdit = (row, uiSectionId) => {
    // Determine the relevant form for this table section
    let formId = "";
    let tableId = "";

    if (uiSectionId === "assignmentTable") {
      formId = "addAssignmentForm";
      tableId = "assignments";
    } else if (uiSectionId === "noticeTable") {
      alert("Notice: Announcements are read-only.");
      return;
    } else if (uiSectionId === "studentTable" || uiSectionId === "classTable") {
      alert("Faculty Note: This record is managed by administration.");
      return;
    }

    setEditingItem({
      formId,
      tableId,
      rowUid: row.uid,
      data: row
    });

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFormSubmit = async (e, sectionId) => {
    e.preventDefault();
    if (!rules || isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    const isEdit = editingItem && editingItem.formId === sectionId;
const options = isEdit ? { mode: "update", primaryKey: "uid" } : { mode: "create" };
const resolvedFormId = sectionId === "teacherProfileForm" ? "addTeacherForm" : sectionId;

const { tableId, uiSectionId, record } = processFormData(resolvedFormId, values, rules, options);

if (!tableId) return setIsSubmitting(false);

try {
  if (isEdit) {
    await supabase.from(tableId).update(record).eq("uid", editingItem.rowUid);
    setLocalData(prev => ({
      ...prev,
      [uiSectionId]: prev[uiSectionId]?.map(item =>
        item.uid === editingItem.rowUid ? { ...item, ...record } : item
      ) || []
    }));
    setEditingItem(null);
    alert("Record updated successfully.");
  } else {
    const { data: newRows, error } = await supabase.from(tableId).insert([record]).select();
    if (error) throw error;
    setLocalData(prev => ({
      ...prev,
      [uiSectionId]: [...(prev[uiSectionId] || []), newRows[0]]
    }));
    alert("Record created successfully.");
  }
  e.target.reset();
} catch (err) {
  alert(`Submission Error: ${err.message}`);
} finally {
  setIsSubmitting(false);
}

   
  };

  if (loading) return <div className="teacher-loading">Initializing Faculty Portal...</div>;
  if (!config) return null;

  const activePage = config.pages ? config.pages[activeTab] : null;

  const renderSection = (section) => {
    switch (section.type) {
      case "stats":
        return (
          <div className="teacher-stats-section" key={section.id}>
            <div className="teacher-stats-grid">     
              {section.data && section.data.map((stat, idx) => (
                <div className="teacher-stat-card" key={idx}>
                  <p className="teacher-stat-label">{stat.label}</p>
                  <div className="teacher-stat-value">
                    <span>{stat.value}</span>
                    <span className={`teacher-trend ${stat.trend && stat.trend.includes("+") ? "up" : "neutral"}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "table":
        const tableData = localData[section.id] || section.data || [];
        const filteredData = searchTerm.trim() 
          ? tableData.filter(row => section.columns && section.columns.some(col => String(row[col.key] || "").toLowerCase().includes(searchTerm.toLowerCase())))
          : tableData;

        // Teachers can only edit specific items based on ownership tags or section ID
        const canEditTable = section.id === "assignmentTable";

        return (
          <div className="teacher-table-card" key={section.id}>
            <h3 className="teacher-section-title">{section.title}</h3>
            <div className="teacher-table-container">
              <table className="teacher-table">
                <thead>
                  <tr>
                    {section.columns && section.columns.map(col => <th key={col.key}>{col.header}</th>)}
                    {canEditTable && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? filteredData.map((row, idx) => (
                    <tr key={row.uid || idx}>
                      {section.columns && section.columns.map(col => (
                        <td key={col.key}>
                          {col.key === "status" ? (
                            <span className={`teacher-pill ${row[col.key]?.toLowerCase()}`}>{row[col.key]}</span>
                          ) : (row[col.key] || "-")}
                        </td>
                      ))}
                      {canEditTable && (
                        <td className="text-right">
                          <div className="teacher-actions">
                            <button className="teacher-btn-icon edit" onClick={() => handleEdit(row, section.id)}>
                              <Icon name="Edit3" />
                            </button>
                            <button className="teacher-btn-icon delete" onClick={() => handleDelete(row, section.id)}>
                              <Icon name="Trash" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={(section.columns ? section.columns.length : 0) + (canEditTable ? 1 : 0)} className="teacher-empty">
                        No records found for this section.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "form":
        const isEditing = editingItem && editingItem.formId === section.id;
        return (
          <div className="teacher-form-card" key={section.id} ref={section.id === editingItem?.formId ? formRef : null}>
            <div className="teacher-form-header">
              <h3 className="teacher-section-title">
                {isEditing ? `Edit ${section.title}` : section.title}
              </h3>
              {isEditing && (
                <button className="teacher-btn-cancel" onClick={() => setEditingItem(null)}>Cancel Edit</button>
              )}
            </div>
            <form onSubmit={(e) => handleFormSubmit(e, section.id)} key={isEditing ? editingItem.rowUid : 'create'}>
              <div className="teacher-form-grid">
                {section.fields && section.fields.map((field) => (
                  <div key={field.name} className={`teacher-form-field ${field.type === "textarea" ? "full" : ""}`}>
                    <label className="teacher-label">
                      {field.label} {field.required && <span className="req">*</span>}
                    </label>
                    {field.type === "select" ? (
                      <select 
                        className="teacher-select" 
                        name={field.name} 
                        required={field.required} 
                        disabled={isSubmitting || field.locked}
                        defaultValue={isEditing ? editingItem.data[field.name] : ""}
                      >
                        <option value="">Choose Option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea 
                        className="teacher-textarea" 
                        name={field.name} 
                        placeholder={field.placeholder} 
                        required={field.required} 
                        readOnly={field.locked}
                        disabled={isSubmitting}
                        defaultValue={isEditing ? editingItem.data[field.name] : ""}
                      />
                    ) : (
                      <input 
                        name={field.name} 
                        type={field.type} 
                        className="teacher-input" 
                        placeholder={field.placeholder} 
                        required={field.required} 
                        readOnly={field.locked}
                        disabled={isSubmitting}
                        defaultValue={isEditing ? editingItem.data[field.name] : ""}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="teacher-form-buttons">
                {!isEditing && <button type="reset" className="teacher-btn-secondary" disabled={isSubmitting}>Reset</button>}
                <button type="submit" className="teacher-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : (isEditing ? "Save Changes" : "Create Entry")}
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
    <div className="teacher-portal">
      <div className={`teacher-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />

      <aside className={`teacher-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="teacher-logo">
          <Icon name="GraduationCap" className="icon-main" />
          <span>{config.portalTitle}</span>
        </div>
        <nav className="teacher-nav">
          <p className="teacher-nav-label">Faculty Menu</p>
          {config.navigation && config.navigation.map((item) => (
            <button
              key={item.id}
              className={`teacher-nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.id);
                setSearchTerm("");
                setIsSidebarOpen(false);
                setEditingItem(null);
              }}
            >
              <Icon name={item.icon} className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="teacher-main">
        <header className="teacher-header">
          <div className="teacher-header-left">
            <button className="teacher-mobile-toggle" onClick={() => setIsSidebarOpen(true)}>
              <Icon name="Menu" />
            </button>
            <h2 className="teacher-page-title">{activePage?.title || "Loading..."}</h2>
          </div>
          <div className="teacher-search">
            <Icon name="Search" className="search-icon" />
            <input 
              type="text" 
              placeholder="Filter current view..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="teacher-content">
          {activePage?.sections ? activePage.sections.map((section) => renderSection(section)) : (
             <div className="teacher-empty">No content available for this page.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;