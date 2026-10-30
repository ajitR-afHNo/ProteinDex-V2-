"""
Catalog Taxonomy and Stateful Title Parser for ProteIndex V2.
Extracts category silos, delivery forms, flags bundles/combos,
and validates economic price floors.
"""

import re
from typing import Dict, Any, Optional, Tuple

# Physical commodity price floor thresholds (INR per gram/unit)
# Prices below this threshold represent scams, fake goods, or scraper parse errors.
MIN_PHYSICAL_PRICE_FLOOR = {
    "protein": 0.70,        # Min ~₹700 per 1kg of bulk whey commodity
    "creatine": 1.00,       # Min ~₹100 per 100g of monohydrate
    "mass_gainers": 0.35,   # Min ~₹350 per 1kg
    "pre_workout": 200.0,   # Absolute min tub price
    "snacks": 25.0,         # Absolute min bar price
}

COMBO_PATTERNS = [
    r"\bfree\s+(?:shaker|bottle|sipper|t-?shirt|creatine|strap|bag|sample)\b",
    r"\bcombo\b",
    r"\bbundle\b",
    r"\bbogo\b",
    r"\bbuy\s+1\s+get\s+1\b",
    r"\b\+\s*(?:shaker|creatine|fish\s*oil|multivitamin)\b",
    r"\bwith\s+free\b",
]

ACCESSORY_PATTERNS = [
    r"\bshaker\s+bottle\b",
    r"\bgym\s+(?:bag|gloves|belt|straps)\b",
    r"\bsipper\b",
]


class StatefulTitleParser:
    @staticmethod
    def is_combo_or_bundle(title: str) -> Tuple[bool, Optional[str]]:
        """Checks if title is a promotional bundle or combo item."""
        for pat in COMBO_PATTERNS:
            if re.search(pat, title, re.IGNORECASE):
                return True, "COMBO_BUNDLE"
        for pat in ACCESSORY_PATTERNS:
            if re.search(pat, title, re.IGNORECASE):
                return True, "ACCESSORY_OR_GEAR"
        return False, None

    @staticmethod
    def detect_category_silo(title: str, category_hint: str = "") -> str:
        """Determines category silo based on keywords and hints."""
        combined = f"{title} {category_hint}".lower()

        if any(k in combined for k in ["creatine", "creapure", "creatine monohydrate"]):
            return "creatine"
        if any(k in combined for k in ["mass gainer", "weight gainer", "super gainer", "muscle gainer"]):
            return "mass_gainers"
        if any(k in combined for k in ["pre-workout", "pre workout", "pump", "c4 original", "preworkout"]):
            return "pre_workout"
        if any(k in combined for k in ["protein bar", "protein cookie", "peanut butter", "protein snack", "snack bar"]):
            return "snacks"
        
        # Default sports nutrition anchor
        return "protein"

    @staticmethod
    def detect_sub_category(title: str, silo: str) -> str:
        """Determines granular subcategory/formulation."""
        t = title.lower()
        if silo == "protein":
            if "isolate" in t and "hydrolyzed" in t:
                return "Hydrolyzed Whey Isolate"
            if "isolate" in t or "isocore" in t or "isopure" in t:
                return "Whey Isolate"
            if "concentrate" in t or "raw whey" in t:
                return "Whey Concentrate"
            if "casein" in t:
                return "Casein"
            if any(k in t for k in ["plant", "pea", "brown rice", "vegan"]):
                return "Plant Protein"
            return "Whey Blend"

        if silo == "creatine":
            if "creapure" in t:
                return "Creapure Monohydrate"
            if "hcl" in t:
                return "Creatine HCL"
            return "Micronized Monohydrate"

        if silo == "mass_gainers":
            if "lean" in t:
                return "Lean Mass Gainer"
            return "High Calorie Gainer"

        if silo == "pre_workout":
            if "stim-free" in t or "non-stim" in t or "caffeine-free" in t:
                return "Stimulant-Free Pump"
            return "High-Stim Pre-Workout"

        return "Standard"

    @staticmethod
    def extract_base_name(title: str, brand: str) -> str:
        """
        Hierarchically strips marketing buzzwords, brand names, weights, and flavors
        to return the clean canonical product line base name.
        """
        clean = title.strip()

        # Remove brand name if at start
        if brand and clean.lower().startswith(brand.lower()):
            clean = clean[len(brand):].strip()

        # Strip common trailing fluff
        fluff_patterns = [
            r"\b\d+(\.\d+)?\s*(?:kg|g|gm|lbs|lb|pound)\b.*$",
            r"\bpack\s+of\s+\d+\b.*$",
            r"\b(?:double rich chocolate|chocolate|vanilla|cafe mocha|strawberry|unflavored|mango)\b.*$",
            r"\|.*$",
            r"-.*$",
            r"\(.*?\)",
            r"\[.*?\]",
        ]
        for pat in fluff_patterns:
            clean = re.sub(pat, "", clean, flags=re.IGNORECASE).strip()

        # Remove punctuation leftovers
        clean = re.sub(r"^[,\s:-]+|[,\s:-]+$", "", clean).strip()

        # If stripping yielded empty string or too short, fallback to a sensible substring
        if len(clean) < 3:
            clean = title[:40].strip()

        return clean

    @staticmethod
    def is_economically_valid_price(silo: str, price_inr: float, weight_grams: Optional[int]) -> bool:
        """Rejects listings priced below physical commodity floors."""
        if price_inr <= 0:
            return False

        silo = silo.lower()
        if silo == "protein" and weight_grams and weight_grams > 0:
            # Min price per gram check
            return (price_inr / weight_grams) >= MIN_PHYSICAL_PRICE_FLOOR["protein"]

        if silo == "creatine" and weight_grams and weight_grams > 0:
            return (price_inr / weight_grams) >= (MIN_PHYSICAL_PRICE_FLOOR["creatine"] / 100.0)

        if silo == "mass_gainers" and weight_grams and weight_grams > 0:
            return (price_inr / weight_grams) >= (MIN_PHYSICAL_PRICE_FLOOR["mass_gainers"] / 1000.0)

        if silo in MIN_PHYSICAL_PRICE_FLOOR:
            floor = MIN_PHYSICAL_PRICE_FLOOR[silo]
            if isinstance(floor, float) and floor > 10.0:
                return price_inr >= floor

        return price_inr >= 100.0
