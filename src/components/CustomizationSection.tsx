import React from 'react';

// 1. Import your reusable component and the specific image for this feature
import FeatureCard from './FeatureCard';
import featureImage from '../assets/feature-customization.png';

// 2. Define the data for this specific feature as a single object
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

// 3. The component now just renders the FeatureCard with the data
const CustomizationFeature: React.FC = () => {
  return (
    <section className='py-20 md:py-28 bg-[#F9FAFB]'>
      <div className='container mx-auto px-4'>
        <FeatureCard
          feature={customizationFeatureData}
          index={0} // We can set index to 0 to get the "Text | Image" layout
        />
      </div>
    </section>
  );
};

export default CustomizationFeature;
