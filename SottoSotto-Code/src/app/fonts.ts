import { Hanken_Grotesk, Spectral, Spectral_SC } from 'next/font/google';

// Fonts are downloaded at build time and served from our own domain (D38, ARCHITECTURE §6.3).
// Budget: at most 4 files. Only the two faces above the fold are preloaded.

export const spectral = Spectral({
  weight: '300',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-spectral',
  preload: true,
});

export const spectralSC = Spectral_SC({
  weight: '300',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-spectral-sc',
  preload: false,
});

export const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hanken',
  preload: true,
});

export const fontVariables = [spectral.variable, spectralSC.variable, hanken.variable].join(' ');
