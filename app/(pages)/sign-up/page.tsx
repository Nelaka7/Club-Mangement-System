'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import classes from './page.module.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'General Member',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to sign-in page after successful registration
        router.push('/sign-in');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

return (
    <div className={classes['signupBackground']}>
      <div className={classes['inner']}>
        <div className={classes['header']}>
          <h2 className={classes['title']}>
            Join UniClub Manager
          </h2>
          <p className={classes['subtitle']}>
            Create your account to get started
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
                value={formData.username}
                onChange={handleChange}
                className={classes['input']}
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label htmlFor="email" className={classes['label']}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={classes['input']}
                placeholder="Enter your email"
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
                  value={formData.password}
                  onChange={handleChange}
                  className={classes['input']}
                  placeholder="Create a password"
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
              <label htmlFor="confirmPassword" className={classes['label']}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={classes['input']}
                  placeholder="Confirm your password"
                />
              </div>
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showConfirmPassword}
                    onChange={(e) => setShowConfirmPassword(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Show password
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="role" className={classes['label']}>
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={classes['select']}
              >
                <option value="General Member">General Member</option>
                <option value="Club Executive">Club Executive</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={classes['button']}
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </div>
          </div>
        </form>
        <div className={classes['header']}>
          <p className={classes['linkText']}>
            Already have an account?{' '}
            <a href="/sign-in" className={classes['link']}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
