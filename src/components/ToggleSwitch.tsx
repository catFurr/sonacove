import React from 'react';

// Define the types for the component's props
interface ToggleSwitchProps {
  options: string[];
  activeOption: string;
  onOptionChange: (option: string) => void;
  className?: string; // Optional className for extra styling on the container
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  options,
  activeOption,
  onOptionChange,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex bg-gray-100 rounded-lg p-1 space-x-1 ${className}`}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onOptionChange(option)}
          className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
            activeOption === option
              ? 'bg-white text-black shadow-sm' // Active state styles
              : 'text-gray-500 hover:text-black' // Inactive state styles
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default ToggleSwitch;
