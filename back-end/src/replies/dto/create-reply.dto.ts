import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class CreateReplyDto {
    @IsString()
    @IsNotEmpty({ message: 'Reply text is required' })
    @MaxLength(280, { message: 'Reply text cannot exceed 280 characters' })
    reply_text: string;

    @IsUUID('4', { message: 'Invalid tweet ID format' })
    @IsNotEmpty({ message: 'Tweet ID is required' })
    tweet_id: string;
} 