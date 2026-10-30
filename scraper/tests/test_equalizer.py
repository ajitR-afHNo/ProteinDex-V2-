import pytest
from analytics.equalizer import EqualizerEngine


def test_equalizer_protein_standard():
    # 2000g ON Whey, 67 servings, 24g protein per 30.4g serving, price 5499, DIAAS 1.0
    res = EqualizerEngine.calculate_silo_equalizer(
        silo="protein",
        price_inr=5499.0,
        weight_grams=2000,
        servings_count=67,
        active_ingredient_per_serving_g=24.0,
        serving_size_g=30.4,
        diaas_score=1.0,
    )
    assert res["is_reliable"] is True
    # total bio protein = 67 * 24.0 * 1.0 = 1608.0g
    # price / 1608 = 3.4197 -> 3.42
    assert res["primary_metric_value"] == 3.42
    assert res["primary_metric_label"] == "INR/g bioavailable protein"
    # purity = 24.0 / 30.4 * 100 = 78.95% -> 78.95
    assert res["secondary_metric_value"] == 78.95


def test_equalizer_protein_missing_servings_unreliable():
    res = EqualizerEngine.calculate_silo_equalizer(
        silo="protein",
        price_inr=4999.0,
        weight_grams=2000,
        servings_count=None,
        active_ingredient_per_serving_g=None,
    )
    assert res["is_reliable"] is False
    assert res["primary_metric_value"] is None


def test_equalizer_creatine():
    # 250g Creatine Monohydrate, 83 servings of 3g, price 999
    res = EqualizerEngine.calculate_silo_equalizer(
        silo="creatine",
        price_inr=999.0,
        weight_grams=250,
        servings_count=83,
        active_ingredient_per_serving_g=3.0,
    )
    assert res["is_reliable"] is True
    # total creatine = 249g
    # cost per g = 999 / 249 = 4.012 -> 4.01
    # per 3g dose = 4.01 * 3 = 12.03
    assert res["primary_metric_label"] == "INR/3g dose"
    assert res["primary_metric_value"] == 12.03


def test_equalizer_mass_gainer():
    # 3000g Gainer, 15 servings, 750 kcal per serving, price 2499
    res = EqualizerEngine.calculate_silo_equalizer(
        silo="mass_gainers",
        price_inr=2499.0,
        weight_grams=3000,
        servings_count=15,
        calories_per_serving=750,
        active_ingredient_per_serving_g=25.0,
        carbs_per_serving_g=125.0,
    )
    assert res["is_reliable"] is True
    # total kcal = 15 * 750 = 11250 kcal
    # cost per 1k kcal = (2499 / 11250) * 1000 = 222.13
    assert res["primary_metric_value"] == 222.13
    # carb to protein ratio = 125 / 25 = 5.0
    assert res["secondary_metric_value"] == 5.0


def test_equalizer_zero_price_protection():
    res = EqualizerEngine.calculate_silo_equalizer(
        silo="protein",
        price_inr=0.0,
        weight_grams=1000,
        servings_count=30,
        active_ingredient_per_serving_g=24.0,
    )
    assert res["is_reliable"] is False
    assert res["primary_metric_value"] is None
