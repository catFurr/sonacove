import React, { useEffect, useState } from 'react';
import { initializePaddle } from '@paddle/paddle-js';
import SectionHeader from './SectionHeader';

interface Plan {
  title: string;
  price: string;
  billingInfo: string;
  icon: string;
  features: string[];
  highlighted: boolean;
  button: { text: string; link: string };
  discount?: number;
  priceWithDiscount?: string | null;
}


// initial static plan data
const initialPlans : Plan[] = [
  {
    title: 'Free Plan',
    price: '$0.0',
    billingInfo: 'Per user/month, billed annually',
    icon: `<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.998 23.7334C17.9351 23.7334 22.748 18.9205 22.748 12.9834C22.7479 7.04646 17.935 2.2334 11.998 2.2334C6.0613 2.23365 1.2482 7.04662 1.24805 12.9834C1.24805 18.9203 6.0612 23.7331 11.998 23.7334ZM8.43945 11.7334C7.45536 11.7334 6.60938 11.1145 6.29395 10.2373C6.15395 9.84761 6.35643 9.41848 6.74609 9.27832C7.13579 9.13819 7.5658 9.33988 7.70605 9.72949C7.80961 10.0175 8.09464 10.2334 8.43945 10.2334C8.78408 10.2332 9.06934 10.0174 9.17285 9.72949C9.3132 9.34008 9.74225 9.13827 10.1318 9.27832C10.5216 9.41846 10.724 9.84757 10.584 10.2373C10.2686 11.1144 9.42337 11.7332 8.43945 11.7334ZM15.5605 11.7334C14.5765 11.7334 13.7314 11.1145 13.416 10.2373C13.276 9.8477 13.4777 9.41865 13.8672 9.27832C14.2568 9.13821 14.6868 9.33998 14.8271 9.72949C14.9307 10.0175 15.2158 10.2334 15.5605 10.2334C15.9054 10.2334 16.1904 10.0175 16.2939 9.72949C16.4342 9.33996 16.8643 9.1382 17.2539 9.27832C17.6433 9.41858 17.8459 9.84774 17.7061 10.2373C17.3906 11.1145 16.5446 11.7334 15.5605 11.7334ZM11.999 18.7334C10.1176 18.7333 8.44704 17.8285 7.39941 16.4336C7.15075 16.1025 7.2178 15.6326 7.54883 15.3838C7.88003 15.135 8.34988 15.202 8.59863 15.5332C9.37517 16.567 10.6094 17.2333 11.999 17.2334C13.3886 17.2334 14.6228 16.567 15.3994 15.5332C15.6481 15.202 16.118 15.1351 16.4492 15.3838C16.7804 15.6325 16.8474 16.1024 16.5986 16.4336C15.551 17.8284 13.8805 18.7334 11.999 18.7334Z" fill="black"/></svg>`,
    features: [
      'Access to core AI tools',
      'Up to 1000 total meeting minutes',
      'Up to 100 guests per meeting',
      'End-to-end encryption',
    ],
    highlighted: false,
    button: { text: 'Try It Free', link: '/onboarding' },
  },
  {
    title: 'Premium Plan',
    price: '$10.0',
    billingInfo: 'Per user/month, billed annually',
    icon: `<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.1727 18.1001C16.8998 16.9432 19.1004 16.9432 20.8275 18.1001C21.1375 18.2961 21.8435 18.7439 22.2143 19.1521C22.4496 19.4113 22.6977 19.7791 22.7429 20.245C22.7915 20.7451 22.5935 21.2046 22.2317 21.5924C21.6846 22.1788 20.953 22.7324 19.9597 22.7324H16.0405C15.0472 22.7324 14.3156 22.1788 13.7685 21.5924C13.4067 21.2046 13.2087 20.7451 13.2573 20.245C13.3025 19.7791 13.5506 19.4113 13.7859 19.1521C14.1567 18.7439 14.8627 18.2961 15.1727 18.1001Z" fill="white"/><path d="M15.25 13.4824C15.25 11.9636 16.4812 10.7324 18 10.7324C19.5188 10.7324 20.75 11.9636 20.75 13.4824C20.75 15.0012 19.5188 16.2324 18 16.2324C16.4812 16.2324 15.25 15.0012 15.25 13.4824Z" fill="white"/></svg>`,
    features: [
      'Access to core AI tools',
      'Unlimited meeting duration',
      'Screen sharing',
      'Live Recording',
      'Breakout rooms',
    ],
    highlighted: true,
    button: { text: 'Try It Free', link: '/onboarding' },
  },
  {
    title: 'Organization Plan',
    price: '$20.0',
    billingInfo: 'Per user/month, billed annually',
    icon: `<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.7801 13.0663C15.914 12.5305 16.457 12.2047 16.9928 12.3387C17.1283 12.3726 17.2624 12.4057 17.3944 12.4384C17.9094 12.5658 18.3935 12.6856 18.8163 12.8111C19.3484 12.9692 19.8684 13.1597 20.315 13.444C20.7841 13.7426 21.168 14.1417 21.4194 14.6893C21.6615 15.2164 21.7502 15.815 21.7502 16.4711V21.3088C21.7502 21.8611 21.3025 22.3088 20.7502 22.3088C20.198 22.3088 19.7502 21.8611 19.7502 21.3088V16.4711C19.7502 15.9814 19.6816 15.6975 19.6019 15.5239C19.5316 15.3707 19.4294 15.251 19.2411 15.1312C19.0303 14.997 18.7216 14.8694 18.2468 14.7284C17.8726 14.6172 17.4481 14.5121 16.9404 14.3865C16.8025 14.3523 16.6585 14.3167 16.5077 14.279C15.9719 14.145 15.6461 13.6021 15.7801 13.0663Z" fill="black"/></svg>`,
    features: [
      'Access to core AI tools',
      'All Premium features',
      'Up to 1000 guests',
      'Custom Authentication',
      'Dedicated support',
    ],
    highlighted: false,
    button: { text: 'Contact Us', link: 'mailto:support@sonacove.com' },
  },
];

function floorPrice(formattedPrice: string) {
  const numeric = parseFloat(formattedPrice.replace(/[^0-9.]/g, ''));
  const currencySymbol = formattedPrice.trim().charAt(0);
  const truncated = Math.floor(numeric * 100) / 100;
  return {
    numeric,
    currencySymbol,
    formatted: `${currencySymbol}${truncated.toFixed(2)}`,
  };
}

function applyDiscount(price: number, discountPercent: number) {
  return price - price * discountPercent;
}

export default function PricingSection() {
  const env = import.meta.env;
  const [plans, setPlans] = useState(initialPlans);

  useEffect(() => {
    async function initPaddle() {
      try {
        const environment = env.PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
        const clientToken = env.PUBLIC_PADDLE_CLIENT_TOKEN;
        if (!clientToken) return console.error('Missing Paddle client token');

        const paddle = await initializePaddle({
          environment,
          token: clientToken,
        });

        if (!paddle) {
          console.error("Failed to initialize Paddle. Check your token or network.");
          return;
        }

        const result = await paddle.PricePreview({
          items: [
            { priceId: env.PUBLIC_PADDLE_PREMIUM_PRICE_ID, quantity: 1 },
            { priceId: env.PUBLIC_PADDLE_ORGANIZATION_PRICE_ID, quantity: 1 },
          ],
        });

        const prices = result.data.details.lineItems;
        const premiumData = floorPrice(prices[0].formattedUnitTotals.total);
        const orgData = floorPrice(prices[1].formattedUnitTotals.total);
        const freeData = {
          numeric: 0,
          currencySymbol: premiumData.currencySymbol,
          formatted: `${premiumData.currencySymbol}0`,
        };

        const premiumDiscount =
          Number(prices[0].price.customData?.discount) || 0;
        const orgDiscount = Number(prices[1].price.customData?.discount) || 0;

        const premiumDiscounted = applyDiscount(
          premiumData.numeric,
          premiumDiscount,
        );
        const orgDiscounted = applyDiscount(orgData.numeric, orgDiscount);

        const premiumDiscountedFormatted = `${
          premiumData.currencySymbol
        }${premiumDiscounted.toFixed(2)}`;
        const orgDiscountedFormatted = `${
          orgData.currencySymbol
        }${orgDiscounted.toFixed(2)}`;

        // update state with new prices
        setPlans((prev) =>
          prev.map((plan) => {
            if (plan.title === 'Free Plan') {
              return { ...plan, price: freeData.formatted };
            }
            if (plan.title === 'Premium Plan') {
              return {
                ...plan,
                price: premiumData.formatted,
                discount: premiumDiscount,
                priceWithDiscount:
                  premiumDiscount > 0 ? premiumDiscountedFormatted : null,
              };
            }
            if (plan.title === 'Organization Plan') {
              return {
                ...plan,
                price: orgData.formatted,
                discount: orgDiscount,
                priceWithDiscount:
                  orgDiscount > 0 ? orgDiscountedFormatted : null,
              };
            }
            return plan;
          }),
        );
      } catch (err) {
        console.error('Error initializing Paddle or fetching prices:', err);
      }
    }

    initPaddle();
  }, []);

    return (
      <section className='py-20 md:py-28 bg-[#F9FAFB]' id='pricing'>
        <div className='container mx-auto px-4'>
          {/* Section Header */}
          <div className='text-center max-w-4xl mx-auto'>
            <SectionHeader tagline='Pricing' className='mb-8'>
              Plans designed for educators
            </SectionHeader>

            {/* Billing Toggle (remains separate) */}
            <div className='inline-flex bg-gray-100 rounded-lg p-1 space-x-1'>
              <button className='px-6 py-2 bg-white text-black font-semibold rounded-md shadow-sm text-sm'>
                Monthly billing
              </button>
              <button className='px-6 py-2 text-gray-500 font-semibold hover:text-black rounded-md text-sm'>
                Annual billing
              </button>
            </div>
          </div>

          <div className='mt-16 w-full mx-auto lg:max-w-7xl lg:grid lg:grid-cols-3 lg:gap-8'>
            {plans.map((plan) => (
              <div key={plan.title}>
                {/* --- Mobile Accordion View --- */}
                <details
                  className={`lg:hidden rounded-2xl transition-shadow mb-4 group ${
                    plan.highlighted
                      ? 'bg-orange-600 shadow-xl'
                      : 'bg-white shadow-md border'
                  }`}
                  open={plan.highlighted}
                >
                  <summary className='list-none cursor-pointer p-6 flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-8 h-8 ${
                          plan.highlighted ? 'text-white' : 'text-black'
                        }`}
                        dangerouslySetInnerHTML={{ __html: plan.icon }}
                      />
                      <h3
                        className={`text-xl font-semibold pb-1 ${
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
                        className={`text-lg font-semibold mb-4 ${
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
                                  : 'bg-red-50 text-orange-600'
                              }`}
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='3'
                                  d='M5 13l4 4L19 7'
                                />
                              </svg>
                            </span>
                            <span
                              className={`${
                                plan.highlighted
                                  ? 'text-white/80'
                                  : 'text-gray-600'
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
                          ? 'bg-white text-orange-600 hover:bg-gray-200'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      <span className='pl-4'>{plan.button.text}</span>
                      <span className='w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 bg-orange-600 text-white'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth='2'
                          stroke='currentColor'
                          className='w-6 h-6'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'
                          />
                        </svg>
                      </span>
                    </a>
                  </div>
                </details>

                {/* --- Desktop Card View --- */}
                <div
                  className={`hidden lg:flex lg:flex-col rounded-2xl p-8 border transition-transform duration-300 ${
                    plan.highlighted
                      ? 'bg-orange-600 text-white shadow-2xl scale-105'
                      : 'bg-white text-black border-gray-200 hover:scale-105 hover:shadow-lg'
                  }`}
                  data-plan={plan.title}
                >
                  {/* START: CONTENT FOR DESKTOP CARD */}
                  <div className='flex items-center text-center gap-2 mb-6'>
                    <div
                      className={`w-10 h-10 ${
                        plan.highlighted ? 'text-white' : 'text-black'
                      }`}
                      dangerouslySetInnerHTML={{ __html: plan.icon }}
                    />
                    <h3 className='text-2xl pb-1 font-semibold'>
                      {plan.title}
                    </h3>
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
                      <p className='text-lg font-semibold mb-4'>Benefits</p>
                      <ul className='space-y-3'>
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className='flex items-start gap-3'>
                            <span
                              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                plan.highlighted
                                  ? 'bg-white/20 text-white'
                                  : 'bg-red-50 text-orange-600'
                              }`}
                            >
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth='3'
                                  d='M5 13l4 4L19 7'
                                />
                              </svg>
                            </span>
                            <span className='opacity-80'>{feature}</span>
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
                          ? 'bg-white text-orange-600 hover:bg-gray-200'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      <span className='pl-4'>{plan.button.text}</span>
                      <span className='w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 bg-orange-600 text-white'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth='2'
                          stroke='currentColor'
                          className='w-6 h-6'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'
                          />
                        </svg>
                      </span>
                    </a>
                  </div>
                  {/* END: CONTENT FOR DESKTOP CARD */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
}
