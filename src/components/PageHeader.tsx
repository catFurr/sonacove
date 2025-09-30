import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

// Define the types for the component's props
interface PageHeaderProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  paragraphClassName?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  children,
  className,
  titleClassName,
  paragraphClassName,
}) => {
  // 2. Apply the twMerge logic to each element that can be customized
  return (
    <div className={twMerge('text-center mb-16', className)}>
      <h1
        className={twMerge(
          'text-5xl md:text-6xl font-bold mb-6',
          titleClassName,
        )}
      >
        {title}
      </h1>
      <p
        className={twMerge(
          'text-lg text-gray-700 max-w-3xl mx-auto tracking-wide',
          paragraphClassName,
        )}
      >
        {children}
      </p>
    </div>
  );
};

export default PageHeader;
