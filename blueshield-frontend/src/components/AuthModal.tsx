'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one digit");
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate password in real-time for signup
    if (isSignUp && name === 'password') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Registration
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Validate password strength
        const passwordValidationErrors = validatePassword(formData.password);
        if (passwordValidationErrors.length > 0) {
          setPasswordErrors(passwordValidationErrors);
          throw new Error('Password does not meet requirements');
        }

        await register(formData.email, formData.username, formData.password);
        setSuccess('Account created successfully! Please sign in.');
        setIsSignUp(false);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        setPasswordErrors([]);
      } else {
        // Login
        await login(formData.email, formData.password);
        setSuccess('Login successful!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    // Toggle between Sign In and Sign Up
    // Flips isSignUp and clears form/feedback state
    // Triggers CSS transforms that slide panels and overlay
    setIsSignUp(!isSignUp);
    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    setError(null);
    setSuccess(null);
    setPasswordErrors([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md " onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden z-[10000] border border-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10001] w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg cursor-pointer"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative h-[650px] overflow-hidden">
          {/*
            Sliding forms container
            - Two panels sit side-by-side (container width is 200%).
            - When isSignUp is true, translate -50% to reveal the Sign Up panel.
          */}
          <div
            className={cn(
              "flex w-[200%] h-full transition-transform duration-500 ease-in-out",
              isSignUp ? "-translate-x-1/2" : "translate-x-0"
            )}
          >
            {/* Sign In Panel */}
            <div className="w-1/2 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white px-16">
              <div className="w-[40%] ml-auto">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back!</h2>
                  <p className="text-gray-600 text-lg">Sign in to your account</p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ocean-primary focus:border-ocean-primary outline-none transition-all duration-200 bg-white shadow-sm text-black"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ocean-primary focus:border-ocean-primary outline-none transition-all duration-200 bg-white shadow-sm text-black"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-ocean-primary accent-ocean-primary" />
                      <span className="ml-2 text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="text-ocean-primary hover:text-ocean-secondary font-medium">Forgot password?</a>
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-ocean-primary to-ocean-secondary hover:from-ocean-secondary hover:to-ocean-primary text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                  </Button>
                </form>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-600">New to BlueShield? 
                    <button onClick={toggleForm} className="text-ocean-primary hover:text-ocean-secondary font-semibold ml-1">
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Sign Up Panel */}
            <div className="w-1/2 h-full flex flex-col justify-center bg-gradient-to-br from-gray-50 to-white px-16">
              <div className="w-[50%] mr-auto h-full overflow-y-auto pr-16 py-16">
                <div className="text-center mb-8">
                  <h2 className="text-3xl w-full font-bold text-gray-900 mb-3">Create Account</h2>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6 px-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ocean-primary focus:border-ocean-primary outline-none transition-all duration-200 bg-white shadow-sm text-black"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-ocean-primary focus:border-ocean-primary outline-none transition-all duration-200 bg-white shadow-sm text-black"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-ocean-primary focus:border-ocean-primary outline-none transition-all duration-200 bg-white shadow-sm text-black ${
                        passwordErrors.length > 0 ? 'border-red-300' : 'border-gray-200'
                      }`}
                      required
                    />
                    {/* Password Requirements */}
                    <div className="text-xs text-gray-600 mt-2">
                      <p className="font-medium mb-1">Password must contain:</p>
                      <ul className="space-y-1">
                        <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-2">{formData.password.length >= 8 ? '✓' : '○'}</span>
                          At least 8 characters
                        </li>
                        <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-2">{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
                          One uppercase letter
                        </li>
                        <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-2">{/[a-z]/.test(formData.password) ? '✓' : '○'}</span>
                          One lowercase letter
                        </li>
                        <li className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-2">{/\d/.test(formData.password) ? '✓' : '○'}</span>
                          One number
                        </li>
                        <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                          <span className="mr-2">{/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '✓' : '○'}</span>
                          One special character
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-ocean-primary focus:border-ocean-primary outline-none transition-all duration-200 bg-white shadow-sm text-black ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword 
                          ? 'border-red-300' 
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-300'
                          : 'border-gray-200'
                      }`}
                      required
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                    )}
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-green-600 text-xs mt-1">✓ Passwords match</p>
                    )}
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm">
                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-ocean-primary accent-ocean-primary" required />
                    <span className="text-gray-600">
                      I agree to the <a href="#" className="text-ocean-primary hover:text-ocean-secondary font-medium">Terms of Service</a> and <a href="#" className="text-ocean-primary hover:text-ocean-secondary font-medium">Privacy Policy</a>
                    </span>
                  </div>
                  
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-ocean-primary to-ocean-secondary hover:from-ocean-secondary hover:to-ocean-primary text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                  </Button>
                </form>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-600">Already have an account? 
                    <button onClick={toggleForm} className="text-ocean-primary hover:text-ocean-secondary font-semibold ml-1">
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sliding Overlay */}
        {/*
          Sliding overlay panel
          - Colored overlay covers half the modal (w-1/2) above content.
          - Moves to the right (translate-x-full) when isSignUp is true.
        */}
          <div className={cn(
            "absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-ocean-primary via-ocean-secondary to-ocean-deep transition-transform duration-500 ease-in-out z-10",
            isSignUp ? "translate-x-full" : "translate-x-0"
          )}>
            <div className="h-full flex flex-col items-center justify-center px-16 text-center text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                <div className="absolute bottom-20 right-16 w-24 h-24 bg-white rounded-full"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
              </div>
              
              <div className="relative z-10">
                
                
                <h2 className="text-4xl font-bold mb-4">
                  {isSignUp ? "Welcome Back!" : "Hello, Friend!"}
                </h2>
                <p className="text-white/90 text-lg mb-10 max-w-sm leading-relaxed">
                  {isSignUp 
                    ? "To keep connected with us please login to your account"
                    : "Create an account to start your journey with us"
                  }
                </p>
                
                <Button
                  onClick={toggleForm}
                  variant="secondary"
                  size="lg"
                  className="bg-white text-ocean-primary hover:bg-white/90 border-2 border-white font-semibold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isSignUp ? "SIGN IN" : "SIGN UP"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
