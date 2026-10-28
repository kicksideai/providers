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


if __name__ == "__main__":
    unittest.main()
