import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='border-b border-gray-200 py-6'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full flex justify-between items-center text-left gap-4'
      >
        <span className='text-lg font-medium text-gray-800'>{question}</span>
        <span className='flex-shrink-0 ml-4'>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className='overflow-hidden'>
          <p className='pt-4 text-gray-600 leading-relaxed'>{answer}</p>
        </div>
      </div>
    </div>
  );
};

export default FaqItem;