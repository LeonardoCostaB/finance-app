'use client';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import gql from 'graphql-tag';

import { Item } from './Item';
import { LogOut } from 'lucide-react';

const LOGOUT = gql`
   mutation Logout($userId: String) {
      logout(userId: $userId)
   }
`;

export function LogoutButton({ hidden }: { hidden?: boolean }) {
   const [logout, { loading }] = useMutation(LOGOUT);
   const router = useRouter();

   function handleLogOut() {
      logout({
         variables: {
            userId: '',
         },
         onCompleted: (data) => {
            if (data?.logout) router.push('/login');
         },
      });
   }

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
