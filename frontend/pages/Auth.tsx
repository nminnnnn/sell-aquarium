import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Fish, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context';
import { authService } from '../services/api';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(username.trim(), password);
      if (user) {
        login(user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const user = await authService.register({
        username: username.trim(),
        password,
        name: displayName.trim() || undefined
      });
      login(user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';
  const onSubmit = isLogin ? handleLogin : handleRegister;


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-deep via-brand-ocean to-brand-cyan px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl mb-4 shadow-xl border border-white/20">
            <Fish className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Charan Aquarium
          </h1>
          <p className="text-white/80 text-sm">Welcome back! Please login to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-brand-cyan" />
            <h2 className="text-2xl font-display font-bold text-gray-900">
              {isLogin ? 'Login' : 'Register'}
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full name (optional)
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all outline-none text-gray-900 placeholder-gray-400"
                    placeholder="Enter your name"
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Enter your username"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all outline-none text-gray-900 placeholder-gray-400"
                    placeholder="Re-enter your password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading || !username.trim() || !password.trim() || (!isLogin && !confirmPassword.trim())}
              className="w-full bg-gradient-to-r from-brand-cyan to-brand-ocean text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Logging in...' : 'Registering...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Login' : 'Register'}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-600">
            {isLogin ? (
              <>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  className="text-brand-cyan font-semibold hover:underline"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  disabled={loading}
                >
                  Đăng ký
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  className="text-brand-cyan font-semibold hover:underline"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  disabled={loading}
                >
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          © {new Date().getFullYear()} Charan Aquarium. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Auth;
