from pathlib import Path
import unittest
import yaml

class DependencyDeclarations(unittest.TestCase):
    def test_dependencies_declare_ranges_for_fresh_hub_resolution(self):
        source = Path(__file__).resolve().parents[1] / 'src'
        for path in source.rglob('*.yaml'):
            doc = yaml.safe_load(path.read_text())
            if not isinstance(doc, dict):
                continue
            for entry in doc.get('entries', []) or []:
                if isinstance(entry, dict) and entry.get('kind') == 'ns.dependency':
                    with self.subTest(identity=doc['namespace'] + ':' + entry['name']):
                        version = str(entry.get('version'))
                        self.assertTrue(version == '*' or any(op in version for op in '<>=~^'),
                                        'exact dependency version ' + version)

if __name__ == '__main__':
    unittest.main()
