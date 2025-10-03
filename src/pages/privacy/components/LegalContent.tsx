// src/components/legal/LegalContent.tsx
import React from 'react';

interface LegalContentProps {
  children: React.ReactNode;
}

const LegalContent: React.FC<LegalContentProps> = ({ children }) => {
  return (
    <div className='prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-900 prose-headings:font-semibold'>
      {children}
    </div>
  );
};

export default LegalContent;
