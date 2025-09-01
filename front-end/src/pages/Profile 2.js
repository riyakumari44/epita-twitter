import React, { useState } from 'react';
import '../styles/Profile.css';
import LogoutScreen from './LogoutScreen';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Mock user data - in real app this would come from API/props
  const userProfile = {
    username: 'Sita Sharma',
    handle: '@sitasharma_np',
    bio: 'Proud Nepali 🇳🇵 | Love for mountains and momo | Digital Nepal advocate | Kathmandu ❤️ #NepalFirst',
    joinDate: 'March 2022',
    following: 287,
    followers: 456,
    postsCount: 89,
    profileImage: '/api/placeholder/120/120',
    coverImage: '/api/placeholder/600/200',
    verified: true,
    location: 'Kathmandu, Nepal',
    website: 'visitnepal.com',
    email: 'sita.sharma@gmail.com',
    phone: '+977-9841234567',
    dateOfBirth: '1995-04-15'
  };

  // Mock followers data
  const followersData = [
    {
      id: 1,
      name: 'Ramesh Thapa',
      handle: '@ramesh_thapa',
      bio: 'Software Engineer from Pokhara | Tech enthusiast',
      profileImage: '/api/placeholder/50/50',
      isFollowing: true
    },
    {
      id: 2,
      name: 'Priya Gurung',
      handle: '@priya_gurung',
      bio: 'Mountain lover | Trekking guide | Born in Solukhumbu',
      profileImage: '/api/placeholder/50/50',
      isFollowing: false
    },
    {
      id: 3,
      name: 'Bikash Shrestha',
      handle: '@bikash_stha',
      bio: 'Entrepreneur | Startup Nepal | Chitwan based',
      profileImage: '/api/placeholder/50/50',
      isFollowing: true
    },
    {
      id: 4,
      name: 'Sunita Rai',
      handle: '@sunita_rai',
      bio: 'Teacher from Dharan | Education for all',
      profileImage: '/api/placeholder/50/50',
      isFollowing: false
    },
    {
      id: 5,
      name: 'Krishna Paudel',
      handle: '@krishna_paudel',
      bio: 'Digital Marketing | Helping local businesses grow',
      profileImage: '/api/placeholder/50/50',
      isFollowing: true
    }
  ];

  // Mock following data
  const followingData = [
    {
      id: 6,
      name: 'Nepal Tourism',
      handle: '@visitnepal2020',
      bio: 'Official Nepal Tourism Board | Visit Nepal 2023',
      profileImage: '/api/placeholder/50/50',
      isFollowing: true
    },
    {
      id: 7,
      name: 'Ani Choying Dolma',
      handle: '@ani_choying',
      bio: 'Buddhist nun | Singer | Social worker',
      profileImage: '/api/placeholder/50/50',
      isFollowing: true
    },
    {
      id: 8,
      name: 'Kathmandu Post',
      handle: '@kathmandupost',
      bio: 'Leading English daily newspaper of Nepal',
      profileImage: '/api/placeholder/50/50',
      isFollowing: true
    },
    {
      id: 9,
      name: 'Paras Khadka',
      handle: '@paras_khadka',
      bio: 'Former Captain | Nepal Cricket Team',
      profileImage: '/api/placeholder/50/50',
      isFollowing: true
    },
    {
      id: 10,
      name: 'Yomari Kitchen',
      handle: '@yomari_kitchen',
      bio: 'Authentic Nepali recipes | Traditional food culture',
      profileImage: '/api/placeholder/50/50',
      isFollowing: true
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFollowToggle = (userId, isCurrentlyFollowing) => {
    // In a real app, this would make an API call
    console.log(`${isCurrentlyFollowing ? 'Unfollowing' : 'Following'} user ${userId}`);
    // Update the local state or refetch data
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
            {users.map(user => (
              <div key={user.id} className="follow-item">
                <div className="follow-item-left">
                  <img src={user.profileImage} alt={user.name} className="follow-avatar" />
                  <div className="follow-info">
                    <div className="follow-name">{user.name}</div>
                    <div className="follow-handle">{user.handle}</div>
                    <div className="follow-bio">{user.bio}</div>
                  </div>
                </div>
                <button 
                  className={`follow-btn ${user.isFollowing ? 'following' : 'follow'}`}
                  onClick={() => handleFollowToggle(user.id, user.isFollowing)}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
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
    switch(activeEditTab) {
      case 'profile':
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
            
            <div className="modal-form-group">
              <label>Website</label>
              <input 
                type="text" 
                defaultValue={userProfile.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                maxLength="100"
              />
              <span className="char-count">{formData.website.length} / 100</span>
            </div>

            <div className="modal-form-group">
              <label>Date of Birth</label>
              <input 
                type="date" 
                defaultValue={userProfile.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="modal-form">
            <div className="modal-form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                defaultValue={userProfile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <small className="form-help">This will be used for account notifications and recovery.</small>
            </div>
            
            <div className="modal-form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                defaultValue={userProfile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              <small className="form-help">For two-factor authentication and account security.</small>
            </div>
            
            <div className="modal-form-group">
              <label>Username</label>
              <input 
                type="text" 
                defaultValue={userProfile.handle.substring(1)}
                onChange={(e) => handleInputChange('username', e.target.value)}
                maxLength="15"
              />
              <span className="char-count">{(formData.username || userProfile.handle.substring(1)).length} / 15</span>
              <small className="form-help">Your username must be unique and can only contain letters, numbers, and underscores.</small>
            </div>
          </div>
        );
      
      case 'password':
        return (
          <div className="modal-form">
            <div className="modal-form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                placeholder="Enter your current password"
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              />
            </div>
            
            <div className="modal-form-group">
              <label>New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password"
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
              />
              <small className="form-help">Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.</small>
            </div>
            
            <div className="modal-form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Confirm your new password"
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
              {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <small className="error-text">Passwords do not match</small>
              )}
            </div>
          </div>
        );
      
      case 'preferences':
        return (
          <div className="modal-form">
            <div className="preferences-section">
              <h3>Privacy Settings</h3>
              <div className="preference-item">
                <label className="preference-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  Make my profile public
                </label>
                <small>Allow others to find and view your profile</small>
              </div>
              
              <div className="preference-item">
                <label className="preference-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  Allow direct messages
                </label>
                <small>Let other users send you private messages</small>
              </div>
              
              <div className="preference-item">
                <label className="preference-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Hide my follower list
                </label>
                <small>Make your followers list private</small>
              </div>
            </div>

            <div className="preferences-section">
              <h3>Notification Settings</h3>
              <div className="preference-item">
                <label className="preference-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  Email notifications
                </label>
                <small>Receive notifications via email</small>
              </div>
              
              <div className="preference-item">
                <label className="preference-label">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark"></span>
                  Push notifications
                </label>
                <small>Receive push notifications on your device</small>
              </div>
              
              <div className="preference-item">
                <label className="preference-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Marketing communications
                </label>
                <small>Receive updates about new features and promotions</small>
              </div>
            </div>

            <div className="preferences-section">
              <h3>Display Settings</h3>
              <div className="preference-item">
                <label>Theme Preference</label>
                <select className="preference-select">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div className="preference-item">
                <label>Language</label>
                <select className="preference-select">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div className="preferences-section danger-zone">
              <h3>Account Actions</h3>
              <button className="danger-btn">Deactivate Account</button>
              <small>Temporarily disable your account. You can reactivate it anytime.</small>
              
              <button className="danger-btn delete-btn">Delete Account</button>
              <small>Permanently delete your account and all associated data. This action cannot be undone.</small>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const posts = [
    {
      id: 1,
      content: "Just had the most amazing dal bhat at a local restaurant in Thamel! Nothing beats authentic Nepali food 🍛 The mountains make everything taste better! #NepalFood #DalBhat #Kathmandu",
      timestamp: "Nov 7, 2024",
      likes: 23,
      retweets: 8,
      replies: 5,
      hasImage: true,
      imageUrl: '/api/placeholder/500/300'
    },
    {
      id: 2,
      content: "Sunrise view from Sarangkot this morning was absolutely breathtaking! 🏔️ Machapuchare peak looked like it was painted by gods. Nepal's natural beauty never fails to amaze me. #Pokhara #Nepal #Mountains",
      timestamp: "Nov 6, 2024",
      likes: 67,
      retweets: 24,
      replies: 12,
      hasImage: false
    },
    {
      id: 3,
      content: "Proud to see young Nepali entrepreneurs building amazing tech startups! 🇳🇵 Our country has so much talent. Let's support local innovation and make Digital Nepal a reality! #DigitalNepal #Startup",
      timestamp: "Nov 5, 2024",
      likes: 45,
      retweets: 18,
      replies: 9,
      hasImage: false
    },
    {
      id: 4,
      content: "Festival season is here! Preparing for Tihar celebrations 🪔 Time to make sel roti and decorate the house. Looking forward to celebrating with family and friends! #Tihar #NepalFestival",
      timestamp: "Nov 4, 2024",
      likes: 34,
      retweets: 15,
      replies: 7,
      hasImage: false
    }
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'posts':
        return (
          <div className="posts-container">
            {posts.map(post => (
              <div key={post.id} className="post">
                <div className="post-header">
                  <img src={userProfile.profileImage} alt="Profile" className="post-avatar" />
                  <div className="post-info">
                    <div className="post-user">
                      <span className="post-username">{userProfile.username}</span>
                      <span className="post-handle">{userProfile.handle}</span>
                      <span className="post-time">· {post.timestamp}</span>
                    </div>
                  </div>
                  <button className="post-menu">⋯</button>
                </div>
                
                <div className="post-content">
                  <p>{post.content}</p>
                  {post.hasImage && (
                    <div className="post-image">
                      <img src={post.imageUrl} alt="Post content" />
                    </div>
                  )}
                </div>
                
                <div className="post-actions">
                  <button className="action-btn reply-btn">
                    <span className="icon">💬</span>
                    <span>{post.replies}</span>
                  </button>
                  <button className="action-btn retweet-btn">
                    <span className="icon">🔄</span>
                    <span>{post.retweets}</span>
                  </button>
                  <button className="action-btn like-btn">
                    <span className="icon">❤️</span>
                    <span>{post.likes}</span>
                  </button>
                  <button className="action-btn share-btn">
                    <span className="icon">📤</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'replies':
        return <div className="tab-content">No replies yet</div>;
      case 'likes':
        return <div className="tab-content">No likes yet</div>;
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
          <button 
            className="logout-header-btn" 
            onClick={() => setShowLogoutModal(true)}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Cover Image */}
      <div className="cover-image">
        <img src={userProfile.coverImage} alt="Cover" />
      </div>

      {/* Profile Info */}
      <div className="profile-info">
        <div className="profile-avatar-container">
          <img src={userProfile.profileImage} alt="Profile" className="profile-avatar" />
          <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>Edit profile</button>
        </div>
        
        <div className="profile-details">
          <div className="profile-name">
            <h2>{userProfile.username}</h2>
          </div>
          <p className="profile-handle">{userProfile.handle}</p>
          
          <div className="profile-bio">
            <p>{userProfile.bio}</p>
          </div>
          
          <div className="profile-meta">
            <span className="join-date">📅 Joined {userProfile.joinDate}</span>
          </div>
          
          <div className="profile-stats">
            <span className="stat clickable" onClick={() => setShowFollowingModal(true)}>
              <strong>{userProfile.following}</strong> Following
            </span>
            <span className="stat clickable" onClick={() => setShowFollowersModal(true)}>
              <strong>{userProfile.followers}</strong> Followers
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
                <h2>Profile Settings</h2>
              </div>
              <button className="modal-save-btn" onClick={handleSaveProfile}>Save</button>
            </div>
            
            {/* Modal Navigation Tabs */}
            <div className="modal-tabs">
              <button 
                className={`modal-tab ${activeEditTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveEditTab('profile')}
              >
                Profile
              </button>
              <button 
                className={`modal-tab ${activeEditTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveEditTab('contact')}
              >
                Contact
              </button>
              <button 
                className={`modal-tab ${activeEditTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveEditTab('password')}
              >
                Password
              </button>
              <button 
                className={`modal-tab ${activeEditTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveEditTab('preferences')}
              >
                Preferences
              </button>
            </div>
            
            <div className="modal-content">
              {activeEditTab === 'profile' && (
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
              )}
              
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
      {showFollowersModal && renderFollowModal('Followers', followersData)}

      {/* Following Modal */}
      {showFollowingModal && renderFollowModal('Following', followingData)}
    </div>
  );
};

export default Profile;
