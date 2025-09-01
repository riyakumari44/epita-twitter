import { TweetResponseDto } from '../../tweets/dto/tweet-response.dto';

export class FeedResponseDto {
    success: boolean;
    data: TweetResponseDto[];
    message: string;
    total: number;
}
