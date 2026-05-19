#!/usr/bin/env python3
"""Bundle WriteSpace dist into a single self-contained HTML file."""
import os, sys

assets_dir = os.path.join(os.path.dirname(__file__), '..', 'dist', 'assets')
assets_dir = os.path.normpath(assets_dir)

js_files  = [f for f in os.listdir(assets_dir) if f.startswith('index-') and f.endswith('.js')]
css_files = [f for f in os.listdir(assets_dir) if f.startswith('index-') and f.endswith('.css')]

if not js_files or not css_files:
    print('ERROR: dist/assets not found. Run `npm run build` first.')
    sys.exit(1)

with open(os.path.join(assets_dir, js_files[0]),  encoding='utf-8') as f: js  = f.read()
with open(os.path.join(assets_dir, css_files[0]), encoding='utf-8') as f: css = f.read()

# Fix Vite ES module meta references for inline script context
js = js.replace('import.meta.url', '"browser"') \
       .replace('import.meta.env', '{}') \
       .replace('import.meta', '{}')

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WriteSpace</title>
  <style>{css}</style>
</head>
<body>
  <div id="root"></div>
  <script>{js}</script>
</body>
</html>"""

out_path = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'dist', 'writespace.html'))
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html)

size_kb = os.path.getsize(out_path) // 1024
print(f'✓ Written: {out_path} ({size_kb} KB)')
