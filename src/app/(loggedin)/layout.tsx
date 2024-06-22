import type { Metadata } from "next";
import { Menu } from "@/components/menu";

export const metadata: Metadata = {
   title: "note recording app",
   description: "Aplicativo de registro de nota",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <>
         <Menu />

         <div className="flex-1">
            {children}
         </div>
      </>
   );
}
