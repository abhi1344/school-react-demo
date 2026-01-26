const fs = require("fs");
const path = require("path");

// Recursive function to list files/folders
function listFiles(dir, prefix = "") {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      console.log(prefix + "📁 " + item);
      listFiles(fullPath, prefix + "   "); // recursive
    } else {
      console.log(prefix + "📄 " + item);
    }
  });
}

// Start from current folder or path provided in command line
const startPath = process.argv[2] || ".";
console.log("Listing files in:", startPath);
listFiles(startPath);
