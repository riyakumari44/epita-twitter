import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UserProfileDto } from "./dto/user-profile.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository, Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from "./entities/user.entity";
import { CloudinaryService } from "./cloudinary.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly dataSource: DataSource,
        private readonly configService: ConfigService,
        private readonly cloudinaryService: CloudinaryService,
    ) {
        const databaseHost = this.configService.get<string>('DATABASE_HOST');
        console.log(databaseHost);
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }

    async findByUsername(username: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException(`User with username "${username}" not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async getMyProfile(userId: string): Promise<UserProfileDto> {
        const user = await this.findOne(userId);
        return this.mapToProfileDto(user);
    }

    async getPublicProfile(userId: string): Promise<UserProfileDto> {
        const user = await this.findOne(userId);
        return this.mapToProfileDto(user);
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto, files?: { profileImage?: Express.Multer.File, coverImage?: Express.Multer.File }): Promise<UserProfileDto> {
        const user = await this.findOne(userId);

        // Check username uniqueness if username is being updated
        if (updateProfileDto.username && updateProfileDto.username !== user.username) {
            const existingUser = await this.userRepository.findOne({ where: { username: updateProfileDto.username } });
            if (existingUser) {
                throw new ConflictException('Username already exists');
            }
        }

        // Handle file uploads
        if (files?.profileImage) {
            // Delete old profile image if exists
            if (user.profileImageUrl) {
                await this.cloudinaryService.deleteFile(user.profileImageUrl);
            }
            user.profileImageUrl = await this.cloudinaryService.uploadFile(files.profileImage, userId, 'profile');
        }

        if (files?.coverImage) {
            // Delete old cover image if exists
            if (user.coverImageUrl) {
                await this.cloudinaryService.deleteFile(user.coverImageUrl);
            }
            user.coverImageUrl = await this.cloudinaryService.uploadFile(files.coverImage, userId, 'cover');
        }

        // Update profile fields
        if (updateProfileDto.displayName !== undefined) user.displayName = updateProfileDto.displayName;
        if (updateProfileDto.bio !== undefined) user.bio = updateProfileDto.bio;
        if (updateProfileDto.location !== undefined) user.location = updateProfileDto.location;
        if (updateProfileDto.website !== undefined) user.website = updateProfileDto.website;
        if (updateProfileDto.dateOfBirth !== undefined) user.dateOfBirth = new Date(updateProfileDto.dateOfBirth);
        if (updateProfileDto.username !== undefined) user.username = updateProfileDto.username;

        await this.userRepository.save(user);
        return this.mapToProfileDto(user);
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
        const user = await this.findOne(userId);

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

        // Update password
        user.password = hashedNewPassword;
        await this.userRepository.save(user);

        return { message: 'Password changed successfully' };
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        await this.userRepository.update(id, updateUserDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);

        // Delete profile and cover images
        if (user.profileImageUrl) {
            await this.cloudinaryService.deleteFile(user.profileImageUrl);
        }
        if (user.coverImageUrl) {
            await this.cloudinaryService.deleteFile(user.coverImageUrl);
        }

        await this.userRepository.delete(id);
    }

    async getAllUsers(currentUserId: string): Promise<UserProfileDto[]> {
        // Get all users except the current user, limit to 10 for suggestions
        const users = await this.userRepository.find({
            where: { id: Not(currentUserId) },
            select: ['id', 'username', 'displayName', 'bio', 'profileImageUrl', 'followersCount'],
            take: 20,
            order: { dateJoined: 'DESC' }
        });

        return users.map(user => this.mapToProfileDto(user));
    }

    async searchUsers(query: string): Promise<UserProfileDto[]> {
        // Search users by username, displayName, or bio
        const users = await this.userRepository
            .createQueryBuilder('user')
            .where('user.username ILIKE :query', { query: `%${query}%` })
            .orWhere('user.displayName ILIKE :query', { query: `%${query}%` })
            .orWhere('user.bio ILIKE :query', { query: `%${query}%` })
            .select(['user.id', 'user.username', 'user.displayName', 'user.bio', 'user.profileImageUrl', 'user.followersCount'])
            .take(10)
            .getMany();

        return users.map(user => this.mapToProfileDto(user));
    }

    private mapToProfileDto(user: User): UserProfileDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            bio: user.bio,
            location: user.location,
            website: user.website,
            dateOfBirth: user.dateOfBirth,
            profileImageUrl: user.profileImageUrl,
            coverImageUrl: user.coverImageUrl,
            dateJoined: user.dateJoined,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
        };
    }
}