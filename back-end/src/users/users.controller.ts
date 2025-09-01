import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    Request,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Query
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Get logged-in user's full profile
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getMyProfile(@Request() req): Promise<UserProfileDto> {
        return this.usersService.getMyProfile(req.user.id);
    }

    // Update logged-in user's profile (text only)
    @Put('me')
    @UseGuards(JwtAuthGuard)
    async updateMyProfile(
        @Request() req,
        @Body() updateProfileDto: UpdateProfileDto
    ): Promise<UserProfileDto> {
        return this.usersService.updateProfile(req.user.id, updateProfileDto);
    }

    // Update logged-in user's profile with images
    @Put('me/upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'profileImage', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]))
    async updateMyProfileWithImages(
        @Request() req,
        @Body() updateProfileDto: UpdateProfileDto,
        @UploadedFiles() files: { profileImage?: Express.Multer.File[], coverImage?: Express.Multer.File[] }
    ): Promise<UserProfileDto> {
        const fileMap = {
            profileImage: files?.profileImage?.[0],
            coverImage: files?.coverImage?.[0]
        };

        return this.usersService.updateProfile(req.user.id, updateProfileDto, fileMap);
    }

    // Change password endpoint
    @Post('me/change-password')
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @Request() req,
        @Body() changePasswordDto: ChangePasswordDto
    ): Promise<{ message: string }> {
        return this.usersService.changePassword(req.user.id, changePasswordDto);
    }

    // Get public profile of any user
    @Get('profile/:userId')
    async getPublicProfile(@Param('userId') userId: string): Promise<UserProfileDto> {
        return this.usersService.getPublicProfile(userId);
    }

    // Get all users (for suggestions)
    @Get()
    @UseGuards(JwtAuthGuard)
    async getAllUsers(@Request() req) {
        return this.usersService.getAllUsers(req.user.id);
    }

    // Search users by username or email
    @Get('search')
    @UseGuards(JwtAuthGuard)
    async searchUsers(@Request() req, @Query('q') query: string) {
        if (!query || query.trim() === '') {
            return [];
        }
        return this.usersService.searchUsers(query.trim());
    }

    // // Get follower count
    // @Get('profile/:userId/followersCount')
    // async getFollowersCount(@Param('userId') userId: string): Promise<{ followersCount: number }> {
    //     return this.usersService.getFollowersCount(userId);
    // }

    // // Get following count
    // @Get('profile/:userId/followingCount')
    // async getFollowingCount(@Param('userId') userId: string): Promise<{ followingCount: number }> {
    //     return this.usersService.getFollowingCount(userId);
    // }

    // Legacy endpoints (keeping for backward compatibility)
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}