import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HabitsProvider } from './contexts/HabitsContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { supabase } from './lib/supabase';
import { UpdatePassword } from './components/UpdatePassword';

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);

  useEffect(() => {
    // Detect when user arrives via password reset email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowUpdatePassword(true);
      }
    });

    // Also check URL hash on first load (handles page refresh)
    if (window.location.hash.includes('type=recovery')) {
      setShowUpdatePassword(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  console.log('AppContent render:', { user: !!user, loading, profile: !!profile, showAuth });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show UpdatePassword when recovery token is detected
  if (showUpdatePassword) {
    return (
      <UpdatePassword
        onSuccess={() => {
          setShowUpdatePassword(false);
          setShowAuth(true);
          // Remove the recovery token from the URL
          window.history.replaceState(null, '', window.location.pathname);
        }}
      />
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (showAuth) {
    return <Auth 
      onGoHome={() => setShowAuth(false)
    }/>;
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