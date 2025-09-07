import md5 from 'blueimp-md5';


export function getGravatarUrl(email: string, size = 200): string {
  if (!email) return 'https://www.gravatar.com/avatar/?d=mp&s=' + size;
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?d=mp&s=${size}`;
}
