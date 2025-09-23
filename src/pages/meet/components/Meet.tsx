import { useEffect, useState } from 'react';
import StartMeeting from './StartMeeting';
import UserCard from './UserCard';
import meet_background from '../../../assets/meet-background.png';
import { useAuth } from '../../../hooks/useAuth';
import { getAuthService } from '../../../utils/AuthService';
import { getGravatarUrl } from '../../../utils/gravatar';
import Header from '../../../components/Header';
import { AlertTriangle, X } from 'lucide-react';
import Popup from '../../../components/Popup';

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
  const { isLoggedIn, dbUser, user: oidcUser, meetings: meetingsList, refetchMeetings } = useAuth();

  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'login_failed') {
      setLoginError('Authentication failed. Please try logging in again.');

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && oidcUser) {
      const { name, email, context, picture } = oidcUser.profile;
      // const minutesUsed = context?.user?.minutes_used ?? 0;
      const minutesUsed = dbUser?.user.totalHostMinutes ?? 0;

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
  }, [isLoggedIn, oidcUser, dbUser]);

  return (
    <div className='bg-gradient-to-b from-[#F3F3F3] to-[#FAFAFA] min-h-screen p-4 overflow-x-hidden'>
      <Popup
        message={loginError}
        type='error'
        onClose={() => setLoginError(null)}
      />

      <div className='w-full max-w-[1700px] mx-auto px-8'>
        <Header pageType='welcome' user={appUser ?? undefined} />

        {/* MAIN */}
        <main className='grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-[5vw] items-start pt-4 lg:pt-8 mt-4'>
          <div className='lg:col-span-2'>
            <StartMeeting isLoggedIn={isLoggedIn} />
          </div>

          {appUser ? (
            <UserCard
              user={appUser}
              meetingsList={meetingsList}
              recordings={[]}
              notes={[]}
              minutesUsed={appUser.minutesUsed}
              token={appUser.token}
              maxBookings={dbUser?.user.maxBookings ?? 1}
              onMeetingDeleted={refetchMeetings}
              
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