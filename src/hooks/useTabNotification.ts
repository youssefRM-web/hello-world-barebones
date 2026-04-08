import { useEffect, useRef, useCallback, useState } from 'react';

// Notification sound as base64 (short beep)
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2djIGBiZWcm5WLf3Z3gImSm5eLf3F0f4iTl5CFe3R3gIuWmZKGfHV4gYyWmpWJfnh4gYuUlpSJf3t5gYuUlpSIf3t6gYuUlpWJf3t5gYuUlpWJf3x6gYuUlpSIfnt5gYuUlpWJf3t6gYuUlpSIf3t6gouUlpSIf3t6gouUlpSIf3t6gouUlpSIfnt5gYuUlpWJf3t6gYuUlpSIf3t5gYuUlpSJf3t5gYuUlpWIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIfnt5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIfnt5gYuUlpSIf3t5gYuUlpSIfnt5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5gYuUlpSIf3t5';

interface UseTabNotificationOptions {
  originalTitle?: string;
  alertTitle?: string;
  notificationTitle?: string;
  notificationBody?: string;
  notificationIcon?: string;
  enableSound?: boolean;
}

export function useTabNotification(options: UseTabNotificationOptions = {}) {
  const {
    originalTitle = 'Mendigo',
    alertTitle = '🔔 New reported issues!',
    notificationTitle = 'New Issue Reported',
    notificationBody = 'A new issue has been reported.',
    notificationIcon = '/favicon.ico',
    enableSound = true,
  } = options;

  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isBlinkingRef = useRef(false);
  const originalTitleRef = useRef(originalTitle);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
    return () => {
      audioRef.current = null;
    };
  }, []);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);

      if (visible) {
        // Stop blinking and restore title when tab becomes visible
        stopBlinking();
      }
    };

    const handleFocus = () => {
      setIsTabVisible(true);
      stopBlinking();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      stopBlinking();
    };
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const playSound = useCallback(() => {
    if (enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [enableSound]);

  const stopBlinking = useCallback(() => {
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
    isBlinkingRef.current = false;
    document.title = originalTitleRef.current;
  }, []);

  const startBlinking = useCallback(() => {
    if (isBlinkingRef.current) return;
    
    isBlinkingRef.current = true;
    let showAlert = true;

    blinkIntervalRef.current = setInterval(() => {
      document.title = showAlert ? alertTitle : originalTitleRef.current;
      showAlert = !showAlert;
    }, 1000);
  }, [alertTitle]);

  const showNativeNotification = useCallback((title?: string, body?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title || notificationTitle, {
        body: body || notificationBody,
        icon: notificationIcon,
        tag: 'new-issue', // Prevents duplicate notifications
        requireInteraction: false,
      });

      // Focus tab when notification is clicked
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, [notificationTitle, notificationBody, notificationIcon]);

  // Toast notification removed - only native notifications are used

  const notifyNewIssue = useCallback((customTitle?: string, customBody?: string) => {
    const title = customTitle || notificationTitle;
    const body = customBody || notificationBody;

    // Play sound regardless of tab visibility
    playSound();

    // Only trigger title blinking and native notification if tab is hidden
    if (document.hidden) {
      startBlinking();
      showNativeNotification(title, body);
    }
  }, [startBlinking, showNativeNotification, playSound, notificationTitle, notificationBody]);

  return {
    isTabVisible,
    notifyNewIssue,
    stopBlinking,
    requestPermission: () => {
      if ('Notification' in window) {
        return Notification.requestPermission();
      }
      return Promise.resolve('denied' as NotificationPermission);
    },
    permissionStatus: 'Notification' in window ? Notification.permission : 'denied',
  };
}
