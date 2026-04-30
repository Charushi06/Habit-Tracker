import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HabitsProvider } from './contexts/HabitsContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import NotFound from './components/NotFound';
// import Footer from './components/Footer';

function AppContent() {
  const { user, loading, profile } = useAuth();

  console.log('AppContent render:', {
    user: !!user,
    loading,
    profile: !!profile,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" replace />}
          />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* <Footer /> */}
    </div>
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