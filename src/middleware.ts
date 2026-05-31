import { NextRequest, NextResponse } from 'next/server';

export default function middleware(req: NextRequest) {
   const publicRoutes = ['/login', '/login/create-user', '/unauthenticated'];
   const { pathname } = req.nextUrl;

   const cookie = req.cookies.get('auth-access-token')?.value;

   if (cookie && publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/', req.url));
   }

   if (publicRoutes.includes(pathname)) {
      return NextResponse.next();
   }

   if (!cookie) {
      return NextResponse.redirect(new URL('/unauthenticated', req.url));
   }

   return NextResponse.next();
}

export const config = {
   matcher: ['/((?!api|_next|static|favicon.ico).*)'],
};
