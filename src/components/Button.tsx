import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({
  variant = 'primary',
  children,
  className,
  onClick,
  ...props
}: ButtonProps) {
  const baseStyles =
    'px-7 py-3.5 font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-black text-white hover:bg-gray-800',
    tertiary: 'bg-gray-100 text-black border border-gray-200 hover:bg-gray-200',
  };

  const mergeClasses = (...inputs: (string | undefined | null | false)[]) => {
    return twMerge(clsx(...inputs));
  };

  return (
    <button
      onClick={onClick}
      className={mergeClasses(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
