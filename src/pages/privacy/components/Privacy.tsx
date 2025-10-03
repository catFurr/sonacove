import React from 'react';

import Header from '../../../components/Header';
import PageHeader from '../../../components/PageHeader';
import LegalContent from './LegalContent';
import { MoveLeft } from 'lucide-react';

const Privacy: React.FC = () => {
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
          <PageHeader title='Privacy Policy'>
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
                At <strong>Sonacove Meets</strong>, operated by Mohammed Ibrahim
                Ali under the business name <em>"Alfaz Studio"</em>, we take
                your privacy seriously. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our service.
              </p>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>2</span>. Information We Collect
              </h2>
              <p>
                We collect only the minimal information necessary to provide our
                service:
              </p>
              <ul className='list-disc pl-6 pb-6 space-y-2'>
                <li>
                  <strong>Account Information:</strong> Email address and
                  authentication data.
                </li>
                <li>
                  <strong>Payment Information:</strong> Collected securely by
                  Paddle; we never store full payment details.
                </li>
                <li>
                  <strong>Usage Data:</strong> Access times, features used, and
                  general service interactions.
                </li>
                <li>
                  <strong>Device Information:</strong> Browser type, OS, and
                  device identifiers.
                </li>
              </ul>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>3</span>. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className='list-disc pl-6 pb-6 space-y-2'>
                <li>Provide, maintain, and improve our service</li>
                <li>Process and complete transactions</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>
                  Protect against, identify, and prevent fraud and other illegal
                  activity
                </li>
              </ul>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>4</span>. Information Sharing
              </h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal
                information to third parties. We may share information in the
                following circumstances:
              </p>
              <ul className='list-disc pl-6 pb-6 space-y-2'>
                <li>
                  With service providers who perform services on our behalf
                  (e.g., Paddle)
                </li>
                <li>To comply with legal obligations</li>
                <li>To protect and defend our rights and property</li>
                <li>With your consent or at your direction</li>
              </ul>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>5</span>. Data Security
              </h2>
              <p className='pb-6'>
                We implement appropriate technical and organizational measures
                to protect your personal information. However, no method of
                transmission over the Internet or electronic storage is 100%
                secure.
              </p>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>6</span>. Your Rights
              </h2>
              <p>
                Depending on your location, you may have certain rights
                regarding your personal information:
              </p>
              <ul className='list-disc pl-6 pb-6 space-y-2'>
                <li>Access and receive a copy of your personal information</li>
                <li>Rectify or update your personal information</li>
                <li>Delete your personal information</li>
                <li>
                  Restrict or object to our processing of your personal
                  information
                </li>
              </ul>

              <h2 className='text-xl font-semibold tracking-wide'>
                <span className='text-3xl'>9</span>. Contact Us
              </h2>
              <div className='p-4 my-4 bg-gray-50 border border-gray-200 rounded-lg'>
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us at{' '}
                  <a
                    href='mailto:privacy@sonacove.com'
                    className='text-primary-600 hover:underline font-medium'
                  >
                    privacy@sonacove.com
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

export default Privacy;
