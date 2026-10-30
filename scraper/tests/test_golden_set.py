import pytest
from pipeline.nutrition_ocr import AtwaterThermodynamicValidator
from pipeline.normalizer import CanonicalProductNormalizer, VariantNormalizer


def test_thermodynamic_conservation_of_mass():
    # 24g protein + 3g carbs + 1g fat = 28g mass in a 30g scoop -> Valid
    is_valid, reason, metrics = AtwaterThermodynamicValidator.validate_nutrition(
        serving_size_g=30.0,
        protein_g=24.0,
        carbs_g=3.0,
        fat_g=1.0,
        calories_kcal=117.0,
    )
    assert is_valid is True
    assert reason is None

    # Impossible: 35g protein in a 30g scoop
    is_valid2, reason2, _ = AtwaterThermodynamicValidator.validate_nutrition(
        serving_size_g=30.0,
        protein_g=35.0,
    )
    assert is_valid2 is False
    assert "exceeds biological ceiling" in reason2


def test_atwater_calorie_divergence():
    # Declared 300 kcal for 24g protein (96 kcal) + 3g carbs (12 kcal) + 1g fat (9 kcal) = 117 kcal
    # Diverges by > 18% -> Flagged
    is_valid, reason, _ = AtwaterThermodynamicValidator.validate_nutrition(
        serving_size_g=30.0,
        protein_g=24.0,
        carbs_g=3.0,
        fat_g=1.0,
        calories_kcal=300.0,
    )
    assert is_valid is False
    assert "diverge by" in reason


def test_deterministic_hashes():
    # Given the same inputs, variant hash must be strictly identical
    pid = CanonicalProductNormalizer.generate_product_id("Optimum Nutrition", "Gold Standard 100% Whey")
    h1 = VariantNormalizer.generate_variant_hash(pid, 2000, "double rich chocolate")
    h2 = VariantNormalizer.generate_variant_hash(pid, 2000, "double rich chocolate")
    h3 = VariantNormalizer.generate_variant_hash(pid, 1000, "double rich chocolate")

    assert h1 == h2
    assert h1 != h3
    assert len(h1) == 64
