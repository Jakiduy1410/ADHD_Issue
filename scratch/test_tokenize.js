
const fs = require('fs');
const jsCode = fs.readFileSync('app/js/app.js', 'utf-8');

// Run in VM with mocks
const vm = require('vm');
const sandbox = {
  window: {},
  document: {
    getElementById: () => ({ innerHTML: '', innerText: '', classList: { add: ()=>{}, remove: ()=>{} }, style: {} })
  },
  console: console
};
vm.createContext(sandbox);

try {
  vm.runInContext(jsCode + '; result = tokenizeSentenceForHighlight;', sandbox);
  console.log('tokenizeSentenceForHighlight exists:', typeof sandbox.result);
} catch (e) {
  console.error('Error running script:', e);
}
