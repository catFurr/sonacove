import React from 'react';

import boltshiftLogo from '../../../assets/boltshift-logo.png';
import lightboxLogo from '../../../assets/lightbox-logo.png';
import featherdevLogo from '../../../assets/featherdev-logo.png';
import spheruleLogo from '../../../assets/spherule-logo.png';
import globalbankLogo from '../../../assets/globalbank-logo.png';
import nietzscheLogo from '../../../assets/nietzsche-logo.png';

const logos = [
  { name: 'Boltshift', logo: boltshiftLogo },
  { name: 'Lightbox', logo: lightboxLogo },
  { name: 'FeatherDev', logo: featherdevLogo },
  { name: 'Spherule', logo: spheruleLogo },
  { name: 'GlobalBank', logo: globalbankLogo },
  { name: 'Nietzsche', logo: nietzscheLogo },
];

const SocialProof: React.FC = () => {
  return (
    <section className='py-20'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <p className='text-lg text-gray-500'>
            We've worked with some great startups
          </p>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-8 items-center'>
          {logos.map((logo) => (
            <div key={logo.name} className='flex justify-center text-center items-center gap-2'>
              <img
                src={logo.logo.src}
                alt={`${logo.name} logo`}
                className='h-8 w-auto object-contain'
              />
              <h1 className='text-2xl font-bold'>{logo.name}</h1>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
