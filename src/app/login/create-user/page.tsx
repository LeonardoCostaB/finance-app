import { CreateUserForm } from '../components/create-user-form';
import Link from 'next/link';

import { MoveLeft } from 'lucide-react';

export default function createUser() {
   return (
      <>
         <h1 className="mx-auto flex w-full max-w-lg items-center justify-between after:w-4">
            <Link
               href="/login"
               className="rounded-full p-1 transition-all hover:bg-gray-700 active:bg-gray-600"
            >
               <MoveLeft size={16} />
            </Link>
            Cadastre sua conta
         </h1>

         <CreateUserForm />
      </>
   );
}
