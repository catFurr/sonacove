import { CircleCheck } from 'lucide-react';
import React from 'react';

// Define the type for the props this component will accept
export interface Feature {
  title: string;
  description: string;
  bulletTitle?: string ;
  bullets?: string[];
  image: {
    img: { src: string }; // Assuming the image object from Astro has a src property
    alt: string;
  };
  extraText?: string; 
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  index,
}) => {
  return (
    <div className='grid px-20 md:grid-cols-2 gap-12 md:gap-16 items-center'>
      {/* Text Column */}
      <div className={index % 2 !== 0 ? 'md:order-last' : ''}>
        <h3 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6'>
          {feature.title}
        </h3>

        <p
          className='text-lg text-gray-600 leading-relaxed mb-8'
          dangerouslySetInnerHTML={{
            __html: feature.description.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="text-gray-800 font-semibold">$1</strong>',
            ),
          }}
        />

        <h4 className='text-xl font-semibold text-gray-800 mb-4'>
          {feature.bullets?.length
            ? feature.bulletTitle || 'Why It Matters:'
            : null}
        </h4>

        <ul className='space-y-3'>
          {feature.bullets &&
            feature.bullets.map((bullet, bIndex) => (
              <li key={bIndex} className='flex items-start'>
                <span className='flex-shrink-0 w-6 h-6 text-orange-600 rounded-full flex items-center justify-center mr-2 mt-1'>
                  <CircleCheck strokeWidth={3} className='w-4 h-4' />
                </span>
                <span className='text-lg text-orange-600 font-semibold'>
                  {bullet}
                </span>
              </li>
            ))}
        </ul>

        {/* Conditionally render the extra text if it exists */}
        {feature.extraText && (
          <p className='mt-10 text-xl font-serif font-medium text-gray-800'>
            {feature.extraText}
          </p>
        )}
      </div>

      {/* Image Column */}
      <div className='flex justify-center items-center'>
        <img
          src={feature.image.img.src}
          alt={feature.image.alt}
          className='rounded-xl w-full max-w-lg'
        />
      </div>
    </div>
  );
};

export default FeatureCard;
