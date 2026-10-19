import json

tasks_data = {"test": "Line 1\nLine 2"}
dumped = json.dumps(tasks_data)
print("dumped repr:", repr(dumped))

# If we write this into a python string literal inside generate_app.py:
escaped_for_python_literal = dumped.replace('\\', '\\\\')
print("escaped_for_python_literal repr:", repr(escaped_for_python_literal))

# Now simulate python evaluating generate_app.py:
code = f"s = '''{escaped_for_python_literal}'''"
loc = {}
exec(code, {}, loc)
result = loc['s']
print("result in index.html:", repr(result))

# Now let's verify if node can parse this as JavaScript:
import subprocess
node_code = f"const data = {result}; console.log('Parsed successfully:', data.test);"
res = subprocess.run(["node", "-e", node_code], capture_output=True, text=True)
print("Node output:", res.stdout, res.stderr)
