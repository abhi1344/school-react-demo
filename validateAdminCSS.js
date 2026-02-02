const fs = require("fs");
const path = require("path");

const JSX_FILE = path.join(__dirname, "src", "pages", "AdminDashboard.js");
const CSS_FILE = path.join(__dirname, "src", "design-admin.css");

if (!fs.existsSync(JSX_FILE) || !fs.existsSync(CSS_FILE)) {
  console.error("❌ Required files not found");
  process.exit(1);
}

const jsx = fs.readFileSync(JSX_FILE, "utf8");
const css = fs.readFileSync(CSS_FILE, "utf8");

/* -----------------------------
   Extract JSX class names
----------------------------- */
const classRegex = /className\s*=\s*["'`]([^"'`]+)["'`]/g;
const jsxClasses = new Set();

let match;
while ((match = classRegex.exec(jsx))) {
  match[1].split(/\s+/).forEach(c => jsxClasses.add(c));
}

/* -----------------------------
   Extract CSS classes
----------------------------- */
const cssClassRegex = /\.([a-zA-Z0-9_-]+)(?=[\s,{])/g;

const cssClasses = new Set();

while ((match = cssClassRegex.exec(css))) {
  cssClasses.add(match[1]);
}

/* -----------------------------
   Output CSV
----------------------------- */
console.log("CSS_CHECK,Class,Type,JSX Used,CSS Exists?");
[...jsxClasses].sort().forEach(cls => {
  const exists = cssClasses.has(cls) ? "✅" : "❌";
  console.log(`CSS_CHECK,${cls},class,${cls},${exists}`);
});

/* -----------------------------
   Summary
----------------------------- */
const missing = [...jsxClasses].filter(c => !cssClasses.has(c));

console.log("\n--- SUMMARY ---");
console.log("Total JSX classes:", jsxClasses.size);
console.log("Missing CSS classes:", missing.length);

if (missing.length) {
  console.log("❌ Missing:");
  missing.forEach(c => console.log(" -", c));
  process.exitCode = 1;
} else {
  console.log("✅ All JSX classes are defined in CSS");
}
