-- ============================================================================
-- PHASE 2: INVOICE COMPLIANCE (INDIA GST)
-- Enhanced Schema for GST-Compliant Invoice Numbering
-- ============================================================================

-- Invoice Sequences for Atomic Numbering
CREATE TABLE IF NOT EXISTS invoice_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prefix VARCHAR(10) NOT NULL,              -- INV, FCO, CON, FVE
    financial_year VARCHAR(7) NOT NULL,       -- Format: YYYY-YY (e.g., 2024-25)
    last_number INTEGER NOT NULL DEFAULT 0,
    entity_type VARCHAR(20) NOT NULL,         -- 'client', 'freelancer', 'contractor', 'vendor'
    company_id UUID,                          -- For multi-company support
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prefix, financial_year, company_id)
);

-- Invoice Sequence Audit Log
CREATE TABLE IF NOT EXISTS invoice_sequence_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_id UUID REFERENCES invoice_sequences(id),
    invoice_number VARCHAR(50) NOT NULL,
    invoice_id UUID,
    generated_by UUID,                        -- User who generated
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Add invoice format validation to invoices table
-- Note: This extends the existing invoices table

-- ============================================
-- ATOMIC INVOICE NUMBER GENERATION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_next_invoice_number(
    p_prefix VARCHAR,
    p_financial_year VARCHAR,
    p_company_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_next_number INTEGER;
    v_invoice_number VARCHAR(50);
    v_sequence_id UUID;
BEGIN
    -- Insert row if doesn't exist (with company_id support)
    INSERT INTO invoice_sequences (prefix, financial_year, entity_type, company_id, last_number)
    VALUES (
        p_prefix, 
        p_financial_year, 
        CASE p_prefix
            WHEN 'INV' THEN 'client'
            WHEN 'FCO' THEN 'freelancer'
            WHEN 'CON' THEN 'contractor'
            WHEN 'FVE' THEN 'vendor'
            ELSE 'unknown'
        END,
        p_company_id, 
        0
    )
    ON CONFLICT (prefix, financial_year, company_id) DO NOTHING;
    
    -- Atomically increment and get the number
    UPDATE invoice_sequences
    SET last_number = last_number + 1,
        updated_at = NOW()
    WHERE prefix = p_prefix 
      AND financial_year = p_financial_year
      AND (company_id = p_company_id OR (company_id IS NULL AND p_company_id IS NULL))
    RETURNING last_number, id INTO v_next_number, v_sequence_id;
    
    -- Format the invoice number: PREFIX/FY/XXXXX
    v_invoice_number := p_prefix || '/' || p_financial_year || '/' || LPAD(v_next_number::TEXT, 5, '0');
    
    -- Log the sequence generation
    INSERT INTO invoice_sequence_logs (sequence_id, invoice_number, generated_at)
    VALUES (v_sequence_id, v_invoice_number, NOW());
    
    RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get client invoice number
CREATE OR REPLACE FUNCTION get_client_invoice_number(
    p_company_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_fy VARCHAR(7);
BEGIN
    -- Get current financial year (April - March)
    SELECT CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN
            EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
            RIGHT((EXTRACT(YEAR FROM CURRENT_DATE) + 1)::TEXT, 2)
        ELSE
            (EXTRACT(YEAR FROM CURRENT_DATE) - 1) || '-' || 
            RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2)
    END INTO v_fy;
    
    RETURN get_next_invoice_number('INV', v_fy, p_company_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get freelancer invoice number
CREATE OR REPLACE FUNCTION get_freelancer_invoice_number(
    p_company_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_fy VARCHAR(7);
BEGIN
    SELECT CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN
            EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
            RIGHT((EXTRACT(YEAR FROM CURRENT_DATE) + 1)::TEXT, 2)
        ELSE
            (EXTRACT(YEAR FROM CURRENT_DATE) - 1) || '-' || 
            RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2)
    END INTO v_fy;
    
    RETURN get_next_invoice_number('FCO', v_fy, p_company_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get contractor invoice number
CREATE OR REPLACE FUNCTION get_contractor_invoice_number(
    p_company_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_fy VARCHAR(7);
BEGIN
    SELECT CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN
            EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
            RIGHT((EXTRACT(YEAR FROM CURRENT_DATE) + 1)::TEXT, 2)
        ELSE
            (EXTRACT(YEAR FROM CURRENT_DATE) - 1) || '-' || 
            RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2)
    END INTO v_fy;
    
    RETURN get_next_invoice_number('CON', v_fy, p_company_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get vendor invoice number
CREATE OR REPLACE FUNCTION get_vendor_invoice_number(
    p_company_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_fy VARCHAR(7);
BEGIN
    SELECT CASE 
        WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN
            EXTRACT(YEAR FROM CURRENT_DATE) || '-' || 
            RIGHT((EXTRACT(YEAR FROM CURRENT_DATE) + 1)::TEXT, 2)
        ELSE
            (EXTRACT(YEAR FROM CURRENT_DATE) - 1) || '-' || 
            RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2)
    END INTO v_fy;
    
    RETURN get_next_invoice_number('FVE', v_fy, p_company_id);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GST CALCULATION VALIDATION
-- ============================================

-- Function to validate GST calculations
CREATE OR REPLACE FUNCTION validate_gst_calculation(
    p_taxable_amount DECIMAL(12,2),
    p_cgst_amount DECIMAL(12,2),
    p_sgst_amount DECIMAL(12,2),
    p_igst_amount DECIMAL(12,2),
    p_gst_rate DECIMAL(5,2),
    p_is_intra_state BOOLEAN
) RETURNS TABLE (
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_expected_cgst DECIMAL(12,2);
    v_expected_sgst DECIMAL(12,2);
    v_expected_igst DECIMAL(12,2);
    v_rounded_cgst DECIMAL(12,2);
    v_rounded_sgst DECIMAL(12,2);
    v_rounded_igst DECIMAL(12,2);
    v_total_gst DECIMAL(12,2);
    v_expected_total DECIMAL(12,2);
BEGIN
    -- Calculate expected values
    IF p_is_intra_state THEN
        -- For intra-state: CGST = SGST = rate/2
        v_expected_cgst := ROUND((p_taxable_amount * (p_gst_rate / 2) / 100), 2);
        v_expected_sgst := ROUND((p_taxable_amount * (p_gst_rate / 2) / 100), 2);
        v_expected_igst := 0;
    ELSE
        -- For inter-state: IGST = full rate
        v_expected_cgst := 0;
        v_expected_sgst := 0;
        v_expected_igst := ROUND((p_taxable_amount * p_gst_rate / 100), 2);
    END IF;
    
    -- Round to paise (2 decimal places)
    v_rounded_cgst := ROUND(p_cgst_amount, 2);
    v_rounded_sgst := ROUND(p_sgst_amount, 2);
    v_rounded_igst := ROUND(p_igst_amount, 2);
    
    -- Validation checks
    IF p_is_intra_state THEN
        -- For intra-state, CGST should equal SGST
        IF ABS(v_rounded_cgst - v_rounded_sgst) > 0.01 THEN
            RETURN QUERY SELECT FALSE, 'CGST and SGST amounts must be equal for intra-state transactions'::TEXT;
            RETURN;
        END IF;
        
        -- Validate amounts match expected (within 0.01 tolerance for rounding)
        IF ABS(v_rounded_cgst - v_expected_cgst) > 0.01 OR ABS(v_rounded_sgst - v_expected_sgst) > 0.01 THEN
            RETURN QUERY SELECT FALSE, FORMAT('CGST/SGST calculation incorrect. Expected: CGST=%s, SGST=%s, Got: CGST=%s, SGST=%s', 
                v_expected_cgst, v_expected_sgst, v_rounded_cgst, v_rounded_sgst)::TEXT;
            RETURN;
        END IF;
        
        -- IGST should be 0
        IF v_rounded_igst != 0 THEN
            RETURN QUERY SELECT FALSE, 'IGST must be 0 for intra-state transactions'::TEXT;
            RETURN;
        END IF;
    ELSE
        -- For inter-state, CGST and SGST should be 0
        IF v_rounded_cgst != 0 OR v_rounded_sgst != 0 THEN
            RETURN QUERY SELECT FALSE, 'CGST and SGST must be 0 for inter-state transactions'::TEXT;
            RETURN;
        END IF;
        
        -- Validate IGST amount
        IF ABS(v_rounded_igst - v_expected_igst) > 0.01 THEN
            RETURN QUERY SELECT FALSE, FORMAT('IGST calculation incorrect. Expected: %s, Got: %s', 
                v_expected_igst, v_rounded_igst)::TEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Validate total GST matches rate
    v_total_gst := v_rounded_cgst + v_rounded_sgst + v_rounded_igst;
    v_expected_total := ROUND((p_taxable_amount * p_gst_rate / 100), 2);
    
    IF ABS(v_total_gst - v_expected_total) > 0.01 THEN
        RETURN QUERY SELECT FALSE, FORMAT('Total GST mismatch. Expected: %s, Got: %s', 
            v_expected_total, v_total_gst)::TEXT;
        RETURN;
    END IF;
    
    -- All validations passed
    RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate GST before invoice insert/update
CREATE OR REPLACE FUNCTION validate_invoice_gst_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_validation RECORD;
BEGIN
    -- Only validate if GST is applicable
    IF NEW.is_gst_applicable THEN
        SELECT * INTO v_validation FROM validate_gst_calculation(
            NEW.taxable_amount,
            NEW.cgst_amount,
            NEW.sgst_amount,
            NEW.igst_amount,
            COALESCE(NEW.cgst_rate, 0) + COALESCE(NEW.sgst_rate, 0) + COALESCE(NEW.igst_rate, 0),
            NEW.gst_type = 'cgst_sgst'
        );
        
        IF NOT v_validation.is_valid THEN
            RAISE EXCEPTION 'GST Validation Failed: %', v_validation.error_message;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to invoices table
DROP TRIGGER IF EXISTS validate_invoice_gst ON invoices;
CREATE TRIGGER validate_invoice_gst
    BEFORE INSERT OR UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION validate_invoice_gst_trigger();

-- ============================================
-- INVOICE VALIDATIONS
-- ============================================

-- Function to validate invoice number format
CREATE OR REPLACE FUNCTION validate_invoice_number_format(
    p_invoice_number VARCHAR(50)
) RETURNS BOOLEAN AS $$
BEGIN
    -- Must match pattern: XXX/YYYY-YY/XXXXX
    -- Examples: INV/2024-25/00001, FCO/2024-25/00042
    RETURN p_invoice_number ~ '^[A-Z]{3}/[0-9]{4}-[0-9]{2}/[0-9]{5}$';
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate invoice number on insert
CREATE OR REPLACE FUNCTION validate_invoice_number_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Validate format
    IF NOT validate_invoice_number_format(NEW.invoice_number) THEN
        RAISE EXCEPTION 'Invalid invoice number format: %. Must be XXX/YYYY-YY/XXXXX', NEW.invoice_number;
    END IF;
    
    -- Check for duplicates
    SELECT COUNT(*) INTO v_count
    FROM invoices
    WHERE invoice_number = NEW.invoice_number
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
    
    IF v_count > 0 THEN
        RAISE EXCEPTION 'Invoice number % already exists', NEW.invoice_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS validate_invoice_number ON invoices;
CREATE TRIGGER validate_invoice_number
    BEFORE INSERT OR UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION validate_invoice_number_trigger();

-- ============================================
-- INDICES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_invoice_sequences_lookup 
ON invoice_sequences(prefix, financial_year, company_id);

CREATE INDEX IF NOT EXISTS idx_invoice_sequence_logs_number 
ON invoice_sequence_logs(invoice_number);

CREATE INDEX IF NOT EXISTS idx_invoice_sequence_logs_generated 
ON invoice_sequence_logs(generated_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_sequence_logs ENABLE ROW LEVEL SECURITY;

-- Policies for invoice_sequences
CREATE POLICY "Only admins can modify invoice sequences"
ON invoice_sequences FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view invoice sequences"
ON invoice_sequences FOR SELECT
TO authenticated
USING (true);

-- Policies for invoice_sequence_logs
CREATE POLICY "Only admins can modify sequence logs"
ON invoice_sequence_logs FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their sequence logs"
ON invoice_sequence_logs FOR SELECT
TO authenticated
USING (generated_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Invoice numbering summary by FY
CREATE OR REPLACE VIEW invoice_numbering_summary AS
SELECT 
    s.prefix,
    s.financial_year,
    s.entity_type,
    s.last_number as last_used_number,
    s.updated_at as last_generated_at,
    COUNT(l.id) as total_generated,
    MAX(l.generated_at) as last_generated,
    MIN(l.generated_at) as first_generated
FROM invoice_sequences s
LEFT JOIN invoice_sequence_logs l ON s.id = l.sequence_id
GROUP BY s.id, s.prefix, s.financial_year, s.entity_type, s.last_number, s.updated_at
ORDER BY s.financial_year DESC, s.entity_type;

-- View: Missing invoice numbers (gaps detection)
CREATE OR REPLACE VIEW invoice_number_gaps AS
WITH RECURSIVE numbers AS (
    SELECT 1 as num
    UNION ALL
    SELECT num + 1 
    FROM numbers 
    WHERE num < 99999
),
sequence_range AS (
    SELECT 
        prefix,
        financial_year,
        MIN(CAST(SPLIT_PART(invoice_number, '/', 3) AS INTEGER)) as min_num,
        MAX(CAST(SPLIT_PART(invoice_number, '/', 3) AS INTEGER)) as max_num
    FROM invoice_sequence_logs
    GROUP BY prefix, financial_year
)
SELECT 
    sr.prefix,
    sr.financial_year,
    n.num as missing_number,
    sr.prefix || '/' || sr.financial_year || '/' || LPAD(n.num::TEXT, 5, '0') as missing_invoice_number
FROM sequence_range sr
JOIN numbers n ON n.num BETWEEN sr.min_num AND sr.max_num
LEFT JOIN invoice_sequence_logs l ON 
    l.invoice_number = sr.prefix || '/' || sr.financial_year || '/' || LPAD(n.num::TEXT, 5, '0')
WHERE l.id IS NULL
ORDER BY sr.financial_year DESC, sr.prefix, n.num;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE invoice_sequences IS 'Tracks atomic invoice numbering for GST compliance';
COMMENT ON FUNCTION get_next_invoice_number IS 'Atomically generates next invoice number with proper FY/sequencing';
COMMENT ON FUNCTION validate_gst_calculation IS 'Validates CGST/SGST/IGST calculations against taxable amount';
