import type { ServiceId } from '../content';
type IconName = ServiceId | 'arrow' | 'sun' | 'moon' | 'menu' | 'close' | 'globe' | 'check' | 'facebook' | 'mail' | 'phone';
const paths: Record<Exclude<IconName, 'facebook'>, string> = {
  company: 'M3 21h18M5 21V5h9v16M14 10h5v11M8 9h3M8 13h3M8 17h3M17 14h.01M17 17h.01',
  identity: 'M3 4h18v14H3zM3 8h18M7 21h10M12 18v3M7 6h.01M10 6h.01M7 12h4M7 15h7',
  store: 'M3 3h2l3 13h11l2-9H6M10 21h.01M18 21h.01M9 6l3-3 3 3',
  automation: 'M5 7h14v12H5zM12 3v4M9 11h.01M15 11h.01M9 15h6M2 11v4M22 11v4',
  hotel: 'M3 21h18M5 21V3h14v18M9 7h1M14 7h1M9 11h1M14 11h1M10 21v-6h4v6',
  restaurant: 'M5 3v7m3-7v7M2 3v7c0 3 6 3 6 0M5 13v8M17 3v18M17 3c-4 3-4 9 0 9',
  arrow: 'M5 12h14m-6-6 6 6-6 6', sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10', menu: 'M4 6h16M4 12h16M4 18h16', close: 'm6 6 12 12M6 18 18 6',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18', check: 'm5 12 4 4L19 6',
  mail: 'M3 5h18v14H3zM3 5l9 8 9-8', phone: 'M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4c-1 5-18-4-18-13z',
};
export default function Icon({name,className=''}:{name:IconName;className?:string}) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name === 'facebook' ? <path fill="currentColor" stroke="none" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.095 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.973H15.83c-1.49 0-1.955.931-1.955 1.887v2.26h3.328l-.532 3.491h-2.796V24C19.612 23.095 24 18.1 24 12.073Z"/> : <path d={paths[name]}/>}</svg>;
}
