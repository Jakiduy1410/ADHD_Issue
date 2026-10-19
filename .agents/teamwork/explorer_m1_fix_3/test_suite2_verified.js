const fs = require('fs');
const vm = require('vm');

let testCode = fs.readFileSync('tests/adversarial/test_milo_sync_adversarial.js', 'utf8');

const target = 'const appScript = appScriptMatch[1];';
const replacement = `let appScript = appScriptMatch[1];
const regex = /(if\\s*\\(\\s*saved\\.totalSessionSeconds\\s*!==\\s*undefined\\s*\\)\\s*\\{[\\s\\S]*?\\})/;
appScript = appScript.replace(regex, '$1\\n        if (saved.selectedCatalogIds && Array.isArray(saved.selectedCatalogIds)) {\\n          appState.selectedCatalogIds = new Set(saved.selectedCatalogIds.filter(id => typeof id === "string" && id.trim().length > 0));\\n        }');
`;

if (!testCode.includes(target)) {
  console.error("Target not found!");
  process.exit(1);
}

testCode = testCode.replace(target, replacement);

const script = new vm.Script(testCode, { filename: 'test_milo_sync_adversarial_patched.js' });
const context = vm.createContext({
  require,
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  process,
  URLSearchParams,
  Date
});
script.runInContext(context);
