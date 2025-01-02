import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Modal } from './Modal';
import { Mail, Send, Trash2 } from 'lucide-react';
import { useEmailRecipients } from '../../hooks/useEmailRecipients';
import { testEmailReport } from '../../utils/tests/emailReport';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    message?: string;
    error?: boolean;
  }>({ loading: false });
  
  const { loading, error, hasRecipients, addRecipient } = useEmailRecipients();

  useEffect(() => {
    if (!hasRecipients) {
      setTestStatus({
        loading: false,
        message: 'لم يتم تكوين أي عناوين بريد إلكتروني لتلقي التقارير',
        error: true
      });
    }
  }, [hasRecipients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    const success = await addRecipient(email);
    if (success) {
      setEmail('');
      setTestStatus({
        loading: false,
        message: 'تمت إضافة البريد الإلكتروني بنجاح',
        error: false
      });
    }
  };

  const handleTest = async () => {
    if (!email) return;
    
    setTestStatus({ loading: true });
    const result = await testEmailReport(email);
    
    setTestStatus({
      loading: false,
      message: result.message,
      error: !result.success
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
        إعدادات البريد الإلكتروني
      </Dialog.Title>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            البريد الإلكتروني
          </label>
          <div className="flex space-x-2 space-x-reverse">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="أدخل البريد الإلكتروني"
              dir="ltr"
              disabled={loading || testStatus.loading}
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={loading || !email || testStatus.loading}
            >
              <Mail className="h-4 w-4 ml-2" />
              إضافة
            </button>
            <button
              type="button"
              onClick={handleTest}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled={loading || !email || testStatus.loading || !hasRecipients}
            >
              <Send className="h-4 w-4 ml-2" />
              اختبار
            </button>
          </div>
        </div>

        {testStatus.message && (
          <div 
            className={`p-3 rounded-md ${
              testStatus.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {testStatus.message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            إغلاق
          </button>
        </div>
      </form>
    </Modal>
  );
};