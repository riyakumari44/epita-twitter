import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateRetweetDto {
    @IsUUID('4', { message: 'Invalid tweet ID format' })
    @IsNotEmpty({ message: 'Tweet ID is required' })
    tweet_id: string;

    @IsOptional()
    @IsString()
    @MaxLength(280, { message: 'Comment cannot exceed 280 characters' })
    comment?: string;
} 