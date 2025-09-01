import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tweet } from '../../tweets/entities/tweet.entity';

export enum NotificationType {
    FOLLOW = 'follow',
    LIKE = 'like',
    COMMENT = 'comment',
}

export enum NotificationStatus {
    CREATED = 'created',
    READ = 'read',
    ARCHIVED = 'archived',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
    })
    type: NotificationType;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.CREATED
    })
    status: NotificationStatus;

    @Column()
    content: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'recipient_id' })
    recipient: User;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'actor_id' })
    actor: User;

    @ManyToOne(() => Tweet, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'related_tweet_id' })
    relatedTweet: Tweet;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
