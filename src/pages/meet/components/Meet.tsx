import { useEffect, useState } from 'react';
import StartMeeting from './StartMeeting';
import UserCard from './UserCard';
import meet_background from '../../../assets/meet-background.png';
import { getUserManager } from './utils';
import { getGravatarUrl } from '../../../utils/gravatar';
import Header from '../../../components/Header';

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

export default function Meet() {
const [user, setUser] = useState<any>(null);

useEffect(() => {
  const userManager = getUserManager();

  const handleAuth = async () => {
    // This will process the redirect if the URL has a `code` query param
    if (window.location.search.includes('code=')) {
      try {
        const u = await userManager.signinRedirectCallback();
        const { name, email, context, picture } = u.profile ?? {};
        setUser({
          name: name ?? 'User',
          email: email ?? '',
          plan: context?.user?.subscription_status ?? 'Free',
          avatarUrl: picture ?? getGravatarUrl(email || '', 200),
        });

        // Remove the query params from URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      } catch (err) {
        console.error('Error processing login redirect:', err);
      }
    } else {
      // If no redirect, just try to get an existing session
      const u = await userManager.getUser();
      if (u) {
        const { name, email, context, picture } = u.profile ?? {};
        setUser({
          name: name ?? 'User',
          email: email ?? '',
          plan: context?.user?.subscription_status ?? 'Free',
          avatarUrl: picture ?? getGravatarUrl(email || '', 200),
        });
      }
    }
  };

  handleAuth();
}, []);

  return (
    <div className='bg-gradient-to-b from-[#F3F3F3] to-[#FAFAFA] min-h-screen p-4 overflow-x-hidden'>
      <div className='w-full max-w-[1700px] mx-auto px-8'>
        <Header pageType='welcome' user={user}/>
        {/* MAIN */}
        <main className='grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-[5vw] items-start pt-4 lg:pt-8 mt-4'>
          <div className='lg:col-span-2'>
            <StartMeeting
              onSubmit={(e) => {
                e.preventDefault();
                const input = document.getElementById(
                  'room-input',
                ) as HTMLInputElement;
                if (input && input.placeholder) {
                  window.location.href = `/meet/${input.placeholder}`;
                }
              }}
            />
          </div>

          {user && (
            <UserCard
              user={user}
              meetingsList={meetingsList}
              recordings={recordings}
              notes={notes}
            />
          )}

          {!user && (
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
