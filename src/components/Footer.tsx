import React from 'react';
import Logo from './icons/Logo'; 
import {
  Facebook,
  Instagram,
  Linkedin,
  MoveRight,
  Twitter,
} from 'lucide-react';

const companyLinks = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Career', href: '/careers' },
  { name: 'Contact', href: '/contact' },
];

const supportLinks = [
  { name: 'Contact us', href: '/contact' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Refund Policy', href: '/refund'},
  { name: 'Privacy Policy', href: '/privacy' },
];

const socialLinks = [
  { name: 'Facebook', href: '#', icon: <Facebook /> },
  { name: 'LinkedIn', href: '#', icon: <Linkedin /> },
  { name: 'Twitter', href: '#', icon: <Twitter /> },
  { name: 'Instagram', href: '#', icon: <Instagram /> },
];

const Footer: React.FC = () => {
  return (
    <footer className='bg-black text-white font-serif'>
      <div className='max-w-7xl mx-auto px-6 py-16 sm:px-8 lg:py-24'>
        {/* Top section */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8'>
          <div className='lg:col-span-4'>
          <Logo variant='withTagline' colorScheme='white'/>
          </div>

          <div className='lg:col-span-4'>
            <p className='text-gray-400'>We're here to help:</p>
            <a
              href='mailto:support@sonacove.com'
              className='text-2xl lg:text-3xl hover:text-gray-300 transition-colors'
            >
              support@sonacove.com
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
                  <MoveRight strokeWidth={1.5} />
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

        <div className='grid grid-cols-1 md:grid-cols-12 gap-12'>
          {/* Company Column (takes full width on mobile, half on desktop) */}
          <div className='md:col-span-6'>
            <h4 className='text-xl font-semibold mb-6'>Company</h4>
            <ul className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-400'>
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

          <div className='md:col-span-6 grid grid-cols-2 gap-8'>
            {/* Support Column */}
            <div>
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

            {/* Social Media Column */}
            <div>
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
