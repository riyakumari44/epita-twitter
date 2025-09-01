-- Migration to add profile fields to users table
-- Run this script in your PostgreSQL database

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "displayName" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "bio" VARCHAR(160),
ADD COLUMN IF NOT EXISTS "location" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "website" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "profileImageUrl" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "coverImageUrl" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "dateJoined" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "followersCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "followingCount" INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email); 