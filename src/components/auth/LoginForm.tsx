import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onToggleForm: () => void;
  isLoading: boolean;
}

// Login form component for user authentication - Input: login callback, form toggle, loading state, Output: void
export default function LoginForm({ onLogin, onToggleForm, isLoading }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await onLogin(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-amber-50/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-300 p-6 max-w-md w-full"
    >
      <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">Sign In</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-amber-800 text-sm font-medium mb-2">
            Username or Email
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Enter username or email"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-amber-800 text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Enter password"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <button
            type="button"
            onClick={onToggleForm}
            className="text-amber-600 hover:text-amber-800 text-sm underline"
            disabled={isLoading}
          >
            Don't have an account? Sign up
          </button>
        </div>
      </form>
    </motion.div>
  );
}