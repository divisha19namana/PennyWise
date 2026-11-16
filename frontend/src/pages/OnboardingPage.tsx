import React, { useState } from 'react';
import { 
  User as UserIcon, Users, Shield, Wallet, PieChart, 
  Bot, CheckCircle2, ArrowRight, ArrowLeft, Plus, Trash2, 
  Lock, AlertTriangle, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import confetti from 'canvas-confetti';

interface OnboardingPageProps {
  onFinish: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onFinish }) => {
  const { currentUser, updateUser } = useAuth();
  const { family, addAccount, updateBudgetLimit } = useFamily();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Profile
  const [profileName, setProfileName] = useState<string>(currentUser.name);
  const [currency, setCurrency] = useState<string>('₹');
  const [startDay, setStartDay] = useState<number>(1);

  // Step 2: Family Setup
  const [familyName, setFamilyName] = useState<string>(family.name);
  const [householdType, setHouseholdType] = useState<string>('Nuclear Family (Parents & Children)');
  const [inviteEmails, setInviteEmails] = useState<string[]>(['priya.sharma@pennywise.app']);
  const [newInviteEmail, setNewInviteEmail] = useState<string>('');

  // Step 4: Account Setup
  const [accountNickname, setAccountNickname] = useState<string>('HDFC Primary Salary');
  const [accountType, setAccountType] = useState<'savings' | 'credit_card' | 'cash_wallet'>('savings');
  const [openingBalance, setOpeningBalance] = useState<string>('125000');
  const [maskedNumber, setMaskedNumber] = useState<string>('•••• 4192');
  const [isAccountShared, setIsAccountShared] = useState<boolean>(false);

  // Step 5: Monthly Budget
  const [totalFamilyBudget, setTotalFamilyBudget] = useState<string>('150000');
  const [groceryLimit, setGroceryLimit] = useState<string>('25000');
  const [rentLimit, setRentLimit] = useState<string>('35000');
  const [diningLimit, setDiningLimit] = useState<string>('12000');

  // Step 6: Automatic Tracking
  const [enableSmsConsent, setEnableSmsConsent] = useState<boolean>(true);
  const [enableNotificationSync, setEnableNotificationSync] = useState<boolean>(true);
  const [allowRawMessageRetention, setAllowRawMessageRetention] = useState<boolean>(false);

  const steps = [
    { num: 1, title: 'Profile', icon: UserIcon },
    { num: 2, title: 'Family', icon: Users },
    { num: 3, title: 'Roles', icon: Shield },
    { num: 4, title: 'Accounts', icon: Wallet },
    { num: 5, title: 'Budget', icon: PieChart },
    { num: 6, title: 'Tracking', icon: Bot },
    { num: 7, title: 'Complete', icon: CheckCircle2 },
  ];

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    } else {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      onFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const addInvite = () => {
    if (newInviteEmail && !inviteEmails.includes(newInviteEmail)) {
      setInviteEmails([...inviteEmails, newInviteEmail]);
      setNewInviteEmail('');
    }
  };

  const removeInvite = (email: string) => {
    setInviteEmails(inviteEmails.filter(e => e !== email));
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B1522] py-8 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full">
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-[#1E3553]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#142B45] text-white flex items-center justify-center font-bold">
              P
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#142B45] dark:text-white">PennyWise</h2>
              <p className="text-[10px] text-[#738095] dark:text-gray-400">Family Onboarding Wizard</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
            Step {currentStep} of 7
          </span>
        </div>

        {/* Stepper Progress */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-8">
          {steps.map(s => {
            const Icon = s.icon;
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-[#16A36A] text-white shadow-sm'
                      : isCurrent
                      ? 'bg-[#142B45] dark:bg-emerald-600 text-white shadow-md ring-2 ring-[#16A36A]'
                      : 'bg-gray-100 dark:bg-[#14253A] text-gray-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="hidden sm:inline text-[10px] font-medium text-gray-500 mt-1">
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Card Content */}
        <div className="bg-white dark:bg-[#14253A] rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-[#1E3553] min-h-[420px] flex flex-col justify-between">
          <div>
            {/* STEP 1: Personal Profile */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[#142B45] dark:text-white">Personal Profile</h3>
                  <p className="text-xs text-[#738095] dark:text-gray-400 mt-0.5">
                    Tell us about yourself. Your personal finances remain strictly confidential by default.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                        Primary Currency
                      </label>
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                      >
                        <option value="₹">INR (₹) - Indian Rupee</option>
                        <option value="$">USD ($) - US Dollar</option>
                        <option value="€">EUR (€) - Euro</option>
                        <option value="£">GBP (£) - British Pound</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                        Financial Month Start Day
                      </label>
                      <select
                        value={startDay}
                        onChange={e => setStartDay(Number(e.target.value))}
                        className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                      >
                        <option value={1}>1st of every month (Standard)</option>
                        <option value={5}>5th of month (Post-Salary)</option>
                        <option value={7}>7th of month</option>
                        <option value={10}>10th of month</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Family Setup */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[#142B45] dark:text-white">Family Household Setup</h3>
                  <p className="text-xs text-[#738095] dark:text-gray-400 mt-0.5">
                    Create your family financial hub and invite your spouse or adult children.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                      Family Space Name
                    </label>
                    <input
                      type="text"
                      value={familyName}
                      onChange={e => setFamilyName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                      Household Type
                    </label>
                    <select
                      value={householdType}
                      onChange={e => setHouseholdType(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                    >
                      <option value="Nuclear Family (Parents & Children)">Nuclear Family (Parents & Children)</option>
                      <option value="Joint Family (Multi-generational)">Joint Family (Multi-generational)</option>
                      <option value="Couples & Partners">Couples & Partners</option>
                      <option value="Flatmates & Shared Household">Flatmates & Shared Household</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                      Invite Family Members by Email
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        placeholder="e.g. spouse@pennywise.app"
                        value={newInviteEmail}
                        onChange={e => setNewInviteEmail(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={addInvite}
                        className="px-4 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>

                    {/* Invite list pills */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {inviteEmails.map(email => (
                        <span key={email} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-100 dark:bg-[#1E3553] text-[#142B45] dark:text-white rounded-full text-xs">
                          <span>{email}</span>
                          <button onClick={() => removeInvite(email)} className="text-gray-400 hover:text-rose-500">
                            <Trash2 className="w-3 h-3 ml-1" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Roles & Privacy Rules */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[#142B45] dark:text-white">Family Role & Privacy Architecture</h3>
                  <p className="text-xs text-[#738095] dark:text-gray-400 mt-0.5">
                    How PennyWise guarantees individual autonomy alongside shared family visibility.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                      Family Admin (Rajesh)
                    </span>
                    <p className="text-gray-600 dark:text-gray-300">
                      Configures family budget, invites members, manages household accounts and reviews shared analytics.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                    <span className="font-bold text-blue-800 dark:text-blue-300 block mb-1">
                      Finance Manager (Priya)
                    </span>
                    <p className="text-gray-600 dark:text-gray-300">
                      Manages category limits, records household bills, tracks groceries and verifies shared expenses.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20">
                    <span className="font-bold text-purple-800 dark:text-purple-300 block mb-1">
                      Adult Member (Aarav)
                    </span>
                    <p className="text-gray-600 dark:text-gray-300">
                      Can view family pool and contribute to goals. Personal salary and shopping remain 100% hidden.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                    <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                      Dependent (Ananya)
                    </span>
                    <p className="text-gray-600 dark:text-gray-300">
                      Can log allowance spending and view family savings goals. Cannot edit family limits or see loans.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Lock className="w-4 h-4 text-[#16A36A] flex-shrink-0" />
                  <span>Personal bank accounts, salary, and personal loans are never shared automatically.</span>
                </div>
              </div>
            )}

            {/* STEP 4: Financial Accounts */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[#142B45] dark:text-white">Primary Account Setup</h3>
                  <p className="text-xs text-[#738095] dark:text-gray-400 mt-0.5">
                    Add your opening bank account or wallet. Masked digits protect privacy.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                      Account Nickname
                    </label>
                    <input
                      type="text"
                      value={accountNickname}
                      onChange={e => setAccountNickname(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                      Account Type
                    </label>
                    <select
                      value={accountType}
                      onChange={e => setAccountType(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                    >
                      <option value="savings">Savings Account</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="cash_wallet">Cash Wallet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                      Opening Balance (INR ₹)
                    </label>
                    <input
                      type="number"
                      value={openingBalance}
                      onChange={e => setOpeningBalance(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                      Masked Account Number
                    </label>
                    <input
                      type="text"
                      value={maskedNumber}
                      onChange={e => setMaskedNumber(e.target.value)}
                      className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAccountShared}
                      onChange={e => setIsAccountShared(e.target.checked)}
                      className="w-4 h-4 text-[#16A36A] rounded border-gray-300"
                    />
                    <span className="text-[#142B45] dark:text-gray-200 font-medium">
                      Make this a Shared Family Account (SBI Joint/Household Pool)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: Monthly Budget */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[#142B45] dark:text-white">Monthly Household Budget</h3>
                  <p className="text-xs text-[#738095] dark:text-gray-400 mt-0.5">
                    Set limits for common living costs. Real-time alerts trigger at 50%, 75%, 90% and 100%.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                      Total Family Monthly Budget (INR ₹)
                    </label>
                    <input
                      type="number"
                      value={totalFamilyBudget}
                      onChange={e => setTotalFamilyBudget(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-base font-bold text-[#142B45] dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Rent & Home</label>
                      <input
                        type="number"
                        value={rentLimit}
                        onChange={e => setRentLimit(e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Groceries</label>
                      <input
                        type="number"
                        value={groceryLimit}
                        onChange={e => setGroceryLimit(e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">Dining Out</label>
                      <input
                        type="number"
                        value={diningLimit}
                        onChange={e => setDiningLimit(e.target.value)}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Automatic Tracking & Consent */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-[#142B45] dark:text-white">Smart Ingestion & Tracking</h3>
                  <p className="text-xs text-[#738095] dark:text-gray-400 mt-0.5">
                    Connect bank SMS notifications with explicit user consent. We never read WhatsApp messages silently.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-gray-200 dark:border-[#1E3553] bg-gray-50 dark:bg-[#0B1522] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableSmsConsent}
                      onChange={e => setEnableSmsConsent(e.target.checked)}
                      className="w-4 h-4 mt-1 text-[#16A36A] rounded border-gray-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#142B45] dark:text-white block">
                        Enable Android Bank SMS Integration
                      </span>
                      <span className="text-[11px] text-[#738095] dark:text-gray-400 leading-relaxed block mt-0.5">
                        Only extracts bank debit/credit messages from verified sender IDs (e.g. HDFCBK, SBINB, ICICIB).
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3.5 rounded-2xl border border-gray-200 dark:border-[#1E3553] bg-gray-50 dark:bg-[#0B1522] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableNotificationSync}
                      onChange={e => setEnableNotificationSync(e.target.checked)}
                      className="w-4 h-4 mt-1 text-[#16A36A] rounded border-gray-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#142B45] dark:text-white block">
                        Real-time Push Notification Detection
                      </span>
                      <span className="text-[11px] text-[#738095] dark:text-gray-400 leading-relaxed block mt-0.5">
                        Instantly surfaces UPI payment alerts on phone for one-tap verification.
                      </span>
                    </div>
                  </label>

                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
                    <Shield className="w-4 h-4 flex-shrink-0 text-[#16A36A]" />
                    <span>You can pause tracking or delete raw message history at any time from Settings.</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: Finish & Summary */}
            {currentStep === 7 && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 text-[#16A36A] flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-[#142B45] dark:text-white">
                  You're Ready to Roll!
                </h3>
                <p className="text-xs text-[#738095] dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Your family workspace <strong>"{familyName}"</strong> is configured with complete financial privacy, monthly budget limit of <strong>₹{Number(totalFamilyBudget).toLocaleString('en-IN')}</strong>, and AI insights active.
                </p>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] max-w-md mx-auto text-left space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Admin Account:</span>
                    <span className="font-bold text-[#142B45] dark:text-white">{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Primary Bank:</span>
                    <span className="font-bold text-[#142B45] dark:text-white">{accountNickname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invited Members:</span>
                    <span className="font-bold text-emerald-600">{inviteEmails.length} Pending Invites</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-[#1E3553] mt-6">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handleBack}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                currentStep === 1
                  ? 'opacity-0 cursor-default'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1E3553]'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-2.5 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              <span>{currentStep === 7 ? 'Enter My Family Dashboard' : 'Save & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

