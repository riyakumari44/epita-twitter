import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @Length(8, 20)
    currentPassword: string;

    @IsString()
    @Length(8, 20)
    newPassword: string;
} 