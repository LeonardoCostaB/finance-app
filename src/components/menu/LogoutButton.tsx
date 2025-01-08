'use client';

import { useCallback } from 'react';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';

import { Item } from './Item';
import { LogOut } from 'lucide-react';

import { LOGOUT } from '@/graphql/client/mutations/login';

interface LogoutButtonProps {
   hidden?: boolean;
}

export function LogoutButton({ hidden }: LogoutButtonProps) {
   const [logout, { loading }] = useMutation(LOGOUT);
   const router = useRouter();

   const handleLogOut = useCallback(() => {
      logout({
         variables: {
            userId: '',
         },
         onCompleted: (data) => {
            if (data?.logout) router.push('/login');
         },
      });
   }, []);

   return (
      <Item
         className={`text-red-600 hover:bg-red-400 hover:text-white dark:text-red-400 dark:hover:text-white ${hidden ? 'max-lg:hidden' : ''}`}
         text="Logout"
         icon={<LogOut size={20} />}
         onClickFunction={handleLogOut}
         loading={loading}
      />
   );
}
