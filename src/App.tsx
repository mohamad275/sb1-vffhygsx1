import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/auth/LoginForm';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { useDataSync } from './hooks/useDataSync';
import { useSupabaseConnection } from './hooks/useSupabaseConnection';
import { ConnectionStatus } from './components/ConnectionStatus';

const AppContent = () => {
  const { isConnected, error: connectionError } = useSupabaseConnection();
  const { user, loading: authLoading } = useAuth();
  const { syncAllData } = useDataSync(); // Fixed: using syncAllData instead of syncData

  useEffect(() => {
    if (user && isConnected) {
      syncAllData();
    }
  }, [user, isConnected, syncAllData]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
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

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-red-600">{connectionError}</div>
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