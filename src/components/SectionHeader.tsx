import React from 'react';

// Define the types for the props this component will accept
interface SectionHeaderProps {
  tagline: string;
  children: React.ReactNode; // 'children' is the standard prop for content passed between tags
  className?: string; // Optional className for extra styling if needed
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  tagline,
  children,
  className = '',
}) => {
  return (
    <div className={`text-center max-w-4xl mx-auto ${className}`}>
      <p className='text-2xl font-semibold text-primary-500 mb-2'>{tagline}</p>
      <h2 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight'>
        {children}
      </h2>
    </div>
  );
};

export default SectionHeader;
