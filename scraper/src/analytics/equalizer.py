"""
Equalizer Analytics Engine for ProteIndex V2.
Computes objective, standardized metrics across all 5 category silos:
- Protein: ₹/g bioavailable protein (adjusted for DIAAS) and Purity %
- Creatine: ₹/g pure creatine
- Mass Gainers: ₹/1,000 kcal and Carb:Protein ratio
- Pre-Workout: ₹/standard dose
- Snacks: ₹/100g net weight
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Optional, Dict, Any


def round_cur(val: float | Decimal) -> float:
    """Rounds float/Decimal strictly to 2 decimal places using half-up."""
    return float(Decimal(str(val)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


class EqualizerEngine:
    @staticmethod
    def calculate_silo_equalizer(
        silo: str,
        price_inr: Optional[float],
        weight_grams: Optional[int],
        servings_count: Optional[int],
        active_ingredient_per_serving_g: Optional[float] = None,
        serving_size_g: Optional[float] = None,
        diaas_score: Optional[float] = 1.0,
        calories_per_serving: Optional[float] = None,
        carbs_per_serving_g: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Calculates standardized equalizer metrics for a product variant.
        Guarantees:
        - Never divides by zero
        - Returns None/null if essential data is missing (anti-slop)
        - Rounds to 2 decimal places
        """
        if price_inr is None or price_inr <= 0:
            return {
                "primary_metric_label": "Price N/A",
                "primary_metric_value": None,
                "secondary_metric_label": None,
                "secondary_metric_value": None,
                "is_reliable": False,
            }

        silo = (silo or "").strip().lower()

        # ----------------------------------------------------------------------
        # SILO 1: PROTEIN
        # ----------------------------------------------------------------------
        if silo == "protein":
            # Primary: ₹/g bioavailable protein = price / (servings * protein_per_serving * DIAAS)
            diaas = diaas_score if (diaas_score and 0 < diaas_score <= 1.5) else 1.0
            
            purity = None
            if serving_size_g and serving_size_g > 0 and active_ingredient_per_serving_g is not None:
                purity = round_cur((active_ingredient_per_serving_g / serving_size_g) * 100.0)

            if (
                servings_count 
                and servings_count > 0 
                and active_ingredient_per_serving_g 
                and active_ingredient_per_serving_g > 0
            ):
                total_bio_protein = servings_count * active_ingredient_per_serving_g * diaas
                cost_per_g = round_cur(price_inr / total_bio_protein)
                return {
                    "primary_metric_label": "INR/g bioavailable protein",
                    "primary_metric_value": cost_per_g,
                    "secondary_metric_label": "Purity %",
                    "secondary_metric_value": purity,
                    "is_reliable": True,
                }
            
            return {
                "primary_metric_label": "INR/g bioavailable protein",
                "primary_metric_value": None,
                "secondary_metric_label": "Purity %",
                "secondary_metric_value": purity,
                "is_reliable": False,
            }

        # ----------------------------------------------------------------------
        # SILO 2: CREATINE
        # ----------------------------------------------------------------------
        elif silo == "creatine":
            # Primary: ₹/g pure creatine = price / (servings * creatine_per_serving)
            # Or if servings/dose missing, price / weight_grams
            if (
                servings_count 
                and servings_count > 0 
                and active_ingredient_per_serving_g 
                and active_ingredient_per_serving_g > 0
            ):
                total_creatine = servings_count * active_ingredient_per_serving_g
                cost_per_g = round_cur(price_inr / total_creatine)
                return {
                    "primary_metric_label": "INR/3g dose",
                    "primary_metric_value": round_cur(cost_per_g * 3.0),
                    "secondary_metric_label": "INR/g pure creatine",
                    "secondary_metric_value": cost_per_g,
                    "is_reliable": True,
                }
            elif weight_grams and weight_grams > 0:
                cost_per_g = round_cur(price_inr / weight_grams)
                return {
                    "primary_metric_label": "INR/3g dose",
                    "primary_metric_value": round_cur(cost_per_g * 3.0),
                    "secondary_metric_label": "INR/g pure creatine",
                    "secondary_metric_value": cost_per_g,
                    "is_reliable": True,
                }

            return {
                "primary_metric_label": "INR/3g dose",
                "primary_metric_value": None,
                "secondary_metric_label": "INR/g pure creatine",
                "secondary_metric_value": None,
                "is_reliable": False,
            }

        # ----------------------------------------------------------------------
        # SILO 3: MASS GAINERS
        # ----------------------------------------------------------------------
        elif silo == "mass_gainers":
            # Primary: INR/1,000 kcal = (price / total_calories) * 1000
            carb_protein_ratio = None
            if (
                carbs_per_serving_g is not None 
                and active_ingredient_per_serving_g 
                and active_ingredient_per_serving_g > 0
            ):
                carb_protein_ratio = round_cur(carbs_per_serving_g / active_ingredient_per_serving_g)

            if (
                servings_count 
                and servings_count > 0 
                and calories_per_serving 
                and calories_per_serving > 0
            ):
                total_calories = servings_count * calories_per_serving
                cost_per_1k_kcal = round_cur((price_inr / total_calories) * 1000.0)
                return {
                    "primary_metric_label": "INR/1,000 kcal",
                    "primary_metric_value": cost_per_1k_kcal,
                    "secondary_metric_label": "Carb:Protein Ratio",
                    "secondary_metric_value": carb_protein_ratio,
                    "is_reliable": True,
                }

            return {
                "primary_metric_label": "INR/1,000 kcal",
                "primary_metric_value": None,
                "secondary_metric_label": "Carb:Protein Ratio",
                "secondary_metric_value": carb_protein_ratio,
                "is_reliable": False,
            }

        # ----------------------------------------------------------------------
        # SILO 4: PRE-WORKOUT
        # ----------------------------------------------------------------------
        elif silo == "pre_workout":
            # Primary: INR/serving
            if servings_count and servings_count > 0:
                cost_per_serving = round_cur(price_inr / servings_count)
                return {
                    "primary_metric_label": "INR/serving",
                    "primary_metric_value": cost_per_serving,
                    "secondary_metric_label": None,
                    "secondary_metric_value": None,
                    "is_reliable": True,
                }

            return {
                "primary_metric_label": "INR/serving",
                "primary_metric_value": None,
                "secondary_metric_label": None,
                "secondary_metric_value": None,
                "is_reliable": False,
            }

        # ----------------------------------------------------------------------
        # SILO 5: SNACKS
        # ----------------------------------------------------------------------
        elif silo == "snacks":
            # Primary: INR/100g
            if weight_grams and weight_grams > 0:
                cost_per_100g = round_cur((price_inr / weight_grams) * 100.0)
                return {
                    "primary_metric_label": "INR/100g",
                    "primary_metric_value": cost_per_100g,
                    "secondary_metric_label": None,
                    "secondary_metric_value": None,
                    "is_reliable": True,
                }

            return {
                "primary_metric_label": "INR/100g",
                "primary_metric_value": None,
                "secondary_metric_label": None,
                "secondary_metric_value": None,
                "is_reliable": False,
            }

        # Default fallback for unknown silo
        return {
            "primary_metric_label": "Equalizer N/A",
            "primary_metric_value": None,
            "secondary_metric_label": None,
            "secondary_metric_value": None,
            "is_reliable": False,
        }
