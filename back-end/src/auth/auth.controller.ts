import { Body, Controller, Post, UnauthorizedException, HttpCode, HttpStatus, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto) {
        try {
            return await this.authService.registerUser(createUserDto);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw error;
        }
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: { email: string; password: string }) {
        try {
            return await this.authService.login(loginDto.email, loginDto.password);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Login failed');
        }
    }
}
