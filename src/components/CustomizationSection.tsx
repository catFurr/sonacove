import React from 'react';
import featureImage from '../assets/feature-customization.png';

const bullets = [
  'Customize colors, fonts, and backgrounds to match your style.',
  'Choose from pre-built themes or design your own.',
  'Create a space that feels like *home* to your students.',
];

const CustomizationFeature: React.FC = () => {
  return (
    <section className='py-20 md:py-28 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 gap-12 md:gap-16 items-center'>
          {/* Left Column: Text Content */}
          <div>
            <h3 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6'>
              Make it uniquely yours
            </h3>
            <p
              className='text-lg text-gray-600 leading-relaxed mb-8'
              dangerouslySetInnerHTML={{
                __html:
                  'Why settle for a one-size-fits-all platform? With Sonacove, you can:'.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-gray-800 font-semibold">$1</strong>',
                  ),
              }}
            />

            <h4 className='text-xl font-semibold text-gray-800 mb-4'>
              Why It Matters:
            </h4>
            <ul className='space-y-4'>
              {bullets.map((bullet, index) => (
                <li key={index} className='flex items-start'>
                  <span className='flex-shrink-0 w-6 h-6 text-orange-600 rounded-full flex items-center justify-center mr-2 mt-1'>
                    <svg
                      width='17'
                      height='17'
                      viewBox='0 0 17 17'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M8.49902 1.33301C12.4571 1.33301 15.666 4.54196 15.666 8.5C15.666 12.458 12.4571 15.667 8.49902 15.667C4.54098 15.667 1.33203 12.458 1.33203 8.5C1.33203 4.54196 4.54098 1.33301 8.49902 1.33301ZM8.49902 2.33301C5.09327 2.33301 2.33203 5.09424 2.33203 8.5C2.33203 11.9058 5.09327 14.667 8.49902 14.667C11.9048 14.667 14.666 11.9058 14.666 8.5C14.666 5.09424 11.9048 2.33301 8.49902 2.33301ZM10.7969 6.16211C10.9835 5.95855 11.3003 5.94524 11.5039 6.13184C11.7071 6.31848 11.7207 6.63446 11.5342 6.83789L7.86719 10.8379C7.77505 10.9383 7.64601 10.997 7.50977 11C7.37347 11.0029 7.24191 10.9499 7.14551 10.8535L5.47852 9.18652C5.28358 8.99123 5.28336 8.67465 5.47852 8.47949C5.67367 8.28434 5.99026 8.28456 6.18555 8.47949L7.4834 9.77734L10.7969 6.16211Z'
                        fill='#F05023'
                      />
                    </svg>
                  </span>
                  <span className='text-lg text-orange-600 font-semibold'>
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Illustration */}
          <div className='flex justify-center items-center'>
            <img
              src={featureImage.src}
              alt='Illustration showing a person interacting with various user interface elements on a screen.'
              className='rounded-xl w-full max-w-lg'
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomizationFeature;
