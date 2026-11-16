import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { FamilyRole } from '../types';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onOpenOnboarding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onOpenOnboarding }) => {
  const { login } = useAuth();
  
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [emailOrPhone, setEmailOrPhone] = useState<string>('rajesh.sharma@pennywise.app');
  const [fullName, setFullName] = useState<string>('Rajesh Sharma');
  const [mobileNumber, setMobileNumber] = useState<string>('+91 98765 43210');
  const [password, setPassword] = useState<string>('PennyWise@2026');
  const [confirmPassword, setConfirmPassword] = useState<string>('PennyWise@2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [termsConsent, setTermsConsent] = useState<boolean>(true);
  const [selectedDemoRole, setSelectedDemoRole] = useState<FamilyRole>('FamilyAdmin');
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const calculatePasswordStrength = (pass: string): { label: string; percent: number; color: string } => {
    if (!pass) return { label: 'None', percent: 0, color: 'bg-gray-200' };
    if (pass.length < 6) return { label: 'Weak', percent: 25, color: 'bg-rose-500' };
    if (pass.length < 8) return { label: 'Fair', percent: 50, color: 'bg-amber-500' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
      return { label: 'Strong', percent: 100, color: 'bg-[#16A36A]' };
    }
    return { label: 'Moderate', percent: 75, color: 'bg-blue-500' };
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage("Please enter your email or mobile number.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMessage("Please enter your full name.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
      if (!termsConsent) {
        setErrorMessage("Please agree to the Terms of Service & Privacy Policy.");
        return;
      }
      setSuccessMessage("Your account has been verified successfully.");
      setTimeout(() => {
        login(emailOrPhone, selectedDemoRole);
        onOpenOnboarding();
      }, 700);
      return;
    }

    // Login path
    setSuccessMessage("Login successful. Welcome back!");
    setTimeout(() => {
      login(emailOrPhone, selectedDemoRole);
      onLoginSuccess();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B1522] flex">
      {/* Left side: Premium Fintech Brand Identity */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#142B45] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative glowing background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#16A36A]/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-white to-[#16A36A] flex items-center justify-center text-[#142B45] font-black text-xl shadow-lg">
              P
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                PennyWise
              </span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#16A36A]/20 text-[#16A36A] border border-[#16A36A]/40">
                Fintech 2.0
              </span>
            </div>
          </div>
          <p className="text-emerald-400 font-medium text-sm mt-2">
            Your Money. Your Family. Your Financial Clarity.
          </p>
        </div>

        {/* Feature Cards Showcase */}
        <div className="relative z-10 space-y-6 max-w-md my-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
            <div className="flex items-center space-x-3 text-emerald-300 mb-2">
              <ShieldCheck className="w-6 h-6 text-[#16A36A]" />
              <h4 className="font-bold text-sm text-white">Private by Default Architecture</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Family members share household budgets and common bills without exposing individual salaries, personal accounts, or private savings.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15">
            <div className="flex items-center space-x-3 text-emerald-300 mb-2">
              <CheckCircle2 className="w-6 h-6 text-[#16A36A]" />
              <h4 className="font-bold text-sm text-white">Smart Automatic Ingestion</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Real-time SMS & UPI message parsing with multi-field duplicate detection and SignalR synchronization.
            </p>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 text-xs text-gray-400 flex items-center justify-between border-t border-white/10 pt-4">
          <span>Trusted by modern families worldwide</span>
          <span>© 2026 PennyWise Inc.</span>
        </div>
      </div>

      {/* Right side: Login & Registration Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-[#14253A] rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-[#1E3553]">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center space-x-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#142B45] text-white flex items-center justify-center font-black">
              P
            </div>
            <div>
              <h2 className="text-lg font-black text-[#142B45] dark:text-white">PennyWise</h2>
              <p className="text-[11px] text-[#738095] dark:text-gray-400">Your Financial Clarity</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#142B45] dark:text-white">
              {isRegister ? 'Create Family Account' : 'Welcome to PennyWise'}
            </h2>
            <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
              {isRegister
                ? 'Set up your profile and family finance workspace in seconds'
                : 'Sign in to access your family finances and smart insights'}
            </p>
          </div>

          {/* Role quick toggle for Demo Testing */}
          <div className="mb-5 p-3 rounded-2xl bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553]">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#738095] dark:text-gray-400 mb-2">
              Select Demo Persona (Full Role Testing):
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { role: 'FamilyAdmin', name: 'Rajesh (Admin)' },
                { role: 'FinanceManager', name: 'Priya (Manager)' },
                { role: 'AdultMember', name: 'Aarav (Adult)' },
                { role: 'Dependent', name: 'Ananya (Student)' },
              ].map(item => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => {
                    setSelectedDemoRole(item.role as FamilyRole);
                    if (item.role === 'FamilyAdmin') setEmailOrPhone('rajesh.sharma@pennywise.app');
                    if (item.role === 'FinanceManager') setEmailOrPhone('priya.sharma@pennywise.app');
                    if (item.role === 'AdultMember') setEmailOrPhone('aarav.sharma@pennywise.app');
                    if (item.role === 'Dependent') setEmailOrPhone('ananya.sharma@pennywise.app');
                  }}
                  className={`py-1.5 px-2 rounded-xl font-medium text-center transition ${
                    selectedDemoRole === item.role
                      ? 'bg-[#16A36A] text-white font-bold shadow-sm'
                      : 'bg-white dark:bg-[#14253A] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#1E3553]'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Email or Mobile Number *
              </label>
              <input
                type="text"
                required
                placeholder="name@pennywise.app or +91 98765 43210"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                  Mobile Number (for SMS sync)
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200">
                  Password *
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link sent to your registered email.")}
                    className="text-xs text-[#16A36A] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${passwordStrength.percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-gray-400">Security: {passwordStrength.label}</span>
                  <span className="text-[10px] text-gray-400">Min. 8 characters</span>
                </div>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                />
              </div>
            )}

            {/* Checkboxes */}
            <div className="flex items-center justify-between text-xs pt-1">
              {!isRegister ? (
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#16A36A] rounded border-gray-300 focus:ring-[#16A36A]"
                  />
                  <span className="text-[#738095] dark:text-gray-300">Remember this device</span>
                </label>
              ) : (
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsConsent}
                    onChange={e => setTermsConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#16A36A] rounded border-gray-300 focus:ring-[#16A36A]"
                  />
                  <span className="text-[#738095] dark:text-gray-300 leading-tight">
                    I agree to the Terms of Service and Family Financial Privacy Consent.
                  </span>
                </label>
              )}
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#16A36A] hover:bg-[#138959] text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>{isRegister ? 'Start Family Onboarding' : 'Sign In to PennyWise'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-[#1E3553] text-center">
            <p className="text-xs text-[#738095] dark:text-gray-400">
              {isRegister ? 'Already have an account?' : "Don't have a family account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-[#16A36A] font-bold hover:underline"
              >
                {isRegister ? 'Sign in' : 'Create family space'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

