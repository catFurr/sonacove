import React from 'react';
import type { LogoInfo } from '../types';

import ascendLogo from '../../../assets/ascend-logo.jpeg';
import edutopLogo from '../../../assets/edutop-logo.png';
import khalidArabicAcademyLogo from '../../../assets/khalidArabicAcademy-logo.png';

const logos: LogoInfo[] = [
  { name: 'Ascend', logo: ascendLogo },
  {
    name: 'Khalid Arabic Academy',
    logo: khalidArabicAcademyLogo,
    url: 'https://www.linkedin.com/company/khalid-arabic-academy/',
  },
  { name: 'Edutop', logo: edutopLogo },
];

const SocialProof: React.FC = () => {
  return (
    <section className='py-20'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <p className='text-lg text-gray-500'>Startups we've worked with</p>
        </div>

        <div className='flex flex-wrap gap-5 justify-around items-center'>
          {logos.map((logo: LogoInfo) => (
            <a
              key={logo.name}
              href={logo.url}
              className='flex justify-center text-center items-center gap-3 transition-transform duration-300 hover:scale-105 will-change-transform'
              target='_blank'
              rel='noopener noreferrer'
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
