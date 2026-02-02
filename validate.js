// validateAllSectionsAndCombined.js
const fs = require('fs');
const path = require('path');

const DASHBOARD_JSON = path.join(__dirname, 'public/json/adminDashboard.json');
const OUTPUT_FOLDER = path.join(__dirname, 'dashboard_csvs');

// Create folder if not exist
if (!fs.existsSync(OUTPUT_FOLDER)) {
  fs.mkdirSync(OUTPUT_FOLDER);
}

// Load JSON
const dashboard = JSON.parse(fs.readFileSync(DASHBOARD_JSON, 'utf-8'));

// Helper to convert rows to CSV string
const toCSV = (rows, headers) => {
  let csv = [];
  csv.push(headers.join(","));
  rows.forEach(r => {
    csv.push(headers.map(h => r[h] !== undefined ? r[h] : "-").join(","));
  });
  return csv.join("\n");
};

// Collect combined CSV data
let combinedRows = [];
let combinedHeadersSet = new Set();

// Process each page and section
Object.values(dashboard.pages).forEach(page => {
  page.sections.forEach(section => {
    let rows = [];
    let headers = [];

    switch(section.type) {
      case "table":
        headers = section.columns.map(c => c.header);
        headers.push("Section"); // section name column

        section.data.forEach(row => {
          let rowData = {};
          section.columns.forEach(col => {
            rowData[col.header] = row[col.key] !== undefined ? row[col.key] : "-";
          });
          rowData.Section = section.title;
          rows.push(rowData);
        });

        // Write individual CSV
        fs.writeFileSync(
          path.join(OUTPUT_FOLDER, `${section.id}.csv`),
          toCSV(rows, headers)
        );

        // Add to combined CSV
        headers.forEach(h => combinedHeadersSet.add(h));
        combinedRows.push(...rows);
        break;

      case "stats":
        headers = ["Label", "Value", "Trend", "Section"];
        section.data.forEach(s => {
          rows.push({
            Label: s.label || "-",
            Value: s.value || "-",
            Trend: s.trend || "-",
            Section: section.title
          });
        });

        // Individual CSV
        fs.writeFileSync(
          path.join(OUTPUT_FOLDER, `${section.id}.csv`),
          toCSV(rows, headers)
        );

        headers.forEach(h => combinedHeadersSet.add(h));
        combinedRows.push(...rows);
        break;

      case "form":
        headers = ["Section"];
        rows.push({ Section: section.title });
        fs.writeFileSync(
          path.join(OUTPUT_FOLDER, `${section.id}.csv`),
          toCSV(rows, headers)
        );

        headers.forEach(h => combinedHeadersSet.add(h));
        combinedRows.push(...rows);
        break;

      default:
        break;
    }
  });
});

// Write combined CSV
const combinedHeaders = Array.from(combinedHeadersSet);
fs.writeFileSync(
  path.join(OUTPUT_FOLDER, `full_dashboard_export.csv`),
  toCSV(combinedRows, combinedHeaders)
);

console.log(`✅ All CSVs created in folder: ${OUTPUT_FOLDER}`);
