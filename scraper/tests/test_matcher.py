import pytest
from pipeline.normalizer import CanonicalProductNormalizer, VariantNormalizer
from pipeline.catalog_taxonomy import StatefulTitleParser
from pipeline.seller_matrix import SellerMatrix


def test_multipack_parsing():
    mult, clean = VariantNormalizer.parse_multipack("Optimum Nutrition Gold Standard Whey 2 x 1kg")
    assert mult == 2
    assert "2 x" not in clean

    mult2, clean2 = VariantNormalizer.parse_multipack("MuscleBlaze Raw Whey Pack of 2 1000g")
    assert mult2 == 2
    assert "pack of 2" not in clean2.lower()


def test_weight_normalization_and_snapping():
    # 2.2 lbs -> 997.9g snaps to 1000g
    g1 = VariantNormalizer.extract_weight_grams("Dymatize ISO 100 2.2 lbs Gourmet Chocolate")
    assert g1 == 1000

    # 4.4 lbs -> 1995.8g snaps to 2000g (anchor)
    g2 = VariantNormalizer.extract_weight_grams("Optimum Nutrition Whey 4.4 lb")
    assert g2 == 2000

    # 5 lbs -> 2267.96g snaps to 2270g anchor
    g3 = VariantNormalizer.extract_weight_grams("GNC Pro Performance Whey 5 lbs")
    assert g3 == 2270


def test_brand_resolution():
    normalizer = CanonicalProductNormalizer()
    assert normalizer.resolve_brand("ON") == "Optimum Nutrition"
    assert normalizer.resolve_brand("MB") == "MuscleBlaze"
    assert normalizer.resolve_brand("", "Avvatar 100% Whey Protein Malai Kulfi") == "Avvatar"
    assert normalizer.resolve_brand("The Whole Truth") == "The Whole Truth"


def test_combo_detection():
    is_combo, reason = StatefulTitleParser.is_combo_or_bundle("MuscleBlaze Biozyme Whey 2kg + Free Shaker Bottle")
    assert is_combo is True
    assert reason == "COMBO_BUNDLE"

    is_combo2, reason2 = StatefulTitleParser.is_combo_or_bundle("Gym Shaker Bottle 700ml")
    assert is_combo2 is True
    assert reason2 == "ACCESSORY_OR_GEAR"

    is_combo3, reason3 = StatefulTitleParser.is_combo_or_bundle("Optimum Nutrition Gold Standard 100% Whey 2kg Double Rich Chocolate")
    assert is_combo3 is False
    assert reason3 is None


def test_seller_verification():
    assert SellerMatrix.verify_seller("Appario Retail Private Ltd", "Optimum Nutrition", "Amazon") is True
    assert SellerMatrix.verify_seller("RetailNetz", "MuscleBlaze", "Flipkart") is True
    assert SellerMatrix.verify_seller("RandomShadyStore123", "Optimum Nutrition", "Amazon") is False
    assert SellerMatrix.verify_seller("ON Official", "Optimum Nutrition", "D2C") is True
