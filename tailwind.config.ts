import type { Config } from 'tailwindcss';

const config: Config = {
   content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
   ],
   theme: {
      extend: {
         backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
         },
         keyframes: {
            overlayShow: {
               from: { opacity: '0' },
               to: { opacity: '1' },
            },
            contentMobileShow: {
               from: { visibility: 'hidden', maxHeight: '0', opacity: '0' },
               to: { opacity: '1', visibility: 'visible', maxHeight: '300px' },
            },
            contentShow: {
               from: { opacity: '0', transform: 'translate(-50%, -48%) scale(0.96)' },
               to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
            },
         },
         animation: {
            overlayShow: 'overlayShow 500ms linear',
            contentMobileShow: 'contentMobileShow 500ms linear',
            contentShow: 'contentShow 300ms cubic-bezier(0.16, 1, 0.3, 1)',
         },
      },
   },
   plugins: [],
};
export default config;
