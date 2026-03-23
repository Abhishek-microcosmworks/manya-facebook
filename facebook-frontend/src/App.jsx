import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth';
import RedirectIfAuth from './auth/RedirectIfAuth';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Profile from './components/Profile';
import { useAuth } from './auth/AuthContext';

function SavedRouteRedirect() {
  const { user } = useAuth();
  // RequireAuth ensures the user is available; fallback to Home if missing.
  return <Navigate to={user?.username ? `/profile/${user.username}?tab=Saved` : '/'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<RedirectIfAuth />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:username" element={<Profile />} />
        {/* Backward-compatible route; redirects to Profile "Saved" tab */}
        <Route path="/saved" element={<SavedRouteRedirect />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}