# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
import hashlib
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]


class MemoryPackageTest(unittest.TestCase):
    def test_published_schema_migration_is_immutable(self):
        migrations = ROOT / "memory/src/migrations"
        self.assertEqual(
            hashlib.sha256((migrations / "01_memory_schema.lua").read_bytes()).hexdigest(),
            "7ae6d810cd10bc72121770b25192795adbbcc6cafeb342915326eb2a9be3a702",
        )
        self.assertEqual(
            hashlib.sha256((migrations / "_fn_01_memory_schema.lua").read_bytes()).hexdigest(),
            "1370344229d72d447c9884ca2f1be95d915e00af9ff32ad8b4837eba3002ed54",
        )
        self.assertEqual(
            hashlib.sha256((migrations / "_index.yaml").read_bytes()[:845]).hexdigest(),
            "5307cfe19c9d3c2f823b1da7de125e050fe35899c7806d2ecdac1cf3b1b1928d",
        )

    def test_one_published_memory_package(self):
        self.assertFalse((ROOT / "memory-kb").exists())
        config = json.loads((ROOT / "release-please-config.json").read_text())
        self.assertIn("memory", config["packages"])
        self.assertNotIn("memory-kb", config["packages"])
        for file in ["Makefile", ".github/workflows/ci.yml"]:
            self.assertNotIn("memory-kb", (ROOT / file).read_text())


if __name__ == "__main__":
    unittest.main()
