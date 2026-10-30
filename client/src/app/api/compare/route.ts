import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabaseAdmin";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    const snapshotId = searchParams.get("snapshotId");

    let variantIds: string[] = [];

    let supabase;
    try {
      supabase = getAdminSupabase();
    } catch {
      return NextResponse.json({ success: true, count: 0, items: [] });
    }

    if (snapshotId) {
      if (!UUID_REGEX.test(snapshotId)) {
        return NextResponse.json({ error: "Invalid snapshotId format" }, { status: 400 });
      }

      const { data: snapshot, error } = await supabase
        .from("comparison_snapshots")
        .select("variant_ids")
        .eq("id", snapshotId)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !snapshot) {
        return NextResponse.json({ error: "Snapshot not found or expired" }, { status: 404 });
      }
      variantIds = snapshot.variant_ids;
    } else if (idsParam) {
      variantIds = idsParam
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    }

    // Deduplicate IDs
    const uniqueIds = Array.from(new Set(variantIds));

    // Enforce 2 to 4 distinct IDs constraint
    if (uniqueIds.length < 2 || uniqueIds.length > 4) {
      return NextResponse.json(
        { error: "Comparison requires between 2 and 4 distinct variant IDs" },
        { status: 400 }
      );
    }

    for (const id of uniqueIds) {
      if (!UUID_REGEX.test(id)) {
        return NextResponse.json({ error: `Invalid UUID: ${id}` }, { status: 400 });
      }
    }

    const { data: variants, error } = await supabase
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
        caffeine_per_serving_mg,
        diaas_score,
        nutrition_status,
        lowest_price_inr,
        best_value_metric,
        products (
          id,
          brand,
          base_name,
          category_silo,
          sub_category,
          image_url,
          fssai_license_number,
          amino_spike_risk
        ),
        offers (
          id,
          platform,
          price_inr,
          in_stock
        )
      `
      )
      .in("id", uniqueIds);

    if (error || !variants || variants.length < 2) {
      return NextResponse.json(
        { error: "Fewer than 2 active variants found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      count: variants.length,
      items: variants,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
