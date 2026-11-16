import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Plus, CheckCircle2, Clock, 
  AlertCircle, ChevronLeft, ChevronRight, Bell, Shield 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { CalendarEvent } from '../types';

export const CalendarPage: React.FC = () => {
  const { calendarEvents, addCalendarEvent, markCalendarEventPaid } = useFamily();
  const { currentUser } = useAuth();

  const [viewMode, setViewMode] = useState<'upcoming' | 'month' | 'week'>('upcoming');
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<any>('utility');
  const [isShared, setIsShared] = useState<boolean>(true);
  const [responsibleMember, setResponsibleMember] = useState<string>(currentUser.name);

  const upcomingEvents = calendarEvents.filter(e => e.status === 'upcoming');
  const paidEvents = calendarEvents.filter(e => e.status === 'paid');

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    addCalendarEvent({
      title,
      amount: numAmount,
      date,
      type,
      responsibleMember,
      isShared,
      status: 'upcoming',
    });

    setTitle('');
    setAmount('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
            <span>Financial Calendar & Due Dates</span>
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Never miss an EMI, insurance renewal, electricity bill or credit card payment date
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex p-1 bg-gray-100 dark:bg-[#1E3553] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('upcoming')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'upcoming' ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Upcoming List
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'month' ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Month View
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Due in Next 15 Days</span>
          <h3 className="text-2xl font-black text-amber-500 mt-1 font-numeric">
            ₹{upcomingEvents.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{upcomingEvents.length} scheduled payment dates</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Settled This Month</span>
          <h3 className="text-2xl font-black text-[#16A36A] mt-1 font-numeric">
            ₹{paidEvents.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">{paidEvents.length} verified obligations paid</p>
        </div>

        <div className="bg-white dark:bg-[#14253A] border border-gray-100 dark:border-[#1E3553] rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Overdue Obligations</span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-numeric">
            0 Overdue
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Clean family record</p>
        </div>
      </div>

      {/* Events List / Calendar Grid */}
      <div className="bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#142B45] dark:text-white">
            November 2026 Scheduled Events
          </h3>
          <span className="text-xs text-gray-400">
            A scheduled event only becomes an expense once verified
          </span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-[#1E3553]">
          {calendarEvents.map(event => (
            <div key={event.id} className="py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-[#1E3553]/20 transition text-xs">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold ${
                  event.status === 'paid'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#16A36A]'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                }`}>
                  <span className="text-[10px] uppercase font-semibold leading-none">Nov</span>
                  <span className="text-base leading-tight font-numeric">
                    {event.date.split('-')[2]}
                  </span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#142B45] dark:text-white text-sm">
                      {event.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#0B1522] text-gray-600 dark:text-gray-300">
                      {event.type}
                    </span>
                    {!event.isShared && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600">
                        Personal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Responsible: {event.responsibleMember} • Due date: {event.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#142B45] dark:text-white font-numeric">
                    ₹{event.amount.toLocaleString('en-IN')}
                  </span>
                  <span className={`block text-[10px] font-bold ${
                    event.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {event.status === 'paid' ? '✓ Paid & Reconciled' : 'Upcoming Due'}
                  </span>
                </div>

                {event.status === 'upcoming' && (
                  <button
                    onClick={() => markCalendarEventPaid(event.id)}
                    className="px-3 py-1.5 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Reminder Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Financial Reminder"
        subtitle="Set up recurring or one-off due dates for household bills"
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Life Insurance Premium, Society Maintenance"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Estimated Amount (INR ₹) *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Event Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                <option value="utility">Utility Bill (Electricity/Water/Gas)</option>
                <option value="emi">Loan / EMI Installment</option>
                <option value="rent">Rent & Maintenance</option>
                <option value="credit_card">Credit Card Bill</option>
                <option value="subscription">Subscription Renewal</option>
                <option value="savings">Savings SIP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
                Responsible Member
              </label>
              <input
                type="text"
                value={responsibleMember}
                onChange={e => setResponsibleMember(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

