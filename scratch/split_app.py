with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

css_start = None
css_end = None
for i, line in enumerate(lines):
    if '<style>' in line and css_start is None:
        css_start = i
    if '</style>' in line and css_start is not None and css_end is None:
        css_end = i

# Find the main <script> tag (not tailwind config)
js_start = None
js_end = None
for i, line in enumerate(lines):
    if '<script>' in line and i > 500:
        js_start = i
    if '</script>' in line and js_start is not None:
        js_end = i

print(f"CSS: lines {css_start} to {css_end}")
print(f"JS: lines {js_start} to {js_end}")

css_content = "".join(lines[css_start+1:css_end])
with open('app/css/style.css', 'w', encoding='utf-8') as f:
    f.write(css_content.strip())
print(f"app/css/style.css written: {len(css_content)} chars")

js_content = "".join(lines[js_start+1:js_end])
with open('app/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js_content.strip())
print(f"app/js/app.js written: {len(js_content)} chars")

html_lines = []
for i, line in enumerate(lines):
    if i == css_start:
        html_lines.append('  <link rel="stylesheet" href="css/style.css">\n')
    elif css_start <= i <= css_end:
        continue
    elif i == js_start:
        html_lines.append('  <script src="js/app.js"></script>\n')
    elif js_start <= i <= js_end:
        continue
    else:
        html_lines.append(line)

with open('app/index.html', 'w', encoding='utf-8') as f:
    f.writelines(html_lines)
print(f"app/index.html written: {len(html_lines)} lines")
