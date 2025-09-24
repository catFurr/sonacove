import React from 'react';

// Define the types for the component's props
interface ToggleSwitchProps {
  options: string[];
  activeOption: string;
  onOptionChange: (option: string) => void;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  options,
  activeOption,
  onOptionChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex flex-wrap justify-center bg-gray-100 rounded-lg p-1 space-x-1 inset-shadow-sm ${className}`}
    >
      {options.map((option) => {
        const isActive = activeOption === option;

        return (
          <button
            key={option}
            type='button'
            onClick={() => onOptionChange(option)}
            aria-pressed={isActive}
            className={`
              rounded-md font-semibold transition-all duration-200 
              whitespace-nowrap
              px-4 py-2 text-xs 
              sm:px-6 sm:py-2 sm:text-sm
              ${
                isActive
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-black'
              }
            `}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default ToggleSwitch;
