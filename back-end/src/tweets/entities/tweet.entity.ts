import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TweetType {
    TEXT = 'text',
    MEDIA = 'media',
    MIXED = 'mixed'
}

@Entity('tweets')
export class Tweet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', nullable: false })
    content: string;

    @Column({ type: 'varchar', nullable: true })
    mediaUrl: string;

    @Column({ type: 'varchar', nullable: true })
    mediaType: string;

    @Column({
        type: 'enum',
        enum: TweetType,
        default: TweetType.TEXT
    })
    type: TweetType;

    @Column({ type: 'uuid', nullable: false })
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'int', default: 0 })
    likesCount: number;

    @Column({ type: 'int', default: 0 })
    retweetsCount: number;

    @Column({ type: 'int', default: 0 })
    repliesCount: number;
} 