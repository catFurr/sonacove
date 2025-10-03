import React from 'react';

// Define the types for the props this component will accept
interface ComparisonCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  icon,
  title,
  description,
  bullets,
}) => {
  return (
    <div className='bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow'>
      <div className='w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-6'>
        {icon}
      </div>
      <h3 className='text-xl font-semibold mb-4 text-gray-800'>{title}</h3>
      <p className='text-gray-600 mb-4'>{description}</p>
      <ul className='space-y-2 text-gray-600 list-disc list-inside'>
        {bullets.map((bullet, index) => (
          <li key={index}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
};

export default ComparisonCard;
