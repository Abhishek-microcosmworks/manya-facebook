import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

function normalizeError(err) {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordMeetsPolicy =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/.test(password);

  const canSubmit =
    name.trim().length >= 2 &&
    email.trim().length > 3 &&
    passwordMeetsPolicy &&
    password === confirmPassword &&
    acceptTerms &&
    !submitting;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        acceptTerms,
      });
      setSuccess(res?.msg || 'Registration complete. Please check your email to verify your account.');
      // setTimeout(() => navigate('/login', { replace: true }), 900);
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
            <h1 className="text-[24px] font-bold text-gray-900">Create a new account</h1>
            <p className="mt-1 text-sm text-gray-600">It’s quick and easy.</p>
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
              <span className="mb-1 block text-sm font-medium text-gray-700">Full name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                autoComplete="name"
                required
                className="h-[44px] w-full rounded-md border border-gray-300 bg-[#f5f6f7] px-3 text-[15px] text-gray-900 outline-none focus:border-[#1877f2] focus:bg-white focus:shadow-[0_0_0_2px_rgba(24,119,242,0.2)]"
                placeholder="Full name"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Email address</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                className="h-[44px] w-full rounded-md border border-gray-300 bg-[#f5f6f7] px-3 text-[15px] text-gray-900 outline-none focus:border-[#1877f2] focus:bg-white focus:shadow-[0_0_0_2px_rgba(24,119,242,0.2)]"
                placeholder="Email address"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">New password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                required
                className="h-[44px] w-full rounded-md border border-gray-300 bg-[#f5f6f7] px-3 text-[15px] text-gray-900 outline-none focus:border-[#1877f2] focus:bg-white focus:shadow-[0_0_0_2px_rgba(24,119,242,0.2)]"
                placeholder="New password"
              />
              {password && !passwordMeetsPolicy ? (
                <p className="mt-1 text-xs text-red-600">
                  Use 8+ characters with uppercase, lowercase, number, and a special character.
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Confirm password</span>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                required
                aria-invalid={Boolean(confirmPassword) && password !== confirmPassword}
                className="h-[44px] w-full rounded-md border border-gray-300 bg-[#f5f6f7] px-3 text-[15px] text-gray-900 outline-none focus:border-[#1877f2] focus:bg-white focus:shadow-[0_0_0_2px_rgba(24,119,242,0.2)]"
                placeholder="Confirm password"
              />
              {confirmPassword && !passwordsMatch ? (
                <p className="mt-1 text-xs text-red-600">Passwords do not match.</p>
              ) : null}
            </label>

            <label className="flex items-start gap-3 pt-1">
              <input
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1877f2] focus:ring-[#1877f2]"
              />
              <span className="text-xs text-gray-700">I agree to the terms and conditions.</span>
            </label>

            <div className="pt-1">
              <button
                type="submit"
                disabled={!canSubmit}
                className="mx-auto flex h-[40px] w-full max-w-[240px] items-center justify-center rounded-md bg-[#42b72a] text-[17px] font-bold text-white hover:bg-[#36a420] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Creating…' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>

        <div className="mx-auto mt-4 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link className="font-semibold text-[#1877f2] hover:underline" to="/login">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

