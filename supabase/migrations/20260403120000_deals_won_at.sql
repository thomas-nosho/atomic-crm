-- Add won_at to deals table to track when a deal was won
ALTER TABLE "public"."deals" ADD COLUMN IF NOT EXISTS "won_at" date;
