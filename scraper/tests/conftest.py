import sys
from pathlib import Path

# Add scraper/src to sys.path so tests can import modules directly
src_dir = Path(__file__).resolve().parent.parent / "src"
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))
