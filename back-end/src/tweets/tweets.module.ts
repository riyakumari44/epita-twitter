import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TweetsController } from './tweets.controller';
import { TweetsService } from './tweets.service';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { TweetMapper } from './mappers/tweet.mapper';
import { CloudinaryMediaService } from './services/cloudinary-media.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tweet, User]),
        ConfigModule,
    ],
    controllers: [TweetsController],
    providers: [TweetsService, TweetMapper, CloudinaryMediaService],
    exports: [TweetsService, TweetMapper, CloudinaryMediaService],
})
export class TweetsModule { } 