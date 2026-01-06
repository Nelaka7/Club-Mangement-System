'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import classes from './page.module.css';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className={classes['signinContainer']}>
      <div className={classes['inner']}>
        <div className={classes['header']}>
          <h2 className={classes['title']}>
            Welcome to UniClub Manager
          </h2>
          <p className={classes['subtitle']}>
            Sign in to your account
          </p>
        </div>
        <form className={classes['form']} onSubmit={handleSubmit}>
          <div className={classes['formGrid']}>
            {error && (
              <div className={classes['error']}>
                {error}
              </div>
            )}
            <div>
              <label htmlFor="username" className={classes['label']}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={classes['input']}
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="password" className={classes['label']}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={classes['input']}
                  placeholder="Enter your password"
                />
              </div>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Show password
                </label>
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={classes['button']}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </div>
        </form>
        <div className={classes['header']}>
          <p className={classes['subtitle']}>
            Don't have an account?{' '}
            <a href="/sign-up" className={classes['link']}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;