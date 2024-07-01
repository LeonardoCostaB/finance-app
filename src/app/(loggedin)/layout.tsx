import { Menu } from "@/components/menu";
import { LoggedInProvider } from "@/context/loggedIn-context";

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <LoggedInProvider>
         <Menu />

         <div className="flex-1">
            {children}
         </div>
      </LoggedInProvider>
   );
}
