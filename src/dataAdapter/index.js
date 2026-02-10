
/**
 * Pure Adapter Module - LEVEL 4
 * Responsibility: Map Form Inputs -> Normalized DB Records
 * STRICT ARCHITECTURE: Only fields explicitly mapped in adapter.rules.json are emitted.
 * Drops all unknown UI keys to prevent Supabase "column not found" errors.
 */

 //export const processFormData = (formIdOrSectionId, formValues, rules) => {
  export const processFormData = (
    formIdOrSectionId,
    formValues,
    rules,
    options = {}
  ) => {
  const { adapter_logic, system_contract } = rules;

  // --- 1. Context Resolution ---
  const sectionToFormMap = adapter_logic.section_to_form || {};
  const formId =
    formIdOrSectionId in adapter_logic.target_table_resolution
      ? formIdOrSectionId
      : sectionToFormMap[formIdOrSectionId];

  if (!formId) {
    console.error("Adapter Error: Unresolved form context for", formIdOrSectionId);
    return { tableId: null, uiSectionId: null, record: null };
  }

  const tableId = adapter_logic.target_table_resolution[formId];
  const uiSectionId =
  adapter_logic.ui_section_mapping[tableId] ||
  (tableId === "assignments" ? "assignmentTable" : null);

  const normalizationMap = adapter_logic.field_name_normalization[formId] || {};
  const defaults = adapter_logic.default_value_injection;
  
    
  // --- 2. Strict Whitelist Normalization ---
  // We initialize an empty record and ONLY populate it using the mapping rules.
  // This ensures UI-only keys (e.g., 'studentCode') never reach the DB unless explicitly mapped.
  const record = {};
  
  Object.keys(normalizationMap).forEach((uiKey) => {
    const dbColumn = normalizationMap[uiKey];
    if (formValues[uiKey] !== undefined && formValues[uiKey] !== null) {
      record[dbColumn] = formValues[uiKey];
    }
  });
  // 🔒 Never allow assignmentCode change during edit
if (tableId === "assignments" && options.mode === "update") {
  delete record.assignmentCode;
}


  // Helper to resolve a UI semantic field to a DB column based on the strict whitelist
  const getDbColumn = (uiKey) => normalizationMap[uiKey];

  // --- 3. System Field Injection (Strict & Context-Aware) ---
  const isSupabase = system_contract?.persistence === "supabase_remote_state";

  // Status Injection: Only if mapped in the rules for this form
  const statusDbKey = getDbColumn("status");
  if (statusDbKey && !record[statusDbKey]) {
    record[statusDbKey] = defaults.status;
  }

  // ID Management: Skip for Supabase (PK auto-gen) or inject if mapped and local
  const idDbKey = getDbColumn("id");
  if (idDbKey) {
    if (!record[idDbKey] && !isSupabase) {
      record[idDbKey] = defaults.id.replace(
        "{random}",
        Math.floor(Math.random() * 10000).toString()
      );
    } else if (record[idDbKey] === "" && isSupabase) {
      delete record[idDbKey];
    }
  }

  // Date Normalization: Inject defaults only if the target columns are whitelisted
  if (tableId === "students") {
    const enrollDbKey = getDbColumn("enrollmentDate");
    if (enrollDbKey && !record[enrollDbKey]) {
      record[enrollDbKey] = new Date().toISOString().split("T")[0];
    }
  } else if (tableId === "notices") {
    const publishDbKey = getDbColumn("date");
    if (publishDbKey && !record[publishDbKey]) {
      record[publishDbKey] = new Date().toISOString().split("T")[0];
    }
  }
  // --- 4. Update Mode Handling ---
  if (options.mode === "update" && options.primaryKey && options.existingRow) {
    Object.keys(normalizationMap).forEach((uiKey) => {
      const dbColumn = normalizationMap[uiKey];
      if (formValues[uiKey] !== undefined && formValues[uiKey] !== null) {
        record[dbColumn] = formValues[uiKey]; // overwrite with new value
      } else {
        // keep existing value from DB
        record[dbColumn] = options.existingRow[dbColumn];
      }
    });
    delete record[options.primaryKey]; // still delete PK
  }
  // ------------------ Assignment Default ------------------
// Only generate code if creating a new assignment
// Only generate code when creating
if (
  tableId === "assignments" &&
  options.mode !== "update" &&
  !record.assignmentCode
) {
  record.assignmentCode = `ASN-${Math.floor(Math.random() * 100000)}`;
}


// Remove null/empty fields so DB defaults are applied
Object.keys(record).forEach(key => {
  if (record[key] === null || record[key] === "") delete record[key];
});

  // Verification: The emitted record keys must strictly match DB expectations
  // Any UI keys not found in normalizationMap[formId] have been successfully pruned.
  return { tableId, uiSectionId, record };
};