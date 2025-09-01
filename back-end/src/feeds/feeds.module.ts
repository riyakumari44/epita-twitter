import { Module } from '@nestjs/common';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from '../tweets/entities/tweet.entity';
import { Follow } from '../follows/entities/follow.entity';
import { TweetsModule } from '../tweets/tweets.module';
import { FollowsModule } from '../follows/follows.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tweet, Follow]),
        TweetsModule,
        FollowsModule,
    ],
    controllers: [FeedsController],
    providers: [FeedsService],
    exports: [FeedsService],
})
export class FeedsModule { }
