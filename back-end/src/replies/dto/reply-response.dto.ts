export class ReplyResponseDto {
    reply_id: string;
    timestamp: Date;
}

export class ReplyWithUserInfoDto {
    reply_id: string;
    tweet_id: string;
    user_id: string;
    reply_text: string;
    timestamp: Date;
    user: {
        username: string;
        profileImageUrl: string;
    };
} 