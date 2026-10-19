from pathlib import Path
import re

gen_content = Path("generate_app.py").read_text(encoding="utf-8")
# Find taskDatabase keys
keys = re.findall(r'\"([a-zA-Z0-9_]+)\":\s*\{\s*\"id\":', gen_content)
print("Keys found in taskDatabase:", keys)
print("Total keys:", len(keys))
