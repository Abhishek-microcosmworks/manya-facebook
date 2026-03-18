import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RedirectIfAuth({ to = '/' }) {
  const { isReady, authenticated } = useAuth();
  if (!isReady) return null;
  if (authenticated) return <Navigate to={to} replace />;
  return <Outlet />;
}

