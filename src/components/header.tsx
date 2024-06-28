import { PiggyBank } from "lucide-react";
import Image from "next/image";
import  jwt  from "jsonwebtoken";

import Cookies from "js-cookie";import { useEffect } from "react";
3

interface HeaderProps {
   search?: {
      onSearch: (search: string) => void;
   }
}

export function Header({ search }: HeaderProps) {
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
            <div className="flex items-center gap-2 text-xs ring-2 ring-lime-400 rounded-md p-2 mr-4">
               <PiggyBank size={25} />

               <strong>R$ 1.200,00</strong>
            </div>

            <span>Leonardo Costa</span>

            <button
               type="button"
               className="h-10 w-10 rounded-full overflow-hidden"
            >
               <Image
                  src="https://instagram.fgig14-2.fna.fbcdn.net/v/t51.2885-19/404033193_370405728770896_7937169088078739060_n.jpg?stp=dst-jpg_s150x150&_nc_ht=instagram.fgig14-2.fna.fbcdn.net&_nc_cat=104&_nc_ohc=5wE0NoP7WMcQ7kNvgHjAqc8&edm=AOQ1c0wBAAAA&ccb=7-5&oh=00_AYAibAkzrGyxYAGtVY1F5POugn-DiKsHUm3podxnz6ZTqw&oe=6679212B&_nc_sid=8b3546"
                  alt="Foto de leonardo Costa"
                  width={40}
                  height={40}
                  />
            </button>
         </div>
      </header>
   )
}
