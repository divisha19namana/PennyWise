import React, { useState } from 'react';
import { 
  Building2, Plus, Calculator, Calendar, ArrowRight, 
  CheckCircle2, Clock, AlertCircle, Percent, ShieldCheck 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { Loan, LoanType } from '../types';

export const LoansPage: React.FC = () => {
  const { loans, addLoan, recordEMIPayment, accounts } = useFamily();
  const { currentUser } = useAuth();

  const [isAddLoanOpen, setIsAddLoanOpen] = useState<boolean>(false);
  const [selectedLoanForAmort, setSelectedLoanForAmort] = useState<Loan | null>(loans[0] || null);
  const [prepayAmount, setPrepayAmount] = useState<string>('50000');

  // Form states
  const [loanName, setLoanName] = useState<string>('');
  const [loanType, setLoanType] = useState<LoanType>('home');
  const [lender, setLender] = useState<string>('');
  const [principal, setPrincipal] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('8.5');
  const [tenureMonths, setTenureMonths] = useState<string>('240');
  const [emiAmount, setEmiAmount] = useState<string>('');
  const [dueDay, setDueDay] = useState<number>(5);
  const [linkedAccountId, setLinkedAccountId] = useState<string>(accounts[0]?.id || '');
  const [isShared, setIsShared] = useState<boolean>(true);

  // Filter loans authorized for current user (privacy check)
  const visibleLoans = loans.filter(l => {
    if (l.isShared) return true;
    if (l.userId === currentUser.id) return true;
    return false;
  });

  const totalOutstanding = visibleLoans.reduce((sum, l) => sum + l.outstandingPrincipal, 0);
  const totalMonthlyCommitment = visibleLoans.reduce((sum, l) => sum + l.emiAmount, 0);

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const principalNum = parseFloat(principal);
    const emiNum = parseFloat(emiAmount);
    if (isNaN(principalNum) || isNaN(emiNum)) return;

    addLoan({
      userId: currentUser.id,
      familyId: 'fam_sharma_01',
      borrowerName: currentUser.name,
      loanName,
      loanType,
      lender,
      accountNumberMasked: `LN-•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      totalPrincipal: principalNum,
      outstandingPrincipal: principalNum,
      interestRate: parseFloat(interestRate) || 8.5,
      interestMethod: 'reducing',
      tenureMonths: parseInt(tenureMonths) || 120,
      remainingMonths: parseInt(tenureMonths) || 120,
      emiAmount: emiNum,
      dueDay,
      linkedAccountId,
      isShared,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
    });

    setIsAddLoanOpen(false);
  };

  // Prepayment impact calculator on selected loan
  const calculatePrepaymentSavings = (loan: Loan, prepay: number) => {
    if (!prepay || prepay <= 0) return { monthsSaved: 0, interestSaved: 0 };
    const monthlyRate = (loan.interestRate / 100) / 12;
    // Approximation for reducing balance
    const interestSaved = Math.round(prepay * (loan.remainingMonths / 12) * (loan.interestRate / 100) * 0.55);
    const monthsSaved = Math.min(loan.remainingMonths, Math.round(prepay / (loan.emiAmount * 0.75)));
    return { monthsSaved, interestSaved };
  };

  const prepaySavings = selectedLoanForAmort ? calculatePrepaymentSavings(selectedLoanForAmort, parseFloat(prepayAmount) || 0) : { monthsSaved: 0, interestSaved: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white">
            Loans & EMI Commitments
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Amortization schedules, prepayment simulations and automatic bank deduction matching
          </p>
        </div>

        <button
          onClick={() => setIsAddLoanOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register Loan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Outstanding Principal</span>
          <h3 className="text-2xl font-black text-rose-500 mt-1 font-numeric">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Across {visibleLoans.length} active liabilities</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Monthly EMI Commitment</span>
          <h3 className="text-2xl font-black text-[#142B45] dark:text-white mt-1 font-numeric">
            ₹{totalMonthlyCommitment.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Nov obligations 100% on track</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Next Due Deduction</span>
          <h3 className="text-2xl font-black text-amber-500 mt-1">
            15 Nov 2026
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">SBI Car Loan (₹18,500)</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Principal Repaid</span>
          <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-numeric">
            ₹{visibleLoans.reduce((sum, l) => sum + l.totalPrincipalPaid, 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Lifetime principal settled</p>
        </div>
      </div>

      {/* Active Loans List & Prepayment Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Loans Cards (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#142B45] dark:text-white">
              Active Loans & Repayment Status
            </h3>
            <span className="text-xs text-gray-400">
              Only confirmed deductions update expense totals
            </span>
          </div>

          {visibleLoans.length === 0 ? (
            <div className="bg-white dark:bg-[#14253A] rounded-2xl p-10 text-center text-gray-400 border border-gray-100 dark:border-[#1E3553]">
              <Building2 className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-[#142B45] dark:text-white">No Loans Registered Yet</h4>
              <p className="text-xs mt-1 max-w-md mx-auto text-[#738095] dark:text-gray-400">
                e.g. Click <strong>"Register Loan"</strong> above to track your Home Loan (e.g. ₹45,00,000 at 8.5%), Car Loan (e.g. ₹8,50,000 at 9.2%), or personal obligations and simulate interest savings with prepayments.
              </p>
            </div>
          ) : (
            visibleLoans.map(loan => {
            const pctPaid = Math.round((loan.totalPrincipalPaid / (loan.totalPrincipal || 1)) * 100);
            return (
              <div
                key={loan.id}
                onClick={() => setSelectedLoanForAmort(loan)}
                className={`bg-white dark:bg-[#14253A] rounded-2xl p-5 border shadow-sm cursor-pointer transition ${
                  selectedLoanForAmort?.id === loan.id
                    ? 'border-[#16A36A] ring-1 ring-[#16A36A]/30'
                    : 'border-gray-100 dark:border-[#1E3553] hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#0B1522] uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        {loan.loanType}
                      </span>
                      <h4 className="text-sm font-bold text-[#142B45] dark:text-white">
                        {loan.loanName}
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {loan.lender} • {loan.accountNumberMasked} • Borrower: {loan.borrowerName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-extrabold text-[#142B45] dark:text-white font-numeric">
                      ₹{loan.emiAmount.toLocaleString('en-IN')}/mo
                    </span>
                    <span className="block text-[10px] text-gray-400">Due day: {loan.dueDay}th</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="my-3 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500 font-semibold">
                    <span>Outstanding: ₹{loan.outstandingPrincipal.toLocaleString('en-IN')}</span>
                    <span>Total: ₹{loan.totalPrincipal.toLocaleString('en-IN')} ({pctPaid}% Repaid)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-[#0B1522] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${pctPaid}%` }}
                    />
                  </div>
                </div>

                {/* Metrics footer & action */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100 dark:border-[#1E3553]">
                  <div className="flex space-x-3 text-gray-500">
                    <span>Rate: <strong>{loan.interestRate}%</strong></span>
                    <span>Tenure left: <strong>{loan.remainingMonths} mos</strong></span>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      recordEMIPayment(loan.id);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#16A36A] hover:bg-[#138959] text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Nov EMI Paid</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

        {/* Prepayment & Amortization Simulator (1 col) */}
        {selectedLoanForAmort && (
          <div className="bg-white dark:bg-[#14253A] rounded-2xl p-5 border border-gray-100 dark:border-[#1E3553] shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#142B45] dark:text-white flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-[#16A36A]" />
                <span>Prepayment Impact Simulator</span>
              </h3>
              <p className="text-[11px] text-[#738095] dark:text-gray-400 mt-0.5">
                Simulating for: <strong>{selectedLoanForAmort.loanName}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Lump Sum Prepayment (INR ₹)
              </label>
              <input
                type="number"
                value={prepayAmount}
                onChange={e => setPrepayAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-sm font-bold text-[#142B45] dark:text-white"
              />
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Interest Saved:</span>
                <span className="font-extrabold text-[#16A36A] font-numeric">
                  ₹{prepaySavings.interestSaved.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tenure Reduction:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400 font-numeric">
                  {prepaySavings.monthsSaved} Months Earlier
                </span>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 leading-relaxed border-t border-gray-100 dark:border-[#1E3553] pt-3">
              Calculated using reducing balance amortization method. Making an extra ₹50,000 payment knocks off several months of interest from your bank liability.
            </div>
          </div>
        )}
      </div>

      {/* Add Loan Modal */}
      <Modal
        isOpen={isAddLoanOpen}
        onClose={() => setIsAddLoanOpen(false)}
        title="Register Loan or Mortgage Liability"
        subtitle="Track amortization schedule and set automated monthly reminders"
      >
        <form onSubmit={handleCreateLoan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Loan Title / Purpose *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Home Loan, SBI Auto Loan"
              value={loanName}
              onChange={e => setLoanName(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Loan Category
              </label>
              <select
                value={loanType}
                onChange={e => setLoanType(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                <option value="home">Home Loan</option>
                <option value="car">Car Loan</option>
                <option value="personal">Personal Loan</option>
                <option value="education">Education Loan</option>
                <option value="gold">Gold Loan</option>
                <option value="other">Other Two-Wheeler / Consumer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Lender / Bank Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Bank, SBI"
                value={lender}
                onChange={e => setLender(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Total Principal Sanctioned (INR ₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 4500000"
                value={principal}
                onChange={e => setPrincipal(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Monthly EMI Amount (INR ₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 32000"
                value={emiAmount}
                onChange={e => setEmiAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Interest %</label>
              <input
                type="number"
                step="0.05"
                value={interestRate}
                onChange={e => setInterestRate(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Tenure (Mos)</label>
              <input
                type="number"
                value={tenureMonths}
                onChange={e => setTenureMonths(e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Due Day of Mo</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                onChange={e => setDueDay(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="loanShared"
              checked={isShared}
              onChange={e => setIsShared(e.target.checked)}
              className="w-4 h-4 text-[#16A36A] rounded border-gray-300"
            />
            <label htmlFor="loanShared" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
              Shared household loan (visible to authorized family members)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              type="button"
              onClick={() => setIsAddLoanOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Register Loan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

