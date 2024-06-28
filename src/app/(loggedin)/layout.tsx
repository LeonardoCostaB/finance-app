'use client'

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';

import { Menu } from "@/components/menu";

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   const router = useRouter();

   useEffect(() => {
      if (!Cookies.get('isLoggedIn')) {
         router.push('/unauthenticated');
      }
   }, [])

   return (
      <>
         <Menu />

         <div className="flex-1">
            {children}
         </div>
      </>
   );
}
