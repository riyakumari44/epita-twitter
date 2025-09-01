import { IsString, IsNotEmpty, IsArray, IsOptional, IsUUID, MinLength, MaxLength, IsDateString, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class CreatePollDto {
    @IsUUID('4', { message: 'Invalid tweet ID format' })
    @IsNotEmpty({ message: 'Tweet ID is required' })
    tweet_id: string;

    @IsArray({ message: 'Options must be an array' })
    @ArrayMinSize(2, { message: 'Poll must have at least 2 options' })
    @ArrayMaxSize(4, { message: 'Poll cannot have more than 4 options' })
    @MinLength(1, { message: 'Option text cannot be empty' })
    @MaxLength(100, { message: 'Option text cannot exceed 100 characters' })
    options: string[];

    @IsOptional()
    @IsDateString({}, { message: 'Invalid date format for expires_at' })
    expires_at?: string;
} 