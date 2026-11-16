import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, Heart, Lock, Key, 
  Check, X, Settings2, Trash2, Mail, Sparkles 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { FamilyMember, FamilyPermissions, FamilyRole } from '../types';

export const FamilyPage: React.FC = () => {
  const { family, members, updateMemberPermissions, inviteMember, removeMember } = useFamily();
  const { currentUser } = useAuth();

  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<FamilyRole>('AdultMember');

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState<boolean>(false);
  const [tempPermissions, setTempPermissions] = useState<FamilyPermissions | null>(null);

  const handleOpenPermissions = (member: FamilyMember) => {
    setSelectedMember(member);
    setTempPermissions({ ...member.permissions });
    setIsPermissionsOpen(true);
  };

  const handleSavePermissions = () => {
    if (selectedMember && tempPermissions) {
      updateMemberPermissions(selectedMember.id, tempPermissions);
      setIsPermissionsOpen(false);
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    inviteMember(inviteEmail.trim(), inviteRole, inviteName.trim());
    setInviteName('');
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#142B45] via-[#1C3B5E] to-[#16A36A] text-white rounded-3xl p-6 sm:p-8 shadow-fintech-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl p-2 bg-white/10 rounded-2xl backdrop-blur-md">
              {family.avatar}
            </span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {family.name}
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                Active family workspace • {members.length} Household Members
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-200 max-w-xl leading-relaxed mt-2">
            A cooperative space for family budgets and shared goals, while respecting individual privacy for personal salaries and private purchases.
          </p>
        </div>

        {currentUser.role === 'FamilyAdmin' && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-white text-[#142B45] hover:bg-gray-100 rounded-xl text-xs font-bold shadow-md transition self-start sm:self-center"
          >
            <UserPlus className="w-4 h-4 text-[#16A36A]" />
            <span>Invite Family Member</span>
          </button>
        )}
      </div>

      {/* Family Financial Pool Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Monthly Pool</span>
          <h3 className="text-2xl font-black text-[#142B45] dark:text-white mt-1 font-numeric">
            ₹{family.totalMonthlyBudget.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Allocated family living expenditure</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Monthly Contribution Total</span>
          <h3 className="text-2xl font-black text-[#16A36A] mt-1 font-numeric">
            ₹{members.reduce((sum, m) => sum + m.sharedContributionMonth, 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Pooled across earning members</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Active Contributors</span>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-numeric">
            {members.filter(m => m.sharedContributionMonth > 0).length} of {members.length}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">All transparent and tracked</p>
        </div>
      </div>

      {/* Members Grid Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#142B45] dark:text-white">
            Household Members & Permissions
          </h3>
          <span className="text-xs text-[#738095] dark:text-gray-400">
            Click configure to adjust role permissions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map(member => (
            <div
              key={member.id}
              className="bg-white dark:bg-[#14253A] rounded-2xl p-5 border border-gray-100 dark:border-[#1E3553] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500"
                      />
                      {member.isOnline && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#14253A]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#142B45] dark:text-white flex items-center space-x-1.5">
                        <span>{member.name}</span>
                        {member.userId === currentUser.id && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                            You
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-400">{member.email}</p>
                      <div className="mt-1">
                        <RoleBadge role={member.role} size="sm" />
                      </div>
                    </div>
                  </div>

                  {currentUser.role === 'FamilyAdmin' && member.userId !== currentUser.id && (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E3553]"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Contribution details */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-50 dark:bg-[#0B1522] border border-gray-100 dark:border-[#1E3553] text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Monthly Contribution</span>
                    <span className="font-bold text-[#142B45] dark:text-white font-numeric">
                      ₹{member.sharedContributionMonth.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Joined Space</span>
                    <span className="font-semibold text-gray-600 dark:text-gray-300">
                      {member.joinedDate}
                    </span>
                  </div>
                </div>

                {/* Privacy Indicators */}
                <div className="space-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Personal salary: <strong>{member.sharingSettings.shareSalary ? 'Shared' : 'Private'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                    <span>Personal accounts: <strong>{member.sharingSettings.shareAccounts ? 'Shared' : 'Hidden'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#1E3553] flex justify-end">
                <button
                  onClick={() => handleOpenPermissions(member)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#1E3553] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1E3553] transition"
                >
                  <Settings2 className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span>Configure Permissions</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Modal */}
      {selectedMember && tempPermissions && (
        <Modal
          isOpen={isPermissionsOpen}
          onClose={() => setIsPermissionsOpen(false)}
          title={`Configure Permissions for ${selectedMember.name}`}
          subtitle={`Role: ${selectedMember.role}`}
        >
          <div className="space-y-4">
            <div className="space-y-2.5">
              {[
                { key: 'canViewFamilyBudget', label: 'View Family Monthly Budget', desc: 'Can see total household limits & overall spent' },
                { key: 'canEditFamilyBudget', label: 'Edit Family Monthly Budget', desc: 'Can modify category limits and monthly allocations' },
                { key: 'canViewSharedTransactions', label: 'View Shared Family Activity', desc: 'Can see common household bills, groceries & dining' },
                { key: 'canAddSharedTransactions', label: 'Add Shared Family Transactions', desc: 'Can record expenses towards family pool' },
                { key: 'canViewReports', label: 'Access Financial Analytics & Reports', desc: 'Can view monthly charts and export PDF reports' },
                { key: 'canManageAccounts', label: 'Manage Household Bank Accounts', desc: 'Can link or reconcile joint accounts & wallets' },
                { key: 'canViewSharedLoans', label: 'View Shared Loans & EMI Schedules', desc: 'Can inspect home loans and car loans' },
                { key: 'canManageSavingsGoals', label: 'Contribute to Family Savings Goals', desc: 'Can create and pool money into vacation & emergency goals' },
              ].map(item => (
                <label
                  key={item.key}
                  className="flex items-start space-x-3 p-3 rounded-xl border border-gray-100 dark:border-[#1E3553] hover:bg-gray-50 dark:hover:bg-[#0B1522] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(tempPermissions[item.key as keyof FamilyPermissions])}
                    onChange={e => setTempPermissions({ ...tempPermissions, [item.key]: e.target.checked })}
                    className="w-4 h-4 mt-0.5 text-[#16A36A] rounded border-gray-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#142B45] dark:text-white block">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-[#738095] dark:text-gray-400 block mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-[#1E3553]">
              <button
                type="button"
                onClick={() => setIsPermissionsOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Family Member"
        subtitle="They will receive an email invitation to join your PennyWise household"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Member Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Maya Sharma"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="name@pennywise.app"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Assigned Role
            </label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as any)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm text-[#142B45] dark:text-white"
            >
              <option value="FinanceManager">Finance Manager (Co-manager of household budget)</option>
              <option value="AdultMember">Adult Member (Independent contributor with private finances)</option>
              <option value="Dependent">Dependent (View savings goals, student allowance)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Send Invitation Link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

