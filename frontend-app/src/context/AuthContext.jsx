import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getDemoUsers,
  getNotifications,
  loginUser,
  signupUser,
  markNotificationRead,
  markAllNotificationsRead,
  API_BASE,
} from '../services/api';
import { joinUser, leaveUser, joinRole, leaveRole, subscribeToNotifications } from '../services/socket';

const AuthContext = createContext(null);

function storeSession({ token, user }) {
  localStorage.setItem('civicpulse_auth_token', token);
  localStorage.setItem('civicpulse_active_user_id', user._id);
  localStorage.setItem('civicpulse_active_role', user.role);
}

export const AuthProvider = ({ children }) => {
  const [demoUsers, setDemoUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const setSession = useCallback((session) => {
    storeSession(session);
    setCurrentUser(session.user);
    joinUser(session.user._id);
    joinRole(session.user.role);
  }, []);

  const logout = useCallback(() => {
    const storedUserId = localStorage.getItem('civicpulse_active_user_id');
    const storedRole = localStorage.getItem('civicpulse_active_role');
    if (storedUserId) leaveUser(storedUserId);
    if (storedRole) leaveRole(storedRole);
    localStorage.removeItem('civicpulse_auth_token');
    localStorage.removeItem('civicpulse_active_user_id');
    localStorage.removeItem('civicpulse_active_role');
    setCurrentUser(null);
    setNotifications([]);
  }, []);

  const initAuth = useCallback(async () => {
    const token = localStorage.getItem('civicpulse_auth_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/auth/me-authenticated`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Session expired');
      const user = await response.json();
      setCurrentUser(user);
      joinUser(user._id);
      joinRole(user.role);
      const users = await getDemoUsers();
      setDemoUsers(users);
    } catch {
      localStorage.removeItem('civicpulse_auth_token');
      localStorage.removeItem('civicpulse_active_user_id');
      localStorage.removeItem('civicpulse_active_role');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const fetchUserNotifications = useCallback(async () => {
    if (!currentUser?._id) return;
    try {
      setNotifications(await getNotifications());
    } catch (error) {
      console.warn('Failed to load notifications:', error.message);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserNotifications();
    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifications((previous) => [notification, ...previous]);
    });
    return unsubscribe;
  }, [fetchUserNotifications]);

  const signIn = async (credentials) => {
    const session = await loginUser(credentials);
    setSession(session);
    return session.user;
  };

  const signUp = async (details) => {
    const session = await signupUser(details);
    setSession(session);
    return session.user;
  };

  const switchUser = (user) => {
    if (!user || !currentUser) return;
    setCurrentUser(user);
    localStorage.setItem('civicpulse_active_user_id', user._id);
    localStorage.setItem('civicpulse_active_role', user.role);
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((previous) => previous.map((item) => (item._id === id ? { ...item, is_read: true } : item)));
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((previous) => previous.map((item) => ({ ...item, is_read: true })));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole: currentUser?.role || null,
      demoUsers,
      loading,
      signIn,
      signUp,
      logout,
      switchUser,
      notifications,
      unreadCount: notifications.filter((item) => !item.is_read).length,
      markNotificationRead: handleMarkRead,
      markAllNotificationsRead: handleMarkAllRead,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
