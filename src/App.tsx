import { useState, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HabitsProvider } from './contexts/HabitsContext';

const Auth = lazy(() => import('./components/Auth').then(module => ({ default: module.Auth })));
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const LandingPage = lazy(() => import('./components/LandingPage').then(module => ({ default: module.LandingPage })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  console.log('AppContent render:', { user: !!user, loading, profile: !!profile, showAuth });

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      {user ? (
        <Dashboard />
      ) : showAuth ? (
        <Auth onGoHome={() => setShowAuth(false)} />
      ) : (
        <LandingPage onGetStarted={() => setShowAuth(true)} />
      )}
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HabitsProvider>
          <AppContent />
        </HabitsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;