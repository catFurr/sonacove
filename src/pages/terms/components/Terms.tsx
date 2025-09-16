import React from 'react';
import { MoveLeft } from 'lucide-react';

import Header from '../../../components/Header';
import PageHeader from '../../../components/PageHeader';
import LegalContent from '../../privacy/components/LegalContent';

const Terms: React.FC = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <Header pageType='landing' />

      <section className='text-center'>
        <div className='container mx-auto mt-10 text-center'>
          <PageHeader title='Terms of Service'>
            <p className='text-gray-600'>Last Updated: {lastUpdated}</p>
          </PageHeader>
        </div>
      </section>

      <main className='py-16 bg-gray-50/50'>
        <div className='container mx-auto px-4'>
          <section className='max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200'>
            <LegalContent>
              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>1</span>. Introduction
              </h2>
              <p className='pb-6'>
                Welcome to <strong>Sonacove Meets</strong> ("we," "our," or
                "us"). These Terms of Service ("Terms") govern your access to
                and use of the Sonacove Meets platform, including any associated
                websites, content, and services (collectively, the "Service").
                By accessing or using the Service, you agree to be bound by
                these Terms.
              </p>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>2</span>. Using Our Service
              </h2>
              <p className='pb-6'>
                You must be at least 13 years old to use our Service. You are
                responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your
                account. You agree to notify us immediately of any unauthorized
                use of your account.
              </p>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>3</span>. Privacy
              </h2>
              <p className='pb-6'>
                Your privacy is important to us. Please review our{' '}
                <a href='/privacy' className='text-primary-600 hover:underline'>
                  Privacy Policy
                </a>
                , which explains how we collect, use, and disclose information
                about you.
              </p>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>6</span>. Subscription and Billing
              </h2>
              <p className='pb-6'>
                Sonacove Meets is a paid service. Payment will be charged to
                your chosen payment method through our payment processor,
                Paddle. Your subscription will automatically renew unless you
                cancel it at least 24 hours before the end of the current
                billing period.
              </p>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>7</span>. Refund Policy
              </h2>
              <div className='p-4 my-4 bg-primary-50 border-l-4 border-primary-500 rounded-md'>
                <p>
                  If you cancel your subscription, you will not be charged for
                  the next billing period, but you will retain access to premium
                  features until the end of your current billing period. If you
                  request a refund, we may provide a full refund at our
                  discretion. Upon refund, you will immediately lose access to
                  premium features.
                </p>
              </div>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>13</span>. Contact Us
              </h2>
              <div className='p-4 my-4 bg-gray-50 border border-gray-200 rounded-lg'>
                <p>
                  If you have any questions about these Terms, please contact us
                  at{' '}
                  <a
                    href='mailto:support@sonacove.com'
                    className='text-primary-600 hover:underline font-medium'
                  >
                    support@sonacove.com
                  </a>
                  .
                </p>
              </div>
            </LegalContent>

            <div className='mt-12 border-t border-gray-200 pt-8 text-center'>
              <a
                href='/'
                className='flex justify-center items-center text-center gap-2 text-primary-600 hover:text-primary-800 transition-colors font-semibold'
              >
                <MoveLeft /> Back to Home
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Terms;
