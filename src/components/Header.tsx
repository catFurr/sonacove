import React, { useState } from 'react';
import Button from './Button';
import { login, logout, signup } from '../pages/meet/components/utils';
import { TextAlignJustify } from 'lucide-react'; 

type PageType = 'welcome' | 'landing';

interface HeaderProps {
  pageType?: PageType;
  user?: any; // user comes in as a prop now
}

const Header: React.FC<HeaderProps> = ({ pageType = 'landing', user }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Center nav links
  const renderNavLinks = () => {
    if (pageType === 'landing') {
      return (
        <nav className='hidden md:flex gap-8'>
          <a href='/features' className='text-gray-600 hover:text-black'>
            Features
          </a>
          <a href='/comparison' className='text-gray-600 hover:text-black'>
            Comparison
          </a>
          <a href='#pricing' className='text-gray-600 hover:text-black'>
            Pricing
          </a>
          <a href='/faq' className='text-gray-600 hover:text-black'>
            FAQ
          </a>
        </nav>
      );
    }
    return null;
  };

  // Desktop right section (auth buttons + CTA)
  const renderDesktopRight = () => {
    if (pageType === 'welcome') {
      return (
        <div className='hidden md:flex gap-4 items-center'>
          {user ? (
            <>
              <Button variant='secondary' onClick={() => logout()}>
                Log Out
              </Button>
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className='w-10 h-10 rounded-full object-cover'
                />
              )}
            </>
          ) : (
            <>
              <Button variant='secondary' onClick={() => login()}>
                Login
              </Button>
              <Button variant='primary' onClick={() => signup()}>
                Signup
              </Button>
            </>
          )}
        </div>
      );
    }

    // Landing page
    return (
      <div className='hidden md:flex gap-4 items-center'>
        <Button
          variant='primary'
          onClick={() => (window.location.href = '/meet')}
          className='hidden md:block'
        >
          Visit Platform
        </Button>
      </div>
    );
  };

  const renderMobileMenu = () => {
    if (!mobileMenuOpen) return null;

    return (
      <div className='absolute top-full right-4 bg-white rounded-xl shadow-md p-4 flex flex-col gap-3 w-48 z-50'>
        {pageType === 'landing' ? (
          <>
            <a href='/features' className='text-gray-600 hover:text-black'>
              Features
            </a>
            <a href='/comparison' className='text-gray-600 hover:text-black'>
              Comparison
            </a>
            <a href='#pricing' className='text-gray-600 hover:text-black'>
              Pricing
            </a>
            <a href='/faq' className='text-gray-600 hover:text-black'>
              FAQ
            </a>
            <Button
              variant='primary'
              onClick={() => {
                window.location.href = '/meet';
              }}
            >
              Visit Platform
            </Button>
          </>
        ) : user ? (
          <Button variant='secondary' onClick={() => logout()}>
            Log Out
          </Button>
        ) : (
          <>
            <Button variant='secondary' onClick={() => login()}>
              Login
            </Button>
            <Button variant='primary' onClick={() => signup()}>
              Signup
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <header className='ml-[2vw] mr-[2vw] flex flex-1 items-center justify-between rounded-full md:border md:border-gray-200 p-3 mt-4 md:shadow-sm md:backdrop-blur-sm relative'>
      {/* Left: Logo */}
      <div className='flex items-center gap-2 pl-4'>
        <a href='/' className='flex items-center gap-2'>
          <img
            src='/sonacove-orange.svg'
            alt='Sonacove Logo'
            className='h-8 w-8'
          />
          <span className='text-xl font-semibold text-black'>Sonacove</span>
        </a>
      </div>

      {/* Center: Nav Links */}
      <div className='absolute left-1/2 transform -translate-x-1/2'>
        {renderNavLinks()}
      </div>

      {/* Right: Auth Buttons / CTA */}
      <div className='flex items-center gap-2 md:gap-4'>
        {renderDesktopRight()}

        {/* Mobile Hamburger */}
        <div className='md:hidden flex items-center'>
          <button
            className='p-2'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <TextAlignJustify strokeWidth={3} size={26} />
          </button>

          {renderMobileMenu()}
        </div>
      </div>
    </header>
  );
};

export default Header;
