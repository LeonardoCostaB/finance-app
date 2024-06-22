'use client';

import { LogOut } from 'lucide-react';
import { Item } from './Item';

export function LogoutButton() {
   return (
      <Item
         className="text-red-600 hover:bg-red-400 hover:text-white dark:text-red-400 dark:hover:text-white"
         text="Logout"
         icon={<LogOut size={20} />}
         url='/login'
      />
   );
}
