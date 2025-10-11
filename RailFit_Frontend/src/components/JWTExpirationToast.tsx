import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface JWTExpirationToastProps {
  onClose?: () => void;
}

export const JWTExpirationToast: React.FC<JWTExpirationToastProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleJWTExpired = () => {
      setIsVisible(true);
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 5000);
    };

    window.addEventListener('jwt_expired', handleJWTExpired);

    return () => {
      window.removeEventListener('jwt_expired', handleJWTExpired);
    };
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Session Expired
            </h3>
            <p className="mt-1 text-sm text-red-700">
              Your session has expired. Please log in again to continue.
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md bg-red-50 text-red-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JWTExpirationToast;