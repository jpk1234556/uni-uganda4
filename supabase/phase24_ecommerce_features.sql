-- phase24_ecommerce_features.sql
-- Add category column to hostels if it doesn't exist

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'hostels' AND column_name = 'category'
    ) THEN
        ALTER TABLE hostels ADD COLUMN category text DEFAULT 'Hostel';
    END IF;
END $$;
