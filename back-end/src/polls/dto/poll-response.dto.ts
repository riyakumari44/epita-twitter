export class PollOptionResponseDto {
    id: string;
    option_text: string;
    vote_count: number;
    percentage: number;
}

export class PollResponseDto {
    id: string;
    tweet_id: string;
    user_id: string;
    created_at: Date;
    expires_at: Date | null;
    options: PollOptionResponseDto[];
    total_votes: number;
    is_expired: boolean;
    user_voted: boolean;
    user_vote_option_id?: string;
}

export class PollWithVotersDto {
    id: string;
    tweet_id: string;
    user_id: string;
    created_at: Date;
    expires_at: Date | null;
    options: {
        id: string;
        option_text: string;
        vote_count: number;
        percentage: number;
        voters: {
            user_id: string;
            username: string;
            profileImageUrl: string;
        }[];
    }[];
    total_votes: number;
    is_expired: boolean;
} 