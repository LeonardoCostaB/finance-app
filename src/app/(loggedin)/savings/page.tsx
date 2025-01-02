'use client';

import { FormattedPrice } from '@/components/formatted-price';
import { Header } from '@/components/header';
import { useLoggedIn } from '@/hooks/use-loggedIn';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
// import { SavingsPreview } from '@/components/savings-preview';

export default function Savings() {
   const { user } = useLoggedIn();

   return (
      <>
         <Header />

         <main className="mx-auto my-12 max-w-6xl space-y-6 px-5 max-lg:mb-20">
            <h1>Área de poupança</h1>

            <section>
               <form className="flex flex-col">
                  <label htmlFor="">Depositar novo valor</label>
                  <input type="number" name="" id="" className="bg-transparent" />
                  <button type="submit">Depositar</button>
               </form>
            </section>

            {user?.economy?.extract ? (
               user.economy.extract.map((extract) => (
                  <div
                     key={extract.date}
                     className="flex items-center justify-between rounded-lg border px-4 py-2"
                  >
                     <p>{format(extract.date, 'dd/MM/yyyy')}</p>

                     <div className="flex items-center gap-4">
                        <FormattedPrice style="normal" price={extract.value} />

                        <button type="button">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               ))
            ) : (
               <p>
                  Você ainda não possui dados de poupança. Crie uma cotação e acompanhe seu
                  progresso.
               </p>
            )}
         </main>
      </>
   );
}
