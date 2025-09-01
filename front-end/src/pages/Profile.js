import React, { useState, useEffect } from 'react';
import '../styles/Profile.css';
import LogoutScreen from './LogoutScreen';
import { userAPI, tweetAPI, followAPI } from '../services/api';

const Profile = ({ user, onLogout, refreshTrigger }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [userProfile, setUserProfile] = useState(user);
  const [userTweets, setUserTweets] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: ''
  });

  // Refresh function to reload profile data
  const refreshProfileData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Get user's tweets - use "me" endpoint for current user's tweets
      const tweets = await tweetAPI.getUserTweets(user.id);
      const tweetsData = tweets?.payload?.data || tweets?.data || [];
      setUserTweets(tweetsData);
      
      // Get followers count and list
      try {
        const followersCount = await followAPI.getFollowersCount(user.id);
        const followersList = await followAPI.getFollowers(user.id);
        
        console.log('Followers count response:', followersCount);
        console.log('Followers list response:', followersList);
        
        // Handle different response structures
        const followersData = followersList?.payload?.data || followersList?.data || followersList || [];
        setFollowers(followersData);
        
        // Get following count and list  
        const followingCount = await followAPI.getFollowingCount(user.id);
        const followingList = await followAPI.getFollowing(user.id);
        
        console.log('Following count response:', followingCount);
        console.log('Following list response:', followingList);
        
        const followingData = followingList?.payload?.data || followingList?.data || followingList || [];
        setFollowing(followingData);
        
        // Update user profile with counts
        setUserProfile(prev => ({
          ...prev,
          postsCount: tweetsData?.length || 0,
          followersCount: followersCount?.payload?.data?.followersCount || followersCount?.followersCount || followersData.length || 0,
          followingCount: followingCount?.payload?.data?.followingCount || followingCount?.followingCount || followingData.length || 0
        }));
        
      } catch (followError) {
        console.error('Error fetching follow data:', followError);
        // Set counts to 0 if there's an error
        setFollowers([]);
        setFollowing([]);
        setUserProfile(prev => ({
          ...prev,
          postsCount: tweetsData?.length || 0,
          followersCount: 0,
          followingCount: 0
        }));
      }
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Load user profile data from API
  useEffect(() => {
    refreshProfileData();
  }, [user]);

  // Add effect to refresh profile when window gains focus (user returns to profile)
  useEffect(() => {
    const handleFocus = () => {
      // Refresh profile data when user returns to the page
      refreshProfileData();
    };

    const handleVisibilityChange = () => {
      // Refresh when tab becomes visible
      if (document.visibilityState === 'visible') {
        refreshProfileData();
      }
    };

    // Add event listeners
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Refresh profile data when refreshTrigger changes (when user switches to profile tab)
  useEffect(() => {
    if (refreshTrigger > 0) {
      refreshProfileData();
    }
  }, [refreshTrigger]);

  // Use real followers and following data from API

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    try {
      if (isCurrentlyFollowing) {
        await followAPI.unfollowUser(userId);
        console.log('Unfollowed user:', userId);
      } else {
        await followAPI.followUser(userId);
        console.log('Followed user:', userId);
      }
      
      // Refresh the followers/following lists after follow/unfollow
      const updatedFollowers = await followAPI.getFollowers(user.id);
      const updatedFollowing = await followAPI.getFollowing(user.id);
      setFollowers(updatedFollowers?.data || updatedFollowers || []);
      setFollowing(updatedFollowing?.data || updatedFollowing || []);
      
      // Also refresh the counts
      refreshProfileData();
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  // Delete tweet handler
  const handleDeleteTweet = async (tweetId) => {
    if (window.confirm('Are you sure you want to delete this tweet?')) {
      try {
        await tweetAPI.delete(tweetId);
        // Remove tweet from local state
        setUserTweets(prev => prev.filter(t => t.id !== tweetId));
        alert('Tweet deleted successfully');
      } catch (error) {
        console.error('Error deleting tweet:', error);
        alert('Failed to delete tweet. Please try again.');
      }
    }
  };

  const renderFollowModal = (title, users) => {
    return (
      <div className="modal-overlay" onClick={() => {
        setShowFollowersModal(false);
        setShowFollowingModal(false);
      }}>
        <div className="follow-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header-left">
              <button className="modal-close-btn" onClick={() => {
                setShowFollowersModal(false);
                setShowFollowingModal(false);
              }}>✕</button>
              <h2>{title}</h2>
            </div>
          </div>
          
          <div className="follow-list">
            {loading ? (
              <div className="follow-empty">
                <p>Loading...</p>
              </div>
            ) : !users || users.length === 0 ? (
              <div className="follow-empty">
                <p>
                  {title === 'Followers' 
                    ? 'No followers yet' 
                    : 'Not following anyone yet'
                  }
                </p>
              </div>
            ) : (
              users.map(user => (
                <div key={user.id} className="follow-item">
                  <div className="follow-item-left">
                    <div className="follow-info">
                      <div className="follow-name">{user.name || user.displayName || user.username}</div>
                      <div className="follow-handle">@{user.handle || user.username}</div>
                      <div className="follow-bio">{user.bio || 'No bio available'}</div>
                    </div>
                  </div>
                  <button 
                    className={`follow-btn ${user.isFollowing ? 'following' : 'follow'}`}
                    onClick={() => handleFollowToggle(user.id, user.isFollowing)}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleSaveProfile = () => {
    // Here you would normally send the data to your backend API
    console.log('Saving profile data:', formData);
    setShowEditModal(false);
    // Show success message or handle API response
  };

  const renderEditModalContent = () => {
    return (
      <div className="modal-form">
        <div className="modal-form-group">
          <label>Name</label>
          <input 
            type="text" 
            defaultValue={userProfile.username}
            onChange={(e) => handleInputChange('name', e.target.value)}
            maxLength="50"
          />
          <span className="char-count">{formData.name.length} / 50</span>
        </div>
        
        <div className="modal-form-group">
          <label>Bio</label>
          <textarea 
            defaultValue={userProfile.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            maxLength="160"
            rows="3"
          />
          <span className="char-count">{formData.bio.length} / 160</span>
        </div>
        
        <div className="modal-form-group">
          <label>Location</label>
          <input 
            type="text" 
            defaultValue={userProfile.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            maxLength="30"
          />
          <span className="char-count">{formData.location.length} / 30</span>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'posts':
        return (
          <div className="posts-container">
            {loading ? (
              <div className="tab-content">Loading tweets...</div>
            ) : error ? (
              <div className="tab-content">Error loading tweets: {error}</div>
            ) : userTweets.length === 0 ? (
              <div className="tab-content">No tweets yet</div>
            ) : (
              userTweets.map(tweet => (
                <div key={tweet.id} className="tweet">
                  <div className="tweet-content">
                    <div className="tweet-header">
                      <span className="tweet-author">{tweet.user?.username || 'Unknown'}</span>
                      <span className="tweet-handle">@{tweet.user?.username || 'unknown'}</span>
                      <span className="tweet-time">{new Date(tweet.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="tweet-text">
                      {tweet.content}
                    </div>
                    {tweet.mediaUrl && (
                      <div className="tweet-media">
                        <div className="media-placeholder">
                          <div className="media-content">
                            <img src={tweet.mediaUrl} alt="Tweet media" style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '16px'}} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="tweet-actions">
                      <button className="action-btn" title="Reply">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#536471">
                          <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-2.26 1.23c-.51.28-1.1.28-1.61 0l-2.26-1.23C4.307 15.68 2.751 12.96 2.751 10z"/>
                        </svg>
                        <span>{tweet.repliesCount || 0}</span>
                      </button>
                      <button className="action-btn" title="Repost">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#536471">
                          <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 6.55V16c0 1.1.9 2 2 2h13v-2H7.5V6.55l-2.068 1.93-1.364-1.46L4.5 3.88z"/>
                        </svg>
                        <span>{tweet.retweetsCount || 0}</span>
                      </button>
                      <button className="action-btn" title="Like">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#536471">
                          <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C10.084 6.01 8.627 5.41 7.405 5.5c-1.243.06-2.356.52-3.149 1.38S3 8.22 3 9.5c0 1.28.62 2.36 1.38 3.19s1.95 1.38 3.193 1.38c1.243 0 2.356-.52 3.149-1.38l.805-1.09.806 1.09c.793.86 1.906 1.38 3.149 1.38s2.356-.52 3.149-1.38S20 10.78 20 9.5s-.62-2.36-1.38-3.19S16.94 5.44 15.697 5.5z"/>
                        </svg>
                        <span>{tweet.likesCount || 0}</span>
                      </button>
                      {/* Delete button for user's own tweets */}
                      <button 
                        className="action-btn delete-btn" 
                        title="Delete"
                        onClick={() => handleDeleteTweet(tweet.id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#f4212e">
                          <path d="M16 6V4.5C16 3.12 14.88 2 13.5 2h-3C9.11 2 8 3.12 8 4.5V6H3v2h2v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8h2V6h-5zM10 4.5c0-.28.22-.5.5-.5h3c.28 0 .5.22.5.5V6h-4V4.5zM17 20H7V8h10v12z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'replies':
        return (
          <div className="posts-container">
            <div className="tab-content">No replies yet</div>
          </div>
        );
      case 'likes':
        return (
          <div className="posts-container">
            <div className="tab-content">No likes yet</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="header-controls">
          <button className="back-btn">←</button>
          <div className="header-info">
            <h1>{userProfile.username}</h1>
            <p>{userProfile.postsCount} posts</p>
          </div>
          <button className="refresh-btn" onClick={refreshProfileData} disabled={loading}>
            🔄
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="cover-image">
        <img src={userProfile.coverImage} alt="Cover" />
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        <div className="profile-details">
          <div className="profile-name-section">
            <div className="profile-name">
              <h2>{userProfile.username}</h2>
            </div>
            <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>Edit profile</button>
          </div>
          <p className="profile-handle">{userProfile.handle}</p>
          
          <div className="profile-bio">
            <p>{userProfile.bio}</p>
          </div>
          
          <div className="profile-stats">
            <span className="stat clickable" onClick={() => setShowFollowingModal(true)}>
              <strong>{userProfile.followingCount || 0}</strong> Following
            </span>
            <span className="stat clickable" onClick={() => setShowFollowersModal(true)}>
              <strong>{userProfile.followersCount || 0}</strong> Followers
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button 
          className={`tab ${activeTab === 'replies' ? 'active' : ''}`}
          onClick={() => setActiveTab('replies')}
        >
          Replies
        </button>
        <button 
          className={`tab ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          Likes
        </button>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>✕</button>
                <h2>Edit Profile</h2>
              </div>
              <button className="modal-save-btn" onClick={handleSaveProfile}>Save</button>
            </div>
            
            <div className="modal-content">
              <div className="modal-cover-section">
                <div className="modal-cover-image">
                  <img src={userProfile.coverImage} alt="Cover" />
                  <div className="cover-overlay">
                    <button className="cover-edit-btn">📷</button>
                    <button className="cover-remove-btn">✕</button>
                  </div>
                </div>
                <div className="modal-avatar-section">
                  <img src={userProfile.profileImage} alt="Profile" className="modal-avatar" />
                  <button className="avatar-edit-btn">📷</button>
                </div>
              </div>
              
              {renderEditModalContent()}
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutScreen
          onCancel={() => setShowLogoutModal(false)}
          onConfirmLogout={() => {
            setShowLogoutModal(false);
            // Here you would redirect to login page or handle logout
            console.log('User logged out successfully');
          }}
        />
      )}

      {/* Followers Modal */}
      {showFollowersModal && renderFollowModal('Followers', followers)}

      {/* Following Modal */}
      {showFollowingModal && renderFollowModal('Following', following)}
    </div>
  );
};

export default Profile;
