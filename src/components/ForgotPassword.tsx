import { supabase } from "../lib/supabase";
import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void; // Callback to go back to the sign-in form
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Show success/error feedback

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Tell Supabase where to redirect after the user clicks the email link.
      // This should be your app's URL — during development it's localhost.
      redirectTo: `${window.location.origin}`,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("✅ Check your email for the password reset link!");
    }
    setLoading(false);
  };
  return (
    <div>
      {/* <h2>Reset your password</h2> */}
      {/* Add email input + reset logic here */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          {/* Back button — calls the onBack prop to return to login */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 mt-2">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              {/* Show success or error feedback */}
              {message && (
                <div className={`px-4 py-3 rounded-lg text-sm ${
                  message.startsWith('Error') 
                    ? 'bg-red-50 border border-red-200 text-red-700' 
                    : 'bg-green-50 border border-green-200 text-green-700'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
          </form>
        </div>
      </div>
    </div>
  );
}
