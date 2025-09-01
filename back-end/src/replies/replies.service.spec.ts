import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RepliesService } from './replies.service';
import { Reply } from './entities/reply.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { CreateReplyDto } from './dto/create-reply.dto';
import { NotFoundException } from '@nestjs/common';

describe('RepliesService', () => {
    let service: RepliesService;
    let repliesRepository: Repository<Reply>;
    let tweetsRepository: Repository<Tweet>;
    let usersRepository: Repository<User>;

    const mockRepliesRepository = {
        create: jest.fn(),
        save: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockTweetsRepository = {
        findOne: jest.fn(),
        increment: jest.fn(),
    };

    const mockUsersRepository = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RepliesService,
                {
                    provide: getRepositoryToken(Reply),
                    useValue: mockRepliesRepository,
                },
                {
                    provide: getRepositoryToken(Tweet),
                    useValue: mockTweetsRepository,
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
            ],
        }).compile();

        service = module.get<RepliesService>(RepliesService);
        repliesRepository = module.get<Repository<Reply>>(getRepositoryToken(Reply));
        tweetsRepository = module.get<Repository<Tweet>>(getRepositoryToken(Tweet));
        usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createReply', () => {
        it('should create a reply successfully', async () => {
            const createReplyDto: CreateReplyDto = {
                reply_text: 'Test reply',
                tweet_id: 'tweet-uuid',
            };
            const userId = 'user-uuid';

            const mockTweet = { id: 'tweet-uuid' };
            const mockUser = { id: 'user-uuid' };
            const mockReply = {
                reply_id: 'reply-uuid',
                timestamp: new Date(),
            };

            mockTweetsRepository.findOne.mockResolvedValue(mockTweet);
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockRepliesRepository.create.mockReturnValue(mockReply);
            mockRepliesRepository.save.mockResolvedValue(mockReply);

            const result = await service.createReply(createReplyDto, userId);

            expect(result).toEqual({
                reply_id: mockReply.reply_id,
                timestamp: mockReply.timestamp,
            });
            expect(mockTweetsRepository.increment).toHaveBeenCalledWith(
                { id: createReplyDto.tweet_id },
                'repliesCount',
                1
            );
        });

        it('should throw NotFoundException when tweet does not exist', async () => {
            const createReplyDto: CreateReplyDto = {
                reply_text: 'Test reply',
                tweet_id: 'non-existent-tweet',
            };
            const userId = 'user-uuid';

            mockTweetsRepository.findOne.mockResolvedValue(null);

            await expect(service.createReply(createReplyDto, userId)).rejects.toThrow(
                NotFoundException
            );
        });
    });
}); 