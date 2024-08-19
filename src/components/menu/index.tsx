import { Item } from './Item';
import { Home, UserCircle2, LineChart, PiggyBank, LockKeyhole } from 'lucide-react';
import { LogoutButton } from './LogoutButton';

export function Menu() {
   return (
      <aside className="sticky bottom-0 top-0 flex max-lg:fixed max-lg:top-auto max-lg:z-40 max-lg:w-full max-lg:bg-slate-900 lg:h-screen lg:flex-col">
         <div className="mx-auto my-8 flex h-10 w-10 items-center justify-center rounded-full bg-white max-lg:hidden">
            <LineChart size={20} className="text-black" />
         </div>

         <nav className="flex max-lg:w-full max-lg:justify-center max-lg:gap-4 max-lg:px-4 lg:flex-1 lg:flex-col lg:justify-between">
            <ul className="max-lg:flex max-lg:gap-4">
               <Item
                  url="/"
                  text="Home"
                  icon={<Home size={20} className="text-black dark:text-gray-200" />}
               />

               <Item
                  url="/my-account"
                  text="Minha Conta"
                  icon={<UserCircle2 size={20} className="text-black dark:text-gray-200" />}
               />

               <Item
                  url="/savings"
                  text="Poupança"
                  icon={<PiggyBank size={20} className="text-black dark:text-gray-200" />}
               />
            </ul>

            <ul className="max-lg:flex">
               <Item
                  url="/admin"
                  className=""
                  text="Admin"
                  icon={<LockKeyhole size={20} className="text-black dark:text-gray-200" />}
               />

               <LogoutButton hidden />
            </ul>
         </nav>
      </aside>
   );
}
