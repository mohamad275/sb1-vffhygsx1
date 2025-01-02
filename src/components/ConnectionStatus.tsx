import React from 'react';
import { useSupabaseConnection } from '../hooks/useSupabaseConnection';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, error, retrying, retry } = useSupabaseConnection();

  if (isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
      <div className="flex items-center space-x-3 space-x-reverse">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <div className="flex-1">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={retry}
          disabled={retrying}
          className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};