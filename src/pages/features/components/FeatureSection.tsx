import React from 'react';
import feature_natural from '../assets/feature-natural.png';
import feature_simple from '../assets/feature-simple.png';
import feature_privacy from '../assets/feature-privacy.png';
import feature_control from '../assets/feature-control.png';
import FeatureCard from './FeatureCard';
import SectionHeader from '../../../components/SectionHeader';

const featureSections = [
  {
    title: 'Teach as naturally as you would in person',
    description:
      'Imagine a virtual classroom where every word, gesture, and interaction feels as natural as being in the same room. With Sonacove’s **lightningfast latency (<100ms)**, your lessons flow effortlessly—no awkward pauses, no frozen screens. Just you and your students, fully engaged in the moment.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Students stay focused when interactions are instant.',
      'You teach with confidence, knowing the technology won’t let you down.',
      'A seamless experience means more time for what really matters.',
    ],
    image: {
      img: feature_natural,
      alt: 'An illustration of a teacher conducting an online class on a desktop computer.',
    },
  },
  {
    title: 'One click. No hassle.',
    description:
      'Forget complicated setups. With Sonacove, your students join with a single click—no downloads, no installs, no confusion. Whether they’re on a laptop, tablet, or phone, the experience is flawless.',
    bulletTitle: 'Perfect for:',
    bullets: [
      'Busy teachers who need simplicity.',
      'Students with varying tech access.',
      'Anyone who values “ease” as much as excellence.',
    ],
    image: {
      img: feature_simple,
      alt: 'An illustration showing a user easily starting a meeting with floating avatars around.',
    },
  },
  {
    title: 'Privacy you can trust',
    description:
      'In a world where data is currency, we promise something rare: **your privacy matters**. Sonacove uses **military-grade encryption** to keep your meetings safe. We don’t collect unnecessary data, and we never sell what we don’t need.',
    image: {
      img: feature_privacy,
      alt: 'A grid of user avatars with a large lock icon, symbolizing privacy.',
    },
    extraText: 'Your classroom. Your rules. Always private.',
  },
  {
    title: 'Full control & moderation',
    description:
      'Manage your virtual classroom with powerful, easy-to-use moderation tools. From waiting rooms to microphone controls, you have the power to create a safe and productive learning environment for all your students.',
    bullets: [
      'Approve students before they join with the waiting room feature.',
      'Manage audio and video permissions to minimize disruptions.',
      'Promote focused learning with advanced moderation tools.',
    ],
    image: {
      img: feature_control,
      alt: 'An illustration showing meeting UI elements like a settings panel and a waiting room approval modal.',
    },
    extraText: 'Teach with confidence, not chaos.',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className='py-20 md:py-28 bg-[#F9FAFB]'>
      <div className='container mx-auto px-4'>
        <SectionHeader tagline='Features' className='mb-8'>
          Make magic with your passionate service with Sonacove Meets
        </SectionHeader>

        {/* Features */}
        <div className='mt-20 md:mt-28 space-y-24'>
          {featureSections.map((feature, index) => (
            // Replace the large block of JSX with a single component call
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
