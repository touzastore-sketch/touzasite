import React from 'react';
import { StoreSettings } from '../types';

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: (props: { className?: string }) => React.ReactNode;
}

const InstagramIcon = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TiktokIcon = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const TwitterIcon = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsappIcon = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const YoutubeIcon = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const SnapchatIcon = ({ className = 'w-[18px] h-[18px]' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2c-3.8 0-6 2.6-6 6.2 0 1.6.4 2.8 1 3.8-.4.3-1 .5-1.5.5-.3 0-.6-.1-.9-.2-.3-.1-.6 0-.8.2s-.2.5-.1.8c.4 1 1.4 1.7 2.3 2 .2 1.2 1 2 2 2.2.4.1.8.2 1.2.2 1.3 0 2.3-.6 2.8-1.5.5.9 1.5 1.5 2.8 1.5.4 0 .8-.1 1.2-.2 1-.2 1.8-1 2-2.2.9-.3 1.9-1 2.3-2 .1-.3 0-.6-.1-.8s-.5-.3-.8-.2c-.3.1-.6.2-.9.2-.5 0-1.1-.2-1.5-.5.6-1 1-2.2 1-3.8C18 4.6 15.8 2 12 2z" />
  </svg>
);

export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'instagram', name: 'Instagram', url: 'https://instagram.com', icon: InstagramIcon },
  { id: 'facebook', name: 'Facebook', url: 'https://facebook.com', icon: FacebookIcon },
  { id: 'tiktok', name: 'TikTok', url: 'https://tiktok.com', icon: TiktokIcon },
  { id: 'twitter', name: 'X (Twitter)', url: 'https://x.com', icon: TwitterIcon },
];

interface SocialLinksProps {
  variant?: 'horizontal' | 'vertical' | 'floating-hero' | 'menu';
  className?: string;
  theme?: 'light' | 'dark' | 'hero';
  storeSettings?: StoreSettings;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  variant = 'horizontal',
  className = '',
  theme = 'light',
  storeSettings,
}) => {
  // Theme styling rules
  const getThemeClasses = () => {
    if (theme === 'hero') {
      return 'text-white/80 hover:text-white hover:scale-110 bg-black/30 hover:bg-black/50 border-white/20';
    }
    if (theme === 'dark') {
      return 'text-white/80 hover:text-white hover:scale-110 hover:bg-white/10 border-white/10';
    }
    return 'text-[#000000]/70 hover:text-[#000000] hover:scale-110 hover:bg-black/5 border-black/10';
  };

  // Build active links based on storeSettings or default fallbacks
  const waUrl = storeSettings?.socialWhatsappUrl || (storeSettings?.whatsappNumber ? `https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}` : '');

  const activeLinks: SocialLink[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      url: storeSettings?.socialInstagramUrl !== undefined ? storeSettings.socialInstagramUrl : 'https://instagram.com',
      icon: InstagramIcon,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: storeSettings?.socialFacebookUrl !== undefined ? storeSettings.socialFacebookUrl : 'https://facebook.com',
      icon: FacebookIcon,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      url: storeSettings?.socialTiktokUrl !== undefined ? storeSettings.socialTiktokUrl : 'https://tiktok.com',
      icon: TiktokIcon,
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      url: storeSettings?.socialTwitterUrl !== undefined ? storeSettings.socialTwitterUrl : 'https://x.com',
      icon: TwitterIcon,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      url: waUrl,
      icon: WhatsappIcon,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: storeSettings?.socialYoutubeUrl || '',
      icon: YoutubeIcon,
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      url: storeSettings?.socialSnapchatUrl || '',
      icon: SnapchatIcon,
    },
  ].filter((item) => Boolean(item.url && item.url.trim() !== ''));

  if (activeLinks.length === 0) return null;

  if (variant === 'floating-hero') {
    return (
      <div
        className={`absolute bottom-6 rtl:left-6 ltr:right-6 md:bottom-12 rtl:md:left-10 ltr:md:right-10 z-20 flex flex-col items-center gap-3.5 ${className}`}
      >
        <div className="flex flex-col items-center gap-2.5 p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 shadow-lg">
          {activeLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.name}
              title={`Follow us on ${item.name}`}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-white/85 hover:text-white hover:scale-115 transition-all duration-300 hover:bg-white/15"
            >
              <item.icon className="w-[18px] h-[18px]" />
            </a>
          ))}
        </div>
        <div className="w-[1px] h-10 bg-gradient-to-b from-white/40 to-transparent hidden md:block" />
      </div>
    );
  }

  const isVertical = variant === 'vertical';

  return (
    <div
      className={`flex ${
        isVertical ? 'flex-col gap-2.5' : 'items-center gap-1.5 sm:gap-2'
      } ${className}`}
    >
      {activeLinks.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.name}
          title={item.name}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-250 cursor-pointer ${getThemeClasses()}`}
        >
          <item.icon className="w-[18px] h-[18px]" />
        </a>
      ))}
    </div>
  );
};
