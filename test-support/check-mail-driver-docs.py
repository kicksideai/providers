#!/usr/bin/env python3
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import re
import sys
from pathlib import Path

import yaml


EXPORTED_FUNCTION = re.compile(r'^function M\.(\w+)\(', re.MULTILINE)
HELPER_CALL = re.compile(r'\b(\w+)\.(\w+)\(')


def exported_functions(source):
    definitions = list(EXPORTED_FUNCTION.finditer(source))
    functions = {}
    for index, definition in enumerate(definitions):
        end = definitions[index + 1].start() if index + 1 < len(definitions) else len(source)
        functions[definition[1]] = source[definition.start():end]
    return functions


def codes(source):
    classified = re.findall(r'\.failure\(errors\.\w+,\s*"([a-z_]+)"', source)
    details = re.findall(r'(?:details\s*=\s*\{|error_envelope\.wrap\([^\n]*\{)\s*code\s*=\s*"([a-z_]+)"', source)
    return set(classified + details)


def driver_codes(source, mail):
    libraries = {
        'delivery': exported_functions((mail / 'driver/http.lua').read_text()),
        'settings': exported_functions((mail / 'driver/config.lua').read_text()),
        'config': exported_functions((mail / 'domain/config.lua').read_text()),
    }
    intercepted = re.findall(r'if response\.status_code == (\d+) then return nil, delivery\.authorization_refused\(\1,', source)
    status = libraries['delivery']['status_error']
    for value in intercepted:
        status = re.sub(rf'^    if status == {value} then\n.*?^    end\n', '', status, flags=re.MULTILINE | re.DOTALL)
    libraries['delivery']['status_error'] = status

    expected = set()
    seen = set()
    pending = [(None, source)]
    while pending:
        owner, code = pending.pop()
        expected.update(codes(code))
        for alias, name in HELPER_CALL.findall(code):
            library = owner if alias == 'M' else alias
            if library not in libraries or name not in libraries[library] or (library, name) in seen:
                continue
            seen.add((library, name))
            pending.append((library, libraries[library][name]))
    return expected


def check_error_table(module, mail):
    source = (module / 'src/transport' / f'{module.name.removeprefix("mail-")}.lua').read_text()
    expected = driver_codes(source, mail)
    readme = (module / 'src/README.md').read_text()
    table = readme.split('## Error codes', 1)[1].split('```text\n', 1)[1].split('```', 1)[0]
    rows = re.findall(r'^([a-z][a-z_]+)\s', table, re.MULTILINE)
    missing = expected - set(rows)
    extra = set(rows) - expected
    if missing or extra or len(rows) != len(set(rows)):
        sys.exit(f'{module.name}: missing {sorted(missing)}, extra {sorted(extra)}, duplicate rows {len(rows) - len(set(rows))}')
    print(f'{module.name}: documents all {len(expected)} emitted error codes')


def matches_declaration(snippet, declaration):
    if isinstance(snippet, dict):
        return isinstance(declaration, dict) and all(
            key in declaration and matches_declaration(value, declaration[key]) for key, value in snippet.items()
        )
    return snippet == declaration


def guide_link(guide, target):
    published = 'https://github.com/kicksideai/components/blob/main/mail/'
    if target.startswith(published):
        return (guide.parent.parent / target.removeprefix(published)).resolve()
    if '://' in target:
        return None
    return (guide.parent / target).resolve()


def check_guide(guide):
    source = guide.read_text()
    manifest_link = re.search(r'\[wippy\.yaml\]\(([^)]+)\)', source)
    manifest = manifest_link and guide_link(guide, manifest_link[1])
    if not manifest:
        sys.exit(f'{guide}: missing example manifest link')
    example = manifest.parent
    links = {guide_link(guide, target) for target in re.findall(r'\]\(([^)\n]+)\)', source)}
    required = ['wippy.yaml', 'src/_index.yaml', 'src/security/_index.yaml', 'src/settings/_index.yaml',
                'src/settings/validate.lua', 'src/transport/_index.yaml', 'src/transport/relay.lua']
    for name in required:
        path = example / name
        if path not in links or not path.is_file():
            sys.exit(f'{guide}: missing example link or file {name}')

    entries = {
        entry['name']: entry
        for manifest in (example / 'src').rglob('_index.yaml')
        for entry in yaml.safe_load(manifest.read_text())['entries']
    }
    shown = set()
    for block in re.findall(r'```yaml\n(.*?)```', source, re.DOTALL):
        for snippet in yaml.safe_load(block):
            shown.add(snippet['name'])
            fields = {key: value for key, value in snippet.items() if key != 'meta'}
            # Explanatory metadata may use different wording in the guide.
            for key, value in snippet.get('meta', {}).items():
                if key not in {'comment', 'description'}:
                    fields.setdefault('meta', {})[key] = value
            if not matches_declaration(fields, entries.get(snippet['name'])):
                sys.exit(f'{guide}: example declaration {snippet["name"]} differs from the package')

    missing = {'transport_open', 'endpoints', 'api_base_url'} - shown
    if missing:
        sys.exit(f'{guide}: missing example declarations {sorted(missing)}')

    adapter = (example / 'src/transport/relay.lua').read_text()
    for alias, name in sorted(set(HELPER_CALL.findall(adapter))):
        if alias in {'config', 'delivery'} and not re.search(rf'\b{re.escape(name)}\(', source):
            sys.exit(f'{guide}: undocumented example helper {alias}.{name}')
    print(f'{guide.name}: links and declarations agree with the example package')


def main():
    module = Path(sys.argv[1]).resolve()
    providers = module.parent
    mail = providers.parent / 'components/mail/src'
    check_error_table(module, mail)
    check_guide(mail / 'driver-authoring.md')


if __name__ == '__main__':
    main()
