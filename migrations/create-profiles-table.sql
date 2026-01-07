-- Migration to create role-specific profile tables
-- Run this SQL script to create the agent, owner, and seeker profile tables

-- Agent Profiles Table
CREATE TABLE IF NOT EXISTS "AgentProfiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User1"("id") ON DELETE CASCADE,
  
  -- Personal Information (matching Figma design)
  "firstName" VARCHAR(255) NOT NULL,
  "surname" VARCHAR(255) NOT NULL,
  "phoneNumber" VARCHAR(255) NOT NULL,
  "emailAddress" VARCHAR(255) NOT NULL,
  "stateOfResidence" VARCHAR(255) NOT NULL,
  "gender" VARCHAR(20) NOT NULL CHECK ("gender" IN ('male', 'female', 'other')),
  "dateOfBirth" DATE NOT NULL,
  "profilePicture" VARCHAR(500),
  "address" TEXT,
  "city" VARCHAR(255),
  "state" VARCHAR(255),
  "zipCode" VARCHAR(20),
  
  -- Agency Information (matching Figma design - both optional)
  "agencyCompanyName" VARCHAR(255), -- Agency/Company Name (if applicable)
  "agentLicense" VARCHAR(255), -- Agent License (Optional)
  
  -- Additional professional fields
  "yearsOfExperience" INTEGER CHECK ("yearsOfExperience" >= 0 AND "yearsOfExperience" <= 50),
  "specialization" TEXT,
  "bio" TEXT,
  "website" VARCHAR(500),
  "linkedinProfile" VARCHAR(500),
  
  -- Agent verification and ratings
  "isVerified" BOOLEAN DEFAULT FALSE,
  "verificationDocuments" JSONB,
  "averageRating" DECIMAL(2,1) DEFAULT 0.0 CHECK ("averageRating" >= 0 AND "averageRating" <= 5),
  "totalReviews" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT TRUE,
  "isComplete" BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Owner Profiles Table
CREATE TABLE IF NOT EXISTS "OwnerProfiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User1"("id") ON DELETE CASCADE,
  
  -- Personal Information (same as agent profile)
  "firstName" VARCHAR(255) NOT NULL,
  "surname" VARCHAR(255) NOT NULL,
  "phoneNumber" VARCHAR(255) NOT NULL,
  "emailAddress" VARCHAR(255) NOT NULL,
  "stateOfResidence" VARCHAR(255) NOT NULL,
  "gender" VARCHAR(20) NOT NULL CHECK ("gender" IN ('male', 'female', 'other')),
  "dateOfBirth" DATE NOT NULL,
  "profilePicture" VARCHAR(500),
  "address" TEXT,
  "city" VARCHAR(255),
  "state" VARCHAR(255),
  "zipCode" VARCHAR(20),
  
  -- Owner-specific fields (no agency information)
  "ownerType" VARCHAR(50) DEFAULT 'individual' CHECK ("ownerType" IN ('individual', 'company', 'investment_group')),
  "companyName" VARCHAR(255), -- Optional for individual owners
  "businessRegistrationNumber" VARCHAR(255),
  "bio" TEXT,
  "website" VARCHAR(500),
  
  -- Owner verification and stats
  "isVerified" BOOLEAN DEFAULT FALSE,
  "verificationDocuments" JSONB,
  "totalProperties" INTEGER DEFAULT 0,
  "activeListings" INTEGER DEFAULT 0,
  "averageRating" DECIMAL(2,1) DEFAULT 0.0 CHECK ("averageRating" >= 0 AND "averageRating" <= 5),
  "totalReviews" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT TRUE,
  "isComplete" BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seeker Profiles Table
CREATE TABLE IF NOT EXISTS "SeekerProfiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE REFERENCES "User1"("id") ON DELETE CASCADE,
  
  -- Base profile fields (matching Figma design)
  "firstName" VARCHAR(255) NOT NULL,
  "surname" VARCHAR(255) NOT NULL,
  "phoneNumber" VARCHAR(255) NOT NULL,
  "emailAddress" VARCHAR(255) NOT NULL,
  "stateOfResidence" VARCHAR(255) NOT NULL,
  "gender" VARCHAR(20) NOT NULL CHECK ("gender" IN ('male', 'female', 'other')),
  "dateOfBirth" DATE NOT NULL,
  "ninVerification" VARCHAR(255), -- NIN Verification field as shown in Figma
  "profilePicture" VARCHAR(500),
  "address" TEXT,
  "city" VARCHAR(255),
  "state" VARCHAR(255),
  "zipCode" VARCHAR(20),
  
  -- Seeker-specific fields (for property matching)
  "occupation" VARCHAR(255),
  "monthlyIncome" DECIMAL(15,2),
  "employmentStatus" VARCHAR(50) CHECK ("employmentStatus" IN ('employed', 'self_employed', 'unemployed', 'student', 'retired')),
  
  -- Property preferences
  "preferredPropertyType" VARCHAR(50) CHECK ("preferredPropertyType" IN ('apartment', 'house', 'condo', 'townhouse', 'studio', 'any')),
  "preferredLocation" VARCHAR(255),
  "budgetMin" DECIMAL(15,2),
  "budgetMax" DECIMAL(15,2),
  "preferredBedrooms" INTEGER CHECK ("preferredBedrooms" >= 0 AND "preferredBedrooms" <= 10),
  "preferredBathrooms" INTEGER CHECK ("preferredBathrooms" >= 0 AND "preferredBathrooms" <= 10),
  
  -- Seeker verification
  "isVerified" BOOLEAN DEFAULT FALSE,
  "verificationDocuments" JSONB,
  "creditScore" INTEGER CHECK ("creditScore" >= 300 AND "creditScore" <= 850),
  "backgroundCheckStatus" VARCHAR(50) DEFAULT 'not_requested' CHECK ("backgroundCheckStatus" IN ('pending', 'approved', 'rejected', 'not_requested')),
  
  -- Seeker activity
  "totalInquiries" INTEGER DEFAULT 0,
  "totalApplications" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT TRUE,
  "isComplete" BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for Agent Profiles
CREATE INDEX IF NOT EXISTS idx_agent_profiles_user_id ON "AgentProfiles" ("userId");
CREATE INDEX IF NOT EXISTS idx_agent_profiles_state ON "AgentProfiles" ("stateOfResidence");
CREATE INDEX IF NOT EXISTS idx_agent_profiles_verified ON "AgentProfiles" ("isVerified");
CREATE INDEX IF NOT EXISTS idx_agent_profiles_active ON "AgentProfiles" ("isActive");
CREATE INDEX IF NOT EXISTS idx_agent_profiles_rating ON "AgentProfiles" ("averageRating");
CREATE INDEX IF NOT EXISTS idx_agent_profiles_agency ON "AgentProfiles" ("agencyCompanyName");

-- Create indexes for Owner Profiles
CREATE INDEX IF NOT EXISTS idx_owner_profiles_user_id ON "OwnerProfiles" ("userId");
CREATE INDEX IF NOT EXISTS idx_owner_profiles_state ON "OwnerProfiles" ("stateOfResidence");
CREATE INDEX IF NOT EXISTS idx_owner_profiles_type ON "OwnerProfiles" ("ownerType");
CREATE INDEX IF NOT EXISTS idx_owner_profiles_verified ON "OwnerProfiles" ("isVerified");
CREATE INDEX IF NOT EXISTS idx_owner_profiles_active ON "OwnerProfiles" ("isActive");
CREATE INDEX IF NOT EXISTS idx_owner_profiles_rating ON "OwnerProfiles" ("averageRating");

-- Create indexes for Seeker Profiles
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_user_id ON "SeekerProfiles" ("userId");
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_state ON "SeekerProfiles" ("stateOfResidence");
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_employment ON "SeekerProfiles" ("employmentStatus");
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_property_type ON "SeekerProfiles" ("preferredPropertyType");
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_budget ON "SeekerProfiles" ("budgetMin", "budgetMax");
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_verified ON "SeekerProfiles" ("isVerified");
CREATE INDEX IF NOT EXISTS idx_seeker_profiles_active ON "SeekerProfiles" ("isActive");

-- Create triggers to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_profiles_updated_at 
    BEFORE UPDATE ON "AgentProfiles" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_owner_profiles_updated_at 
    BEFORE UPDATE ON "OwnerProfiles" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seeker_profiles_updated_at 
    BEFORE UPDATE ON "SeekerProfiles" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();