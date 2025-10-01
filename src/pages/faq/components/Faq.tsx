import React from 'react';

import Header from '../../../components/Header';
import PageHeader from '../../../components/PageHeader';
import FaqItem from './FaqItem';
import SupportCTA from './SupportCta';
import type { FAQ } from '../types';

const faqCategories: { category: string; items: FAQ[] }[] = [
  {
    category: 'General',
    items: [
      {
        question:
          'How is Sonacove Meets different from other meeting platforms?',
        answer:
          "Sonacove Meets prioritizes speed, simplicity, and security. We don't require downloads, we don't track your data, and we ensure all communications are end-to-end encrypted.",
      },
      {
        question: 'Can I use Sonacove Meets on mobile devices?',
        answer:
          'Absolutely! Sonacove Meets works on all modern browsers, including mobile browsers on iOS and Android devices.',
      },
    ],
  },
  {
    category: 'Billing & Subscriptions',
    items: [
      {
        question: 'How much does Sonacove Meets cost?',
        answer:
          'Sonacove Meets costs $9 per month, including unlimited meeting duration, up to 100 guests, and all premium features. Start with our unlimited free trial - no time limit, just 1000 active meeting minutes to explore all features.',
      },
      {
        question: 'Can I try Sonacove Meets before subscribing?',
        answer:
          "Yes, we offer an unlimited free trial for all new users with 1000 active meeting minutes included. No payment information required and no time deadline. Once you've used your 1000 minutes, you can subscribe to continue with unlimited access.",
      },
      {
        question: 'What happens if I cancel my subscription?',
        answer:
          "If you cancel your subscription, you won't be charged for the next billing period, but you'll still have access to premium features until the end of your current billing period.",
      },
      {
        question: "Can I get a refund if I'm not satisfied?",
        answer:
          'Yes, we offer refunds on a case-by-case basis. Please contact our support team at support@sonacove.com to request a refund.',
      },
    ],
  },
  {
    category: 'Technical',
    items: [
      {
        question: 'How many participants can join a meeting?',
        answer:
          'Our meetings support up to 100 participants. We are planning to raise this limit as we grow.',
      },
      {
        question: 'What data do you collect about users?',
        answer:
          "We collect only the minimal data required for authentication and billing. We never store meeting content, and we don't track user behavior or sell data to third parties.",
      },
    ],
  },
];

const Faq: React.FC = () => {
  return (
    <>
      <Header pageType='landing' activePage='FAQ' />

      <main className='py-12 bg-gray-50/50'>
        <div className='container mx-auto px-4'>
          <PageHeader title='Frequently Asked Questions'>
            Have a question? We're here to help. Find answers to common
            questions below.
          </PageHeader>

          <div className='max-w-4xl mx-auto mt-16'>
            {faqCategories.map((category) => (
              <section key={category.category} className='mb-12'>
                <h2 className='text-3xl font-bold text-black mb-6'>
                  {category.category}
                </h2>
                <div>
                  {category.items.map((item) => (
                    <FaqItem
                      key={item.question}
                      question={item.question}
                      answer={item.answer}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <SupportCTA />
        </div>
      </main>
    </>
  );
};

export default Faq;
