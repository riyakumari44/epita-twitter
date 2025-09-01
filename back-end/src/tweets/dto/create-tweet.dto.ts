import { IsString, IsOptional, IsEnum, MaxLength, ValidateIf } from 'class-validator';
import { TweetType } from '../entities/tweet.entity';

export class CreateTweetDto {
    @IsOptional()
    @IsString()
    @MaxLength(280, { message: 'Tweet content cannot exceed 280 characters' })
    content?: string;

    @IsOptional()
    @IsEnum(TweetType)
    type?: TweetType;
} 