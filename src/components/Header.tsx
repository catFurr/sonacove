import React, { useState } from 'react';
import Button from './Button';
import { login, logout, signup } from '../pages/meet/components/utils';

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
        <a
          href='/meet'
          className='hidden md:block rounded-full bg-orange-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-500'
        >
          Visit Platform
        </a>
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
    <header className='mx-auto flex max-w-7xl items-center justify-between rounded-full md:border md:border-gray-200 p-3 mt-4 md:shadow-sm md:backdrop-blur-sm relative'>
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
            <svg
              width='25'
              height='25'
              viewBox='0 0 25 25'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M14.0693 17.8027C14.8956 17.8029 15.5653 18.4725 15.5654 19.2988C15.5654 20.1253 14.8957 20.7957 14.0693 20.7959H4.0918C3.26554 20.7956 2.5957 20.1252 2.5957 19.2988C2.59585 18.4726 3.26563 17.803 4.0918 17.8027H14.0693ZM20.0557 10.8193C20.8819 10.8196 21.5516 11.4892 21.5518 12.3154C21.5515 13.1416 20.8818 13.8123 20.0557 13.8125H4.0918C3.26569 13.8122 2.59596 13.1415 2.5957 12.3154C2.59583 11.4892 3.26561 10.8196 4.0918 10.8193H20.0557ZM20.0557 3.83496C20.882 3.83512 21.5516 4.50474 21.5518 5.33105C21.5518 6.15748 20.882 6.82796 20.0557 6.82812H10.0781C9.25181 6.82788 8.58203 6.15743 8.58203 5.33105C8.58216 4.50479 9.25189 3.8352 10.0781 3.83496H20.0557Z'
                fill='black'
              />
            </svg>
          </button>

          {renderMobileMenu()}
        </div>
      </div>
    </header>
  );
};

export default Header;
