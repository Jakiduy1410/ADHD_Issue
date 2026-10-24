import re
from pathlib import Path

files = [
    'tests/adversarial/test_adhd_ui_ergonomics_adversarial.js',
    'tests/adversarial/test_challenger_curriculum_ui.js',
    'tests/adversarial/test_challenger_storage_cheer_stress.js',
    'tests/adversarial/test_m3_ai_decomposition_interactive_stages.js',
    'tests/adversarial/test_m4_ergonomics_contrast_themes.js',
    'tests/adversarial/test_parent_survey_cognitive_profile.js',
    'tests/adversarial/test_whitebox_sync_simulator_adversarial.js',
]

replacement = """const html = fs.existsSync('app/index.html') ? fs.readFileSync('app/index.html', 'utf8') : '';
const appScript = fs.existsSync('app/js/app.js') ? fs.readFileSync('app/js/app.js', 'utf8') : '';"""

for fp in files:
    content = Path(fp).read_text(encoding='utf-8')
    # Find start: const htmlPath = 'index.html' or const html = fs.readFileSync('index.html'
    # Find end: const appScript = appScriptMatch[1];
    pattern = re.compile(
        r"(//[^\n]*\n)?(const\s+htmlPath\s*=\s*'index\.html';\s*assert\([^\n]+;\s*\n)?const\s+html\s*=\s*fs\.readFileSync\([^)]+\);\s*\n(?:[^\n]*\n)*?const\s+appScript\s*=\s*appScriptMatch\[1\];",
        re.MULTILINE
    )
    new_content, n = pattern.subn(replacement, content)
    if n > 0:
        Path(fp).write_text(new_content, encoding='utf-8')
        print("Updated:", fp)
    else:
        print("NO MATCH:", fp)
