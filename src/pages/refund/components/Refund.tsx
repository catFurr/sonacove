import React from 'react';
import { MoveLeft } from 'lucide-react';

import Header from '../../../components/Header';
import PageHeader from '../../../components/PageHeader';
import LegalContent from '../../privacy/components/LegalContent';

const Refund: React.FC = () => {
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
          <PageHeader title='Refund Policy'>
            <p className='text-gray-600'>Last Updated: {lastUpdated}</p>
          </PageHeader>
        </div>
      </section>

      <main className='py-16 bg-gray-50/50'>
        <div className='container mx-auto px-4'>
          <section className='max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200'>
            <LegalContent>
              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>1</span>. Subscription Cancellation
              </h2>
              <p>
                You may cancel your subscription at any time through your
                account settings or by contacting our support team at{' '}
                <a
                  href='mailto:support@sonacove.com'
                  className='text-primary-600 hover:underline'
                >
                  support@sonacove.com
                </a>
                .
              </p>
              <p className='pb-6'>When you cancel your subscription:</p>
              <ul className='list-disc pl-6 pb-6 space-y-2'>
                <li>You will not be charged for the next billing period.</li>
                <li>
                  You will retain access to premium features until the end of
                  your current billing period.
                </li>
                <li>Your subscription will not automatically renew.</li>
              </ul>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>2</span>. Refund Requests
              </h2>
              <p>
                If you are not satisfied with our service, you may request a
                refund by contacting our support team.
              </p>
              <p className='pb-6'>
                Refund requests will be evaluated on a case-by-case basis. If
                approved:
              </p>
              <ul className='list-disc pl-6 pb-6 space-y-2'>
                <li>
                  You will receive a full refund of your most recent payment.
                </li>
                <li>
                  Your access to premium features will be immediately revoked.
                </li>
                <li>Your subscription will be canceled.</li>
              </ul>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>3</span>. Payment Processing
              </h2>
              <div className='p-4 my-4 bg-primary-50 border-l-4 border-primary-500 rounded-md'>
                <p>
                  All payments and refunds are processed through our payment
                  processor, Paddle. Refunds will be issued to the original
                  payment method used for the purchase.
                </p>
              </div>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>4</span>. Contact Us
              </h2>
              <div className='p-4 my-4 bg-gray-50 border border-gray-200 rounded-lg'>
                <p>
                  If you have any questions about our refund policy, please
                  contact us at{' '}
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

export default Refund;
