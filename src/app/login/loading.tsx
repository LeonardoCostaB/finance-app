'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
   const [progress, setProgress] = useState(0);

   useEffect(() => {
      const interval: any = setInterval(() => {
         setProgress((prevProgress) =>
            prevProgress >= 100 ? 0 : prevProgress + 10,
         );
      }, 600);

      return () => {
         clearInterval(interval);
      };
   }, []);

   return (
      <div
         className="fixed left-0 top-0 h-0.5 w-screen bg-cyan-200 transition-all duration-300 ease-linear"
         style={{ width: `${progress}%` }}
      />
   );
}
