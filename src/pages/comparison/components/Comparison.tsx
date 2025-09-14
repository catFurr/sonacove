import React from 'react';
import { basicFeaturesData, controlFeaturesData, ethicalFeaturesData } from '../../../data/comparison';
import Header from '../../../components/Header';
import PageHeader from '../../../components/PageHeader';
import { Boxes, Heart, Lock } from 'lucide-react';
import ComparisonCard from './ComparisonCard';
import ComparisonTable from './ComparisonTable';
import Button from '../../../components/Button';


const advantagesData = [
  {
    icon: <Heart strokeWidth={2} />,
    title: 'Ethical Business Practices',
    description:
      "Unlike our competitors, we don't invest in or take investments from entities associated with unethical practices:",
    bullets: [
      'No involvement with interest-based or usurious financial systems',
      'Zero tolerance for war profiteering',
      'No connection to organizations using slave labor',
      'Commitment to environmental and social responsibility',
    ],
  },
  {
    icon: <Lock strokeWidth={2} />,
    title: 'Uncompromising Privacy',
    description:
      'Your data belongs to you - not to advertisers or data brokers:',
    bullets: [
      'End-to-end encryption for all meetings',
      'We never sell, share, or store personal data',
      'No tracking or analytics that compromise privacy',
      'Private by design - not as an afterthought',
    ],
  },
  {
    icon: <Boxes strokeWidth={2} />,
    title: 'Complete Customizability',
    description: 'Tailor your meeting experience exactly to your needs:',
    bullets: [
      'Most customizable meeting interface available',
      'Personalize layouts, backgrounds, and controls',
      'Modular components you can arrange how you want',
      'White-label options for businesses',
    ],
  },
];

const Comparison: React.FC = () => {

  const handleClick = () => {
     window.location.href = '/onboarding';
  }

  return (
    <>
      <Header pageType='landing' activePage='Comparison' />
      <main className='py-12'>
        <div className='container mx-auto px-4'>
          <PageHeader title='Sonacove Meets vs Competitors'>
            Why choose Sonacove Meets over other alternatives? Here's how we
            stand out from the crowd.
          </PageHeader>

          <section className='mb-20'>
            <h2 className='text-3xl font-bold mb-8 text-center text-gray-800'>
              Our Unique Advantages
            </h2>
            <div className='grid md:grid-cols-3 gap-8'>
              {advantagesData.map((card) => (
                <ComparisonCard
                  key={card.title}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  bullets={card.bullets}
                />
              ))}
            </div>
          </section>

          <section>
            <div className='overflow-x-auto'>
              <ComparisonTable rows={ethicalFeaturesData} />
            </div>
          </section>

          <section className='mt-20'>
            <h2 className='text-3xl font-bold mb-12 text-center text-gray-800'>
              Detailed Feature Comparison
            </h2>
            <ComparisonTable
              sectionTitle='Basic Features'
              rows={basicFeaturesData}
            />
            <ComparisonTable
              sectionTitle='Control & Moderation'
              rows={controlFeaturesData}
            />
          </section>

          <section className='text-center mt-20'>
            <h2 className='text-3xl font-bold mb-6 text-gray-800'>
              Ready to experience the difference?
            </h2>
            <p className='text-lg text-gray-700 max-w-2xl mx-auto mb-8'>
              Try Sonacove Meets today and discover a video conferencing
              platform built on ethics, privacy, and genuine user empowerment.
            </p>
            <div className='text-center'>
              <Button variant='primary' onClick={handleClick}>
                Try Sonacove Meets Today
              </Button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Comparison;
