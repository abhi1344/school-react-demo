/**
 * Pure Adapter Module - LEVEL 4
 * Responsibility: Map Form Inputs -> Normalized DB Records
 */

 export const processFormData = (formIdOrSectionId, formValues, rules) => {
    const { adapter_logic } = rules;
  
    // --- Defensive: sectionId -> formId mapping
    const sectionToFormMap = adapter_logic.section_to_form || {};
    const formId =
      formIdOrSectionId in adapter_logic.target_table_resolution
        ? formIdOrSectionId
        : sectionToFormMap[formIdOrSectionId];
  
    if (!formId) {
      console.error(
        "processFormData: Invalid formId or sectionId passed:",
        formIdOrSectionId
      );
      return { tableId: null, uiSectionId: null, record: null };
    }
  
    // 1️⃣ Resolve target table
    const tableId = adapter_logic.target_table_resolution[formId];
  
    // 2️⃣ Resolve UI section for renderer state sync
    const uiSectionId = adapter_logic.ui_section_mapping[tableId];
  
    // 3️⃣ Normalize field names (per-form)
    const record = { ...formValues };
    const normalizationMap =
      adapter_logic.field_name_normalization[formId] || {};
  
    Object.keys(formValues).forEach((key) => {
      if (normalizationMap[key]) {
        record[normalizationMap[key]] = formValues[key];
      }
    });
  
    // 4️⃣ Inject system defaults
    const defaults = adapter_logic.default_value_injection;
  
    // ID
    if (!record.id) {
      record.id = defaults.id.replace(
        "{random}",
        Math.floor(Math.random() * 10000).toString()
      );
    }
  
    // Status
    if (!record.status) {
      record.status = defaults.status;
    }
  
    // Date handling per table
    if (tableId === "students" && !record.enrollmentDate) {
      record.enrollmentDate = new Date().toISOString().split("T")[0];
    } else if (tableId === "notices" && !record.date) {
      record.date = new Date().toISOString().split("T")[0];
    }
  
    return { tableId, uiSectionId, record };
  };
  