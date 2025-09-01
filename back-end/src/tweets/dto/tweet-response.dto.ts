export class TweetResponseDto {
    id: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    type: string;
    createdAt: Date;
    likesCount: number;
    retweetsCount: number;
    repliesCount: number;
    user: {
        id: string;
        username: string;
        displayName: string;
        profileImageUrl?: string;
    };
}

export class TweetListResponseDto {
    success: boolean;
    data: TweetResponseDto[];
    message: string;
    total: number;
}

export class SingleTweetResponseDto {
    success: boolean;
    data: TweetResponseDto;
    message: string;
} 