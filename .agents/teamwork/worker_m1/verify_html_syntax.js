const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Extract script content
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let scriptIndex = 0;
let errors = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  scriptIndex++;
  const code = match[1];
  try {
    new Function(code);
    console.log(`Script tag #${scriptIndex} parsed successfully! (${code.length} chars)`);
  } catch (err) {
    console.error(`Syntax error in script tag #${scriptIndex}:`, err);
    errors++;
  }
}

if (errors === 0) {
  console.log("ALL SCRIPT BLOCKS ARE 100% VALID JAVASCRIPT SYNTAX!");
} else {
  process.exit(1);
}
