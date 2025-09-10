import React from 'react';

// Data for the links - easy to update
const companyLinks = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Pricing', href: '/pricing' }, // Note: Pricing is duplicated in your design
  { name: 'Career', href: '/careers' },
  { name: 'Contact', href: '/contact' },
];

const supportLinks = [
  { name: 'Contact us', href: '/contact' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Refund Policy', href: '/refund-policy' },
];

const socialLinks = [
  {
    name: 'Facebook',
    href: '#',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
        <path
          fillRule='evenodd'
          d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
          clipRule='evenodd'
        />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' />
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: '#',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
        <path
          fillRule='evenodd'
          d='M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 3.808s-.012 2.741-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-3.808.06s-2.741-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.067-.06-1.407-.06-3.808s.012-2.741.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.784 2.013 10.13 2 12.315 2zm0 1.62c-2.403 0-2.72.01-3.667.058-1.144.053-1.62.224-2.023.385-.433.17-.74.386-1.06.706-.32.32-.537.627-.706 1.06-.16.403-.332.88-.385 2.023-.048.947-.058 1.265-.058 3.667s.01 2.72.058 3.667c.053 1.144.224 1.62.385 2.023.17.433.386.74.706 1.06.32.32.627.537 1.06.706.403.16.88.332 2.023.385.947.048 1.265.058 3.667.058s2.72-.01 3.667-.058c1.144-.053 1.62-.224 2.023-.385.433-.17.74-.386 1.06-.706.32-.32.537-.627.706-1.06.16-.403.332-.88.385-2.023.048-.947.058-1.265.058-3.667s-.01-2.72-.058-3.667c-.053-1.144-.224-1.62-.385-2.023-.17-.433-.386-.74-.706-1.06-.32-.32-.627-.537-1.06-.706-.403-.16-.88-.332-2.023-.385-.947-.048-1.265-.058-3.667-.058zM12 8.25a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm0 9a3.5 3.5 0 110-7 3.5 3.5 0 010 7zM16.969 8.25a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z'
          clipRule='evenodd'
        />
      </svg>
    ),
  },
];

const Footer: React.FC = () => {
  return (
    <footer className='bg-black text-white font-serif'>
      <div className='max-w-7xl mx-auto px-6 py-16 sm:px-8 lg:py-24'>
        {/* Top section */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8'>
          <div className='lg:col-span-4'>
            <div className='flex items-center gap-1.5 font-bold text-2xl'>
            <img src='/sonacove-white.svg' alt='Sonacove Logo' className='h-10' />
            <p>Sonacove</p>
            </div>
            <p className='text-gray-400 mt-2'>Teach Freely. Learn Joyfully.</p>
          </div>

          <div className='lg:col-span-4'>
            <p className='text-gray-400'>We're here to help:</p>
            <a
              href='mailto:hello@sonacove.com'
              className='text-2xl lg:text-3xl hover:text-gray-300 transition-colors'
            >
              hello@sonacove.com
            </a>
          </div>

          <div className='lg:col-span-4'>
            <h3 className='text-lg font-semibold'>
              Subscribe to our newsletter
            </h3>
            <form className='mt-4'>
              <div className='flex items-end border-b border-gray-600 focus-within:border-white'>
                <input
                  type='email'
                  placeholder='Your email'
                  className='w-full bg-transparent border-0 pb-2 focus:ring-0 focus:outline-none'
                />
                <button
                  type='submit'
                  className='flex items-center gap-2 pb-2 text-gray-400 hover:text-white'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='w-5 h-5'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3'
                    />
                  </svg>
                  Submit
                </button>
              </div>
              <p className='text-xs text-gray-500 mt-2'>
                We respect your privacy. We'll only use your email to send you
                updates about Sonacove Meets.
              </p>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-gray-800 my-16'></div>

        {/* Bottom section */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-12'>
          <div className='md:col-span-6'>
            <h4 className='text-xl font-semibold mb-6'>Company</h4>
            <ul className='grid grid-cols-2 gap-4 text-gray-400'>
              {companyLinks.map((link) => (
                <li key={link.name + Math.random()}>
                  <a
                    href={link.href}
                    className='hover:text-white transition-colors'
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className='md:col-span-3'>
            <h4 className='text-xl font-semibold mb-6'>Support</h4>
            <ul className='space-y-4 text-gray-400'>
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className='hover:text-white transition-colors'
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className='md:col-span-3'>
            <h4 className='text-xl font-semibold mb-6'>Social media</h4>
            <ul className='space-y-4 text-gray-400'>
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className='flex items-center gap-3 hover:text-white transition-colors'
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='border-t border-gray-800 mt-16 pt-8 text-center text-gray-500'>
          <p>
            &copy; {new Date().getFullYear()} Sonacove Meets by Alfaz Studio.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
