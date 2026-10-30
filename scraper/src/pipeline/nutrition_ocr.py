"""
Thermodynamic and Nutritional Mass Balance Validator for ProteIndex V2.
Validates nutrition facts against physical laws:
1. Conservation of mass (macronutrients cannot exceed serving size + moisture margin)
2. Biological purity ceiling (whey protein cannot exceed 96% pure isolate)
3. Atwater energy balance (kcal must align within 15% of 4P + 4C + 9F)
4. Container weight sanity (servings * scoop size approx container weight)
"""

from typing import Dict, Any, Tuple, Optional


class AtwaterThermodynamicValidator:
    @staticmethod
    def validate_nutrition(
        serving_size_g: Optional[float],
        protein_g: Optional[float],
        carbs_g: Optional[float] = None,
        fat_g: Optional[float] = None,
        calories_kcal: Optional[float] = None,
        servings_per_container: Optional[int] = None,
        total_weight_g: Optional[int] = None,
    ) -> Tuple[bool, Optional[str], Dict[str, Any]]:
        """
        Validates nutritional factsheets.
        Returns: (is_valid, failure_reason, debug_metrics)
        """
        metrics = {
            "purity_pct": None,
            "mass_sum_g": None,
            "calculated_kcal": None,
            "kcal_delta_pct": None,
            "container_delta_pct": None,
        }

        # If serving size is missing or zero, cannot perform physical validation
        if not serving_size_g or serving_size_g <= 0:
            return True, None, metrics

        # 1. Negative nutrient checks
        if (protein_g is not None and protein_g < 0) or \
           (carbs_g is not None and carbs_g < 0) or \
           (fat_g is not None and fat_g < 0) or \
           (calories_kcal is not None and calories_kcal < 0):
            return False, "PHYSICS_VIOLATION: Negative macronutrient value detected", metrics

        # 2. Biological Purity Ceiling Check (Whey isolate ceiling is 96.0%)
        if protein_g is not None:
            purity = (protein_g / serving_size_g) * 100.0
            metrics["purity_pct"] = round(purity, 2)
            if purity > 96.0:
                return False, f"PHYSICS_VIOLATION: Protein purity {purity:.1f}% exceeds biological ceiling (96%)", metrics

        # 3. Conservation of Mass (P + C + F <= serving_size * 1.05 for bound moisture)
        p = protein_g or 0.0
        c = carbs_g or 0.0
        f = fat_g or 0.0
        mass_sum = p + c + f
        metrics["mass_sum_g"] = round(mass_sum, 2)

        # Allow 5% tolerance for moisture and analytical tolerance
        if mass_sum > (serving_size_g * 1.05):
            return False, f"PHYSICS_VIOLATION: Sum of macros ({mass_sum:.1f}g) exceeds serving size ({serving_size_g}g)", metrics

        # 4. Atwater Energy Balance Check
        # Calories = 4*P + 4*C + 9*F
        if calories_kcal is not None and calories_kcal > 0 and (p > 0 or c > 0 or f > 0):
            calculated_kcal = (4.0 * p) + (4.0 * c) + (9.0 * f)
            metrics["calculated_kcal"] = round(calculated_kcal, 1)
            
            delta = abs(calories_kcal - calculated_kcal)
            pct_delta = (delta / calories_kcal) * 100.0
            metrics["kcal_delta_pct"] = round(pct_delta, 1)

            # Flag if declared calories diverge more than 18% from Atwater formula
            if pct_delta > 18.0:
                return False, f"PHYSICS_VIOLATION: Declared calories ({calories_kcal}) diverge by {pct_delta:.1f}% from Atwater formula ({calculated_kcal:.1f})", metrics

        # 5. Container Weight Sanity
        if servings_per_container and servings_per_container > 0 and total_weight_g and total_weight_g > 0:
            expected_weight = serving_size_g * servings_per_container
            container_delta = abs(expected_weight - total_weight_g)
            container_delta_pct = (container_delta / total_weight_g) * 100.0
            metrics["container_delta_pct"] = round(container_delta_pct, 1)

            # Tolerance +-15%
            if container_delta_pct > 15.0:
                return False, f"PHYSICS_VIOLATION: Serving math ({servings_per_container} x {serving_size_g}g = {expected_weight}g) diverges {container_delta_pct:.1f}% from pack weight ({total_weight_g}g)", metrics

        return True, None, metrics
