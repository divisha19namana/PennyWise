import React, { useState } from 'react';
import { 
  Settings, User, Users, Shield, Bell, Bot, 
  Lock, Sun, Moon, Laptop, CheckCircle2, AlertTriangle, 
  Trash2, Download, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

export const SettingsPage: React.FC = () => {
  const { currentUser, updateUser, logout } = useAuth();
  const { family } = useFamily();
  const { theme, setTheme } = useTheme();
  const { showToast } = useNotifications();

  const [activeSection, setActiveSection] = useState<'profile' | 'family' | 'financial' | 'notifications' | 'tracking' | 'security' | 'privacy' | 'appearance'>('profile');

  // Profile form state
  const [name, setName] = useState<string>(currentUser.name);
  const [email, setEmail] = useState<string>(currentUser.email);
  const [phone, setPhone] = useState<string>(currentUser.phone);

  // Financial settings state
  const [currency, setCurrency] = useState<string>(currentUser.currency);
  const [monthStartDay, setMonthStartDay] = useState<number>(currentUser.financialMonthStartDay);

  // Notification toggles
  const [inAppAlerts, setInAppAlerts] = useState<boolean>(true);
  const [pushAlerts, setPushAlerts] = useState<boolean>(true);
  const [maskLockScreenAmounts, setMaskLockScreenAmounts] = useState<boolean>(true);

  // 2FA toggle
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, email, phone });
    showToast('Profile Saved', 'Personal information updated successfully.', 'success');
  };

  const handleSaveFinancials = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ currency, financialMonthStartDay: monthStartDay });
    showToast('Preferences Saved', 'Financial cycle and currency updated.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#142B45] dark:text-white">
          Settings & Privacy Center
        </h2>
        <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
          Manage your account profile, family data sharing, security policies and appearance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="bg-white dark:bg-[#14253A] rounded-2xl p-3 border border-gray-100 dark:border-[#1E3553] shadow-sm space-y-1 h-fit">
          {[
            { id: 'profile', label: 'Personal Profile', icon: User },
            { id: 'family', label: 'Family Space', icon: Users },
            { id: 'financial', label: 'Financial Preferences', icon: Shield },
            { id: 'notifications', label: 'Notification Settings', icon: Bell },
            { id: 'tracking', label: 'Automatic Tracking', icon: Bot },
            { id: 'security', label: 'Security & 2FA', icon: Lock },
            { id: 'privacy', label: 'Privacy & Data Deletion', icon: Shield },
            { id: 'appearance', label: 'Theme Appearance', icon: Sun },
          ].map(sec => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1E3553]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#14253A] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-[#1E3553] shadow-sm">
          {/* PROFILE SECTION */}
          {activeSection === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-gray-100 dark:border-[#1E3553] pb-4">
                <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                  Personal Information
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update your contact details and household avatar
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
                <div>
                  <button
                    type="button"
                    onClick={() => showToast('Avatar Upload', 'Photo selection opened.', 'info')}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-[#1E3553] hover:bg-gray-200 text-xs font-semibold rounded-xl"
                  >
                    Change Photo
                  </button>
                  <p className="text-[10px] text-gray-400 mt-1">PNG or JPG, max 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                    Mobile Number (SMS verification)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                    Current Assigned Role
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.role}
                    className="w-full px-3.5 py-2 bg-gray-100 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-gray-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-[#1E3553]">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* FINANCIAL PREFERENCES */}
          {activeSection === 'financial' && (
            <form onSubmit={handleSaveFinancials} className="space-y-6">
              <div className="border-b border-gray-100 dark:border-[#1E3553] pb-4">
                <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                  Financial Preferences
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Customize currency formats and salary payment cycle timing
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                    Base Currency
                  </label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
                  >
                    <option value="₹">INR (₹) - Indian Rupee</option>
                    <option value="$">USD ($) - US Dollar</option>
                    <option value="€">EUR (€) - Euro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                    Financial Cycle Start Day
                  </label>
                  <select
                    value={monthStartDay}
                    onChange={e => setMonthStartDay(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
                  >
                    <option value={1}>1st of every month</option>
                    <option value={5}>5th of month (Post salary credit)</option>
                    <option value={10}>10th of month</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-[#1E3553]">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Save Financial Preferences
                </button>
              </div>
            </form>
          )}

          {/* NOTIFICATION SETTINGS */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-[#1E3553] pb-4">
                <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                  Notification Channels & Privacy Previews
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Configure real-time alerts and lock screen privacy safeguards
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-[#1E3553] cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#142B45] dark:text-white block">
                      In-App Real-time SignalR Alerts
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Pop up immediate alerts when expenses or EMI deductions occur
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppAlerts}
                    onChange={e => setInAppAlerts(e.target.checked)}
                    className="w-4 h-4 text-[#16A36A] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-[#1E3553] cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#142B45] dark:text-white block">
                      Lock-Screen Sensitive Amount Masking
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Hide exact bank balances and large amounts on Android lock screen previews
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maskLockScreenAmounts}
                    onChange={e => setMaskLockScreenAmounts(e.target.checked)}
                    className="w-4 h-4 text-[#16A36A] rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* SECURITY & 2FA */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-[#1E3553] pb-4">
                <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                  Security, Sessions & 2FA
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Password rotation, two-factor authentication and active device management
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-gray-100 dark:border-[#1E3553] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#142B45] dark:text-white block">
                    Two-Factor Authentication (OTP / Authenticator App)
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Require extra verification code when signing in on a new device
                  </span>
                </div>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast('2FA Status Updated', twoFactorEnabled ? '2FA disabled.' : '2FA enabled with authenticator.', 'info');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                    twoFactorEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 dark:bg-[#1E3553] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {twoFactorEnabled ? 'Enabled ✓' : 'Enable 2FA'}
                </button>
              </div>

              <div className="border-t border-gray-100 dark:border-[#1E3553] pt-4">
                <h4 className="text-xs font-bold text-[#142B45] dark:text-white mb-2">
                  Active Login Sessions
                </h4>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#0B1522] border border-gray-100 dark:border-[#1E3553] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#142B45] dark:text-white block">Chrome on Windows (Current Session)</span>
                    <span className="text-[10px] text-gray-400">IP: 103.21.24.8 • Active Now</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#16A36A]">This Device</span>
                </div>
              </div>
            </div>
          )}

          {/* THEME APPEARANCE */}
          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-[#1E3553] pb-4">
                <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                  Theme Appearance
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Select your preferred interface styling
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { mode: 'light', label: 'Light Theme', icon: Sun },
                  { mode: 'dark', label: 'Dark Fintech Navy', icon: Moon },
                  { mode: 'system', label: 'System Default', icon: Laptop },
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = theme === item.mode;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => setTheme(item.mode as any)}
                      className={`p-5 rounded-2xl border flex flex-col items-center justify-center space-y-2 transition ${
                        isSelected
                          ? 'border-[#16A36A] ring-2 ring-[#16A36A]/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                          : 'border-gray-200 dark:border-[#1E3553] hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-[#16A36A]' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold text-[#142B45] dark:text-white">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PRIVACY & DATA DELETION */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-[#1E3553] pb-4">
                <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                  Privacy & Data Erasure Rights
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Export complete data archive or request account termination
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#1E3553] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#142B45] dark:text-white block">
                    Export All Financial Records
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Download complete encrypted JSON archive of transactions, accounts and budgets
                  </span>
                </div>
                <button
                  onClick={() => showToast('Data Export', 'Data archive compiled and ready for download.', 'success')}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-200 dark:border-[#1E3553] text-xs font-semibold"
                >
                  Export Archive
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                    Permanently Delete Family Space
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Irrevocably erase all historical transactions, messages, and bank connections
                  </span>
                </div>
                <button
                  onClick={() => alert("Deletion confirmation prompt: Enter 'DELETE' to confirm irreversible erasure.")}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Delete Space
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

