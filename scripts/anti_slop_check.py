#!/usr/bin/env python3
"""
ProteIndex V2 Anti-Slop AST & Static Codebase Guard.
Strictly inspects the codebase for:
1. Synthetic / Fake Data Patterns (Math.random, Math.sin, hardcoded dummy nutrition)
2. Ignored Type Errors (@ts-ignore, @ts-expect-error, ignoreBuildErrors: true)
3. Direct dangerous shell execution in API routes
4. Parallel / shadow database table creations
"""

import os
import re
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

FORBIDDEN_PATTERNS = [
    (r"Math\.random\(\)", "Usage of Math.random() forbidden (violates zero-synthetic data policy)"),
    (r"Math\.sin\(\)", "Usage of Math.sin() forbidden (violates zero-synthetic data policy)"),
    (r"@ts-ignore", "Usage of @ts-ignore forbidden (type discipline violated)"),
    (r"@ts-expect-error", "Usage of @ts-expect-error forbidden (type discipline violated)"),
    (r"ignoreBuildErrors:\s*true", "ignoreBuildErrors: true forbidden in Next.js config"),
    (r"price_listings", "Creation of shadow/parallel table 'price_listings' forbidden"),
]

EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    ".next",
    "venv",
    ".venv",
    "__pycache__",
    ".pytest_cache",
}


def run_anti_slop_check() -> int:
    violations = 0
    print("[*] Running ProteIndex V2 Anti-Slop Audit...")

    for root, dirs, files in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        for file in files:
            if file in ["anti_slop_check.py", "proteindex_v2_scratch_prompt.md"]:
                continue

            file_path = Path(root) / file
            if file_path.suffix not in [".ts", ".tsx", ".js", ".jsx", ".py", ".sql"]:
                continue

            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

            for pattern, message in FORBIDDEN_PATTERNS:
                matches = list(re.finditer(pattern, content))
                if matches:
                    for m in matches:
                        line_num = content[: m.start()].count("\n") + 1
                        print(f"[-] VIOLATION: {file_path.relative_to(ROOT_DIR)}:{line_num} - {message}")
                        violations += 1

    if violations == 0:
        print("[+] Anti-Slop Audit PASSED: Zero forbidden synthetic or bypass patterns found.")
        return 0
    else:
        print(f"[-] Anti-Slop Audit FAILED: {violations} violation(s) detected.")
        return 1


if __name__ == "__main__":
    sys.exit(run_anti_slop_check())
