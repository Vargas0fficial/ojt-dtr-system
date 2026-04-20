'use client';
import { signIn } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Account created! You can now sign in.');
      setTimeout(() => setSuccess(''), 4000);
    }
    if (searchParams.get('deleted') === 'true') {
      setSuccess('Account deleted successfully.');
      setTimeout(() => setSuccess(''), 4000);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OJT DTR System</h1>
          <p className="text-gray-600">Sign in to track your hours</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-400 active:scale-98"
          >
            {loading? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
          >
            Register here
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500 space-y-1">
        <p>© {new Date().getFullYear()}  OJT Daily Time Monitoring System</p>
        <a
          href="https://ko-fi.com/mbvargas"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-yellow-600 transition-colors"
        >
          ☕ Buy me a coffee?
        </a>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}