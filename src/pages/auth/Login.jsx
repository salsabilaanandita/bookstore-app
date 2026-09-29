// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../../store/useSession';
import { useToast } from '../../store/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export function Login({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useSession();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = async (e) => {
    e?.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please provide your full name.');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);

    try {
      let account;
      if (mode === 'register') {
        account = await register(name, email, password);
        addToast({
          title: `Welcome, ${account.name}!`,
          description: 'Your account has been created successfully.',
          type: 'success',
        });
      } else {
        account = await login(email, password);
        addToast({
          title: `Welcome back, ${account.name}`,
          description: `Signed in as ${account.role}.`,
          type: 'success',
        });
      }

      const redirectMap = {
        admin: '/admin',
        staff: '/staff',
        user: '/',
      };
      const fromPath = location.state?.from?.pathname;
      const target = fromPath || redirectMap[account.role] || '/';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="w-full max-w-md bg-surface border border-border rounded-panel p-8 shadow-card flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-2xl shadow-card">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-2">
            {mode === 'register' ? 'Create an Account' : 'Welcome to Pustaka'}
          </h1>
          <p className="text-xs text-text-secondary">
            {mode === 'register'
              ? 'Join Pustaka to start reading and collecting books'
              : 'Sign in to access your digital library and bookstore'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-surface-subtle p-1 rounded-card border border-border">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              mode === 'login'
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              mode === 'register'
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-error-subtle border border-error/20 rounded-card text-error text-xs font-medium">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {mode === 'register' && (
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon="User"
              autoComplete="name"
              required
            />
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon="Mail"
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon="Lock"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
          />

          {mode === 'register' && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon="Lock"
              autoComplete="new-password"
              required
            />
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            {mode === 'register' ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        {/* Footer Toggle Text */}
        <div className="text-center pt-2 border-t border-border">
          {mode === 'register' ? (
            <p className="text-xs text-text-secondary">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-semibold text-accent hover:underline"
              >
                Sign in here
              </button>
            </p>
          ) : (
            <p className="text-xs text-text-secondary">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-semibold text-accent hover:underline"
              >
                Register for free
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
export default Login;
