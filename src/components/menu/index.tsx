import { Item } from './Item';
import { Home, UserCircle2, LineChart, PiggyBank, LockKeyhole } from 'lucide-react';
import { LogoutButton } from './LogoutButton';

export function Menu() {
   return (
      <aside className="sticky bottom-0 top-0 flex h-screen flex-col max-lg:hidden">
         <div className="mx-auto my-8 flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <LineChart size={20} className="text-black" />
         </div>

         <nav className="flex flex-1 flex-col justify-between">
            <ul>
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

            <ul>
               <Item
                  url="/admin"
                  className=""
                  text="Admin"
                  icon={<LockKeyhole size={20} className="text-black dark:text-gray-200" />}
               />

               <LogoutButton />
            </ul>
         </nav>
      </aside>
   );
}
