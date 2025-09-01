import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
    constructor(private readonly configService: ConfigService) { }

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

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Create user-specific directory
        const userDir = path.join(uploadsDir, userId);
        if (!fs.existsSync(userDir)) {
            fs.mkdirSync(userDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname);
        const filename = `${type}_${timestamp}${fileExtension}`;
        const filePath = path.join(userDir, filename);

        // Write file to disk
        fs.writeFileSync(filePath, file.buffer);

        // Return the relative URL path
        return `/uploads/${userId}/${filename}`;
    }

    async deleteFile(fileUrl: string): Promise<void> {
        if (!fileUrl) return;

        try {
            const filePath = path.join(process.cwd(), fileUrl.replace(/^\//, ''));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }
} 