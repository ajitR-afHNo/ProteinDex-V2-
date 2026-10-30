"""
Data Normalization Pipeline for ProteIndex V2.
Handles canonical brand resolution, multipack parsing, weight normalization,
and deterministic UUID / hash generation.
"""

import json
import re
import hashlib
import uuid
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
from rapidfuzz import process, fuzz

# Canonical UUID namespace for ProteIndex deterministic product UUIDv5
PROTEINDEX_NAMESPACE = uuid.UUID("a74f4b12-9c16-4d69-8ecb-99f83a48e899")

# Canonical weight snapping lookup (grams)
STANDARD_WEIGHT_ANCHORS = [
    100, 250, 400, 454, 500, 907, 1000, 1500, 1800, 2000, 2270, 2500, 3000, 4000, 4540, 5000
]


def load_canonical_brands() -> Dict[str, Any]:
    """Loads canonical brand database from JSON."""
    brand_file = Path(__file__).resolve().parent.parent / "data" / "canonical_brands.json"
    if brand_file.exists():
        with open(brand_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


class CanonicalProductNormalizer:
    def __init__(self, brands_data: Optional[Dict[str, Any]] = None):
        self.brands_data = brands_data or load_canonical_brands()
        self.alias_to_canonical = {}
        for canonical, info in self.brands_data.items():
            self.alias_to_canonical[canonical.lower()] = canonical
            for alias in info.get("aliases", []):
                self.alias_to_canonical[alias.lower()] = canonical

    def resolve_brand(self, raw_brand: str, raw_title: str = "") -> Optional[str]:
        """Resolves brand string to canonical brand name using exact alias match then rapidfuzz."""
        if not raw_brand and not raw_title:
            return None

        clean_brand = (raw_brand or "").strip().lower()
        if clean_brand in self.alias_to_canonical:
            return self.alias_to_canonical[clean_brand]

        # Scan raw title for known brand aliases
        title_lower = (raw_title or "").lower()
        for alias, canonical in self.alias_to_canonical.items():
            # Check whole word match
            if re.search(r"\b" + re.escape(alias) + r"\b", title_lower):
                return canonical

        # Fuzzy match on clean_brand if present
        if clean_brand:
            choices = list(self.alias_to_canonical.keys())
            match = process.extractOne(clean_brand, choices, scorer=fuzz.token_sort_ratio)
            if match and match[1] >= 85:
                return self.alias_to_canonical[match[0]]

        return (raw_brand or "").strip().title() if raw_brand else None

    @staticmethod
    def generate_product_id(brand: str, base_name: str) -> uuid.UUID:
        """Generates deterministic UUIDv5 for a product from brand + base_name."""
        key = f"{brand.strip().lower()}:::{base_name.strip().lower()}"
        return uuid.uuid5(PROTEINDEX_NAMESPACE, key)


class VariantNormalizer:
    @staticmethod
    def parse_multipack(raw_title: str) -> Tuple[int, str]:
        """
        Detects multipack patterns (e.g. '2 x 1kg', 'Pack of 2', '2 Pack').
        Returns (multiplier, cleaned_title).
        """
        title = raw_title.strip()
        multiplier = 1

        # Pattern: '2 x 1kg' or '2x1kg'
        m = re.search(r"(\d+)\s*[xX]\s*(\d+(?:\.\d+)?\s*(?:kg|g|lbs?|lb))", title, re.IGNORECASE)
        if m:
            multiplier = int(m.group(1))
            # replace '2 x ' with '' to keep single unit weight
            title = re.sub(r"(\d+)\s*[xX]\s*", "", title, flags=re.IGNORECASE)
            return multiplier, title

        # Pattern: 'Pack of 2', 'Pack of 3'
        m2 = re.search(r"\bpack\s+of\s+(\d+)\b", title, re.IGNORECASE)
        if m2:
            multiplier = int(m2.group(1))
            title = re.sub(r"\bpack\s+of\s+\d+\b", "", title, flags=re.IGNORECASE)
            return multiplier, title

        # Pattern: '2 Pack'
        m3 = re.search(r"\b(\d+)\s*pack\b", title, re.IGNORECASE)
        if m3:
            multiplier = int(m3.group(1))
            title = re.sub(r"\b\d+\s*pack\b", "", title, flags=re.IGNORECASE)
            return multiplier, title

        return multiplier, title

    @staticmethod
    def extract_weight_grams(raw_title: str) -> Optional[int]:
        """
        Extracts weight from title and normalizes into integer grams with canonical snapping.
        """
        multiplier, cleaned_title = VariantNormalizer.parse_multipack(raw_title)

        # Match kg, g, lbs, lb
        pattern = r"(\d+(?:\.\d+)?)\s*(kg|kgs|g|gm|gms|grams|lbs|lb|pound|pounds)\b"
        matches = list(re.finditer(pattern, cleaned_title, re.IGNORECASE))
        if not matches:
            return None

        # Take last match (often product weight comes after serving specs)
        match = matches[-1]
        val = float(match.group(1))
        unit = match.group(2).lower()

        if unit in ["kg", "kgs"]:
            base_grams = val * 1000.0
        elif unit in ["lbs", "lb", "pound", "pounds"]:
            base_grams = val * 453.592
        else:
            base_grams = val

        single_unit_grams = int(round(base_grams))

        # Canonical snapping check (tolerance: +-2.5% for <=500g, +-1.8% for >500g)
        snapped_grams = single_unit_grams
        for anchor in STANDARD_WEIGHT_ANCHORS:
            tolerance = 0.025 if anchor <= 500 else 0.018
            if abs(single_unit_grams - anchor) <= (anchor * tolerance):
                snapped_grams = anchor
                break

        total_grams = snapped_grams * multiplier
        return total_grams if total_grams > 0 else None

    @staticmethod
    def clean_flavor(raw_flavor: str, raw_title: str = "") -> str:
        """Normalizes flavor strings into clean lowercase descriptors."""
        combined = f"{raw_flavor} {raw_title}".lower()

        known_flavors = [
            ("double rich chocolate", "double rich chocolate"),
            ("rich milk chocolate", "rich milk chocolate"),
            ("chocolate fudge", "chocolate fudge"),
            ("chocolate peanut butter", "chocolate peanut butter"),
            ("cookies and cream", "cookies & cream"),
            ("cookies & cream", "cookies & cream"),
            ("cafe mocha", "cafe mocha"),
            ("coffee", "coffee"),
            ("vanilla ice cream", "vanilla ice cream"),
            ("french vanilla", "french vanilla"),
            ("vanilla", "vanilla"),
            ("strawberry shake", "strawberry"),
            ("strawberry", "strawberry"),
            ("mango", "mango"),
            ("banana", "banana"),
            ("malai kulfi", "malai kulfi"),
            ("kashmiri kesar pista", "kesar pista"),
            ("kesar pista", "kesar pista"),
            ("unflavored", "unflavored"),
            ("raw unflavored", "unflavored"),
            ("unflavoured", "unflavored"),
        ]

        for trigger, canonical in known_flavors:
            if trigger in combined:
                return canonical

        clean = (raw_flavor or "").strip().lower()
        clean = re.sub(r"[^\w\s-]", "", clean)
        return clean if clean else "unflavored"

    @staticmethod
    def generate_sku_id(brand: str, base_name: str, flavor: str, weight_grams: int) -> str:
        """Generates human-readable, deterministic SKU ID."""
        def slugify(text: str) -> str:
            text = text.lower().strip()
            text = re.sub(r"[^\w\s-]", "", text)
            return re.sub(r"[-\s]+", "-", text)

        return f"{slugify(brand)}-{slugify(base_name)}-{slugify(flavor)}-{weight_grams}g"

    @staticmethod
    def generate_variant_hash(product_id: uuid.UUID | str, weight_grams: int, flavor: str) -> str:
        """
        Generates 64-character SHA256 hex digest for variant uniqueness:
        SHA256(product_id || weight_grams || canonical_flavor)
        """
        payload = f"{str(product_id).strip().lower()}:::{weight_grams}:::{flavor.strip().lower()}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()
