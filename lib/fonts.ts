import { Plus_Jakarta_Sans, DM_Sans, Fraunces } from 'next/font/google';

export const displayFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',  // Variabele naam behouden zodat alle bestaande CSS blijft werken
  display: 'swap',
});

export const bodyFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const serifFont = Fraunces({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-fraunces',
  display: 'swap',
});
