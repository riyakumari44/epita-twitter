// Comprehensive API service for Twitter clone
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    
    // Handle token expiration
    if (response.status === 401 && (error.message?.includes('expired') || error.message?.includes('invalid'))) {
      // Clear expired token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

// Helper function specifically for auth endpoints that need full response
const handleAuthResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data; // Return full response for auth endpoints
};

// Helper function for regular API endpoints that extract payload
const handleAPIResponse = async (response) => {
  const data = await handleResponse(response);
  
  // Handle the ResponseInterceptor format {statusCode, timestamp, message, payload}
  if (data && typeof data === 'object' && data.hasOwnProperty('payload')) {
    return data.payload;
  }
  
  // Return original data if not in interceptor format
  return data;
};

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleAuthResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleAuthResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  verifyToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  }
};

// User Management API
export const userAPI = {
  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleAPIResponse(response);
  },

  changePassword: async (passwordData) => {
    const response = await fetch(`${API_BASE_URL}/users/me/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    return handleAPIResponse(response);
  },

  getUserById: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  searchUsers: async (query) => {
    const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  }
};

// Tweet Management API
export const tweetAPI = {
  create: async (tweetData) => {
    const response = await fetch(`${API_BASE_URL}/tweets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tweetData),
    });
    return handleAPIResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/tweets`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getById: async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/tweets/${tweetId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  delete: async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/tweets/${tweetId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  like: async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/tweets/${tweetId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  unlike: async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/tweets/${tweetId}/unlike`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getLikeCount: async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/tweets/${tweetId}/likes`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  retweet: async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/retweets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tweetId }),
    });
    return handleAPIResponse(response);
  },

  unretweet: async (retweetId) => {
    const response = await fetch(`${API_BASE_URL}/retweets/${retweetId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getRetweetCount: async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/retweets/count/${tweetId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  reply: async (tweetId, content) => {
    const response = await fetch(`${API_BASE_URL}/replies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        tweetId: tweetId,
        content: content 
      }),
    });
    return handleAPIResponse(response);
  },

  getReplies: async (tweetId) => {
    const response = await fetch(`${API_BASE_URL}/replies/tweets/${tweetId}/replies`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  createTweetWithImage: async (formData) => {
    const token = localStorage.getItem('token');
    console.log('📸 Sending FormData to backend...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/tweets`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type for FormData, let the browser set it
        },
        body: formData,
      });
      
      // Log response details for debugging
      console.log('📸 Response status:', response.status);
      console.log('📸 Response statusText:', response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('📸 Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      return handleAPIResponse(response);
    } catch (error) {
      console.error('📸 Image upload error:', error);
      throw error;
    }
  },

  getUserTweets: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/tweets/user/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  }
};

// Follow/Following API
export const followAPI = {
  followUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/follows/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  unfollowUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/follows/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getFollowers: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/follows/followers/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getFollowing: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/follows/following/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getFollowersCount: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/follows/followers/count/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getFollowingCount: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/follows/following/count/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getFollowStatus: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/follows/status/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  }
};

// Feed API
export const feedAPI = {
  getFeed: async () => {
    const response = await fetch(`${API_BASE_URL}/feeds`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getForYouFeed: async () => {
    const response = await fetch(`${API_BASE_URL}/feeds/for-you`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getFollowingFeed: async () => {
    const response = await fetch(`${API_BASE_URL}/feeds`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },
};

// Notification API
export const notificationAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  }
};

// Media/File Upload API
export const mediaAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    return handleAPIResponse(response);
  },

  uploadVideo: async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/media/upload-video`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });
    return handleAPIResponse(response);
  }
};

// Poll API
export const pollAPI = {
  create: async (pollData) => {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pollData),
    });
    return handleAPIResponse(response);
  },

  vote: async (pollId, optionId) => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ optionId }),
    });
    return handleAPIResponse(response);
  },

  getResults: async (pollId) => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/results`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  }
};

// Search API
export const searchAPI = {
  searchTweets: async (query) => {
    const response = await fetch(`${API_BASE_URL}/search/tweets?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  searchUsers: async (query) => {
    const response = await fetch(`${API_BASE_URL}/search/users?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  searchHashtags: async (query) => {
    const response = await fetch(`${API_BASE_URL}/search/hashtags?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  },

  globalSearch: async (query, filters = {}) => {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await fetch(`${API_BASE_URL}/search?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleAPIResponse(response);
  }
};

const API = {
  authAPI,
  userAPI,
  tweetAPI,
  followAPI,
  feedAPI,
  notificationAPI,
  mediaAPI,
  pollAPI,
  searchAPI
};

export default API;
