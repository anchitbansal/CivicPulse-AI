import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ roles, children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading secure session...</div>;
  if (!currentUser) return <Navigate to={`/login/${roles[0] === 'supervisor' ? 'worker' : roles[0]}`} state={{ from: location }} replace />;
  if (!roles.includes(currentUser.role)) return <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : currentUser.role === 'citizen' ? '/citizen/dashboard' : '/worker/dashboard'} replace />;
  return children;
}
