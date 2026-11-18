# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
"""Credential declarations require the runtime APIs that consume them."""
from pathlib import Path
import unittest
import yaml

ROOT = Path(__file__).resolve().parents[1]
FLOORS = {"kickside/component": (0, 3, 21), "kickside/contract": (0, 3, 8)}
TOKEN_CLIENTS = {"airtable", "box", "dropbox", "linear", "notion"}

class SecretDependencyTests(unittest.TestCase):
    def test_declared_credentials_require_compatible_runtime_dependencies(self):
        for manifest in sorted(ROOT.glob("*/src/_index.yaml")):
            module = manifest.parent.parent
            if not any("secret_fields:" in path.read_text() for path in (module / "src").rglob("*.yaml")):
                continue
            entries = yaml.safe_load(manifest.read_text())["entries"]
            dependencies = {entry["component"]: entry.get("version", "*")
                            for entry in entries if entry["kind"] == "ns.dependency"}
            required = dict(FLOORS)
            if module.name in TOKEN_CLIENTS:
                required["kickside/connection"] = (0, 5, 8)
            for dependency, floor in required.items():
                with self.subTest(module=module.name, dependency=dependency):
                    constraint = dependencies[dependency]
                    self.assertTrue(constraint.startswith(">="), constraint)
                    self.assertGreaterEqual(tuple(map(int, constraint[2:].split("."))), floor)

if __name__ == "__main__":
    unittest.main()
