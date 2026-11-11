import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getDemoUsers,
  getCurrentUser,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/api';
import { joinUser, leaveUser, joinRole, leaveRole, subscribeToNotifications } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [demoUsers, setDemoUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Load demo users and active user
  const initAuth = useCallback(async () => {
    try {
      const users = await getDemoUsers();
      setDemoUsers(users);

      const storedUserId = localStorage.getItem('civicpulse_active_user_id');
      let active = null;

      if (storedUserId) {
        active = users.find((u) => u._id === storedUserId);
      }

      // Default to admin or first user if none stored
      if (!active && users.length > 0) {
        active = users.find((u) => u.role === 'admin') || users[0];
      }

      if (active) {
        setCurrentUser(active);
        localStorage.setItem('civicpulse_active_user_id', active._id);
        localStorage.setItem('civicpulse_active_role', active.role);
        joinUser(active._id);
        joinRole(active.role);
      }
    } catch (err) {
      console.error('Failed to initialize demo auth:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Load notifications for active user
  const fetchUserNotifications = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserNotifications();

    const unsubscribe = subscribeToNotifications((newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchUserNotifications]);

  const switchUser = (newUser) => {
    if (!newUser) return;

    if (currentUser) {
      leaveUser(currentUser._id);
      leaveRole(currentUser.role);
    }

    setCurrentUser(newUser);
    localStorage.setItem('civicpulse_active_user_id', newUser._id);
    localStorage.setItem('civicpulse_active_role', newUser.role);
    joinUser(newUser._id);
    joinRole(newUser.role);
    fetchUserNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser?._id) return;
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser?.role || 'citizen',
        demoUsers,
        loading,
        switchUser,
        notifications,
        unreadCount,
        markNotificationRead: handleMarkRead,
        markAllNotificationsRead: handleMarkAllRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
