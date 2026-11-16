import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileNav } from './components/common/MobileNav';
import { NotificationToast } from './components/common/NotificationToast';
import { QuickActionModal } from './components/common/QuickActionModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AutoTrackingPage } from './pages/AutoTrackingPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { FamilyPage } from './pages/FamilyPage';
import { BudgetPage } from './pages/BudgetPage';
import { IncomePage } from './pages/IncomePage';
import { LoansPage } from './pages/LoansPage';
import { SavingsPage } from './pages/SavingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CalendarPage } from './pages/CalendarPage';
import { AccountsPage } from './pages/AccountsPage';
import { RecurringPage } from './pages/RecurringPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChallengesPage } from './pages/ChallengesPage';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState<boolean>(false);

  // If not logged in, render the login page
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => setCurrentPage('dashboard')}
        onOpenOnboarding={() => setIsOnboarding(true)}
      />
    );
  }

  // If user enters onboarding wizard
  if (isOnboarding) {
    return (
      <OnboardingPage
        onFinish={() => {
          setIsOnboarding(false);
          setCurrentPage('dashboard');
        }}
      />
    );
  }

  const renderActivePage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} onOpenQuickAction={() => setIsQuickActionOpen(true)} />;
      case 'transactions':
        return <TransactionsPage />;
      case 'autotracking':
        return <AutoTrackingPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'family':
        return <FamilyPage />;
      case 'budget':
        return <BudgetPage />;
      case 'income':
        return <IncomePage />;
      case 'loans':
        return <LoansPage />;
      case 'savings':
        return <SavingsPage />;
      case 'analytics':
        return <AnalyticsPage onNavigate={setCurrentPage} />;
      case 'calendar':
        return <CalendarPage />;
      case 'accounts':
        return <AccountsPage />;
      case 'recurring':
        return <RecurringPage />;
      case 'importexport':
        return <ImportExportPage />;
      case 'ai':
        return <AIAssistantPage onNavigate={setCurrentPage} />;
      case 'notifications':
        return <NotificationsPage onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPage />;
      case 'challenges':
        return <ChallengesPage />;
      default:
        return <DashboardPage onNavigate={setCurrentPage} onOpenQuickAction={() => setIsQuickActionOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#0B1522] text-[#142B45] dark:text-[#E2E8F0] flex">
      {/* Desktop Sidebar */}
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Header onNavigate={setCurrentPage} currentPage={currentPage} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Floating Real-time Toast Notifications */}
      <NotificationToast />

      {/* Quick Action Global Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
      />
    </div>
  );
};

export default App;

