import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

interface SignupFormProps {
  onSignup: (username: string, email: string, password: string) => Promise<void>;
  onToggleForm: () => void;
  isLoading: boolean;
}

// Signup form component for user registration - Input: signup callback, form toggle, loading state, Output: void
export default function SignupForm({ onSignup, onToggleForm, isLoading }: SignupFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await onSignup(username.trim(), email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-amber-50/90 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-300 p-6 max-w-md w-full"
    >
      <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">Create Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-amber-800 text-sm font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Choose a username"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-amber-800 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Enter your email"
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
            placeholder="Choose a password (6+ characters)"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-amber-800 text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Confirm your password"
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
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <button
            type="button"
            onClick={onToggleForm}
            className="text-amber-600 hover:text-amber-800 text-sm underline"
            disabled={isLoading}
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </motion.div>
  );
}