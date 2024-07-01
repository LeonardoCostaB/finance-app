import { useLoggedIn } from "@/hooks/use-loggedIn";
import { PiggyBank, User } from "lucide-react";
import { useEffect } from "react";
import Image from "next/image";

interface HeaderProps {
   search?: {
      onSearch: (search: string) => void;
   }
}

export function Header({ search }: HeaderProps) {
   const { getUser, user } = useLoggedIn();

   useEffect(() => {
      getUser()
   }, [])

   return (
      <header className="w-full flex items-center justify-end p-8 gap-2 relative">
         {search && (
            <form className="flex justify-center w-96 absolute left-1/2 -translate-x-1/2 max-xl:left-[40%]">
               <input
                  type="text"
                  placeholder="Encontrar mês"
                  className="w-full bg-transparent text-base border border-gray-500 h-10 rounded-full font-semibold tracking-tight outline-none text-center placeholder:text-slate-500 focus:border-white"
                  onChange={(e) => search.onSearch(e.target.value)}
               />
            </form>
         )}

         <div className="flex items-center gap-4">
            {user?.economy && (
               <div className="flex items-center gap-2 text-xs ring-2 ring-lime-400 rounded-md p-2 mr-4">
                  <PiggyBank size={25} />

                  <strong>
                     {(user.economy)?.toLocaleString('pt-BR', { currency: 'BRL', style: 'currency' })}
                  </strong>
               </div>
            )}

            <span>{user?.name}</span>

            <button
               type="button"
               className="h-10 w-10 rounded-full overflow-hidden bg-slate-700"
            >
               {user?.avatar.url ? (
                  <Image
                     src={user?.avatar.url as string}
                     alt={`Foto de ${user?.name}`}
                     width={40}
                     height={40}
                  />
               ) : (
                  <User size={40} className="p-1" />
               )}
            </button>
         </div>
      </header>
   )
}
