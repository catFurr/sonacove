import { useEffect, useState, type FormEvent } from 'react';
import StartMeeting from './StartMeeting';
import UserCard from './UserCard';
import meet_background from '../../../assets/meet-background.png';
import { useAuth } from '../../../hooks/useAuth';
import { getAuthService } from '../../../utils/AuthService';
import { getGravatarUrl } from '../../../utils/gravatar';
import Header from '../../../components/Header';

// --- Type Definition for the User state object ---
export interface AppUser {
  name: string;
  email: string;
  plan: string;
  avatarUrl: string;
  minutesUsed: number;
  token: string;
}

export default function Meet() {
  const { isLoggedIn, dbUser, user: oidcUser, meetings: meetingsList } = useAuth();

  const [appUser, setAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const authService = getAuthService();

    if (authService && window.location.search.includes('code=')) {
      authService.handleLoginCallback().then(() => {
        // Clean the URL after the login is processed
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      });
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && oidcUser) {
      const { name, email, context, picture } = oidcUser.profile;
      // const minutesUsed = context?.user?.minutes_used ?? 0;
      const minutesUsed = dbUser?.totalHostMinutes ?? 0;

      setAppUser({
        name: name ?? 'User',
        email: email ?? '',
        plan: context?.user?.subscription_status ?? 'trialing',
        avatarUrl: picture ?? getGravatarUrl(email || '', 200),
        minutesUsed: minutesUsed,
        token: oidcUser.access_token,
      });
    } else {
      setAppUser(null);
    }
  }, [isLoggedIn, oidcUser]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const input = document.getElementById('room-input') as HTMLInputElement;
    if (input && input.placeholder) {
      window.location.href = `/meet/${input.placeholder}`;
    }
  };

  return (
    <div className='bg-gradient-to-b from-[#F3F3F3] to-[#FAFAFA] min-h-screen p-4 overflow-x-hidden'>
      <div className='w-full max-w-[1700px] mx-auto px-8'>
        <Header pageType='welcome' user={appUser ?? undefined} />
        {/* MAIN */}
        <main className='grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-[5vw] items-start pt-4 lg:pt-8 mt-4'>
          <div className='lg:col-span-2'>
            <StartMeeting onSubmit={handleSubmit} isLoggedIn={isLoggedIn}/>
          </div>

          {appUser ? (
            <UserCard
              user={appUser}
              meetingsList={meetingsList}
              recordings={[]}
              notes={[]}
              minutesUsed={appUser.minutesUsed}
              token={appUser.token}
            />
          ) : (
            <div className='relative lg:col-span-3 w-full h-full mt-12 lg:mt-0'>
              <img
                src={meet_background.src}
                alt='Illustration'
                className='w-full h-full object-contain'
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}