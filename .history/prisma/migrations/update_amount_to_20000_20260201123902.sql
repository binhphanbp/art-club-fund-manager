-- Migration: Update default amount from 50000 to 20000
-- Date: 2026-02-01

-- Update Settings table default weekly fund amount
UPDATE "settings" 
SET "weeklyFundAmount" = 20000 
WHERE "weeklyFundAmount" = 50000;

-- Update existing contributions that have 50000 to 20000 (optional - only if you want to update historical data)
-- Uncomment the line below if you want to update all existing contributions
-- UPDATE "contributions" SET "amount" = 20000 WHERE "amount" = 50000;

-- Note: The schema default has been updated in schema.prisma
-- Run: npx prisma db push
-- Or: npx prisma migrate dev --name update_amount_to_20000
