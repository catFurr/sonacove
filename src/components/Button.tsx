import React from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function Button({
  variant = 'primary',
  children,
  className,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles =
    'px-7 py-3 font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    secondary: 'bg-black text-white hover:bg-gray-800',
  };

  return (
    <button
      onClick={onClick}
      className={clsx(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
