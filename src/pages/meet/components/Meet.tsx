import { useEffect, useRef, useState, type FormEvent } from 'react';
import StartMeeting from './StartMeeting';
import UserCard from './UserCard';
import meet_background from '../../../assets/meet-background.png';
import { getUserManager } from './utils.ts';
import { getGravatarUrl } from '../../../utils/gravatar';
import Header from '../../../components/Header';
import type { User } from 'oidc-client-ts';

const meetingsList = [
{
    date: 'August 25, 2025',
    title: 'Design Workshop with Ibrahim',
    time: '8:20 PM',
    status: 'Upcoming',
  },
  {
    date: 'August 25, 2025',
    title: 'Design Workshop with Ibrahim',
    time: '8:20 PM',
    status: 'Upcoming',
  },
  {
    date: 'August 26, 2025',
    title: 'Project Sync-Up',
    time: '10:00 AM',
    status: 'Upcoming',
  },
  {
    date: 'August 27, 2025',
    title: 'Marketing Brainstorm',
    time: '3:30 PM',
    status: 'Upcoming',
  },
];
const recordings = [
  {
    title: 'Design Workshop with Ibrahim',
    date: 'August 20, 2025',
    duration: '1h 15m',
  },
  { title: 'Project Sync-Up', date: 'August 18, 2025', duration: '45m' },
  { title: 'Marketing Brainstorm', date: 'August 15, 2025', duration: '30m' },
];
const notes = [
  {
    title: 'Follow-up: Q3 Roadmap',
    date: 'August 25, 2025',
    content: 'Key takeaways from the design workshop...',
  },
  {
    title: 'Ideas from Marketing Sync',
    date: 'August 22, 2025',
    content: 'We discussed potential new ad campaigns...',
  },
  {
    title: 'Client Onboarding Feedback',
    date: 'August 20, 2025',
    content: 'The client found the initial setup process a bit confusing...',
  },
];

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
  const [user, setUser] = useState<AppUser | null>(null);
  const authInitialized = useRef(false);

  useEffect(() => {
    if (authInitialized.current === false){
      authInitialized.current = true;

      // Helper function to transform the oidc-client user object into our app's user state
      const processUser = (u: User): AppUser | null => {
        if (!u || !u.profile) return null;
        const { name, email, context, picture } = u.profile;
        const minutesUsed = context?.user?.minutes_used ?? 0;

        return {
          name: name ?? 'User',
          email: email ?? '',
          plan: context?.user?.subscription_status ?? 'trialing',
          avatarUrl: picture ?? getGravatarUrl(email || '', 200),
          minutesUsed: minutesUsed,
          token: u.access_token,
        };
      };

      // Function to handle the initial authentication check and redirect callback
      const handleAuth = async () => {
        try {
          let u: User | null = null;
          if (window.location.search.includes('code=')) {
            u = await getUserManager().signinRedirectCallback();
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
          } else {
            u = await getUserManager().getUser();
          }

          if (u) {
            setUser(processUser(u));
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Error handling authentication:', err);
          setUser(null);
        }
      };

      // --- Event Listeners for Automatic UI Updates ---

      const onUserLoaded = (loadedUser: User) => {
        console.log('User session updated via event, refreshing UI.');
        setUser(processUser(loadedUser));
      };

      const onUserUnloaded = () => {
        console.log('User unloaded, logging out.');
        setUser(null);
      };

      const onSilentRenewError = (error: Error) => {
        console.error('Silent renew error:', error);
        // Invalidate the user's login state
        setUser(null);
      };

      getUserManager().events.addUserLoaded(onUserLoaded);
      getUserManager().events.addUserUnloaded(onUserUnloaded);
      getUserManager().events.addSilentRenewError(onSilentRenewError);

      // Run the initial authentication check
      handleAuth();

      return () => {
        getUserManager().events.removeUserLoaded(onUserLoaded);
        getUserManager().events.removeUserUnloaded(onUserUnloaded);
        getUserManager().events.removeSilentRenewError(onSilentRenewError);
      };
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const input = document.getElementById('room-input') as HTMLInputElement;
    if (input && input.placeholder) {
      window.location.href = `/meet/${input.placeholder}`;
    }
  }

  return (
    <div className='bg-gradient-to-b from-[#F3F3F3] to-[#FAFAFA] min-h-screen p-4 overflow-x-hidden'>
      <div className='w-full max-w-[1700px] mx-auto px-8'>
        <Header pageType='welcome' user={user ?? undefined} />
        {/* MAIN */}
        <main className='grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-[5vw] items-start pt-4 lg:pt-8 mt-4'>
          <div className='lg:col-span-2'>
            <StartMeeting
              onSubmit={handleSubmit}
            />
          </div>

          {user ? (
            <UserCard
              user={user}
              meetingsList={meetingsList}
              recordings={recordings}
              notes={notes}
              minutesUsed={750} // Hardcoded for now
              token={user.token}
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