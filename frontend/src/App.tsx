import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApplicationWizardPage } from './pages/ApplicationWizardPage';
import { ApplicationHistoryPage } from './pages/ApplicationHistoryPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ModelPerformancePage } from './pages/ModelPerformancePage';

const AppRouter: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-mute text-xs">
        <span className="w-6 h-6 border-2 border-cy border-t-transparent rounded-full animate-spin mr-2" />
        Initializing Loan AI session...
      </div>
    );
  }

  // Routing logic
  const renderPage = () => {
    // 1. Static public paths
    if (currentPath === '/') {
      return <LandingPage navigate={navigate} />;
    }
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage navigate={navigate} />;
    }
    if (currentPath === '/model-metrics') {
      return <ModelPerformancePage navigate={navigate} />;
    }

    // 2. Protected paths (require authentication)
    if (!isAuthenticated) {
      return <LoginPage navigate={navigate} />;
    }

    if (currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }
    if (currentPath === '/apply') {
      return <ApplicationWizardPage navigate={navigate} />;
    }
    if (currentPath === '/history') {
      return <ApplicationHistoryPage navigate={navigate} />;
    }
    if (currentPath.startsWith('/applications/')) {
      const id = currentPath.replace('/applications/', '');
      return <ApplicationDetailPage id={id} navigate={navigate} />;
    }

    // 3. Admin only paths
    if (currentPath === '/admin') {
      if (!isAdmin) {
        return <DashboardPage navigate={navigate} />;
      }
      return <AdminDashboardPage navigate={navigate} />;
    }

    return <LandingPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-cy selection:text-bg">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
