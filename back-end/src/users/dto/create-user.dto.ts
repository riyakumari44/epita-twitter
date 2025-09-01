import { IsString, IsEmail, Length } from 'class-validator';

export class CreateUserDto {
    @IsString()
    readonly username: string;

    @IsEmail()
    readonly email: string;

    @IsString()
    @Length(8, 20)
    readonly password: string;
}