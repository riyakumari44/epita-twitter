import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class VotePollDto {
    @IsUUID('4', { message: 'Invalid option ID format' })
    @IsNotEmpty({ message: 'Option ID is required' })
    option_id: string;
} 