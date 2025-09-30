import React from 'react';
import cta_illustration from '../../../assets/metrics-image.png';

const CTASection: React.FC = () => {
  return (
    <section className='py-16 md:py-24 bg-[#F9FAFB]'>
      <div className='w-[90%] mx-auto px-2'>
        {/* Orange container */}
        <div className='rounded-3xl bg-[#F05023] p-8 md:p-16 lg:p-20'>
          <div className='grid items-center gap-12 md:grid-cols-2'>
            {/* Left Column: Text */}
            <div className='text-white'>
              <h2 className='mb-6 text-5xl font-bold leading-tight lg:text-6xl'>
                Join the movement
              </h2>
              <p className='mb-12 max-w-lg text-lg text-white/80'>
                Say goodbye to technical glitches and hello to seamless, joyful
                teaching. No downloads. No fuss. Just you and your students,
                connecting like never before.
              </p>

              {/* Stats */}
              <div className='mb-12 flex flex-col gap-10 sm:flex-row'>
                <div>
                  <p className='text-4xl font-bold lg:text-5xl'>100+</p>
                  <p className='text-lg text-white/90'>Educators</p>
                  <p className='mt-1 text-white/70'>Transforming teaching.</p>
                </div>
                <div>
                  <p className='text-4xl font-bold lg:text-5xl'>10K+</p>
                  <p className='text-lg text-white/90'>Hours</p>
                  <p className='mt-1 text-white/70'>
                    Seamless lessons delivered.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <a
                href='/onboarding'
                className='inline-block rounded-full bg-white px-8 py-4 font-semibold text-primary-600 transition-transform hover:scale-105 will-change-transform'
              >
                Start Teaching for Free
              </a>
            </div>

            {/* Right Column: Illustration */}
            <div>
              <img
                src={cta_illustration.src}
                alt='Illustration of a person at a desk using a laptop for an online meeting with analytics'
                className='w-full'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
