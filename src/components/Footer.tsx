import React, { useEffect, useState } from 'react';
import Logo from './icons/Logo'; 
import {
  AlertTriangle,
  CheckCircle,
  Facebook,
  Instagram,
  Linkedin,
  MoveRight,
  Twitter,
} from 'lucide-react';
import { addContactToBrevo } from '../utils/brevo';

const companyLinks = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Career', href: '/careers' },
];

const supportLinks = [
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Refund Policy', href: '/refund'},
];

const socialLinks = [
  { name: 'Facebook', href: '#', icon: <Facebook /> },
  { name: 'LinkedIn', href: '#', icon: <Linkedin /> },
  { name: 'Twitter', href: '#', icon: <Twitter /> },
  { name: 'Instagram', href: '#', icon: <Instagram /> },
];

const Footer: React.FC = () => {

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (message) {
      // ...create a timer that will clear the message after 3s
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]); 

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await addContactToBrevo(email, 'footer_newsletter');
      
      setMessage({ type: 'success', text: 'Thank you for subscribing!' });
      setEmail('');

    } catch (error) {
      console.error('Error submitting to Brevo:', error);
      setMessage({ type: 'error', text: 'There was an error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className='bg-black text-white font-serif'>
      <div className='max-w-7xl mx-auto px-6 py-16 sm:px-8 lg:py-24'>
        {/* Top section */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8'>
          <div className='lg:col-span-4'>
            <Logo variant='withTagline' colorScheme='white' />
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
            <form onSubmit={handleNewsletterSubmit} className='mt-4'>
              <div className='flex items-end border-b border-gray-600 focus-within:border-white'>
                <input
                  type='email'
                  placeholder='Your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className='w-full bg-transparent border-0 pb-2 focus:ring-0 focus:outline-none disabled:opacity-50'
                />
                <button
                  type='submit'
                  disabled={isLoading}
                  className='flex items-center gap-2 pb-2 text-gray-400 hover:text-white disabled:opacity-50'
                >
                  <MoveRight strokeWidth={1.5} />
                  {isLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              <p className='text-xs text-gray-500 mt-2'>
                We respect your privacy. We'll only use your email to send you
                updates about Sonacove Meets.
              </p>

              {message && (
                <div
                  className={`mt-2 flex items-center gap-2 text-sm transition-opacity duration-300 ${
                    message.type === 'error' ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {message.type === 'error' ? (
                    <AlertTriangle size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  <span>{message.text}</span>
                </div>
              )}
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
