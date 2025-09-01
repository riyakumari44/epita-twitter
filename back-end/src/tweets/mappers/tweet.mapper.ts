import { Tweet } from '../entities/tweet.entity';
import { TweetResponseDto } from '../dto/tweet-response.dto';

export class TweetMapper {
    static toResponseDto(tweet: Tweet): TweetResponseDto {
        return {
            id: tweet.id,
            content: tweet.content,
            mediaUrl: tweet.mediaUrl,
            mediaType: tweet.mediaType,
            type: tweet.type,
            createdAt: tweet.createdAt,
            likesCount: tweet.likesCount,
            retweetsCount: tweet.retweetsCount,
            repliesCount: tweet.repliesCount,
            user: {
                id: tweet.user.id,
                username: tweet.user.username,
                displayName: tweet.user.displayName || tweet.user.username,
                profileImageUrl: tweet.user.profileImageUrl,
            },
        };
    }

    static toResponseDtoList(tweets: Tweet[]): TweetResponseDto[] {
        return tweets.map(tweet => this.toResponseDto(tweet));
    }
} 