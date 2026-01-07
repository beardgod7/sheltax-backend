-- Migration to add Google OAuth support to User table
-- Run this SQL script to update your existing database

-- First, update the role enum to include new roles
-- Drop the existing constraint and enum
ALTER TABLE "User1" DROP CONSTRAINT IF EXISTS "User1_role_check";

-- Add new columns for Google OAuth
ALTER TABLE "User1" 
ADD COLUMN IF NOT EXISTS "username" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "googleId" VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS "profilePicture" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "signup_channel" VARCHAR(20) DEFAULT 'manual';

-- Update the role column to use new enum values
-- First update existing data
UPDATE "User1" SET role = 'admin' WHERE role = 'Admin';
UPDATE "User1" SET role = 'super_admin' WHERE role = 'SuperAdmin';
UPDATE "User1" SET role = 'seeker' WHERE role = 'User';

-- Add the new constraint with updated roles
ALTER TABLE "User1" ADD CONSTRAINT "User1_role_check" 
CHECK (role IN ('seeker', 'owner', 'agent', 'admin', 'super_admin'));

-- Make password nullable for Google OAuth users
ALTER TABLE "User1" ALTER COLUMN "password" DROP NOT NULL;

-- Add constraint to ensure password is required for manual signups
ALTER TABLE "User1" ADD CONSTRAINT check_password_for_manual_signup 
CHECK (
  (signup_channel = 'manual' AND password IS NOT NULL) OR 
  (signup_channel = 'google')
);

-- Create index on googleId for better performance
CREATE INDEX IF NOT EXISTS idx_user1_google_id ON "User1" ("googleId") WHERE "googleId" IS NOT NULL;

-- Update existing users to have manual signup_channel
UPDATE "User1" SET signup_channel = 'manual' WHERE signup_channel IS NULL;