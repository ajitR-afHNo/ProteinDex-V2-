-- ==============================================================================
-- ProteIndex V2: 0001_initial_schema.sql
-- Production Core Schema: 4 Core Domain Tables + 2 Operational Support Tables
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. PRODUCTS (Core Table 1)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    base_name TEXT NOT NULL,
    category_silo TEXT NOT NULL CHECK (category_silo IN ('protein', 'creatine', 'mass_gainers', 'pre_workout', 'snacks')),
    sub_category TEXT NOT NULL DEFAULT 'Whey Blend',
    image_url TEXT,
    is_fairy_dusted BOOLEAN NOT NULL DEFAULT FALSE,
    fairy_dusting_flags TEXT[] DEFAULT '{}',
    amino_spike_risk BOOLEAN NOT NULL DEFAULT FALSE,
    lab_verified BOOLEAN NOT NULL DEFAULT FALSE,
    lab_report_url TEXT,
    fssai_license_number VARCHAR(14),
    trust_score INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_brand_base UNIQUE (brand, base_name)
);

CREATE INDEX IF NOT EXISTS idx_products_silo ON products(category_silo);
CREATE INDEX IF NOT EXISTS idx_products_brand_trgm ON products USING gin (brand gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_base_name_trgm ON products USING gin (base_name gin_trgm_ops);

-- 3. VARIANTS (Core Table 2)
CREATE TABLE IF NOT EXISTS variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku_id TEXT NOT NULL UNIQUE,
    variant_hash CHAR(64) NOT NULL UNIQUE,
    flavor TEXT NOT NULL DEFAULT 'unflavored',
    weight_grams INTEGER NOT NULL CHECK (weight_grams > 0),
    servings_count INTEGER CHECK (servings_count > 0),
    label_serving_size_g NUMERIC(6,2) CHECK (label_serving_size_g > 0),
    label_protein_per_serving_g NUMERIC(6,2) CHECK (
        label_protein_per_serving_g >= 0 AND 
        (label_serving_size_g IS NULL OR label_protein_per_serving_g <= label_serving_size_g)
    ),
    calories_per_serving NUMERIC(6,2),
    carbs_per_serving_g NUMERIC(6,2),
    fat_per_serving_g NUMERIC(6,2),
    caffeine_per_serving_mg NUMERIC(6,2),
    diaas_score NUMERIC(4,2) CHECK (diaas_score > 0 AND diaas_score <= 1.50),
    calculated_purity_pct NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN label_serving_size_g > 0 AND label_protein_per_serving_g IS NOT NULL 
            THEN ROUND(((label_protein_per_serving_g / label_serving_size_g) * 100.0)::numeric, 1) 
            ELSE NULL 
        END
    ) STORED,
    nutrition_status TEXT NOT NULL DEFAULT 'pending_verification' 
        CHECK (nutrition_status IN ('verified', 'observed', 'pending_verification', 'not_applicable')),
    lowest_price_inr NUMERIC(10,2) CHECK (lowest_price_inr >= 0),
    best_value_metric NUMERIC(10,2),
    is_canary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_variant_sku UNIQUE (product_id, flavor, weight_grams)
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_lowest_price ON variants(lowest_price_inr);
CREATE INDEX IF NOT EXISTS idx_variants_best_value ON variants(best_value_metric);
CREATE INDEX IF NOT EXISTS idx_variants_hash ON variants(variant_hash);

-- 4. OFFERS (Core Table 3)
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    seller_name TEXT NOT NULL DEFAULT '',
    is_authorized_seller BOOLEAN NOT NULL DEFAULT TRUE,
    listing_url TEXT NOT NULL,
    price_inr NUMERIC(10,2) NOT NULL CHECK (price_inr > 0),
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_variant_platform UNIQUE (variant_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_offers_variant_id ON offers(variant_id);
CREATE INDEX IF NOT EXISTS idx_offers_platform ON offers(platform);
CREATE INDEX IF NOT EXISTS idx_offers_price_inr ON offers(price_inr);

-- 5. PRICE_HISTORY (Core Table 4)
CREATE TABLE IF NOT EXISTS price_history (
    id BIGSERIAL PRIMARY KEY,
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    price_inr NUMERIC(10,2) NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_variant_date ON price_history(variant_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_offer_id ON price_history(offer_id);

-- 6. STAGING_QUARANTINE (Operational Support Table 1)
CREATE TABLE IF NOT EXISTS staging_quarantine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    brand_hint TEXT,
    raw_title TEXT NOT NULL,
    raw_price NUMERIC(10,2),
    raw_url TEXT,
    detected_weight_g INTEGER,
    failure_category TEXT NOT NULL CHECK (
        failure_category IN (
            'COMBO_BUNDLE', 
            'ACCESSORY_OR_GEAR', 
            'UNRESOLVABLE_WEIGHT', 
            'FORMULATION_MISMATCH', 
            'AMINO_SPIKED', 
            'PHYSICS_VIOLATION', 
            'SCRAPER_PARSE_ERROR'
        )
    ),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staging_failure_category ON staging_quarantine(failure_category);

-- 7. COMPARISON_SNAPSHOTS (Operational Support Table 2)
CREATE TABLE IF NOT EXISTS comparison_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_ids UUID[] NOT NULL CHECK (array_length(variant_ids, 1) BETWEEN 2 AND 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE INDEX IF NOT EXISTS idx_comparison_snapshots_id ON comparison_snapshots(id);

-- ==============================================================================
-- 8. TRIGGERS & FUNCTIONS: DELTA PRICE LOGGING & LOWEST ASKS
-- ==============================================================================

CREATE OR REPLACE FUNCTION fn_handle_offer_delta()
RETURNS TRIGGER AS $$
DECLARE
    min_price NUMERIC(10,2);
BEGIN
    -- Log to price_history if price or in_stock changed or upon insertion
    IF (TG_OP = 'INSERT') OR 
       (NEW.price_inr IS DISTINCT FROM OLD.price_inr) OR 
       (NEW.in_stock IS DISTINCT FROM OLD.in_stock) THEN
        
        INSERT INTO price_history (
            offer_id,
            variant_id,
            platform,
            price_inr,
            in_stock,
            recorded_at
        ) VALUES (
            NEW.id,
            NEW.variant_id,
            NEW.platform,
            NEW.price_inr,
            NEW.in_stock,
            NOW()
        );
    END IF;

    -- Recompute lowest available in-stock price for the variant
    SELECT MIN(price_inr) INTO min_price
    FROM offers
    WHERE variant_id = NEW.variant_id
      AND in_stock = TRUE;

    UPDATE variants
    SET lowest_price_inr = min_price
    WHERE id = NEW.variant_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_offer_delta ON offers;
CREATE TRIGGER trg_offer_delta
AFTER INSERT OR UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION fn_handle_offer_delta();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_quarantine ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_snapshots ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies (anon & authenticated)
CREATE POLICY "Public products viewable by all" ON products
    FOR SELECT TO public USING (true);

-- Honey pot variant protection: Canary variants are NEVER returned to public
CREATE POLICY "Public variants viewable by all excluding canary" ON variants
    FOR SELECT TO public USING (is_canary = FALSE);

CREATE POLICY "Public offers viewable by all" ON offers
    FOR SELECT TO public USING (true);

CREATE POLICY "Public price history viewable by all" ON price_history
    FOR SELECT TO public USING (true);

CREATE POLICY "Public snapshots viewable if unexpired" ON comparison_snapshots
    FOR SELECT TO public USING (expires_at > NOW());

-- Staging quarantine has no public policy (service role only)

-- Service role full access policies
CREATE POLICY "Service role full access products" ON products
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access variants" ON variants
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access offers" ON offers
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access price_history" ON price_history
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access staging" ON staging_quarantine
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access snapshots" ON comparison_snapshots
    FOR ALL TO service_role USING (true) WITH CHECK (true);
