'use client'

import type { Metadata } from "next";
import { Menu } from "@/components/menu";
import { useEffect } from "react";
import Cookies from "js-cookie";

// export const metadata: Metadata = {
//    title: "note recording app",
//    description: "Aplicativo de registro de nota",
// };

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   useEffect(() => {
      if (!Cookies.get('isLoggedIn')) {
         window.location.href = '/login'
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
