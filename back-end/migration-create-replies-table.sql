-- Create replies table
CREATE TABLE IF NOT EXISTS replies (
    reply_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tweet_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reply_text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_replies_tweet FOREIGN KEY (tweet_id) REFERENCES tweets(id) ON DELETE CASCADE,
    CONSTRAINT fk_replies_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT chk_reply_text_length CHECK (char_length(reply_text) <= 280)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_replies_tweet_id ON replies(tweet_id);
CREATE INDEX IF NOT EXISTS idx_replies_user_id ON replies(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_timestamp ON replies(timestamp DESC);

-- Create composite index for getting replies for a tweet ordered by timestamp
CREATE INDEX IF NOT EXISTS idx_replies_tweet_timestamp ON replies(tweet_id, timestamp DESC); 