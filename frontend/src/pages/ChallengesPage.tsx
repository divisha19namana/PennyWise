import React, { useState } from 'react';
import { 
  Trophy, Plus, Sparkles, CheckCircle2, Heart, 
  Users, Calendar, ArrowRight, Award, Flame 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import confetti from 'canvas-confetti';

export const ChallengesPage: React.FC = () => {
  const { challenges, contributeToChallenge, family } = useFamily();
  const { currentUser } = useAuth();

  const [isLogProgressOpen, setIsLogProgressOpen] = useState<boolean>(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');
  const [progressAmount, setProgressAmount] = useState<string>('500');

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const handleOpenLog = (id: string) => {
    setSelectedChallengeId(id);
    setProgressAmount('500');
    setIsLogProgressOpen(true);
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(progressAmount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    contributeToChallenge(selectedChallengeId, numAmt);
    setIsLogProgressOpen(false);
  };

  const triggerCelebrate = () => {
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
            <span>Family Financial Challenges</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-500/20">
              Cooperative Milestones
            </span>
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Build healthy money habits together with positive encouragement, team badges and shared milestones
          </p>
        </div>

        <button
          onClick={triggerCelebrate}
          className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition shadow-md self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Celebrate Achievements! 🎉</span>
        </button>
      </div>

      {/* Supportive Philosophy Card */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-5 flex items-start space-x-3 text-xs text-emerald-900 dark:text-emerald-300">
        <Heart className="w-5 h-5 text-[#16A36A] flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Supportive & Non-Judgmental Family Teamwork:</span>
          <p className="mt-0.5 text-gray-600 dark:text-gray-300 leading-relaxed">
            PennyWise challenges are designed for joint empowerment. We never shame or compare individual members. Every small step towards conscious spending is celebrated by the whole household.
          </p>
        </div>
      </div>

      {/* Active Challenges Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Active Family Sprints</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeChallenges.map(ch => (
            <div
              key={ch.id}
              className="bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {ch.rewardBadge}
                  </span>
                  <span className="text-xs text-gray-400">
                    Ends: {ch.deadline}
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-[#142B45] dark:text-white">
                  {ch.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {ch.description}
                </p>

                {/* Progress bar */}
                <div className="my-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#16A36A] font-numeric">
                      ₹{ch.currentValue.toLocaleString('en-IN')} Saved
                    </span>
                    <span className="text-[#142B45] dark:text-white font-numeric">
                      {ch.currentProgress}% of ₹{ch.targetValue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-[#0B1522] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#16A36A] transition-all duration-500"
                      style={{ width: `${ch.currentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-center space-x-1.5 text-[11px] text-gray-400">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>Team: {ch.participants.join(', ')}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#1E3553] flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {ch.targetMetric}
                </span>

                <button
                  onClick={() => handleOpenLog(ch.id)}
                  className="px-4 py-2 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Log Team Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Trophies & Hall of Fame */}
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[#1E3553]">
        <h3 className="text-base font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
          <Award className="w-4 h-4 text-[#16A36A]" />
          <span>Family Trophy Vault & Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {completedChallenges.map(ch => (
            <div
              key={ch.id}
              className="bg-white dark:bg-[#14253A] rounded-2xl p-5 border border-emerald-500/20 shadow-sm flex items-center space-x-3.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                🏆
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#142B45] dark:text-white">
                  {ch.title}
                </h4>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  100% Completed • {ch.rewardBadge}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Achieved on {ch.deadline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Progress Modal */}
      <Modal
        isOpen={isLogProgressOpen}
        onClose={() => setIsLogProgressOpen(false)}
        title="Contribute Progress to Family Sprint"
        subtitle="Log savings or skipped discretionary expenses towards team milestone"
      >
        <form onSubmit={handleSaveProgress} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142B45] dark:text-gray-200 mb-1">
              Amount Saved / Progress Increment (INR ₹) *
            </label>
            <input
              type="number"
              required
              value={progressAmount}
              onChange={e => setProgressAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#0B1522] border border-gray-200 dark:border-[#1E3553] rounded-xl text-base font-bold text-[#142B45] dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-[#1E3553]">
            <button
              type="button"
              onClick={() => setIsLogProgressOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Record Progress
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

