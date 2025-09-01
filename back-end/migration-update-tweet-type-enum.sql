-- Migration: Update TweetType enum to include MIXED type
-- This migration adds support for tweets with both text and media content

-- Add the new MIXED value to the TweetType enum
-- Note: PostgreSQL requires recreating the enum type to add new values
-- This approach handles the case where the enum already exists

DO $$ 
BEGIN
    -- Check if MIXED value already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'mixed' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tweettype')
    ) THEN
        -- Add MIXED value to the enum
        ALTER TYPE "TweetType" ADD VALUE 'mixed';
    END IF;
END $$;

-- Update existing tweets that have both content and media to use MIXED type
-- This handles any existing tweets that might have been created with both content and media
UPDATE tweets 
SET type = 'mixed' 
WHERE content IS NOT NULL 
  AND content != '' 
  AND media_url IS NOT NULL 
  AND media_url != '';

-- Add comment to document the change
COMMENT ON TYPE "TweetType" IS 'Tweet types: text (text only), media (media only), mixed (text + media)'; 