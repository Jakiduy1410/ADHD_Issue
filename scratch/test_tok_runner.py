import subprocess

test_js = """
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
"""
with open('scratch/test_tokenize.js', 'w', encoding='utf-8') as f:
    f.write(test_js)

res = subprocess.run(['node', 'scratch/test_tokenize.js'], capture_output=True, text=True, encoding='utf-8')
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
