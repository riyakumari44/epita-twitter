export class UserProfileDto {
    id: string;
    username: string;
    email: string;
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
    dateOfBirth?: Date;
    profileImageUrl?: string;
    coverImageUrl?: string;
    dateJoined: Date;
    followersCount: number;
    followingCount: number;
} 