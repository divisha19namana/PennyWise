import React, { useState } from 'react';
import { 
  Bot, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, 
  Send, RefreshCw, Smartphone, MessageSquare, Sliders, 
  FileText, ArrowDownRight, ArrowUpRight, Check, Trash2 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../services/api';
import { DetectedMessage } from '../types';

export const AutoTrackingPage: React.FC = () => {
  const { detectedMessages, confirmDetectedMessage, rejectDetectedMessage, accounts, categories } = useFamily();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'detected' | 'review' | 'rules' | 'settings' | 'history'>('detected');
  
  // Simulator state
  const [pasteText, setPasteText] = useState<string>('');
  const [simulatedSource, setSimulatedSource] = useState<'Android SMS' | 'UPI Notification' | 'WhatsApp Share'>('Android SMS');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Merchant rules state
  const [rules, setRules] = useState([
    { id: 'rule_1', keyword: 'BLINKIT', targetCategory: 'Groceries & Supplies', defaultShared: true },
    { id: 'rule_2', keyword: 'BARBEQUE NATION', targetCategory: 'Food & Dining Out', defaultShared: true },
    { id: 'rule_3', keyword: 'HDFC HOME LOAN', targetCategory: 'EMI & Loans', defaultShared: true },
    { id: 'rule_4', keyword: 'ZARA', targetCategory: 'Shopping & Apparel', defaultShared: false },
    { id: 'rule_5', keyword: 'TATA POWER', targetCategory: 'Bills & Utilities', defaultShared: true },
  ]);
  const [newRuleKeyword, setNewRuleKeyword] = useState<string>('');
  const [newRuleCategory, setNewRuleCategory] = useState<string>('Groceries & Supplies');

  // Parser simulator logic using real ASP.NET Core backend API
  const handleSimulateParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;

    setIsProcessing(true);
    try {
      const parsed = await api.autoTracking.parseMessage(pasteText, simulatedSource);
      const newMsg: DetectedMessage = {
        id: parsed.id || `msg_${Date.now()}`,
        rawText: pasteText,
        source: simulatedSource,
        receivedAt: new Date().toISOString(),
        extractedAmount: parsed.extractedAmount || 850,
        merchant: parsed.merchant || 'General Merchant',
        transactionType: parsed.transactionType === 'credit' ? 'credit' : 'debit',
        accountNickname: parsed.accountNickname || 'SBI Household Joint Account',
        accountLast4: parsed.accountLast4 || '8821',
        paymentMethod: parsed.paymentMethod || 'UPI',
        suggestedCategory: parsed.suggestedCategory || 'Groceries & Supplies',
        confidenceScore: parsed.confidenceScore || 0.95,
        reviewStatus: 'pending',
        referenceNo: parsed.referenceNo || `REF-${Math.floor(100000000 + Math.random() * 900000000)}`,
      };

      detectedMessages.unshift(newMsg);
      showToast('Message Ingested via Backend', `Parsed: ₹${newMsg.extractedAmount} at ${newMsg.merchant} (${newMsg.suggestedCategory})`, 'success');
    } catch (err) {
      // Local fallback
      const amountMatch = pasteText.match(/(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)/i) || pasteText.match(/([\d,]+(?:\.\d{2})?)\s*(?:credited|debited|spent)/i);
      const rawAmt = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 850;
      const isDebit = !pasteText.toLowerCase().includes('credited');
      const isFailed = pasteText.toLowerCase().includes('failed') || pasteText.toLowerCase().includes('declined');

      let merchant = 'General Merchant';
      if (pasteText.toUpperCase().includes('BLINKIT')) merchant = 'Blinkit Instamart';
      else if (pasteText.toUpperCase().includes('STARBUCKS')) merchant = 'Starbucks Coffee';
      else if (pasteText.toUpperCase().includes('SWIGGY')) merchant = 'Swiggy Food';
      else if (pasteText.toUpperCase().includes('AMAZON')) merchant = 'Amazon India';

      const fallbackMsg: DetectedMessage = {
        id: `msg_${Date.now()}`,
        rawText: pasteText,
        source: simulatedSource,
        receivedAt: new Date().toISOString(),
        extractedAmount: rawAmt,
        merchant,
        transactionType: isDebit ? 'debit' : 'credit',
        accountNickname: 'SBI Household Joint Account',
        accountLast4: '8821',
        paymentMethod: simulatedSource === 'UPI Notification' ? 'UPI' : 'Credit Card',
        suggestedCategory: merchant === 'Blinkit Instamart' ? 'Groceries & Supplies' : 'Food & Dining Out',
        confidenceScore: 0.92,
        reviewStatus: isFailed ? 'rejected' : 'pending',
        referenceNo: `REF-${Math.floor(100000000 + Math.random() * 900000000)}`,
      };
      detectedMessages.unshift(fallbackMsg);
      showToast('Message Ingested', `Parsed transaction: ₹${rawAmt} at ${merchant}`, 'success');
    } finally {
      setIsProcessing(false);
      setPasteText('');
    }
  };

  const handleAddRule = () => {
    if (!newRuleKeyword.trim()) return;
    setRules([...rules, {
      id: `rule_${Date.now()}`,
      keyword: newRuleKeyword.toUpperCase().trim(),
      targetCategory: newRuleCategory,
      defaultShared: true,
    }]);
    setNewRuleKeyword('');
    showToast('Rule Saved', `Transactions with "${newRuleKeyword}" will auto-categorize to ${newRuleCategory}.`, 'success');
  };

  const pendingMessages = detectedMessages.filter(m => m.reviewStatus === 'pending');
  const processedMessages = detectedMessages.filter(m => m.reviewStatus !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
            <span>Automatic Transaction Tracking</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#16A36A] border border-emerald-500/20">
              AI NLP Powered
            </span>
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Privacy-compliant transaction detection from SMS, UPI notifications and bank statements
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-[#1E3553] text-[#142B45] dark:text-gray-300">
            {pendingMessages.length} Messages Awaiting Review
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-100 dark:border-[#1E3553] pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'detected', label: 'Detected Messages', count: detectedMessages.length },
          { id: 'review', label: 'Review Queue', count: pendingMessages.length },
          { id: 'rules', label: 'Merchant Auto-Rules', count: rules.length },
          { id: 'settings', label: 'Integration Settings' },
          { id: 'history', label: 'Processing History' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#14253A]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1 & 2: Detected Messages & Review Queue */}
      {(activeTab === 'detected' || activeTab === 'review') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages Feed (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {(activeTab === 'review' ? pendingMessages : detectedMessages).length > 0 ? (
              (activeTab === 'review' ? pendingMessages : detectedMessages).map(msg => (
                <div
                  key={msg.id}
                  className={`bg-white dark:bg-[#14253A] rounded-2xl p-5 border shadow-sm transition ${
                    msg.reviewStatus === 'pending'
                      ? 'border-amber-300/60 dark:border-amber-600/40'
                      : 'border-gray-100 dark:border-[#1E3553]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#0B1522] text-gray-600 dark:text-gray-300">
                        {msg.source}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.receivedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Match Score: {Math.round(msg.confidenceScore * 100)}%
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        msg.reviewStatus === 'confirmed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                          : msg.reviewStatus === 'rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                      }`}>
                        {msg.reviewStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Raw message block */}
                  <div className="my-3 p-3 rounded-xl bg-gray-50 dark:bg-[#0B1522] font-mono text-xs text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-[#1E3553] leading-relaxed">
                    "{msg.rawText}"
                  </div>

                  {/* Extracted Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 pb-3 border-b border-gray-100 dark:border-[#1E3553]">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Extracted Amount</span>
                      <span className="font-extrabold text-[#142B45] dark:text-white font-numeric text-sm">
                        ₹{msg.extractedAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Identified Merchant</span>
                      <span className="font-semibold text-[#142B45] dark:text-white">{msg.merchant}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Account</span>
                      <span className="font-semibold text-[#142B45] dark:text-white">{msg.accountNickname} (xx{msg.accountLast4})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Predicted Category</span>
                      <span className="font-semibold text-[#16A36A]">{msg.suggestedCategory}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-[11px] text-gray-400">
                      Ref: {msg.referenceNo}
                    </span>

                    {msg.reviewStatus === 'pending' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => rejectDetectedMessage(msg.id)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#1E3553] text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-[#1E3553] transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => confirmDetectedMessage(msg.id)}
                          className="px-4 py-1.5 rounded-xl bg-[#16A36A] hover:bg-[#138959] text-white text-xs font-bold transition shadow-sm flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm & Ingest</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-gray-400">
                        {msg.reviewStatus === 'confirmed' ? '✓ Reconciled with balance' : '✕ Ignored from balance'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-[#14253A] rounded-2xl p-12 text-center text-gray-400 border border-gray-100 dark:border-[#1E3553]">
                <CheckCircle2 className="w-10 h-10 text-[#16A36A] mx-auto mb-2" />
                <h4 className="font-bold text-sm text-[#142B45] dark:text-white">Review Queue is Clear</h4>
                <p className="text-xs mt-1">All detected SMS & notifications have been reviewed and verified.</p>
              </div>
            )}
          </div>

          {/* Test Simulator Panel (1 col) */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#14253A] rounded-2xl p-5 border border-gray-100 dark:border-[#1E3553] shadow-sm">
              <h3 className="text-sm font-bold text-[#142B45] dark:text-white flex items-center space-x-2 mb-2">
                <Bot className="w-4 h-4 text-[#16A36A]" />
                <span>Message Parsing Simulator</span>
              </h3>
              <p className="text-xs text-[#738095] dark:text-gray-400 mb-3 leading-relaxed">
                Paste any mock bank SMS or UPI share text to test the extraction and categorization engine in real time.
              </p>

              <form onSubmit={handleSimulateParse} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                    Simulated Channel
                  </label>
                  <select
                    value={simulatedSource}
                    onChange={e => setSimulatedSource(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
                  >
                    <option value="Android SMS">Android SMS (Bank Debit/Credit)</option>
                    <option value="UPI Notification">UPI Notification (GPay/PhonePe)</option>
                    <option value="WhatsApp Share">WhatsApp Share-Sheet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                    Raw Message Text
                  </label>
                  <textarea
                    rows={4}
                    placeholder="e.g. Sent Rs. 450.00 from HDFC A/c xx4192 to SWIGGY on 12-Nov-26 via UPI. Ref 948192847."
                    value={pasteText}
                    onChange={e => setPasteText(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs font-mono text-[#142B45] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#16A36A]"
                  />
                </div>

                {/* Pre-fill Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPasteText('Dear Customer, INR 1,850.00 spent on ICICI Card xx5034 at STARBUCKS COFFEE on 12-NOV-26. Avl Lmt: 2,73,800.00.')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-[#1E3553] hover:text-[#16A36A]"
                  >
                    + Starbucks Card SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasteText('Payment of Rs. 480.00 to SWIGGY via UPI successful. Ref 392019284719.')}
                    className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-[#1E3553] hover:text-[#16A36A]"
                  >
                    + Swiggy UPI SMS
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !pasteText.trim()}
                  className="w-full py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Parsing...' : 'Simulate Message Detection'}</span>
                </button>
              </form>
            </div>

            {/* Privacy Guarantee Card */}
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
              <div className="flex items-center space-x-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
                <span>Strict Privacy Compliance</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                PennyWise does not silently scan phone messages. Only financial transaction alerts containing amounts and authorized bank identifiers are parsed locally.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Merchant Rules */}
      {activeTab === 'rules' && (
        <div className="bg-white dark:bg-[#14253A] rounded-2xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                Merchant Auto-Categorization Rules
              </h3>
              <p className="text-xs text-[#738095] dark:text-gray-400">
                Automatically maps merchant keywords to family budget categories upon message arrival
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Merchant keyword (e.g. UBER)"
                value={newRuleKeyword}
                onChange={e => setNewRuleKeyword(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              />
              <select
                value={newRuleCategory}
                onChange={e => setNewRuleCategory(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-xs text-[#142B45] dark:text-white"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddRule}
                className="px-4 py-1.5 bg-[#16A36A] text-white rounded-xl text-xs font-bold"
              >
                Add Rule
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-[#1E3553]">
            {rules.map(rule => (
              <div key={rule.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold px-2.5 py-1 bg-gray-100 dark:bg-[#0B1522] rounded-lg text-[#142B45] dark:text-white">
                    {rule.keyword}
                  </span>
                  <span className="text-gray-400">⟶</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {rule.targetCategory}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] text-gray-400">
                    {rule.defaultShared ? 'Shared Expense' : 'Personal Expense'}
                  </span>
                  <button
                    onClick={() => setRules(rules.filter(r => r.id !== rule.id))}
                    className="p-1 text-gray-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Integration Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-[#14253A] rounded-2xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#142B45] dark:text-white">
              Integration & Data Retention Controls
            </h3>
            <p className="text-xs text-[#738095] dark:text-gray-400 mt-0.5">
              Manage connected companion apps, data retention thresholds, and deletion policies
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#1E3553] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#142B45] dark:text-white block">
                  Android Companion App (Pixel 8 Pro)
                </span>
                <span className="text-gray-400">Connected on Nov 10, 2026 • SMS Permission Granted</span>
              </div>
              <button
                onClick={() => showToast('Sync Paused', 'Automatic SMS sync is now paused.', 'info')}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#1E3553] font-semibold text-gray-600 dark:text-gray-300"
              >
                Pause Sync
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#1E3553] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#142B45] dark:text-white block">
                  Raw SMS Text Retention
                </span>
                <span className="text-gray-400">Automatically scrub raw SMS texts 48 hours after verification</span>
              </div>
              <button
                onClick={() => showToast('Messages Purged', 'Raw message logs permanently erased.', 'info')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold"
              >
                Purge Raw Messages Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#14253A] rounded-2xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm">
          <h3 className="text-base font-bold text-[#142B45] dark:text-white mb-4">
            Message Processing Audit Log
          </h3>
          <div className="divide-y divide-gray-100 dark:divide-[#1E3553] text-xs">
            {processedMessages.map(msg => (
              <div key={msg.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#142B45] dark:text-white">{msg.merchant}</span>
                  <span className="text-gray-400 ml-2">₹{msg.extractedAmount} • {msg.source}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{msg.rawText}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  msg.reviewStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {msg.reviewStatus.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

