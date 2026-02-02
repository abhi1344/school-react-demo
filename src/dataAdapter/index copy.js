/**
 * DATA ADAPTER — LEVEL 2
 * ----------------------------------
 * Purpose:
 * - Centralize form → table normalization
 * - Prevent renderer mutation
 * - Prepare for Supabase integration (Level 4)
 *
 * NOTE:
 * - Logic currently lives inside AdminDashboard.handleFormSubmit
 * - This file is a placeholder until Level 3
 */

/**
 * Pure Adapter Module
 * Responsibility: Map Form Inputs -> Table Records based on adapter.rules.json
 */

 export const processFormData = (formId, formValues, rules) => {
    const { adapter_logic } = rules;
    
    // 1. Resolve Target Table
    const tableId = adapter_logic.target_table_resolution[formId];
    if (!tableId) return { tableId: null, record: null };
  
    // 2. Initialize Record with Default Values
    const record = { ...formValues };
    
    // 3. Normalize Field Names (Mapping UI keys to Schema keys)
    const normalizationMap = adapter_logic.field_name_normalization;
    Object.keys(formValues).forEach((key) => {
      if (normalizationMap[key]) {
        record[normalizationMap[key]] = formValues[key];
        // Note: We keep original values to avoid data loss, 
        // but ensure schema keys are populated.
      }
    });
  
    // 4. Inject System Defaults
    const defaults = adapter_logic.default_value_injection;
    if (!record.id) {
      record.id = defaults.id.replace('{random}', Math.floor(Math.random() * 1000).toString());
    }
    if (!record.status) {
      record.status = defaults.status;
    }
    if (!record.date) {
      record.date = new Date().toISOString().split('T')[0];
    }
  
    return { tableId, record };
  };
  