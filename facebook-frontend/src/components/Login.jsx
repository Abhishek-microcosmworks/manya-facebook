import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

function normalizeError(err) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => location.state?.from?.pathname || '/', [location.state]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !submitting;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');
    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="mx-auto flex min-h-screen max-w-[980px] flex-col justify-center px-4 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="mx-auto max-w-[500px] text-center lg:mx-0 lg:text-left">
          <div className="select-none text-[52px] font-extrabold leading-none tracking-tight text-[#1877f2] lg:text-[64px]">
            facebook
          </div>
          <p className="mt-3 text-[20px] leading-snug text-gray-900 lg:text-[28px]">
            Facebook helps you connect and share with the people in your life.
          </p>
        </div>

        <div className="mx-auto mt-6 w-full max-w-[396px] lg:mx-0 lg:mt-0">
          <div className="rounded-lg bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)]">
            {error ? (
              <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-3.5">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Email address</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  className="h-[50px] w-full rounded-md border border-gray-300 bg-white px-3 text-[17px] text-gray-900 outline-none focus:border-[#1877f2] focus:shadow-[0_0_0_2px_rgba(24,119,242,0.2)]"
                  placeholder="Email address or phone number"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">Password</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-[50px] w-full rounded-md border border-gray-300 bg-white px-3 text-[17px] text-gray-900 outline-none focus:border-[#1877f2] focus:shadow-[0_0_0_2px_rgba(24,119,242,0.2)]"
                  placeholder="Password"
                />
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="h-[48px] w-full rounded-md bg-[#1877f2] text-[20px] font-bold text-white hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Logging in…' : 'Log in'}
              </button>
            </form>

            <div className="mt-3 text-center">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[#1877f2] hover:underline"
              >
                Forgotten password?
              </Link>
            </div>

            <div className="my-4 h-px w-full bg-gray-200" />

            <div className="flex justify-center">
              <Link
                to="/register"
                className="inline-flex h-[48px] items-center justify-center rounded-md bg-[#42b72a] px-5 text-[17px] font-bold text-white hover:bg-[#36a420]"
              >
                Create new account
              </Link>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-900">
            <span className="font-semibold hover:underline">Create a Page</span> for a celebrity, brand or business.
          </div>
        </div>
      </div>
    </div>
  );
}

