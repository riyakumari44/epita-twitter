import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(private readonly configService: ConfigService) {
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadFile(file: Express.Multer.File, userId: string, type: 'profile' | 'cover'): Promise<string> {
        if (!file) {
            throw new Error('No file provided');
        }

        // Validate file type
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size too large. Maximum size is 5MB.');
        }

        try {
            // Convert buffer to base64 string
            const base64String = file.buffer.toString('base64');
            const dataURI = `data:${file.mimetype};base64,${base64String}`;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: `twitter-clone/${userId}`,
                public_id: `${type}_${Date.now()}`,
                resource_type: 'image',
                transformation: [
                    { quality: 'auto:good' }, // Optimize quality
                    { fetch_format: 'auto' }  // Auto-format (WebP if supported)
                ]
            });

            return result.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('Failed to upload image to Cloudinary');
        }
    }

    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;

        try {
            // Extract public_id from Cloudinary URL
            const urlParts = fileUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            const publicId = filename.split('.')[0]; // Remove file extension

            // Delete from Cloudinary
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Error deleting file from Cloudinary:', error);
        }
    }

    async updateFile(oldFileUrl: string, newFile: Express.Multer.File, userId: string, type: 'profile' | 'cover'): Promise<string> {
        // Delete old file first
        if (oldFileUrl) {
            await this.deleteFile(oldFileUrl);
        }

        // Upload new file
        return await this.uploadFile(newFile, userId, type);
    }
} 