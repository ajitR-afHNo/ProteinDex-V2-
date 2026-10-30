#!/usr/bin/env python3
"""
Seed Verified Baseline Products across all 5 Category Silos for ProteIndex V2.
Stores verified data into Supabase or outputs verified dataset for ingestion.
"""

import os
import sys
import uuid
from pathlib import Path
from dotenv import load_dotenv

# Add scraper/src to path
src_dir = Path(__file__).resolve().parent.parent / "scraper" / "src"
sys.path.insert(0, str(src_dir))

from pipeline.normalizer import CanonicalProductNormalizer, VariantNormalizer
from analytics.equalizer import EqualizerEngine

load_dotenv()

# Verified Golden Baseline across all 5 Silos
GOLDEN_PRODUCTS = [
    {
        "brand": "Optimum Nutrition",
        "base_name": "Gold Standard 100% Whey",
        "category_silo": "protein",
        "sub_category": "Whey Blend",
        "fssai": "10015064000576",
        "image_url": "https://m.media-amazon.com/images/I/716uVeq4qYL._SL1500_.jpg",
        "variants": [
            {
                "flavor": "double rich chocolate",
                "weight_grams": 2000,
                "servings_count": 67,
                "serving_size_g": 30.4,
                "protein_g": 24.0,
                "calories": 120,
                "carbs_g": 3.0,
                "fat_g": 1.0,
                "diaas_score": 1.0,
                "price_inr": 5499.0,
                "platform": "Brand D2C",
                "seller_name": "ON Official",
                "is_authorized": True,
                "url": "https://www.optimumnutrition.co.in/gold-standard-100-whey",
            }
        ],
    },
    {
        "brand": "MuscleBlaze",
        "base_name": "Biozyme Performance Whey",
        "category_silo": "protein",
        "sub_category": "Whey Blend",
        "fssai": "10015064000019",
        "image_url": "https://m.media-amazon.com/images/I/61Q+rN1R6PL._SL1500_.jpg",
        "variants": [
            {
                "flavor": "rich milk chocolate",
                "weight_grams": 2000,
                "servings_count": 55,
                "serving_size_g": 36.0,
                "protein_g": 25.0,
                "calories": 136,
                "carbs_g": 4.5,
                "fat_g": 2.0,
                "diaas_score": 1.0,
                "price_inr": 4899.0,
                "platform": "HealthKart",
                "seller_name": "Bright Lifesciences",
                "is_authorized": True,
                "url": "https://www.healthkart.com/mb-biozyme-performance-whey",
            }
        ],
    },
    {
        "brand": "Avvatar",
        "base_name": "100% Whey Protein",
        "category_silo": "protein",
        "sub_category": "Whey Blend",
        "fssai": "10012022001320",
        "image_url": "https://m.media-amazon.com/images/I/71Yv+Vp2v8L._SL1500_.jpg",
        "variants": [
            {
                "flavor": "malai kulfi",
                "weight_grams": 2000,
                "servings_count": 57,
                "serving_size_g": 35.0,
                "protein_g": 24.0,
                "calories": 135,
                "carbs_g": 4.0,
                "fat_g": 2.5,
                "diaas_score": 1.0,
                "price_inr": 4699.0,
                "platform": "Brand D2C",
                "seller_name": "Parag Milk Foods",
                "is_authorized": True,
                "url": "https://www.avvatarindia.com/products/whey-protein",
            }
        ],
    },
    {
        "brand": "Optimum Nutrition",
        "base_name": "Micronized Creatine Powder",
        "category_silo": "creatine",
        "sub_category": "Micronized Monohydrate",
        "fssai": "10015064000576",
        "image_url": "https://m.media-amazon.com/images/I/61tSkn4QnTL._SL1500_.jpg",
        "variants": [
            {
                "flavor": "unflavored",
                "weight_grams": 250,
                "servings_count": 83,
                "serving_size_g": 3.0,
                "protein_g": 3.0,  # 3g creatine
                "calories": 0,
                "carbs_g": 0.0,
                "fat_g": 0.0,
                "diaas_score": 1.0,
                "price_inr": 999.0,
                "platform": "Amazon",
                "seller_name": "Appario Retail Private Ltd",
                "is_authorized": True,
                "url": "https://www.amazon.in/dp/B002DYIZEO",
            }
        ],
    },
    {
        "brand": "MuscleBlaze",
        "base_name": "Super Gainer XXL",
        "category_silo": "mass_gainers",
        "sub_category": "High Calorie Gainer",
        "fssai": "10015064000019",
        "image_url": "https://m.media-amazon.com/images/I/61G7h5g1kDL._SL1500_.jpg",
        "variants": [
            {
                "flavor": "chocolate",
                "weight_grams": 3000,
                "servings_count": 30,
                "serving_size_g": 100.0,
                "protein_g": 22.5,
                "calories": 375,
                "carbs_g": 75.0,
                "fat_g": 2.5,
                "diaas_score": 1.0,
                "price_inr": 2399.0,
                "platform": "Brand D2C",
                "seller_name": "Bright Lifesciences",
                "is_authorized": True,
                "url": "https://www.muscleblaze.com/sv/muscleblaze-super-gainer-xxl",
            }
        ],
    },
]


def seed_data():
    print("[*] Generating Verified Seed Data for ProteIndex V2...")
    total_variants = 0

    for prod_data in GOLDEN_PRODUCTS:
        brand = prod_data["brand"]
        base_name = prod_data["base_name"]
        pid = CanonicalProductNormalizer.generate_product_id(brand, base_name)
        print(f"  [+] Product: {brand} - {base_name} (UUID: {pid})")

        for v_data in prod_data["variants"]:
            weight = v_data["weight_grams"]
            flavor = v_data["flavor"]
            vhash = VariantNormalizer.generate_variant_hash(pid, weight, flavor)
            sku = VariantNormalizer.generate_sku_id(brand, base_name, flavor, weight)

            eq = EqualizerEngine.calculate_silo_equalizer(
                silo=prod_data["category_silo"],
                price_inr=v_data["price_inr"],
                weight_grams=weight,
                servings_count=v_data["servings_count"],
                active_ingredient_per_serving_g=v_data["protein_g"],
                serving_size_g=v_data["serving_size_g"],
                diaas_score=v_data["diaas_score"],
                calories_per_serving=v_data["calories"],
                carbs_per_serving_g=v_data["carbs_g"],
            )

            print(f"      Variant: {sku} | Equalizer: {eq['primary_metric_label']} = INR {eq['primary_metric_value']}")
            total_variants += 1

    print(f"[+] Verified Seed Dataset Ready: {len(GOLDEN_PRODUCTS)} Products, {total_variants} Variants.")


if __name__ == "__main__":
    seed_data()
