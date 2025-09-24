import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, CircleCheck, Info } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

/**
 * Defines the possible visual styles for the popup.
 */
type PopupType = 'success' | 'error' | 'info';

/**
 * Props for the Popup component.
 */
interface PopupProps {
  /** The message to be displayed in the popup. If null, the popup is not rendered. */
  message: string | null;

  /** The visual style of the popup. Defaults to 'error'. */
  type?: PopupType;

  /** The duration in milliseconds for which the popup will be visible. Defaults to 5000ms. */
  duration?: number;

  /** Callback function to be invoked when the popup closes, either by timer or user action. */
  onClose: () => void;

}

/**
 * A floating notification component that appears at the top-right of the screen.
 *
 * @param {PopupProps} props - The props for the component.
 * @returns {React.ReactElement | null} The rendered popup component or null if no message is provided.
 */
const Popup: React.FC<PopupProps> = ({
  message,
  type = 'error',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow the fade-out animation to complete before calling onClose.
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation before calling parent's onClose.
  };

  /** Base Tailwind classes for the popup container. */
  const baseClasses =
    'fixed top-5 right-5 z-[100] flex items-center justify-between gap-4 p-4 rounded-lg shadow-lg transition-all duration-300';

  /** Style mappings for each popup type. */
  const typeStyles = {
    error: 'bg-red-100 border border-red-200 text-red-800',
    success: 'bg-green-100 border border-green-200 text-green-800',
    info: 'bg-blue-100 border border-blue-200 text-blue-800',
  };

  const typeIcons = {
    error: <AlertTriangle className='h-5 w-5 flex-shrink-0' />,
    success: <CircleCheck className='h-5 w-5 flex-shrink-0' />,
    info: <Info className='h-5 w-5 flex-shrink-0' />,
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
        {typeIcons[type]}
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
