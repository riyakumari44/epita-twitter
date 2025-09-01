// Notification utility functions for push notifications
class NotificationManager {
  constructor() {
    this.vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with actual VAPID key
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notifications are blocked');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Show local notification
  async showNotification(title, options = {}) {
    if (!await this.requestPermission()) {
      return;
    }

    const defaultOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'epita-twitter',
      requireInteraction: false,
      ...options
    };

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  // Show notification for new tweet
  notifyNewTweet(username, content) {
    this.showNotification(`New tweet from ${username}`, {
      body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      tag: 'new-tweet'
    });
  }

  // Show notification for new follower
  notifyNewFollower(username) {
    this.showNotification('New follower!', {
      body: `${username} is now following you`,
      tag: 'new-follower'
    });
  }

  // Show notification for mention
  notifyMention(username, content) {
    this.showNotification(`${username} mentioned you`, {
      body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      tag: 'mention'
    });
  }

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

const notificationManager = new NotificationManager();
export default notificationManager;
