import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

type PopupType = 'error' | 'success';

interface PopupProps {
  message: string | null;
  type?: PopupType;
  duration?: number; // Duration in milliseconds
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({
  message,
  type = 'error',
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const baseClasses =
    'fixed top-5 right-5 z-50 flex items-center justify-between gap-4 p-4 rounded-lg shadow-lg transition-all duration-300';
  const typeStyles = {
    error: 'bg-red-100 border border-red-200 text-red-800',
    success: 'bg-green-100 border border-green-200 text-green-800',
  };

  const visibilityClasses = isVisible
    ? 'opacity-100 translate-x-0'
    : 'opacity-0 translate-x-10';

  if (!message) {
    return null;
  }

  return (
    <div
      className={twMerge(baseClasses, typeStyles[type], visibilityClasses)}
      role='alert'
    >
      <div className='flex items-center gap-3'>
        <AlertTriangle className='h-5 w-5 flex-shrink-0' />
        <span className='font-medium'>{message}</span>
      </div>
      <button
        onClick={handleClose}
        className='p-1 rounded-full hover:bg-black/10 transition-colors'
        aria-label='Dismiss message'
      >
        <X className='h-5 w-5' />
      </button>
    </div>
  );
};

export default Popup;
