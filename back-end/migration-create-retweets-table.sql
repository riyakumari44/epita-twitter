-- Create retweets table
CREATE TABLE IF NOT EXISTS retweets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tweet_id UUID NOT NULL,
    user_id UUID NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_retweets_tweet FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE CASCADE,
    CONSTRAINT fk_retweets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate retweets from same user (only for retweets without comments)
    CONSTRAINT unique_user_tweet_retweet UNIQUE (tweet_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_retweets_tweet_id ON retweets(tweet_id);
CREATE INDEX IF NOT EXISTS idx_retweets_user_id ON retweets(user_id);
CREATE INDEX IF NOT EXISTS idx_retweets_created_at ON retweets(created_at DESC);

-- Create composite index for getting retweets for a tweet ordered by creation time
CREATE INDEX IF NOT EXISTS idx_retweets_tweet_created ON retweets(tweet_id, created_at DESC);

-- Create index for user retweets
CREATE INDEX IF NOT EXISTS idx_retweets_user_created ON retweets(user_id, created_at DESC); 