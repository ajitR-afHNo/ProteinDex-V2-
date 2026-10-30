export type CategorySilo =
  | "protein"
  | "creatine"
  | "mass_gainers"
  | "pre_workout"
  | "snacks";

export type NutritionStatus =
  | "verified"
  | "observed"
  | "pending_verification"
  | "not_applicable";

export interface VendorOffer {
  platform: string;
  url: string;
  priceInr: number;
  inStock: boolean;
  sellerName: string;
  isAuthorizedSeller: boolean;
}

export interface ProductItem {
  productId: string;
  variantId: string;
  skuId: string;
  brand: string;
  productName: string;
  categorySilo: CategorySilo;
  subCategory: string;
  flavor: string;
  imageUrl: string | null;
  packaging: {
    weightGrams: number;
    servingsCount: number | null;
    servingSizeGrams: number | null;
  };
  nutritionalProfile: {
    activeIngredientPerServingGrams: number | null;
    bioavailableProteinPerServing: number | null;
    proteinPurityPct: number | null;
    caloriesPerServing: number | null;
    carbsPerServingGrams: number | null;
    nutritionStatus: NutritionStatus;
    diaasScore: number | null;
  };
  usefulDoseAnalysis: {
    leucinePerServingGrams: number | null;
    meetsMpsThreshold: boolean;
    aminoSpikeRisk: boolean;
    fillersDetected: string[];
  };
  equalizerMetrics: {
    primaryMetricLabel: string;
    primaryMetricValue: number | null;
    secondaryMetricLabel: string | null;
    secondaryMetricValue: number | null;
    isReliable: boolean;
  };
  pricing: {
    lowestPriceInr: number;
    sellerCount: number;
    lastObservedAt: string;
    inStock: boolean;
    vendorOffers: VendorOffer[];
  };
  verification: {
    tier: "gold" | "silver" | "bronze" | "unverified";
    fssai: {
      licenseNumber: string | null;
      status: string;
      verifiedManufacturer: string | null;
    };
    records: Array<{
      batchNumber?: string;
      testedProteinPct?: number;
      reportUrl?: string;
    }>;
  };
}

export interface ProductsApiResponse {
  success: boolean;
  page: number;
  page_size: number;
  total_count: number;
  data: ProductItem[];
  error?: string;
}

export interface PricePoint {
  recordedAt: string;
  priceInr: number;
  platform: string;
  inStock: boolean;
}
