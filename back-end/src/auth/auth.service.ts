import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserMapper } from '../users/mappers/user.mapper';
import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private userMapper: UserMapper,
    ) { }

    async registerUser(createUserDto: CreateUserDto) {
        try {
            // Check if user already exists
            const existingUser = await this.userRepository.findOne({
                where: [
                    { email: createUserDto.email },
                    { username: createUserDto.username }
                ]
            });

            if (existingUser) {
                if (existingUser.email === createUserDto.email) {
                    throw new ConflictException('Email already exists');
                }
                if (existingUser.username === createUserDto.username) {
                    throw new ConflictException('Username already exists');
                }
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);
            const user = this.userRepository.create({
                ...createUserDto,
                password: hashedPassword,
            });
            const savedUser = await this.userRepository.save(user);
            return this.userMapper.toDto(savedUser);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            // Handle database constraint errors
            if (error.code === '23505') { // PostgreSQL unique violation
                if (error.constraint?.includes('email')) {
                    throw new ConflictException('Email already exists');
                }
                if (error.constraint?.includes('username')) {
                    throw new ConflictException('Username already exists');
                }
                throw new ConflictException('User already exists');
            }
            throw error;
        }
    }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        }
        throw new UnauthorizedException('Invalid credentials');
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
