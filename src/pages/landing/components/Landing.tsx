import React from 'react';

import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import PricingSection from './PricingSection';
import MetricsSection from './MetricsSection';
import CTASection from './CTASection';
import CertificationsSection from './CertificationsSection';
import CustomizationSection from './CustomizationSection';
import TestimonialsSection from './TestimonialsSection';
import SocialProof from './SocialProof';

const Landing: React.FC = () => {
  return (
      <main>
        <HeroSection />

        <SocialProof />

        <div id='features'>
          <FeatureSection />
        </div>

        <MetricsSection />

        <CertificationsSection />

        <CustomizationSection />

        <TestimonialsSection />

        <div id='pricing'>
          <PricingSection />
        </div>

        <CTASection />
      </main>
  );
};

export default Landing;
