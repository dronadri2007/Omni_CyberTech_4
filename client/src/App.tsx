import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzeMediaPage } from './pages/AnalyzeMediaPage';
import { AnalysisProcessingPage } from './pages/AnalysisProcessingPage';
import { AnalysisResultsPage } from './pages/AnalysisResultsPage';
import { MediaEvidencePage } from './pages/MediaEvidencePage';
import { CaseHistoryPage } from './pages/CaseHistoryPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { ProvenancePage } from './pages/ProvenancePage';
import { ReportsPage } from './pages/ReportsPage';
import { HumanReviewQueuePage } from './pages/HumanReviewQueuePage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpLearnPage } from './pages/HelpLearnPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const location = useLocation();

  // Pages that display the Landing Page / Auth layouts without SOC Sidebar
  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    );
  }

  // Dashboard SOC Layout with Sidebar
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analyze" element={<AnalyzeMediaPage />} />
            <Route path="/analyze/processing/:id" element={<AnalysisProcessingPage />} />
            <Route path="/analyze/results/:id" element={<AnalysisResultsPage />} />
            <Route path="/evidence/:id" element={<MediaEvidencePage />} />
            <Route path="/cases" element={<CaseHistoryPage />} />
            <Route path="/cases/:id" element={<CaseDetailPage />} />
            <Route path="/provenance/:id" element={<ProvenancePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportsPage />} />
            <Route path="/review" element={<HumanReviewQueuePage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpLearnPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
