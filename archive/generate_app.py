# -*- coding: utf-8 -*-
"""
Build compiler script: Compiles app/ source files into standalone index.html and out_index.html.
Single source of truth: app/ directory (index.html, css/style.css, js/app.js).
"""
import json
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent

def sync_tasks_to_js():
    tasks_path = REPO_ROOT / "data" / "curriculum" / "tasks_db.json"
    js_path = REPO_ROOT / "app" / "js" / "app.js"
    if not tasks_path.exists() or not js_path.exists():
        return

    with open(tasks_path, "r", encoding="utf-8") as f:
        tasks_data = json.load(f)

    with open(js_path, "r", encoding="utf-8") as f:
        js = f.read()

    start_marker = "const taskDatabase = {"
    end_marker = "};\n    taskDatabase['math_garden']"
    start_pos = js.find(start_marker)
    end_pos = js.find(end_marker)

    if start_pos != -1 and end_pos != -1:
        new_task_db_str = "const taskDatabase = " + json.dumps(tasks_data, ensure_ascii=False, indent=2)
        js = js[:start_pos] + new_task_db_str + js[end_pos + 1:]
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(js)
        print(f"Synced {len(tasks_data)} tasks from {tasks_path.name} into app/js/app.js.")

def build_full_html() -> str:
    sync_tasks_to_js()

    app_html_path = REPO_ROOT / "app" / "index.html"
    css_path = REPO_ROOT / "app" / "css" / "style.css"
    js_path = REPO_ROOT / "app" / "js" / "app.js"

    with open(app_html_path, "r", encoding="utf-8") as f:
        html = f.read()

    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    with open(js_path, "r", encoding="utf-8") as f:
        js = f.read()

    # Inline CSS
    css_link = '<link rel="stylesheet" href="css/style.css">'
    inline_css = f"<style>\n{css}\n</style>"
    html = html.replace(css_link, inline_css)

    # Inline JS
    js_tag = '<script src="js/app.js"></script>'
    inline_js = f"<script>\n{js}\n</script>"
    html = html.replace(js_tag, inline_js)

    return html

if __name__ == '__main__':
    html_content = build_full_html()
    out_idx = REPO_ROOT / "out_index.html"
    idx = REPO_ROOT / "index.html"

    with open(out_idx, "w", encoding="utf-8") as f:
        f.write(html_content)

    with open(idx, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Successfully compiled app/ into {idx.name} and {out_idx.name}! (Length: {len(html_content)} chars)")
