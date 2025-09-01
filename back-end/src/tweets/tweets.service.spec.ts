import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TweetsService } from './tweets.service';
import { Tweet, TweetType } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { CloudinaryMediaService } from './services/cloudinary-media.service';
import { BadRequestException } from '@nestjs/common';

describe('TweetsService', () => {
  let service: TweetsService;
  let tweetRepository: Repository<Tweet>;
  let userRepository: Repository<User>;
  let cloudinaryMediaService: CloudinaryMediaService;

  const mockTweetRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCloudinaryMediaService = {
    uploadMedia: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TweetsService,
        {
          provide: getRepositoryToken(Tweet),
          useValue: mockTweetRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: CloudinaryMediaService,
          useValue: mockCloudinaryMediaService,
        },
      ],
    }).compile();

    service = module.get<TweetsService>(TweetsService);
    tweetRepository = module.get<Repository<Tweet>>(getRepositoryToken(Tweet));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    cloudinaryMediaService = module.get<CloudinaryMediaService>(CloudinaryMediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTweet', () => {
    const userId = 'user-123';
    const mockFile = {
      fieldname: 'media',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test'),
      size: 1024,
    } as Express.Multer.File;

    it('should create a text-only tweet', async () => {
      const createTweetDto = { content: 'Hello, world!' };
      const mockTweet = { id: 'tweet-123', content: 'Hello, world!', type: TweetType.TEXT, userId };
      
      mockTweetRepository.create.mockReturnValue(mockTweet);
      mockTweetRepository.save.mockResolvedValue(mockTweet);

      const result = await service.createTweet(userId, createTweetDto);

      expect(result.type).toBe(TweetType.TEXT);
      expect(result.content).toBe('Hello, world!');
      expect(mockTweetRepository.create).toHaveBeenCalledWith({
        content: 'Hello, world!',
        userId,
        type: TweetType.TEXT,
      });
    });

    it('should create a media-only tweet', async () => {
      const createTweetDto = {};
      const mockTweet = { id: 'tweet-123', content: '', type: TweetType.MEDIA, userId };
      const mediaResult = { url: 'https://example.com/image.jpg', type: 'image/jpeg' };
      
      mockTweetRepository.create.mockReturnValue(mockTweet);
      mockTweetRepository.save.mockResolvedValue(mockTweet);
      mockCloudinaryMediaService.uploadMedia.mockResolvedValue(mediaResult);

      const result = await service.createTweet(userId, createTweetDto, mockFile);

      expect(result.type).toBe(TweetType.MEDIA);
      expect(result.content).toBe('');
      expect(result.mediaUrl).toBe(mediaResult.url);
      expect(result.mediaType).toBe(mediaResult.type);
    });

    it('should create a mixed tweet (text + media)', async () => {
      const createTweetDto = { content: 'Check out this image!' };
      const mockTweet = { id: 'tweet-123', content: 'Check out this image!', type: TweetType.MIXED, userId };
      const mediaResult = { url: 'https://example.com/image.jpg', type: 'image/jpeg' };
      
      mockTweetRepository.create.mockReturnValue(mockTweet);
      mockTweetRepository.save.mockResolvedValue(mockTweet);
      mockCloudinaryMediaService.uploadMedia.mockResolvedValue(mediaResult);

      const result = await service.createTweet(userId, createTweetDto, mockFile);

      expect(result.type).toBe(TweetType.MIXED);
      expect(result.content).toBe('Check out this image!');
      expect(result.mediaUrl).toBe(mediaResult.url);
      expect(result.mediaType).toBe(mediaResult.type);
    });

    it('should throw error when neither content nor media is provided', async () => {
      const createTweetDto = {};

      await expect(service.createTweet(userId, createTweetDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.createTweet(userId, createTweetDto)).rejects.toThrow(
        'Tweet must contain either text content or media'
      );
    });

    it('should handle empty content string as no content', async () => {
      const createTweetDto = { content: '   ' };

      await expect(service.createTweet(userId, createTweetDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.createTweet(userId, createTweetDto)).rejects.toThrow(
        'Tweet must contain either text content or media'
      );
    });
  });
}); 