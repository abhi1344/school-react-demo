const fs = require("fs");
const path = require("path");
const { createObjectCsvWriter } = require("csv-writer");

const JSON_PATH = path.join(__dirname, "public/json/adminDashboard.json");
const JSX_PATH = path.join(__dirname, "src/pages/AdminDashboard.js");
const CSS_PATH = path.join(__dirname, "src/design-admin.css");
const OUT = path.join(__dirname, "adminValidation.csv");

const json = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const jsx = fs.readFileSync(JSX_PATH, "utf8");
const css = fs.readFileSync(CSS_PATH, "utf8");

const TYPE_TO_CLASS = {
  stats: "stats-card",
  table: "table-card",
  form: "form-card",
};

const rows = [];

Object.entries(json.pages).forEach(([pageId, page]) => {
  page.sections.forEach((section) => {
    const expectedClass = TYPE_TO_CLASS[section.type] || "";
    const jsxUses = expectedClass && jsx.includes(`"${expectedClass}"`);
    const cssExists = expectedClass && css.includes(`.${expectedClass}`);

    rows.push({
      page: pageId,
      sectionId: section.id,
      type: section.type,
      expectedClass,
      jsxUses: jsxUses ? "YES" : "NO",
      cssExists: cssExists ? "YES" : "NO",
    });
  });
});

const writer = createObjectCsvWriter({
  path: OUT,
  header: [
    { id: "page", title: "Page" },
    { id: "sectionId", title: "Section ID" },
    { id: "type", title: "Type" },
    { id: "expectedClass", title: "Expected CSS Class" },
    { id: "jsxUses", title: "JSX Uses Class" },
    { id: "cssExists", title: "CSS Exists" },
  ],
});

writer.writeRecords(rows).then(() => {
  console.log("✅ Contract validation CSV created:", OUT);
});
