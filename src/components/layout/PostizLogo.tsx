import Image from 'next/image';

export const PostizLogo = () => (
  <Image
    src="/large.png"
    alt="AutoLaunch logo"
    width={44}
    height={44}
    priority
  />
);
