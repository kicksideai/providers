# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

class MemoryPackageTest(unittest.TestCase):
    def test_one_published_memory_package(self):
        self.assertFalse((ROOT / "memory-kb").exists())
        config = json.loads((ROOT / "release-please-config.json").read_text())
        self.assertIn("memory", config["packages"])
        self.assertNotIn("memory-kb", config["packages"])
        for file in ["Makefile", ".github/workflows/ci.yml"]:
            self.assertNotIn("memory-kb", (ROOT / file).read_text())

    def test_published_trait_owns_the_typed_engine(self):
        index = (ROOT / "memory/src/_index.yaml").read_text()
        for name in ["knowledge_based_memory", "runtime", "runtime_lifecycle", "runtime_checkpoint",
                     "memory_recall_tool", "lifecycle_binding", "checkpoint_binding",
                     "knowledge_memory_component", "ui_fs", "ui_static"]:
            self.assertIn("- name: " + name + "\n", index)
        self.assertIn("memory_id:", index)
        self.assertIn("after_persist", index)
        self.assertIn("path: /kickside-memory\n", index)
        for file in (ROOT / "memory/src").rglob("*"):
            if file.is_file():
                self.assertNotIn("kickside.memory_kb", file.read_text(), str(file))

if __name__ == "__main__":
    unittest.main()
