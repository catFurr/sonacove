import React from 'react';

// Define the types for the component's props
interface PageHeaderProps {
  title: React.ReactNode; // Allows passing strings or JSX elements for the title
  children: React.ReactNode; // Use 'children' for the main paragraph content
  className?: string; // Optional prop to allow custom styling on the container
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`text-center mb-16 ${className}`}>
      <h1 className='text-5xl md:text-6xl font-bold mb-6'>{title}</h1>
      <p className='text-lg text-gray-700 max-w-3xl mx-auto tracking-wide'>{children}</p>
    </div>
  );
};

export default PageHeader;
