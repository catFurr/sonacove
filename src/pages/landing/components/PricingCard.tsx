import React from 'react';
import { clsx } from 'clsx'
import { MoveRight, CircleCheck } from 'lucide-react';
import type { Plan } from '../types';

const PlanIcon: React.FC<{
  icon: React.ReactNode | string;
  className?: string;
}> = ({ icon, className = '' }) => {
  if (typeof icon === 'string') {
    return (
      <div className={className} dangerouslySetInnerHTML={{ __html: icon }} />
    );
  }
  return <div className={className}>{icon}</div>;
};

// The new PricingCard component
const PricingCard: React.FC<{ plan: Plan }> = ({ plan }) => {
  return (
    <>
      {/* --- Mobile Accordion View --- */}
      <details
        className={`lg:hidden rounded-2xl transition-shadow mb-4 group ${
          plan.highlighted
            ? 'bg-primary-600 shadow-xl'
            : 'bg-white shadow-md border'
        }`}
        open={plan.highlighted}
      >
        <summary className='list-none cursor-pointer p-6 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <PlanIcon
              icon={plan.icon}
              className={`w-8 h-8 ${
                plan.highlighted ? 'text-white' : 'text-black'
              }`}
            />
            <h3
              className={`text-xl font-semibold pb-2 ${
                plan.highlighted ? 'text-white' : 'text-black'
              }`}
            >
              {plan.title}
            </h3>
          </div>
          <div
            className={`text-right ${
              plan.highlighted ? 'text-white' : 'text-black'
            }`}
          >
            <span className='text-2xl font-bold plan-price'>
              {plan.priceWithDiscount ?? plan.price}
            </span>
            <span className='opacity-80'>/m</span>
          </div>
        </summary>

        {/* Expanded Mobile Content */}
        <div className='px-6 pb-6'>
          <div
            className={`border-t pt-6 ${
              plan.highlighted ? 'border-white/20' : 'border-gray-200'
            }`}
          >
            <p
              className={`text-lg font-semibold mb-4 tracking-wider ${
                plan.highlighted ? 'text-white' : 'text-black'
              }`}
            >
              Benefits
            </p>
            <ul className='space-y-3'>
              {plan.features.map((feature, idx) => (
                <li key={idx} className='flex items-start gap-3'>
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      plan.highlighted
                        ? 'bg-white/20 text-white'
                        : 'bg-red-50 text-primary-600'
                    }`}
                  >
                    <CircleCheck className='w-4 h-4' />
                  </span>
                  <span
                    className={`${
                      plan.highlighted ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <a
            href={plan.button.link}
            className={`group mt-8 flex items-center justify-between w-full p-2 rounded-full text-lg font-semibold text-left transition-colors ${
              plan.highlighted
                ? 'bg-white text-primary-600 hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <span className='pl-4'>{plan.button.text}</span>
            <span
              className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 text-white will-change-transform',
                {
                  'bg-primary-500': plan.highlighted,
                  'bg-primary-600': !plan.highlighted,
                },
              )}
            >
              <MoveRight strokeWidth={2.5} />
            </span>
          </a>
        </div>
      </details>

      {/* --- Desktop Card View --- */}
      <div
        className={`hidden lg:flex lg:flex-col h-full rounded-2xl p-8 border transition-transform duration-300 ${
          plan.highlighted
            ? 'bg-primary-600 text-white shadow-2xl scale-105'
            : 'bg-white text-black border-gray-200 hover:scale-105 hover:shadow-lg'
        }`}
        data-plan={plan.title}
      >
        <div className='flex items-center text-center gap-2 mb-6'>
          <PlanIcon
            icon={plan.icon}
            className={`w-10 h-10 ${
              plan.highlighted ? 'text-white' : 'text-black'
            }`}
          />
          <h3 className='text-2xl pb-4 font-semibold'>{plan.title}</h3>
        </div>
        <div className='mb-8'>
          <span className='text-5xl font-bold plan-price'>
            {plan.priceWithDiscount ?? plan.price}
          </span>
          <span className='text-lg opacity-80'>/month</span>
          <p className='opacity-70 mt-2'>{plan.billingInfo}</p>
        </div>
        <div className='flex-grow'>
          <hr
            className={`my-8 ${
              plan.highlighted ? 'border-white/20' : 'border-gray-200'
            }`}
          />
          <div>
            <p className='text-lg font-semibold mb-4 tracking-wider'>
              Benefits
            </p>
            <ul className='space-y-3'>
              {plan.features.map((feature, idx) => (
                <li key={idx} className='flex items-start gap-3'>
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      plan.highlighted
                        ? 'bg-white/20 text-white'
                        : 'bg-red-50 text-primary-600'
                    }`}
                  >
                    <CircleCheck className='w-4 h-4' />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='mt-auto'>
          <a
            href={plan.button.link}
            className={`group flex items-center justify-between w-full p-2 rounded-full text-lg font-semibold text-left transition-colors mt-8 ${
              plan.highlighted
                ? 'bg-white text-primary-600 hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <span className='pl-4'>{plan.button.text}</span>
            <span
              className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 text-white will-change-transform',
                {
                  'bg-primary-500 shadow-lg': plan.highlighted,
                  'bg-primary-600': !plan.highlighted,
                },
              )}
            >
              <MoveRight strokeWidth={2.5} />
            </span>
          </a>
        </div>
      </div>
    </>
  );
};

export default PricingCard;
