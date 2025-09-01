import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetweetsService } from './retweets.service';
import { Retweet } from './entities/retweet.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { CreateRetweetDto } from './dto/create-retweet.dto';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('RetweetsService', () => {
    let service: RetweetsService;
    let retweetsRepository: Repository<Retweet>;
    let tweetsRepository: Repository<Tweet>;
    let usersRepository: Repository<User>;

    const mockRetweetsRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        count: jest.fn(),
        remove: jest.fn(),
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
                RetweetsService,
                {
                    provide: getRepositoryToken(Retweet),
                    useValue: mockRetweetsRepository,
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

        service = module.get<RetweetsService>(RetweetsService);
        retweetsRepository = module.get<Repository<Retweet>>(getRepositoryToken(Retweet));
        tweetsRepository = module.get<Repository<Tweet>>(getRepositoryToken(Tweet));
        usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createRetweet', () => {
        it('should create a simple retweet successfully', async () => {
            const createRetweetDto: CreateRetweetDto = {
                tweet_id: 'tweet-uuid',
            };
            const userId = 'user-uuid';

            const mockTweet = { id: 'tweet-uuid' };
            const mockUser = { id: 'user-uuid' };
            const mockRetweet = {
                id: 'retweet-uuid',
                tweet_id: 'tweet-uuid',
                user_id: 'user-uuid',
                comment: null,
                created_at: new Date(),
            };

            mockTweetsRepository.findOne.mockResolvedValue(mockTweet);
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockRetweetsRepository.findOne.mockResolvedValue(null); // No existing retweet
            mockRetweetsRepository.create.mockReturnValue(mockRetweet);
            mockRetweetsRepository.save.mockResolvedValue(mockRetweet);

            const result = await service.createRetweet(createRetweetDto, userId);

            expect(result).toEqual({
                id: mockRetweet.id,
                tweet_id: mockRetweet.tweet_id,
                user_id: mockRetweet.user_id,
                comment: mockRetweet.comment,
                created_at: mockRetweet.created_at,
            });
            expect(mockTweetsRepository.increment).toHaveBeenCalledWith(
                { id: createRetweetDto.tweet_id },
                'retweetsCount',
                1
            );
        });

        it('should create a quote retweet successfully', async () => {
            const createRetweetDto: CreateRetweetDto = {
                tweet_id: 'tweet-uuid',
                comment: 'This is a great tweet!',
            };
            const userId = 'user-uuid';

            const mockTweet = { id: 'tweet-uuid' };
            const mockUser = { id: 'user-uuid' };
            const mockRetweet = {
                id: 'retweet-uuid',
                tweet_id: 'tweet-uuid',
                user_id: 'user-uuid',
                comment: 'This is a great tweet!',
                created_at: new Date(),
            };

            mockTweetsRepository.findOne.mockResolvedValue(mockTweet);
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockRetweetsRepository.create.mockReturnValue(mockRetweet);
            mockRetweetsRepository.save.mockResolvedValue(mockRetweet);

            const result = await service.createRetweet(createRetweetDto, userId);

            expect(result.comment).toBe('This is a great tweet!');
        });

        it('should throw NotFoundException when tweet does not exist', async () => {
            const createRetweetDto: CreateRetweetDto = {
                tweet_id: 'non-existent-tweet',
            };
            const userId = 'user-uuid';

            mockTweetsRepository.findOne.mockResolvedValue(null);

            await expect(service.createRetweet(createRetweetDto, userId)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw ConflictException when user already retweeted without comment', async () => {
            const createRetweetDto: CreateRetweetDto = {
                tweet_id: 'tweet-uuid',
            };
            const userId = 'user-uuid';

            const mockTweet = { id: 'tweet-uuid' };
            const mockUser = { id: 'user-uuid' };
            const existingRetweet = { id: 'existing-retweet' };

            mockTweetsRepository.findOne.mockResolvedValue(mockTweet);
            mockUsersRepository.findOne.mockResolvedValue(mockUser);
            mockRetweetsRepository.findOne.mockResolvedValue(existingRetweet);

            await expect(service.createRetweet(createRetweetDto, userId)).rejects.toThrow(
                ConflictException
            );
        });
    });

    describe('getRetweetCount', () => {
        it('should return correct retweet count', async () => {
            const tweetId = 'tweet-uuid';
            const mockTweet = { id: 'tweet-uuid' };

            mockTweetsRepository.findOne.mockResolvedValue(mockTweet);
            mockRetweetsRepository.count.mockResolvedValue(5);

            const result = await service.getRetweetCount(tweetId);

            expect(result).toEqual({
                tweet_id: tweetId,
                retweet_count: 5,
            });
        });
    });

    describe('deleteRetweet', () => {
        it('should delete retweet successfully', async () => {
            const retweetId = 'retweet-uuid';
            const userId = 'user-uuid';
            const mockRetweet = {
                id: 'retweet-uuid',
                tweet_id: 'tweet-uuid',
                user_id: 'user-uuid',
            };

            mockRetweetsRepository.findOne.mockResolvedValue(mockRetweet);

            await service.deleteRetweet(retweetId, userId);

            expect(mockRetweetsRepository.remove).toHaveBeenCalledWith(mockRetweet);
            expect(mockTweetsRepository.increment).toHaveBeenCalledWith(
                { id: 'tweet-uuid' },
                'retweetsCount',
                -1
            );
        });

        it('should throw BadRequestException when user tries to delete another user\'s retweet', async () => {
            const retweetId = 'retweet-uuid';
            const userId = 'user-uuid';
            const mockRetweet = {
                id: 'retweet-uuid',
                tweet_id: 'tweet-uuid',
                user_id: 'different-user-uuid',
            };

            mockRetweetsRepository.findOne.mockResolvedValue(mockRetweet);

            await expect(service.deleteRetweet(retweetId, userId)).rejects.toThrow(
                BadRequestException
            );
        });
    });
}); 