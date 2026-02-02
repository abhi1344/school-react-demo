const fs = require("fs");
const path = require("path");

const TARGET_FILE = path.join(
  __dirname,
  "src",
  "pages",
  "AdminDashboard.js"
);

if (!fs.existsSync(TARGET_FILE)) {
  console.error("❌ AdminDashboard.js not found at:", TARGET_FILE);
  process.exit(1);
}

let source = fs.readFileSync(TARGET_FILE, "utf8");
let updated = source;

/* -----------------------------
   FIX STATS WRAPPER
   ----------------------------- */
updated = updated.replace(
  /<div className="stats-card">/g,
  '<div className="card stats-card">'
);

/* -----------------------------
   FIX TABLE WRAPPER ORDER
   ----------------------------- */
updated = updated.replace(
  /<div className="card table-card">/g,
  '<div className="table-card card">'
);

/* -----------------------------
   WRITE BACK
   ----------------------------- */
if (updated !== source) {
  fs.writeFileSync(TARGET_FILE, updated, "utf8");
  console.log("✅ AdminDashboard.js auto-fixed successfully");
} else {
  console.log("ℹ️ No changes needed — already compliant");
}
