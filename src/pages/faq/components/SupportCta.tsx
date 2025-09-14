import React from 'react';

const SupportCta: React.FC = () => {
  return (
    <section className='mt-20 text-center bg-white p-12 rounded-2xl border border-gray-200 max-w-4xl mx-auto'>
      <h3 className='text-3xl font-bold text-gray-900'>
        Still have questions?
      </h3>
      <p className='text-lg text-gray-600 mt-4 mb-8'>
        Can't find the answer you're looking for? Our team is here to help.
      </p>
      <a
        href='mailto:support@sonacove.com'
        className='inline-block px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg'
      >
        Contact Support
      </a>
    </section>
  );
};

export default SupportCta;
