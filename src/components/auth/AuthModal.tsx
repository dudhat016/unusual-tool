import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Input, Button } from '../ui';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot_password';
}

/**
 * Format Firebase Auth error codes into human-readable messages
 */
function getFriendlyAuthErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const code = err.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase. Please contact support.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No user found with this email address. Please create an account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify and try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please reset your password or wait a few minutes.';
    case 'auth/popup-closed-by-user':
      return 'Sign in cancelled: Google popup was closed.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    default:
      return err.message || 'Authentication failed. Please verify your details and try again.';
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSentEmail, setResetSentEmail] = useState<string | null>(null);

  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    showToast,
  } = useApp();

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setResetSentEmail(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setError(null);
    setResetSentEmail(null);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      showToast('Signed in with Google successfully!', 'success');
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot_password') {
      setLoading(true);
      try {
        await sendPasswordReset(cleanEmail);
        setResetSentEmail(cleanEmail);
        showToast('Password reset link sent to your email!', 'success');
      } catch (err: any) {
        console.error('Password Reset Error', err);
        setError(getFriendlyAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(cleanEmail, password, displayName);
        showToast('Account created successfully! Welcome to AetherPix.', 'success');
        onClose();
      } else {
        await signInWithEmail(cleanEmail, password);
        showToast('Signed in successfully!', 'success');
        onClose();
      }
    } catch (err: any) {
      console.error('Email Auth Error', err);
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close auth dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            {mode === 'forgot_password' ? (
              <KeyRound className="h-6 w-6" />
            ) : (
              <Sparkles className="h-6 w-6" />
            )}
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'forgot_password' && 'Reset Your Password'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {mode === 'signin' && 'Sign in to access your cloud presets, credits, and image tools.'}
            {mode === 'signup' && 'Sign up with email & password to get 30 monthly credits.'}
            {mode === 'forgot_password' && "Enter your email to receive a password reset link."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300 text-xs font-medium animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Reset Link Sent Success Banner */}
        {mode === 'forgot_password' && resetSentEmail && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Reset Email Dispatched</span>
            </div>
            <p>
              We sent password reset instructions to <strong className="underline">{resetSentEmail}</strong>. Check your inbox and spam folder.
            </p>
          </div>
        )}

        {/* Mode Navigation Tabs (Sign In / Sign Up) */}
        {mode !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                resetFormState();
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                resetFormState();
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Google OAuth Button */}
        {mode !== 'forgot_password' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
                Or with Email & Password
              </span>
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              leftIcon={UserIcon}
              helperText="How your name appears in workspace exports and presets."
            />
          )}

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            leftIcon={Mail}
            autoComplete="email"
          />

          {mode !== 'forgot_password' && (
            <div className="space-y-1">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  leftIcon={Lock}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {mode === 'signin' && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      resetFormState();
                    }}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                leftIcon={Lock}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          )}

          <Button
            type="submit"
            isLoading={loading}
            fullWidth
            variant="primary"
            size="md"
            className="mt-2"
          >
            {mode === 'signin' && 'Sign In to AetherPix'}
            {mode === 'signup' && 'Create Account & Claim Credits'}
            {mode === 'forgot_password' && (loading ? 'Sending Reset Link...' : 'Send Password Reset Link')}
          </Button>
        </form>

        {/* Footer Links & Navigation */}
        <div className="text-center pt-2 space-y-3">
          {mode === 'forgot_password' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  resetFormState();
                }}
                className="font-bold text-primary hover:underline cursor-pointer ml-1"
              >
                Back to Sign In
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'signin' ? "Don't have an account yet?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  resetFormState();
                }}
                className="font-bold text-primary hover:underline cursor-pointer ml-1"
              >
                {mode === 'signin' ? 'Sign Up with Email' : 'Sign In'}
              </button>
            </p>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Encrypted Firebase Authentication & Secure Firestore Sync</span>
          </div>
        </div>
      </div>
    </div>
  );
};

