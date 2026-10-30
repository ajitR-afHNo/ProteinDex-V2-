import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabaseAdmin";
import { ProductItem, ProductsApiResponse } from "@/types/products";
import { generateOutboundToken } from "@/lib/urlSigning";
import { computeClientEqualizer } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const silo = searchParams.get("silo");
    const brand = searchParams.get("brand");
    const flavor = searchParams.get("flavor");
    const minPrice = searchParams.get("min_price") ? parseFloat(searchParams.get("min_price")!) : null;
    const maxPrice = searchParams.get("max_price") ? parseFloat(searchParams.get("max_price")!) : null;
    const sort = searchParams.get("sort") || "featured";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const offset = (page - 1) * limit;

    let supabase;
    try {
      supabase = getAdminSupabase();
    } catch {
      // If DB env vars are unconfigured in local dev, return empty set rather than crash
      return NextResponse.json<ProductsApiResponse>({
        success: true,
        page,
        page_size: limit,
        total_count: 0,
        data: [],
      });
    }

    // Build query with database-level joins, filtering, and sorting
    let query = supabase
      .from("variants")
      .select(
        `
        id,
        sku_id,
        flavor,
        weight_grams,
        servings_count,
        label_serving_size_g,
        label_protein_per_serving_g,
        calories_per_serving,
        carbs_per_serving_g,
        fat_per_serving_g,
        diaas_score,
        nutrition_status,
        lowest_price_inr,
        best_value_metric,
        is_canary,
        products!inner (
          id,
          brand,
          base_name,
          category_silo,
          sub_category,
          image_url,
          fssai_license_number,
          amino_spike_risk,
          is_fairy_dusted,
          fairy_dusting_flags
        ),
        offers (
          id,
          platform,
          seller_name,
          is_authorized_seller,
          listing_url,
          price_inr,
          in_stock,
          scraped_at
        )
      `,
        { count: "exact" }
      )
      .eq("is_canary", false);

    // Apply database-level filters
    if (silo) {
      query = query.eq("products.category_silo", silo);
    }
    if (brand) {
      query = query.ilike("products.brand", `%${brand}%`);
    }
    if (flavor) {
      query = query.ilike("flavor", `%${flavor}%`);
    }
    if (minPrice != null && !isNaN(minPrice)) {
      query = query.gte("lowest_price_inr", minPrice);
    }
    if (maxPrice != null && !isNaN(maxPrice)) {
      query = query.lte("lowest_price_inr", maxPrice);
    }

    // Apply database-level sorting
    if (sort === "value_asc") {
      query = query.order("best_value_metric", { ascending: true, nullsFirst: false });
    } else if (sort === "price_asc") {
      query = query.order("lowest_price_inr", { ascending: true, nullsFirst: false });
    } else if (sort === "price_desc") {
      query = query.order("lowest_price_inr", { ascending: false, nullsFirst: false });
    } else {
      // featured default
      query = query.order("created_at", { ascending: false });
    }

    // Database-level range limit & offset
    query = query.range(offset, offset + limit - 1);

    const { data: rows, count, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Transform raw SQL rows to the strict ProductItem contract
    const data: ProductItem[] = (rows || []).map((row: any) => {
      const prod = row.products;
      const rawOffers = (row.offers || []).filter((o: any) => o.in_stock);
      const lowestPrice = row.lowest_price_inr || (rawOffers.length > 0 ? Math.min(...rawOffers.map((o: any) => o.price_inr)) : 0);

      const vendorOffers = rawOffers.map((o: any) => {
        let signedUrl = o.listing_url;
        try {
          const token = generateOutboundToken(o.id);
          signedUrl = `/api/out?token=${encodeURIComponent(token)}`;
        } catch {
          // If signing secret missing, fall back to direct listing url
        }

        return {
          platform: o.platform,
          url: signedUrl,
          priceInr: o.price_inr,
          inStock: o.in_stock,
          sellerName: o.seller_name,
          isAuthorizedSeller: o.is_authorized_seller,
        };
      });

      const eq = computeClientEqualizer({
        silo: prod.category_silo,
        priceInr: lowestPrice,
        weightGrams: row.weight_grams,
        servingsCount: row.servings_count,
        proteinPerServingG: row.label_protein_per_serving_g,
        servingSizeG: row.label_serving_size_g,
        diaasScore: row.diaas_score,
        caloriesPerServing: row.calories_per_serving,
        carbsPerServingG: row.carbs_per_serving_g,
      });

      return {
        productId: prod.id,
        variantId: row.id,
        skuId: row.sku_id,
        brand: prod.brand,
        productName: prod.base_name,
        categorySilo: prod.category_silo,
        subCategory: prod.sub_category,
        flavor: row.flavor,
        imageUrl: prod.image_url,
        packaging: {
          weightGrams: row.weight_grams,
          servingsCount: row.servings_count,
          servingSizeGrams: row.label_serving_size_g,
        },
        nutritionalProfile: {
          activeIngredientPerServingGrams: row.label_protein_per_serving_g,
          bioavailableProteinPerServing: row.label_protein_per_serving_g,
          proteinPurityPct:
            row.label_serving_size_g && row.label_protein_per_serving_g
              ? Math.round((row.label_protein_per_serving_g / row.label_serving_size_g) * 1000) / 10
              : null,
          caloriesPerServing: row.calories_per_serving,
          carbsPerServingGrams: row.carbs_per_serving_g,
          nutritionStatus: row.nutrition_status,
          diaasScore: row.diaas_score,
        },
        usefulDoseAnalysis: {
          leucinePerServingGrams: null,
          meetsMpsThreshold: (row.label_protein_per_serving_g || 0) >= 20.0,
          aminoSpikeRisk: prod.amino_spike_risk || false,
          fillersDetected: prod.fairy_dusting_flags || [],
        },
        equalizerMetrics: {
          primaryMetricLabel: eq.primaryMetricLabel,
          primaryMetricValue: eq.primaryMetricValue,
          secondaryMetricLabel: eq.secondaryMetricLabel,
          secondaryMetricValue: eq.secondaryMetricValue,
          isReliable: eq.isReliable,
        },
        pricing: {
          lowestPriceInr: lowestPrice,
          sellerCount: vendorOffers.length,
          lastObservedAt: rawOffers[0]?.scraped_at || new Date().toISOString(),
          inStock: rawOffers.length > 0,
          vendorOffers,
        },
        verification: {
          tier: prod.fssai_license_number ? "gold" : "silver",
          fssai: {
            licenseNumber: prod.fssai_license_number,
            status: prod.fssai_license_number ? "ACTIVE" : "UNVERIFIED",
            verifiedManufacturer: prod.brand,
          },
          records: [],
        },
      };
    });

    return NextResponse.json<ProductsApiResponse>({
      success: true,
      page,
      page_size: limit,
      total_count: count || data.length,
      data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
