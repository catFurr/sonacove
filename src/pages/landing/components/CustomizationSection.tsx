import React from 'react';

import FeatureCard from '../../features/components/FeatureCard';
import featureImage from '../../../assets/feature-customization.png';

const customizationFeatureData = {
  title: 'Make it uniquely yours',
  bulletTitle: 'Why It Matters:',
  description:
    'Why settle for a one-size-fits-all platform? With Sonacove, you can customize your virtual classroom to create a space that feels like home to your students.',
  bullets: [
    'Customize colors, fonts, and backgrounds to match your style.',
    'Choose from pre-built themes or design your own.',
    'Create a space that feels like *home* to your students.',
  ],
  image: {
    img: featureImage,
    alt: 'Illustration showing a person interacting with various user interface elements on a screen.',
  },
  extraText: 'Because teaching is personal—your platform should be too.',
};

const CustomizationFeature: React.FC = () => {
  return (
    <section className='py-20 md:py-28 bg-[#F9FAFB]'>
      <div className='container mx-auto px-4'>
        <FeatureCard
          feature={customizationFeatureData}
          index={0}
        />
      </div>
    </section>
  );
};

export default CustomizationFeature;
