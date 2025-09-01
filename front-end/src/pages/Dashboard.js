import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { userAPI, tweetAPI, feedAPI, notificationAPI, followAPI, pollAPI } from '../services/api';
import { FormattedTweetText, extractHashtags, extractMentions } from '../utils/textFormatter';
import Profile from './Profile';
import Settings from './Settings';
import LogoutScreen from './LogoutScreen';
import NotificationManager from '../utils/notifications';

// Page Components
const HomePage = ({ 
  user, 
  filteredPosts,
  postContent,
  setPostContent,
  showPoll,
  setShowPoll,
  pollQuestion,
  setPollQuestion,
  pollOptions,
  setPollOptions,
  selectedImage,
  imagePreview,
  showEmojiPicker,
  setShowEmojiPicker,
  selectedLocation,
  handleImageUpload,
  handlePost,
  handlePollOptionChange,
  handleAddPollOption,
  handleRemovePollOption,
  handleEmojiClick,
  handleLocationClick,
  isPollValid,
  setSelectedImage,
  setImagePreview,
  setSelectedLocation,
  isPostButtonDisabled,
  loading,
  error,
  likedTweets,
  likeCounts,
  likingTweets,
  handleLike,
  handleReply,
  handleRetweet,
  handleViewTweet,
  tweets,
  userProfile,
  setTweetsLoading,
  loadFeedData,
  handleSearch,
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState('for-you');

  // Handle tab changes and notify parent
  const handleTabChange = (newTab) => {
    console.log('🔀 HomePage tab changed to:', newTab);
    setActiveTab(newTab);
    if (onTabChange) {
      console.log('📞 Calling onTabChange callback with:', newTab);
      onTabChange(newTab);
    } else {
      console.warn('⚠️ No onTabChange callback provided!');
    }
  };

  // Enhanced emoji list with more categories
  const commonEmojis = [
    // Faces & Smileys
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    // Hearts & Love
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '�',
    '💖', '💗', '💘', '💝', '💞', '💟',
    // Hand Gestures
    '�👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏',
    '🙌', '👐', '🤲', '🤜', '🤛', '✊', '👊', '👎',
    // Objects & Activities
    '🎉', '🎊', '🎈', '🎂', '🎁', '🎀', '🎃', '🎄', '🎆', '🎇',
    '✨', '🎯', '🎮', '🎲', '🎸', '🎵', '🎶', '🎤', '🎧', '�',
    '💻', '🖥️', '⌚', '📷', '📸', '�🔥', '�', '⭐', '🌟', '�'
  ];

  return (
    <div className="home-page">
      {/* Navigation Tabs */}
      <div className="home-navigation">
        <button 
          className={`nav-tab ${activeTab === 'for-you' ? 'active' : ''}`}
          onClick={() => handleTabChange('for-you')}
        >
          For you
        </button>
        <button 
          className={`nav-tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => handleTabChange('following')}
        >
          Following
        </button>
      </div>

      {/* Post Composer */}
      <div className="post-composer">
        <div className="composer-header">
          <div className="user-avatar">
            <div className="avatar-placeholder">
              {user?.username?.substring(0, 2).toUpperCase() || 'My'}
            </div>
          </div>
          <div className="composer-content">
            <textarea
              className="post-input"
              placeholder="What's happening?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows="3"
            />

            {/* Poll Creator  */}
            {showPoll && (
              <div className="poll-creator" style={{border: '1px solid #e1e8ed', borderRadius: 8, padding: 12, marginBottom: 8}}>
                <input
                  type="text"
                  className="poll-question-input"
                  placeholder="Poll question"
                  value={pollQuestion}
                  onChange={e => setPollQuestion(e.target.value)}
                  style={{width: '100%', marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc'}}
                />
                {pollOptions.map((opt, idx) => (
                  <div key={idx} style={{display: 'flex', alignItems: 'center', marginBottom: 6}}>
                    <input
                      type="text"
                      className="poll-option-input"
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={e => handlePollOptionChange(idx, e.target.value)}
                      style={{flex: 1, padding: 6, borderRadius: 4, border: '1px solid #ccc'}}
                    />
                    {pollOptions.length > 2 && (
                      <button type="button" style={{marginLeft: 6}} onClick={() => handleRemovePollOption(idx)}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6}}>
                  <button type="button" onClick={handleAddPollOption} disabled={pollOptions.length >= 4}>
                    + Add Option
                  </button>
                  <button type="button" onClick={() => { setShowPoll(false); setPollQuestion(''); setPollOptions(['', '']); }}>
                    Remove Poll
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button 
                  className="remove-image"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    // Reset file input
                    const fileInputs = document.querySelectorAll('input[type="file"]');
                    fileInputs.forEach(input => input.value = '');
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Location Display */}
            {selectedLocation && (
              <div className="location-display">
                📍 {selectedLocation.name || `Location: ${selectedLocation.latitude?.toFixed(4)}, ${selectedLocation.longitude?.toFixed(4)}`}
                <button 
                  className="remove-location"
                  onClick={() => setSelectedLocation(null)}
                >
                  ×
                </button>
              </div>
            )}

            {/* Post Actions */}
            <div className="post-actions">
              <div className="action-buttons">
                                  <label className="action-button" title="Image">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#7371FC">
                      <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3-3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"/>
                    </svg>
                  </label>
                  
                  <button 
                    className="action-button" 
                    title="Emoji"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#7371FC">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                    </svg>
                  </button>

                  <button 
                    className="action-button" 
                    title="Poll"
                    onClick={() => setShowPoll(!showPoll)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#7371FC">
                      <path d="M20.222 9.16h-1.334c.015-.09.028-.182.028-.274 0-2.558-2.08-4.638-4.639-4.638-2.558 0-4.637 2.08-4.637 4.638 0 .092.013.184.028.274H8.333c-.982 0-1.778.797-1.778 1.778v2.444c0 .982.796 1.778 1.778 1.778h1.334c-.015.09-.028.182-.028.274 0 2.558 2.079 4.638 4.637 4.638 2.559 0 4.639-2.08 4.639-4.638 0-.092-.013-.184-.028-.274h1.334c.982 0 1.778-.796 1.778-1.778v-2.444c0-.981-.796-1.778-1.778-1.778zM7.667 12.5v-1.334h11.666V12.5H7.667zm2.223-2.223v-.555c0-1.639 1.332-2.97 2.972-2.97s2.971 1.331 2.971 2.97v.555H9.89zm4.195 7.5c-1.64 0-2.972-1.332-2.972-2.971v-.555h5.943v.555c0 1.639-1.331 2.971-2.971 2.971z"/>
                    </svg>
                  </button>
                  
                  <button 
                    className="action-button" 
                    title="Location"
                    onClick={handleLocationClick}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#7371FC">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </button>
              </div>
              
              <button 
                className={`post-button ${isPostButtonDisabled ? 'disabled' : ''}`}
                onClick={handlePost}
                disabled={isPostButtonDisabled}
              >
                Post
              </button>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="emoji-picker">
                <div className="emoji-picker-header">
                  <span>Emojis</span>
                  <button 
                    className="emoji-picker-close"
                    onClick={() => setShowEmojiPicker(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="emoji-grid">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="emoji-button"
                      onClick={() => handleEmojiClick(emoji)}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Feed */}
       <div className="feed">
         <div className="feed-header">
           <span className="show-posts-link">
             {loading ? 'Loading...' : filteredPosts.length > 0 ? `${filteredPosts.length} posts` : 'No posts found'}
           </span>
         </div>
         
         {error && (
           <div className="error-message" style={{padding: '16px', color: '#d93025', backgroundColor: '#fce8e6', borderRadius: '8px', margin: '16px'}}>
             {error}
             {error.includes('session has expired') && (
               <button 
                 onClick={() => window.location.reload()}
                 style={{
                   marginLeft: '12px', 
                   padding: '8px 16px', 
                   backgroundColor: '#7371FC', 
                   color: 'white', 
                   border: 'none', 
                   borderRadius: '4px', 
                   cursor: 'pointer'
                 }}
               >
                 Refresh Page
               </button>
             )}
           </div>
         )}
         
         <div className="tweets-container">
           {loading ? (
             <div className="loading-state" style={{padding: '20px', textAlign: 'center'}}>
               Loading tweets...
             </div>
           ) : filteredPosts.length > 0 ? (
             filteredPosts.map(tweet => (
               <div key={tweet.id} className="tweet">
                 <div className="tweet-avatar">
                   <div className="avatar-placeholder">
                     {tweet.user?.username?.substring(0, 2).toUpperCase() || 'U'}
                   </div>
                 </div>
                 <div className="tweet-content">
                   <div className="tweet-header">
                     <span className="tweet-author">{tweet.user?.username || 'Unknown'}</span>
                     {tweet.user?.verified && (
                       <svg className="verified-badge" width="16" height="16" viewBox="0 0 24 24" fill="#1d9bf0">
                         <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                       </svg>
                     )}
                     <span className="tweet-handle">@{tweet.user?.username || 'unknown'}</span>
                     <span className="tweet-time">
                       {tweet.createdAt ? new Date(tweet.createdAt).toLocaleDateString() : 'now'}
                     </span>
                   </div>
                   <div className="tweet-text">
                     <FormattedTweetText text={tweet.content || ''} />
                   </div>
                   {tweet.poll && (
                     <div className="tweet-poll">
                       <h4>{tweet.poll.question}</h4>
                       {tweet.poll.options?.map((option, index) => (
                         <div key={index} className="poll-option">
                           <button className="poll-vote-btn">
                             {option.text || option}
                           </button>
                         </div>
                       ))}
                     </div>
                   )}
                   <div className="tweet-actions">
                     <button 
                       className="action-btn" 
                       title="Reply"
                       onClick={() => handleReply(tweet.id)}
                     >
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="#536471">
                         <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-2.26 1.23c-.51.28-1.1.28-1.61 0l-2.26-1.23C4.307 15.68 2.751 12.96 2.751 10z"/>
                       </svg>
                       <span>{tweet.repliesCount || 0}</span>
                     </button>
                     <button 
                       className="action-btn" 
                       title="Repost"
                       onClick={() => handleRetweet(tweet.id)}
                     >
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="#536471">
                         <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 6.55V16c0 1.1.9 2 2 2h13v-2H7.5V6.55l-2.068 1.93-1.364-1.46L4.5 3.88z"/>
                       </svg>
                       <span>{tweet.retweetsCount || 0}</span>
                     </button>
                     <button 
                       className={`action-btn ${likedTweets.has(tweet.id) ? 'liked' : ''}`} 
                       title={likedTweets.has(tweet.id) ? 'Unlike' : 'Like'}
                       onClick={() => handleLike(tweet.id)}
                       disabled={likingTweets.has(tweet.id)}
                     >
                       <svg width="18" height="18" viewBox="0 0 24 24" fill={likedTweets.has(tweet.id) ? "#f91880" : "#536471"}>
                         <path d={likedTweets.has(tweet.id) 
                           ? "M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"
                           : "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C10.084 6.01 8.627 5.41 7.405 5.5c-1.243.06-2.356.52-3.149 1.38S3 8.22 3 9.5c0 1.28.62 2.36 1.38 3.19s1.95 1.38 3.193 1.38c1.243 0 2.356-.52 3.149-1.38l.805-1.09.806 1.09c.793.86 1.906 1.38 3.149 1.38s2.356-.52 3.149-1.38S20 10.78 20 9.5s-.62-2.36-1.38-3.19S16.94 5.44 15.697 5.5z"
                         } />
                       </svg>
                       <span>{likeCounts[tweet.id] ?? tweet.likesCount ?? 0}</span>
                     </button>
                     <button 
                       className="action-btn" 
                       title="View"
                       onClick={() => handleViewTweet(tweet.id)}
                     >
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="#536471">
                         <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
                       </svg>
                       <span>{tweet.viewsCount || 0}</span>
                     </button>
                   </div>
                 </div>
               </div>
             ))
           ) : (
             <div className="no-posts">
               <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style={{marginBottom: '16px', opacity: 0.6}}>
                 <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"/>
               </svg>
               <p className="welcome-message">
                 {error ? error : 'Welcome to Twitter! This is where you\'ll see tweets from people you follow. Start by creating your first tweet above!'}
               </p>
               {/* Debug info */}
               <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #e1e8ed', borderRadius: '8px', fontSize: '14px'}}>
                 <strong>Debug Info:</strong><br/>
                 • Tweets loaded: {tweets.length}<br/>
                 • Filtered posts: {filteredPosts.length}<br/>
                 • Loading: {loading ? 'Yes' : 'No'}<br/>
                 • Auth token: {localStorage.getItem('token') ? 'Present' : 'Missing'}<br/>
                 • User profile: {userProfile ? 'Loaded' : 'Not loaded'}<br/>
                 {error && <span style={{color: 'red'}}>• Error: {error}</span>}
                 <br/><br/>
                 <button 
                   onClick={() => {
                     console.log('🧪 Manual feed reload triggered');
                     setTweetsLoading(true);
                     loadFeedData('for-you').catch(console.error);
                   }}
                   style={{
                     padding: '8px 16px',
                     backgroundColor: '#1d9bf0',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     marginRight: '10px'
                   }}
                 >
                   🔄 Reload Feed
                 </button>
                 <button 
                   onClick={() => {
                     console.log('🧪 Current states:');
                     console.log('User:', user);
                     console.log('UserProfile:', userProfile);
                     console.log('Tweets:', tweets);
                     console.log('FilteredPosts:', filteredPosts);
                     console.log('ActiveTab:', activeTab);
                     console.log('Token:', localStorage.getItem('token')?.substring(0, 50) + '...');
                   }}
                   style={{
                     padding: '8px 16px',
                     backgroundColor: '#657786',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     cursor: 'pointer',
                     marginRight: '10px'
                   }}
                 >
                   📊 Debug Info
                 </button>
                 <button 
                   onClick={async () => {
                     console.log('🧪 Testing search with "ash"');
                     await handleSearch('ash');
                   }}
                   style={{
                     padding: '8px 16px',
                     backgroundColor: '#17bf63',
                     color: 'white',
                     border: 'none',
                     borderRadius: '6px',
                     cursor: 'pointer'
                   }}
                 >
                   🔍 Test Search
                 </button>
               </div>
             </div>
           )}
         </div>
       </div>
    </div>
  );
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationAPI.getAll();
        // Handle the backend response structure - check if it has payload property
        const notificationsData = response?.payload || response || [];
        setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setError('Failed to load notifications');
        setNotifications([]); // Ensure notifications is always an array
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadNotifications();
    
    // Set up polling for real-time notifications (every 30 seconds)
    const notificationPolling = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(notificationPolling);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      // Update local state to mark as read
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return (
    <div className="page-content">
      <div className="feed-header">
        <h2>Notifications</h2>
        <div className="notification-actions">
          {Array.isArray(notifications) && notifications.some(n => !n.isRead) && (
            <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
          <button className="notification-settings-btn" title="Notification Settings">
            ⚙️
          </button>
        </div>
      </div>
      <div className="notifications-content">
        {loading && <div className="loading">Loading notifications...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && Array.isArray(notifications) && notifications.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>When someone likes, retweets, or mentions you, you'll see it here.</p>
          </div>
        )}
        {!loading && !error && Array.isArray(notifications) && notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
          >
            <div className="notification-icon">
              {notification.type === 'like' && '❤️'}
              {notification.type === 'retweet' && '🔁'}
              {notification.type === 'follow' && '👤'}
              {notification.type === 'mention' && '💬'}
              {notification.type === 'reply' && '↩️'}
            </div>
            <div className="notification-avatar">
              <img 
                src={notification.fromUser?.profileImage || '/api/placeholder/40/40'} 
                alt={notification.fromUser?.name || 'User'} 
              />
            </div>
            <div className="notification-content">
              <div className="notification-text">
                <strong>{notification.fromUser?.name || 'Someone'}</strong> {notification.message}
              </div>
              {notification.tweetContent && (
                <div className="notification-tweet-preview">
                  "{notification.tweetContent}"
                </div>
              )}
            </div>
            <div className="notification-meta">
              <div className="notification-time">
                {formatTimeAgo(notification.createdAt)}
              </div>
              {!notification.isRead && <div className="unread-dot"></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }) => {
  console.log('🚀 Dashboard component mounted with user:', user);
  console.log('🚀 Token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
  
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showTweetModal, setShowTweetModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  // Real data states
  const [tweets, setTweets] = useState([]);
  const [users, setUsers] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [error, setError] = useState('');

  // Post composer states
  const [postContent, setPostContent] = useState('');
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Like states
  const [likedTweets, setLikedTweets] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});
  const [likingTweets, setLikingTweets] = useState(new Set());

  // Suggested users states
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [loadingSuggestedUsers, setLoadingSuggestedUsers] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);

  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      // Request notification permissions
      const hasPermission = await NotificationManager.requestPermission();
      if (hasPermission) {
        // Subscribe to push notifications
        await NotificationManager.subscribeToPush();
        console.log('Notifications initialized');
      }
    };

    initializeNotifications();
  }, []);

  // Load feed based on active tab
  const loadFeedData = async (tabType = 'for-you') => {
    console.log('🔄 Loading feed data for tab:', tabType);
    
    // Check authentication status
    const token = localStorage.getItem('token');
    console.log('🔐 Auth token exists:', !!token);
    if (token) {
      console.log('🔐 Token preview:', token.substring(0, 20) + '...');
    }
    
    try {
      setTweetsLoading(true);
      let feedResponse;
      
      if (tabType === 'for-you') {
        console.log('📡 Calling getForYouFeed()');
        feedResponse = await feedAPI.getForYouFeed();
      } else if (tabType === 'following') {
        console.log('📡 Calling getFollowingFeed()');
        feedResponse = await feedAPI.getFollowingFeed();
      } else {
        console.log('📡 Calling getFeed()');
        feedResponse = await feedAPI.getFeed();
      }

      // After handleAPIResponse(), the structure is {success, data, total}
      const feed = feedResponse?.data || feedResponse || [];
      console.log(`✅ Feed API Response for ${tabType}:`, feedResponse);
      console.log('📊 Processed feed data:', feed);
      console.log('📊 Feed is array?', Array.isArray(feed), 'Length:', feed.length);
      
      setTweets(Array.isArray(feed) ? feed : []);
      setFilteredPosts(Array.isArray(feed) ? feed : []);
      
      if (Array.isArray(feed) && feed.length === 0) {
        console.log('📊 No tweets found in feed');
      }
      
      // Load like states for tweets
      if (feed && feed.length > 0) {
        const likeCounts = {};
        const likedTweetIds = new Set();
        
        for (const tweet of feed) {
          try {
            const countResponse = await tweetAPI.getLikeCount(tweet.id);
            // Extract count value from {count: number} response
            likeCounts[tweet.id] = countResponse?.count ?? tweet.likesCount ?? 0;
            
            if (tweet.isLikedByCurrentUser) {
              likedTweetIds.add(tweet.id);
            }
          } catch (error) {
            console.error(`Error loading like data for tweet ${tweet.id}:`, error);
            likeCounts[tweet.id] = tweet.likesCount || 0;
          }
        }
        
        setLikeCounts(likeCounts);
        setLikedTweets(likedTweetIds);
      }
    } catch (error) {
      console.error(`❌ Error loading ${tabType} feed:`, error);
      
      // Check for authentication errors
      if (error.message?.includes('token') || error.message?.includes('401') || error.message?.includes('authentication')) {
        console.warn('❌ Authentication error - user needs to log in');
        setError('Please log in to view tweets');
      } else {
        console.error('❌ Feed loading error details:', error);
        setError('Failed to load tweets. Please try again.');
      }
      
      // Set empty arrays on error
      setTweets([]);
      setFilteredPosts([]);
    } finally {
      setTweetsLoading(false);
    }
  };

  // Load user profile and tweets from API
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to continue');
          return;
        }

        // Get current user profile
        const profileResponse = await userAPI.getCurrentUser();
        const profile = profileResponse?.payload || profileResponse;
        setUserProfile(profile);

        // Load feed based on current active tab
        await loadFeedData(activeTab);
        
      } catch (error) {
        console.error('Error loading data:', error);
        
        // Handle token expiration specifically
        if (error.message?.includes('expired') || error.message?.includes('invalid') || error.message === 'Token has expired' || error.message === 'Authentication required') {
          setError(
            <div className="token-expired-message">
              <p>Your session has expired. Please refresh to continue.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="refresh-button"
                style={{
                  background: '#1da1f2',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Refresh Page
              </button>
            </div>
          );
          // Clear expired token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          setError(error.message || 'Failed to load data');
        }
        
        // Set empty arrays as fallback to prevent undefined errors
        setTweets([]);
        setFilteredPosts([]);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadUserData();

    // Set up polling for real-time feed updates (every 30 seconds)
    const feedPolling = setInterval(async () => {
      try {
        await loadFeedData(activeTab);
      } catch (error) {
        console.error('Error updating feed:', error);
      }
    }, 30000);

    return () => clearInterval(feedPolling);
  }, []);

  // Load suggested users
  useEffect(() => {
    loadSuggestedUsers();
    // Also load all users for search functionality
    loadAllUsers();
  }, [userProfile]);

  // Trigger profile refresh when switching to profile tab
  useEffect(() => {
    if (activeTab === 'profile') {
      setProfileRefreshTrigger(prev => prev + 1);
    }
  }, [activeTab]);

  // Reload feed when switching to home tab (initial load)
  useEffect(() => {
    console.log('🏠 Home tab useEffect triggered. userProfile:', !!userProfile, 'activeTab:', activeTab);
    if (userProfile && activeTab === 'home') { // Only load when home tab is active
      console.log('🏠 Loading initial feed for home tab');
      loadFeedData('for-you').catch(error => {
        console.error('Error loading initial feed:', error);
        setError('Failed to load feed data');
      });
    }
  }, [activeTab, userProfile]);

  // Search and filter functions with real API calls
  const handleSearch = async (query) => {
    console.log('🔍 Search triggered with query:', query);
    setSearchQuery(query);
    if (query.trim()) {
      try {
        console.log('🔍 Searching for:', query);
        
        // Use the backend search API for better performance
        const searchResults = await userAPI.searchUsers(query.trim());
        console.log('🔍 Search API results:', searchResults);
        
        setFilteredUsers(searchResults || []);
        setShowSearchResults(true);
      } catch (error) {
        console.error('🔍 Search API error:', error);
        
        // Check if it's an authentication error
        if (error.message?.includes('token') || error.message?.includes('401') || error.message?.includes('authentication') || error.message?.includes('Invalid authentication')) {
          console.warn('🔍 Authentication issue detected. Attempting to refresh login.');
          
          // Try to refresh the session or redirect to login
          const storedUser = localStorage.getItem('user');
          if (!storedUser) {
            // No user stored, redirect to login
            window.location.href = '/login';
            return;
          } else {
            setError('Session expired. Please log in again.');
          }
        }
        
        // Always try fallback search regardless of error type
        try {
          console.log('🔍 Falling back to client-side search');
          
          // Use all available users for search
          let searchableUsers = [];
          
          // Combine suggested users and all users
          if (suggestedUsers.length > 0) {
            searchableUsers = [...suggestedUsers];
            console.log('🔍 Added suggested users:', suggestedUsers.length);
          }
          
          if (allUsers.length > 0) {
            // Add allUsers but avoid duplicates
            const existingIds = new Set(searchableUsers.map(u => u.id));
            const newUsers = allUsers.filter(u => !existingIds.has(u.id));
            searchableUsers = [...searchableUsers, ...newUsers];
            console.log('🔍 Added additional users:', newUsers.length, 'Total:', searchableUsers.length);
          }
          
          // If no users available, try to load them
          if (searchableUsers.length === 0) {
            console.log('🔍 No users available, trying to load...');
            try {
              await loadAllUsers();
              await loadSuggestedUsers();
              searchableUsers = [...allUsers, ...suggestedUsers];
            } catch (loadError) {
              console.warn('🔍 Failed to load users:', loadError);
            }
          }
          
          // Perform client-side search
          const filtered = searchableUsers.filter(user => 
            user.username?.toLowerCase().includes(query.toLowerCase()) ||
            user.email?.toLowerCase().includes(query.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(query.toLowerCase()) ||
            user.name?.toLowerCase().includes(query.toLowerCase()) ||
            user.bio?.toLowerCase().includes(query.toLowerCase())
          );
          
          console.log('🔍 Client-side search results:', filtered.length, 'from', searchableUsers.length, 'users');
          setFilteredUsers(filtered);
          setShowSearchResults(true);
          
        } catch (fallbackError) {
          console.error('🔍 Fallback search error:', fallbackError);
          // Show empty results but still show the search interface
          setFilteredUsers([]);
          setShowSearchResults(true);
        }
      }
    } else {
      setShowSearchResults(false);
      setFilteredUsers([]);
    }
  };

  const handleFilter = (type) => {
    setFilterType(type);
    let filtered = [...tweets];
    
    switch (type) {
      case 'verified':
        filtered = tweets.filter(tweet => tweet.user?.verified);
        break;
      case 'recent':
        filtered = tweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        filtered = tweets;
    }
    
    setFilteredPosts(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setFilteredUsers([]);
  };

  // Post composer functions
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        event.target.value = ''; // Reset file input
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Please select an image smaller than 5MB');
        event.target.value = ''; // Reset file input
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePost = async () => {
    // Check if we have content, image, or a valid poll
    const isPollValidForPost = showPoll && pollQuestion.trim() && pollOptions.filter(opt => opt.trim()).length >= 2;
    
    if (!postContent.trim() && !selectedImage && !isPollValidForPost) {
      return;
    }

    try {
      setTweetsLoading(true);
      
      let newTweet;
      
      // Handle poll creation
      if (showPoll && isPollValidForPost) {
        const pollData = {
          question: pollQuestion.trim(),
          options: pollOptions.filter(opt => opt.trim()).map(opt => opt.trim()),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        };

        const pollResponse = await pollAPI.create(pollData);
        newTweet = pollResponse?.payload?.data || pollResponse?.payload || pollResponse;
        
        // If poll creation was successful and we have content, also create a tweet
        if (newTweet && postContent.trim()) {
          const tweetData = {
            content: postContent.trim(),
            type: 'poll',
            pollId: newTweet.id
          };
          
          const tweetResponse = await tweetAPI.create(tweetData);
          newTweet = tweetResponse?.payload?.data || tweetResponse?.payload || tweetResponse;
        }
      }
      // Handle image upload
      else if (selectedImage) {
        console.log('📸 Creating tweet with image:', {
          imageFile: selectedImage.name,
          imageSize: selectedImage.size,
          imageType: selectedImage.type,
          content: postContent.trim()
        });
        
        const formData = new FormData();
        // Always include content, even if empty, as backend might expect it
        formData.append('content', postContent.trim() || '');
        formData.append('media', selectedImage);
        // Remove type field - backend determines it automatically based on content and media
        
        // Add location if selected
        if (selectedLocation) {
          formData.append('location', JSON.stringify(selectedLocation));
        }
        
        // Log FormData contents
        console.log('📸 FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
        
        const tweetResponse = await tweetAPI.createTweetWithImage(formData);
        console.log('📸 Image tweet response:', tweetResponse);
        newTweet = tweetResponse?.payload?.data || tweetResponse?.payload || tweetResponse;
      } 
      // Handle text-only tweets
      else {
        // Create tweet with text only - only send fields that backend expects
        const tweetData = {
          content: postContent.trim(),
          type: 'text' // Add type field as per backend DTO
        };

        // Add location if selected
        if (selectedLocation) {
          tweetData.location = selectedLocation;
        }

        const tweetResponse = await tweetAPI.create(tweetData);
        newTweet = tweetResponse?.payload?.data || tweetResponse?.payload || tweetResponse;
      }
      
      // Add the new tweet to the top of the list if it exists
      if (newTweet) {
        console.log('New tweet created:', newTweet);
        setTweets(prev => [newTweet, ...prev]);
        setFilteredPosts(prev => [newTweet, ...prev]);
        
        // Trigger profile refresh so the new tweet appears in profile immediately
        setProfileRefreshTrigger(prev => prev + 1);
      }
      
      // Show success notification
      NotificationManager.showNotification('Tweet posted!', {
        body: 'Your tweet has been posted successfully',
        tag: 'tweet-posted'
      });
      
      // Reset form
      setPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedLocation(null);
      setShowPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      
      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => input.value = '');
      
    } catch (error) {
      console.error('❌ Error creating tweet:', error);
      
      // Show specific error messages
      if (error.message?.includes('Unexpected field')) {
        setError('Image upload failed: Invalid image format. Please try a different image.');
      } else if (error.message?.includes('token') || error.message?.includes('401')) {
        setError('Authentication error. Please log in again.');
      } else if (error.message?.includes('Too large')) {
        setError('Image too large. Please select a smaller image (max 5MB).');
      } else {
        setError(error.message || 'Failed to post tweet. Please try again.');
      }
      
      // Show error notification
      NotificationManager.showNotification('Post failed', {
        body: error.message || 'Failed to post tweet',
        tag: 'tweet-error'
      });
    } finally {
      setTweetsLoading(false);
    }
  };

  // Poll option handlers
  const handlePollOptionChange = (idx, value) => {
    setPollOptions(prev => prev.map((opt, i) => (i === idx ? value : opt)));
  };
  const handleAddPollOption = () => {
    if (pollOptions.length < 4) setPollOptions(prev => [...prev, '']);
  };
  const handleRemovePollOption = (idx) => {
    if (pollOptions.length > 2) setPollOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEmojiClick = (emoji) => {
    setPostContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // For now, just use coordinates - can be enhanced with geocoding later
          setSelectedLocation({ 
            latitude, 
            longitude, 
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          });
          
          setShowLocationPicker(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get your location. ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
              break;
          }
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Like handlers
  const handleLike = async (tweetId) => {
    if (likingTweets.has(tweetId)) return; // Prevent double-clicks
    
    setLikingTweets(prev => new Set([...prev, tweetId]));
    
    try {
      const isCurrentlyLiked = likedTweets.has(tweetId);
      
      if (isCurrentlyLiked) {
        // Unlike
        await tweetAPI.unlike(tweetId);
        setLikedTweets(prev => {
          const newSet = new Set(prev);
          newSet.delete(tweetId);
          return newSet;
        });
        setLikeCounts(prev => ({
          ...prev,
          [tweetId]: Math.max(0, (prev[tweetId] || 0) - 1)
        }));
      } else {
        // Like
        await tweetAPI.like(tweetId);
        setLikedTweets(prev => new Set([...prev, tweetId]));
        setLikeCounts(prev => ({
          ...prev,
          [tweetId]: (prev[tweetId] || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Could add a toast notification here
    } finally {
      setLikingTweets(prev => {
        const newSet = new Set(prev);
        newSet.delete(tweetId);
        return newSet;
      });
    }
  };

  // Reply handler
  const handleReply = (tweetId) => {
    // For now, just focus the text area and mention the user
    const tweet = tweets.find(t => t.id === tweetId);
    if (tweet) {
      setPostContent(`@${tweet.user?.username || 'user'} `);
      // Find and focus the post input
      setTimeout(() => {
        const postInput = document.querySelector('.post-input');
        if (postInput) {
          postInput.focus();
          postInput.setSelectionRange(postInput.value.length, postInput.value.length);
        }
      }, 100);
    }
  };

  // Retweet handler
  const handleRetweet = async (tweetId) => {
    try {
      await tweetAPI.retweet(tweetId);
      // Refresh tweets by calling loadFeedData
      loadFeedData();
    } catch (error) {
      console.error('Error retweeting:', error);
      alert('Failed to retweet. Please try again.');
    }
  };

  // Delete tweet handler
  const handleDeleteTweet = async (tweetId) => {
    if (window.confirm('Are you sure you want to delete this tweet?')) {
      try {
        await tweetAPI.delete(tweetId);
        // Remove tweet from local state
        setTweets(prev => prev.filter(t => t.id !== tweetId));
        setFilteredPosts(prev => prev.filter(t => t.id !== tweetId));
        alert('Tweet deleted successfully');
      } catch (error) {
        console.error('Error deleting tweet:', error);
        alert('Failed to delete tweet. Please try again.');
      }
    }
  };

  // View tweet handler (for analytics)
  const handleViewTweet = (tweetId) => {
    console.log('Viewing tweet:', tweetId);
    // Could implement view analytics here
  };

  // Load suggested users
  const loadSuggestedUsers = async () => {
    try {
      setLoadingSuggestedUsers(true);
      // Get all users except current user
      const usersResponse = await userAPI.getAllUsers();
      const allUsers = usersResponse?.payload || usersResponse || [];
      const currentUserId = userProfile?.id || user?.id;
      
      if (Array.isArray(allUsers) && currentUserId) {
        // Filter out current user and limit to 3-5 suggestions
        const suggestions = allUsers
          .filter(u => u.id !== currentUserId)
          .slice(0, 5);
        setSuggestedUsers(suggestions);
      }
    } catch (error) {
      console.error('Error loading suggested users:', error);
    } finally {
      setLoadingSuggestedUsers(false);
    }
  };

  // Load all users for the users modal
  const loadAllUsers = async () => {
    try {
      setLoadingAllUsers(true);
      const usersResponse = await userAPI.getAllUsers();
      const allUsersData = usersResponse?.payload || usersResponse || [];
      const currentUserId = userProfile?.id || user?.id;
      
      if (Array.isArray(allUsersData) && currentUserId) {
        // Filter out current user
        const filteredUsers = allUsersData.filter(u => u.id !== currentUserId);
        setAllUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error loading all users:', error);
    } finally {
      setLoadingAllUsers(false);
    }
  };

  // Handle follow/unfollow
  const handleFollow = async (userId) => {
    console.log('handleFollow called with userId:', userId);
    try {
      if (followingUsers.has(userId)) {
        // Unfollow
        console.log('Unfollowing user:', userId);
        await followAPI.unfollowUser(userId);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        // Follow
        console.log('Following user:', userId);
        await followAPI.followUser(userId);
        setFollowingUsers(prev => new Set(prev).add(userId));
      }
      
      // Trigger profile refresh to update follower/following counts
      setProfileRefreshTrigger(prev => prev + 1);
      
      // Reload user profile to get updated following count
      try {
        const updatedProfile = await userAPI.getCurrentUser();
        const profileData = updatedProfile?.payload?.data || updatedProfile?.data || updatedProfile;
        setUserProfile(profileData);
      } catch (profileError) {
        console.log('Could not refresh user profile:', profileError);
      }
      
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const isPollValid = showPoll ? pollQuestion.trim() && pollOptions.filter(opt => opt.trim()).length >= 2 : true;
  const isPostButtonDisabled = !postContent.trim() && !selectedImage && !(showPoll && isPollValid);

  // This useEffect is no longer needed since we're loading user data in the main useEffect above
  // useEffect(() => {
  //   const fetchUserProfile = async () => {
  //     try {
  //       if (user && user.id) {
  //         const profile = await userAPI.getCurrentUser();
  //         setUserProfile(profile);
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch user profile:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserProfile();
  // }, [user]);

  // Close emoji picker when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker') && !event.target.closest('[title="Emoji"]')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    // Clear local storage and call parent logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    setShowLogoutModal(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth <= 768) {
      setIsDrawerOpen(false);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const renderPageContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage 
            user={userProfile || user} 
            filteredPosts={filteredPosts}
            postContent={postContent}
            setPostContent={setPostContent}
            showPoll={showPoll}
            setShowPoll={setShowPoll}
            pollQuestion={pollQuestion}
            setPollQuestion={setPollQuestion}
            pollOptions={pollOptions}
            setPollOptions={setPollOptions}
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            selectedLocation={selectedLocation}
            handleImageUpload={handleImageUpload}
            handlePost={handlePost}
            handlePollOptionChange={handlePollOptionChange}
            handleAddPollOption={handleAddPollOption}
            handleRemovePollOption={handleRemovePollOption}
            handleEmojiClick={handleEmojiClick}
            handleLocationClick={handleLocationClick}
            isPollValid={isPollValid}
            setSelectedImage={setSelectedImage}
            setImagePreview={setImagePreview}
            setSelectedLocation={setSelectedLocation}
            isPostButtonDisabled={isPostButtonDisabled}
            loading={tweetsLoading}
            error={error}
            likedTweets={likedTweets}
            likeCounts={likeCounts}
            likingTweets={likingTweets}
            handleLike={handleLike}
            handleReply={handleReply}
            handleRetweet={handleRetweet}
            handleViewTweet={handleViewTweet}
            tweets={tweets}
            userProfile={userProfile}
            setTweetsLoading={setTweetsLoading}
            loadFeedData={loadFeedData}
            handleSearch={handleSearch}
            onTabChange={loadFeedData}
          />
        );
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <Profile user={userProfile || user} onLogout={onLogout} refreshTrigger={profileRefreshTrigger} />;
      case 'settings':
        return <Settings user={userProfile || user} onLogout={onLogout} />;
      default:
        return (
          <HomePage 
            user={userProfile || user} 
            filteredPosts={filteredPosts}
            postContent={postContent}
            setPostContent={setPostContent}
            showPoll={showPoll}
            setShowPoll={setShowPoll}
            pollQuestion={pollQuestion}
            setPollQuestion={setPollQuestion}
            pollOptions={pollOptions}
            setPollOptions={setPollOptions}
            selectedImage={selectedImage}
            imagePreview={imagePreview}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            selectedLocation={selectedLocation}
            handleImageUpload={handleImageUpload}
            handlePost={handlePost}
            handlePollOptionChange={handlePollOptionChange}
            handleAddPollOption={handleAddPollOption}
            handleRemovePollOption={handleRemovePollOption}
            handleEmojiClick={handleEmojiClick}
            handleLocationClick={handleLocationClick}
            isPollValid={isPollValid}
            setSelectedImage={setSelectedImage}
            setImagePreview={setImagePreview}
            setSelectedLocation={setSelectedLocation}
            isPostButtonDisabled={isPostButtonDisabled}
            loading={tweetsLoading}
            error={error}
            likedTweets={likedTweets}
            likeCounts={likeCounts}
            likingTweets={likingTweets}
            handleLike={handleLike}
            handleReply={handleReply}
            handleRetweet={handleRetweet}
            handleViewTweet={handleViewTweet}
            tweets={tweets}
            userProfile={userProfile}
            setTweetsLoading={setTweetsLoading}
            loadFeedData={loadFeedData}
            handleSearch={handleSearch}
            onTabChange={loadFeedData}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        {/* Navigation Drawer */}
        <div className={`navigation-drawer ${isDrawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <div className="logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#7371FC">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.122 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
              </svg>
              <span>Epita Twitter</span>
            </div>
          </div>

          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => handleTabChange('home')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.46 7.57L12.357 2.115c-.223-.12-.49-.12-.713 0L1.543 7.57c-.364.197-.5.652-.303 1.017.135.25.394.393.66.393.12 0 .243-.03.356-.09l.815-.44L4.7 19.963c.214 1.215 1.308 2.062 2.658 2.062h9.282c1.352 0 2.445-.848 2.663-2.087l1.626-11.49.818.442c.364.193.82.06 1.017-.304.196-.363.06-.818-.304-1.016zm-4.638 12.133c-.107.606-.703.822-1.18.822H7.36c-.48 0-1.075-.216-1.178-.798L4.48 7.69 12.05 3.24l7.52 4.49-1.698 12.01z"/>
                <path d="M12 13.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>
              </svg>
              <span>Home</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => handleTabChange('notifications')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.697 16.468c-.02-.016-2.14-1.64-2.18-6.03-.02-.278-.25-.49-.54-.49s-.52.21-.54.49c-.04 4.39-2.16 6.014-2.18 6.03-.01.01-.02.02-.02.03-.01.02-.01.04-.01.06 0 .02.01.04.01.06.01.01.01.02.02.03.02.016 2.14 1.64 2.18 6.03.02.278.25.49.54.49s.52-.21.54-.49c.04-4.39 2.16-6.014 2.18-6.03.01-.01.02-.02.02-.03.01-.02.01-.04.01-.06 0-.02-.01-.04-.01-.06-.01-.01-.01-.02-.02-.03zM12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-1c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v1l-2 2v1h16v-1l-2-2z"/>
              </svg>
              <span>Notifications</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Profile</span>
            </button>

            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
              <span>Settings</span>
            </button>
          </nav>

          <div className="drawer-footer">
            <button className="tweet-button" onClick={() => setShowTweetModal(true)}>
              <span>Tweet</span>
            </button>

            {/* User Profile Section at Bottom */}
            <div className="user-profile-section">
              <div className="user-avatar">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#657786">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div className="user-details">
                <div className="user-name">{user?.username || user?.email}</div>
                <div className="user-handle">@{user?.username || 'user'}</div>
              </div>
              <button className="logout-btn-small" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isDrawerOpen && (
          <div className="drawer-overlay" onClick={toggleDrawer}></div>
        )}

        <div className="main-content">
          {renderPageContent()}
        </div>

        <div className="trending-sidebar">
          {/* Search and Filter Section */}
          <div className="sidebar-section search-filter-section">
            <div className="search-bar">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="#536471">
                <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/>
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search" onClick={clearSearch}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#536471">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
            
            {/* Search Results */}
            {showSearchResults && (
              <div className="search-results">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div key={user.id} className="search-result-item">
                      <div className="user-avatar">
                        <div className="avatar-placeholder">
                          {user.username?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="user-info">
                        <div className="user-name">
                          {user.displayName || user.username}
                          {user.verified && (
                            <svg className="verified-badge" width="16" height="16" viewBox="0 0 24 24" fill="#7371FC">
                              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                            </svg>
                          )}
                        </div>
                        <div className="user-handle">@{user.username}</div>
                        <div className="user-bio">{user.bio || 'No bio available'}</div>
                        <div className="user-followers">{user.followersCount || 0} followers</div>
                      </div>
                      <button
                        className={`follow-btn ${followingUsers.has(user.id) ? 'following' : ''}`}
                        onClick={(e) => {
                          console.log('Follow button clicked in search results:', user.id);
                          e.preventDefault();
                          e.stopPropagation();
                          handleFollow(user.id);
                        }}
                        style={{ pointerEvents: 'auto', zIndex: 20 }}
                      >
                        {followingUsers.has(user.id) ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-results">No users found</div>
                )}
              </div>
            )}

            {/* Filter Pills */}
            <div className="filter-tabs horizontal-tabs">
              <button 
                className={`filter-tab ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => handleFilter('all')}
              >
                All Posts
              </button>
              <button 
                className={`filter-tab ${filterType === 'verified' ? 'active' : ''}`}
                onClick={() => handleFilter('verified')}
              >
                Verified Only
              </button>
              <button 
                className={`filter-tab ${filterType === 'high-engagement' ? 'active' : ''}`}
                onClick={() => handleFilter('high-engagement')}
              >
                High Engagement
              </button>
              <button 
                className={`filter-tab ${filterType === 'recent' ? 'active' : ''}`}
                onClick={() => handleFilter('recent')}
              >
                Recent
              </button>
              <button 
                className={`filter-tab ${filterType === 'trending' ? 'active' : ''}`}
                onClick={() => handleFilter('trending')}
              >
                Trending
              </button>
            </div>
          </div>

          {/* Trends Section */}
          <div className="sidebar-section trends-section">
            <div className="trending-header">
              <h3>Trends for you</h3>
            </div>
            <div className="trending-content">
              <p>No trending topics yet.</p>
            </div>
          </div>

          {/* People You Might Like Section */}
          <div className="sidebar-section suggested-users-section">
            <div className="trending-header">
              <h3>People you might like</h3>
            </div>
            <div className="suggested-users-content">
              {loadingSuggestedUsers ? (
                <p>Loading suggestions...</p>
              ) : suggestedUsers.length > 0 ? (
                <>
                  {suggestedUsers.map(suggestedUser => (
                    <div key={suggestedUser.id} className="suggested-user-item">
                      <div className="user-avatar">
                        <div className="avatar-placeholder">
                          {suggestedUser.username?.substring(0, 2).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="user-info">
                        <div className="user-details">
                          <div className="user-name">{suggestedUser.username}</div>
                          <div className="user-handle">{suggestedUser.email}</div>
                        </div>
                      </div>
                      <button
                        className={`follow-btn ${followingUsers.has(suggestedUser.id) ? 'following' : ''}`}
                        onClick={(e) => {
                          console.log('Follow button clicked in suggested users:', suggestedUser.id);
                          e.preventDefault();
                          e.stopPropagation();
                          handleFollow(suggestedUser.id);
                        }}
                        style={{ pointerEvents: 'auto', zIndex: 20 }}
                      >
                        {followingUsers.has(suggestedUser.id) ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))}
                  <div className="view-more-container">
                    <button 
                      className="view-more-btn"
                      onClick={() => {
                        loadAllUsers();
                        setShowUsersModal(true);
                      }}
                    >
                      View more users
                    </button>
                  </div>
                </>
              ) : (
                <p>No suggestions available.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Tweet Modal */}
      {showTweetModal && (
        <div className="modal-overlay" onClick={() => setShowTweetModal(false)}>
          <div className="tweet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button 
                className="close-modal-btn" 
                onClick={() => setShowTweetModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="post-composer">
                <div className="composer-header">
                  <div className="user-avatar">
                    <div className="avatar-placeholder">
                      {user?.username?.substring(0, 2).toUpperCase() || 'My'}
                    </div>
                  </div>
                  <div className="composer-content">
                    <textarea
                      className="post-input"
                      placeholder="What's happening?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows="3"
                    />

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button 
                          className="remove-image"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Row */}
                <div className="composer-actions">
                  <div className="action-buttons">
                    <label className="action-button" title="Image">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#7371FC">
                        <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3-3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"/>
                      </svg>
                    </label>
                    
                    <button 
                      className="action-button" 
                      title="Emoji"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#7371FC">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                      </svg>
                    </button>

                    <button 
                      className="action-button" 
                      title="Poll"
                      onClick={() => setShowPoll(!showPoll)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#7371FC">
                        <path d="M20.222 9.16h-1.334c.015-.09.028-.182.028-.274 0-2.558-2.08-4.638-4.639-4.638-2.558 0-4.637 2.08-4.637 4.638 0 .092.013.184.028.274H8.333c-.982 0-1.778.797-1.778 1.778v2.444c0 .982.796 1.778 1.778 1.778h1.334c-.015.09-.028.182-.028.274 0 2.558 2.079 4.638 4.637 4.638 2.559 0 4.639-2.08 4.639-4.638 0-.092-.013-.184-.028-.274h1.334c.982 0 1.778-.796 1.778-1.778v-2.444c0-.981-.796-1.778-1.778-1.778zM7.667 12.5v-1.334h11.666V12.5H7.667zm2.223-2.223v-.555c0-1.639 1.332-2.97 2.972-2.97s2.971 1.331 2.971 2.97v.555H9.89zm4.195 7.5c-1.64 0-2.972-1.332-2.972-2.971v-.555h5.943v.555c0 1.639-1.331 2.971-2.971 2.971z"/>
                      </svg>
                    </button>
                    
                    <button 
                      className="action-button" 
                      title="Location"
                      onClick={handleLocationClick}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#7371FC">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </button>
                  </div>
                  
                  <button 
                    className={`post-button ${isPostButtonDisabled ? 'disabled' : ''}`}
                    onClick={() => {
                      handlePost();
                      setShowTweetModal(false);
                    }}
                    disabled={isPostButtonDisabled}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Modal */}
      {showUsersModal && (
        <div className="modal-overlay" onClick={() => setShowUsersModal(false)}>
          <div className="users-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <button 
                  className="modal-close-btn" 
                  onClick={() => setShowUsersModal(false)}
                >
                  ✕
                </button>
                <h2>All Users</h2>
              </div>
            </div>
            
            <div className="users-modal-content">
              {loadingAllUsers ? (
                <div className="loading-users">
                  <p>Loading users...</p>
                </div>
              ) : allUsers.length > 0 ? (
                <div className="users-list">
                  {allUsers.map(user => (
                    <div key={user.id} className="user-item">
                      <div className="user-info">
                        <div className="user-avatar">
                          <div className="avatar-placeholder">
                            {user.username?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="user-details">
                          <div className="username">{user.username}</div>
                          <div className="user-email">{user.email || 'No email available'}</div>
                          <div className="user-bio">{user.bio || 'No bio available'}</div>
                        </div>
                      </div>
                      <button
                        className={`follow-btn ${followingUsers.has(user.id) ? 'following' : ''}`}
                        onClick={(e) => {
                          console.log('Follow button clicked in modal:', user.id);
                          e.preventDefault();
                          e.stopPropagation();
                          handleFollow(user.id);
                        }}
                      >
                        {followingUsers.has(user.id) ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-users">
                  <p>No users available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutScreen
          onCancel={handleCancelLogout}
          onConfirmLogout={handleConfirmLogout}
        />
      )}
    </div>
  );
};

export default Dashboard; 