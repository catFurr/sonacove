import React from 'react';

import Header from '../../../components/Header';
import PageHeader from '../../../components/PageHeader';
import FeatureCard from './FeatureCard';
import type { Feature } from '../types';

import basic_image from '../../../assets/feature-basic.png';
import chat_image from '../../../assets/feature-chat.png';
import breakout_image from '../../../assets/feature-breakout.jpg';
import reactions_image from '../../../assets/feature-reactions.jpg';
import raisehand_image from '../../../assets/feature-raisehand.png';
import recording_image from '../../../assets/feature-recording.jpg';
import background_image from '../../../assets/feature-background.jpg';
import moderation_image from '../../../assets/feature-moderation.png';
import lobby_image from '../../../assets/feature-lobby.jpg';
import security_image from '../../../assets/feature-security.png';
import notes_image from '../../../assets/feature-notes.png';
import polls_image from '../../../assets/feature-polls.jpg';
import Button from '../../../components/Button';


const featuresData: Feature[] = [
  {
    title: 'Crystal Clear Audio, Video & Screensharing',
    description:
      'Start your meetings with confidence. Sonacove Meets offers seamless microphone, camera, and screensharing support, ensuring everyone can be seen and heard clearly. Share your screen in high definition for effortless collaboration and presentations.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Instant device switching',
      'High-quality video and audio',
      'Multiple participants can share screens',
    ],
    image: {
      img: basic_image,
      alt: 'Mic, Camera, and Screensharing',
    },
  },
  {
    title: 'Rich Chat & Messaging',
    description:
      'Communicate your way. Send messages to everyone or privately, and express yourself with emojis and GIFs. Our chat is designed for both fun and productivity, keeping your team connected and engaged.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Public and private messaging',
      'Emoji and GIF support',
      'Message history and search',
    ],
    image: {
      img: chat_image,
      alt: 'Chat, Emojis, and GIFs',
    },
  },
  {
    title: 'Interactive Polls',
    description:
      'Make decisions together. Create polls in seconds and let everyone vote. Results are displayed instantly, making it easy to gather feedback and reach consensus.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Unlimited polls per meeting',
      'Anonymous or named voting',
      'Real-time results',
    ],
    image: {
      img: polls_image,
      alt: 'Polls and Voting',
    },
  },
  {
    title: 'Breakout Rooms',
    description:
      'Divide and conquer. Create multiple breakout rooms for focused discussions or group activities. Assign participants manually or randomly with a single click, and bring everyone back together instantly.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Unlimited rooms per meeting',
      'Random or manual assignment',
      'Broadcast messages to all rooms',
    ],
    image: {
      img: breakout_image,
      alt: 'Breakout Rooms',
    },
  },
  {
    title: 'Animated Reactions & GIFs',
    description:
      'Liven up your meetings. Send animated reactions with sound, or share your favorite GIFs to make your point. Reactions are visible to everyone, adding a fun and interactive layer to your meetings.',
    bulletTitle: 'Why It Matters:',
    bullets: ['Animated emoji reactions', 'Sound effects', 'GIF support'],
    image: {
      img: reactions_image,
      alt: 'Reactions and GIFs',
    },
  },
  {
    title: 'Raise Hands',
    description:
      'Keep meetings organized. Participants can raise their hands to request to speak, and moderators can easily manage the queue, ensuring everyone gets their turn without interruptions.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Automatic speaker queue',
      'Visual hand raise indicators',
      'Easy for moderators to manage',
    ],
    image: {
      img: raisehand_image,
      alt: 'Raise Hands',
    },
  },
  {
    title: 'Meeting Recording',
    description:
      "Never miss a moment. Record your meetings with a single click and share the recordings with anyone who couldn't attend. All recordings are securely stored and easy to access.",
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Cloud or local recording options',
      'Easy sharing and playback',
      'Secure storage',
    ],
    image: {
      img: recording_image,
      alt: 'Meeting Recording',
    },
  },
  {
    title: 'Background Effects',
    description:
      "Personalize your presence. Set a custom background image or blur your surroundings for added privacy and professionalism. Stand out or blend in—it's your choice.",
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Custom image backgrounds',
      'Background blur',
      'Easy to change during meetings',
    ],
    image: {
      img: background_image,
      alt: 'Background Effects',
    },
  },
  {
    title: 'Advanced Moderation',
    description:
      'Take control of your meetings. Fine-tuned moderation tools let you manage who can unmute, remove participants, and promote co-hosts. Keep your meetings safe, productive, and on track.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Mute/unmute controls',
      'Remove or promote participants',
      'Granular permissions',
    ],
    image: {
      img: moderation_image,
      alt: 'Moderation',
    },
  },
  {
    title: 'Lobby Room',
    description:
      'Welcome guests with confidence. Enable a lobby room so new participants wait for approval before joining the main meeting. Perfect for interviews, classes, and secure gatherings.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Admit or deny new participants',
      'Customizable lobby messages',
      'Enhanced meeting security',
    ],
    image: {
      img: lobby_image,
      alt: 'Lobby Room',
    },
  },
  {
    title: 'End-to-End Security',
    description:
      'Your privacy matters. All meetings are end-to-end encrypted, with options for meeting passwords and lobby rooms for extra protection. Your data is never sold or shared.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'End-to-end encryption',
      'Password-protected meetings',
      'No data selling or tracking',
    ],
    image: {
      img: security_image,
      alt: 'Security',
    },
  },
  {
    title: 'Collaborative Note Taking (Coming Soon!)',
    description:
      'Work together in real time. Our upcoming shared document feature lets everyone take notes together, ensuring nothing gets missed and everyone stays on the same page.',
    bulletTitle: 'Why It Matters:',
    bullets: [
      'Live collaborative editing',
      'Share notes instantly',
      'Perfect for teams and classrooms',
    ],
    image: {
      img: notes_image,
      alt: 'Collaborative Note Taking',
    },
  },
];

const Features: React.FC = () => {
  return (
    <>
      <Header pageType='landing' activePage='Features'/>
      <main className='py-12'>
        <div className='container mx-auto px-4'>
          <PageHeader title='All the Features You Need'>
            Explore the powerful, intuitive, and secure features that make
            Sonacove Meets the best choice for your online meetings.
          </PageHeader>

          <div className='space-y-20 mt-16'>
            {featuresData.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index + 1}
              />
            ))}
          </div>

          <section className='text-center mt-20'>
            <h2 className='text-3xl font-bold mb-6 text-gray-800'>
              Ready to get started?
            </h2>
            <p className='text-lg text-gray-700 max-w-2xl mx-auto mb-8'>
              Sign up today and experience the most advanced, ethical, and
              user-friendly meeting platform available.
            </p>
            <div className='text-center'>
                <Button variant='primary' onClick={() => window.location.href = '/onboarding'} className='tracking-wide px-10'>
                    Get Started
                </Button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Features;
