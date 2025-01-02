import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/auth/LoginForm';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { useSupabase } from './hooks/useSupabase';
import { useSupabaseConnection } from './hooks/useSupabaseConnection';
import { ConnectionStatus } from './components/ConnectionStatus';

const AppContent = () => {
  const { loading: dbLoading, error: dbError, initializeData, setupSubscriptions } = useSupabase();
  const { isConnected, error: connectionError } = useSupabaseConnection();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !dbLoading) {
      const initialize = async () => {
        await initializeData();
        setupSubscriptions();
      };
      initialize();
    }
  }, [user, dbLoading, initializeData, setupSubscriptions]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (dbError || connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">
          {dbError?.message || connectionError}
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ConnectionStatus />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;