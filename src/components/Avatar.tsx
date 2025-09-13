import React, { useState, useEffect} from 'react';

const avatarColors = [
  '#6A50D3',
  '#FF9B42',
  '#DF486F',
  '#73348C',
  '#B23683',
  '#F96E57',
  '#4380E2',
  '#238561',
  '#00A8B3',
];

export function createInitialsAvatar(name: string): string {
  if (!name) return '';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const charCodeSum = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const backgroundColor = avatarColors[charCodeSum % avatarColors.length];

  const fontFamily = getComputedStyle(document.body).fontFamily;

  const svg = `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}" />
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
            font-family='${fontFamily}' font-size="80" font-weight="700" letter-spacing="4" fill="#ffffff">
        ${initials}
      </text>
    </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}


interface AvatarProps {
  src?: string;
  alt?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, className = '' }) => {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleLoadError = () => {
    const initialsAvatar = createInitialsAvatar(alt || '');
    if (imgSrc !== initialsAvatar) {
      setImgSrc(initialsAvatar);
    }
  };

  return (
    <img
      src={imgSrc || createInitialsAvatar(alt || '')}
      alt={alt || 'User avatar'}
      className={className}
      onError={handleLoadError}
    />
  );
};

export default Avatar;
