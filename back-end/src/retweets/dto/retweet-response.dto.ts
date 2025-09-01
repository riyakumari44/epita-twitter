export class RetweetResponseDto {
    id: string;
    tweet_id: string;
    user_id: string;
    comment: string | null;
    created_at: Date;
}

export class RetweetWithUserInfoDto {
    id: string;
    tweet_id: string;
    user_id: string;
    comment: string | null;
    created_at: Date;
    user: {
        username: string;
        profileImageUrl: string;
    };
}

export class RetweetCountDto {
    tweet_id: string;
    retweet_count: number;
} 