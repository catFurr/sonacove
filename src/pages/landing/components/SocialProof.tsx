import React from 'react';

import ascendLogo from '../../../assets/ascend-logo.jpeg';
import edutopLogo from '../../../assets/edutop-logo.png';

const logos = [
  { name: 'Khalid Arabic Academy', logo: ascendLogo, url: 'https://www.linkedin.com/company/khalid-arabic-academy/' },
  { name: 'Edutop', logo: edutopLogo, url: '' },
];

const SocialProof: React.FC = () => {
  return (
    <section className='py-20'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <p className='text-lg text-gray-500'>
            Startups we've worked with
          </p>
        </div>

        <div className='flex flex-wrap gap-5 justify-around items-center'>
          {logos.map((logo) => (
            <a
            key={logo.name}
            href={logo.url}
            className='flex justify-center text-center items-center gap-3 transition-transform duration-300 hover:scale-105 will-change-transform'
            target='_blank'
            >
              <img
                src={logo.logo.src}
                alt={`${logo.name} logo`}
                className='h-8 w-auto object-contain'
              />
              <h1 className='text-2xl font-bold'>{logo.name}</h1>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
