-- Migration: Add Twitter and Facebook OAuth fields to User1 table
-- Date: 2024-01-01

-- Add Twitter OAuth fields
ALTER TABLE "User1" 
ADD COLUMN IF NOT EXISTS "twitterId" VARCHAR(255) UNIQUE;

-- Add Facebook OAuth fields  
ALTER TABLE "User1"
ADD COLUMN IF NOT EXISTS "facebookId" VARCHAR(255) UNIQUE;

-- Update signup_channel enum to include new social providers
ALTER TYPE enum_User1_signup_channel ADD VALUE IF NOT EXISTS 'twitter';
ALTER TYPE enum_User1_signup_channel ADD VALUE IF NOT EXISTS 'facebook';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user1_twitter_id ON "User1" ("twitterId") WHERE "twitterId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user1_facebook_id ON "User1" ("facebookId") WHERE "facebookId" IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN "User1"."twitterId" IS 'Twitter user ID for OAuth authentication';
COMMENT ON COLUMN "User1"."facebookId" IS 'Facebook user ID for OAuth authentication';