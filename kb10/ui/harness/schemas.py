"""Extract the live engine config schemas from src/_index.yaml for the harness."""
import json
import os
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
with open(os.path.join(ROOT, 'src', '_index.yaml'), encoding='utf-8') as fh:
    doc = yaml.safe_load(fh)

out = {}
for entry in doc.get('entries', []):
    name = entry.get('name')
    if name in ('engine_document', 'engine_wiki'):
        out[entry['meta']['kb_type']] = entry['meta']['config_schema']

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schemas.json'), 'w', encoding='utf-8') as fh:
    json.dump(out, fh, indent=2, ensure_ascii=False)
print(json.dumps({k: list(v['properties']) for k, v in out.items()}, indent=2))
