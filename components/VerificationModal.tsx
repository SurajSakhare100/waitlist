'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { data: session } = useSession();

  if (!isOpen) return null;

  const handleResendVerification = async () => {
    try {
      setIsLoading(true);
      setMessage('');

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('An error occurred while sending the verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Email Verification Required</h2>
        <p className="text-gray-600 mb-6">
          Please verify your email address ({session?.user?.email}) before adding to the waitlist.
        </p>
        
        {message && (
          <div className={`p-4 mb-4 rounded ${
            message.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Close
          </button>
          <button
            onClick={handleResendVerification}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      </div>
    </div>
  );
} 