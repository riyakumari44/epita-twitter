import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryMediaService {
    constructor(private readonly configService: ConfigService) {
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadMedia(file: Express.Multer.File, userId: string, tweetId: string): Promise<{ url: string; type: string }> {
        if (!file) {
            throw new Error('No media file provided');
        }

        // Validate file type
        const allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov', 'video/wmv'
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, AVI, MOV, WMV) are allowed.');
        }

        // Validate file size (max 10MB for media)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('File size too large. Maximum size is 10MB.');
        }

        try {
            // Convert buffer to base64 string
            const base64String = file.buffer.toString('base64');
            const dataURI = `data:${file.mimetype};base64,${base64String}`;

            // Determine resource type
            const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'video';

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: `twitter-clone/${userId}/tweets/${tweetId}`,
                public_id: `media_${Date.now()}`,
                resource_type: resourceType,
                transformation: resourceType === 'image' ? [
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' }
                ] : undefined,
                // Video specific options
                ...(resourceType === 'video' && {
                    chunk_size: 6000000, // 6MB chunks
                    eager: [
                        { width: 300, height: 300, crop: 'pad', audio_codec: 'none' },
                        { width: 300, height: 300, crop: 'crop', gravity: 'south', y: 0, audio_codec: 'none' }
                    ]
                })
            });

            return {
                url: result.secure_url,
                type: resourceType
            };
        } catch (error) {
            console.error('Cloudinary media upload error:', error);
            throw new Error('Failed to upload media to Cloudinary');
        }
    }

    async deleteMedia(mediaUrl: string): Promise<void> {
        if (!mediaUrl) return;

        try {
            // Extract public_id from Cloudinary URL
            const urlParts = mediaUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            const publicId = filename.split('.')[0]; // Remove file extension

            // Delete from Cloudinary
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Error deleting media from Cloudinary:', error);
        }
    }
} 