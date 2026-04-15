import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HabitsProvider } from './contexts/HabitsContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  console.log('AppContent render:', { user: !!user, loading, profile: !!profile, showAuth });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (showAuth) {
    return <Auth />;
  }

  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
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