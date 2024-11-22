'use client';

import { Header } from '@/components/header';
import { SavingsPreview } from '@/components/common/savings-preview';

export default function Savings() {
   return (
      <>
         <Header />

         <div className="mx-auto my-12 max-w-6xl space-y-6 px-5 max-lg:mb-20">
            <SavingsPreview />
         </div>
      </>
   );
}
