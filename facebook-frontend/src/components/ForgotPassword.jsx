import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

function normalizeError(err) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canSubmit = email.trim().length > 3 && !submitting;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await forgotPassword({
        email: email.trim().toLowerCase(),
      });
      setSuccess(res?.msg || 'Password reset email sent! Check your inbox for instructions.');
      setEmail('');
      // setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="mx-auto flex min-h-screen max-w-[980px] flex-col justify-center px-4 py-6">
        <div className="mx-auto mb-4 select-none text-[44px] font-extrabold leading-none tracking-tight text-[#1877f2]">
          facebook
        </div>

        <div className="mx-auto w-full max-w-[432px] rounded-lg bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)]">
          <div className="text-center">
            <h1 className="text-[24px] font-bold text-gray-900">Find Your Account</h1>
            <p className="mt-1 text-sm text-gray-600">Please enter your email address to search for your account.</p>
          </div>

          <div className="my-3 h-px w-full bg-gray-200" />

          {error ? (
            <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mb-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-green-200">
              {success}
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
                disabled={submitting}
                className="h-[44px] w-full rounded-md border border-gray-300 bg-[#f5f6f7] px-3 text-[15px] text-gray-900 outline-none disabled:opacity-60 focus:border-[#1877f2] focus:bg-white focus:shadow-[0_0_0_2px_rgba(24,119,242,0.2)]"
                placeholder="Email address"
              />
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 rounded-md bg-[#1877f2] px-3 py-2 text-sm font-bold text-white hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Continue'}
              </button>
              <Link
                to="/login"
                className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-sm text-gray-700">
          Don't have an account?{' '}
          <Link className="font-semibold text-[#1877f2] hover:underline" to="/register">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
