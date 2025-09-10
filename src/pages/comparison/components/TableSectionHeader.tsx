import React from 'react';

const TableSectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const columnSpan = 4; // This remains the same

  return (
    <tr>
      <td colSpan={columnSpan} className='px-3 py-4 border-x border-gray-200'>
        {/* Flex container to align the lines and text */}
        <div className='flex items-center gap-4'>
          {/* Left Line: Grows to fill available space */}
          <div className='flex-grow h-0.5 bg-gray-400'></div>

          {/* Title Text: Doesn't shrink */}
          <span className='flex-shrink-0 text-center font-serif font-semibold text-gray-600'>
            {title}
          </span>

          {/* Right Line: Grows to fill available space */}
          <div className='flex-grow h-0.5 bg-gray-400'></div>
        </div>
      </td>
    </tr>
  );
};

export default TableSectionHeader;
