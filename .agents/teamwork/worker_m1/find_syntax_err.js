const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
scriptRegex.exec(html); // skip #1
const match = scriptRegex.exec(html);
const code = match[1];

try {
  new vm.Script(code, { filename: 'script2.js' });
} catch (err) {
  console.error("Error message:", err.message);
  console.error("Stack:", err.stack);
}
