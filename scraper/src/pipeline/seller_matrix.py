"""
Seller Verification and Marketplace Routing Matrix for ProteIndex V2.
Classifies retailers and sellers into Authorized vs Unverified/Grey Market.
"""

from typing import Dict, Any, Optional

# Verified Authorized Sellers in the Indian Sports Nutrition Ecosystem
AUTHORIZED_SELLERS_MAP = {
    "amazon": {
        "appario retail private ltd",
        "cocoblu retail",
        "clicktech retail private ltd",
        "glanbia performance nutrition",
        "bright lifesciences pvt ltd",
        "muscleblaze",
        "optimum nutrition",
    },
    "flipkart": {
        "retailnetz",
        "supercomnet",
        "indiflash mart",
        "bright lifesciences",
        "glanbia",
    },
    "nutrabay": {
        "nutrabay retail",
        "nutrabay official",
        "nutrabay",
    },
    "healthkart": {
        "healthkart official",
        "bright lifesciences",
        "healthkart",
    },
    "hyugalife": {
        "hyugalife official",
        "hyugalife",
    }
}

DIRECT_PLATFORMS = {"d2c", "brand d2c", "official", "shopify"}


class SellerMatrix:
    @staticmethod
    def verify_seller(seller_name: str, brand: str, platform: str) -> bool:
        """
        Determines if an offer comes from an authorized or verified supply chain.
        Rules:
        - D2C / Brand Direct is always Authorized.
        - Marketplace sellers must match the verified whitelist or brand official account.
        - Blank / Unknown marketplace sellers default to FALSE (unauthorized).
        """
        p_lower = (platform or "").strip().lower()
        s_lower = (seller_name or "").strip().lower()
        b_lower = (brand or "").strip().lower()

        # Direct-to-Consumer brand sites are inherently authorized
        if p_lower in DIRECT_PLATFORMS:
            return True

        # Check if seller is explicitly the brand itself
        if b_lower and b_lower in s_lower:
            return True

        # Check platform whitelist
        for platform_key, authorized_set in AUTHORIZED_SELLERS_MAP.items():
            if platform_key in p_lower:
                if any(auth_seller in s_lower for auth_seller in authorized_set):
                    return True
                # If marketplace is known but seller is not in whitelist
                return False

        # If platform is a major third-party store with direct fulfillment
        if p_lower in ["nutrabay", "healthkart", "hyugalife"]:
            return True

        return False
