#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import re
import sys
from pathlib import Path


module = Path(sys.argv[1]).resolve()
source = (module / 'src' / 'transport' / f'{module.name.removeprefix("mail-")}.lua').read_text()
mail = module.resolve().parent.parent / 'components' / 'mail' / 'src' / 'driver'
http = (mail / 'http.lua').read_text()
config = (mail / 'config.lua').read_text()


def failure_codes(lua):
    return set(re.findall(r'\.failure\(errors\.\w+,\s*"([a-z_]+)"', lua))


def detail_codes(lua):
    return set(re.findall(r'(?:details\s*=\s*\{|error_envelope\.wrap\([^\n]*\{)\s*code\s*=\s*"([a-z_]+)"', lua))


shared_http = http[:http.index('function M.encode_message')]
expected = failure_codes(source) | detail_codes(source)
expected |= failure_codes(shared_http) | detail_codes(shared_http)
if 'delivery.authorization_refused(401,' in source:
    expected.discard('credentials_invalid')
expected |= detail_codes(config)
expected.add('invalid_config')
for helper in ('encode_message', 'encode_attachment'):
    if f'delivery.{helper}(' in source:
        start = http.index(f'function M.{helper}(')
        end = http.index('\nend', start)
        expected |= detail_codes(http[start:end])

readme = (module / 'src' / 'README.md').read_text()
table = readme.split('## Error codes', 1)[1].split('```text\n', 1)[1].split('```', 1)[0]
rows = re.findall(r'^([a-z][a-z_]+)\s', table, re.MULTILINE)
missing = expected - set(rows)
extra = set(rows) - expected
if missing or extra or len(rows) != len(set(rows)):
    sys.exit(f'{module.name}: missing {sorted(missing)}, extra {sorted(extra)}, duplicate rows {len(rows) - len(set(rows))}')
print(f'{module.name}: documents all {len(expected)} emitted error codes')
