-- Add won_at to track the exact date a deal was moved to closed-won stage
ALTER TABLE deals ADD COLUMN IF NOT EXISTS won_at timestamp with time zone;

-- Backfill: for existing closed-won deals, use updated_at as best approximation
UPDATE deals SET won_at = updated_at WHERE stage = 'closed-won' AND won_at IS NULL;
