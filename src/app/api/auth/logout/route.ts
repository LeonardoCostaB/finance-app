import { LoginApi } from '@/graphql/server/login/data-source';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
   const accessToken = cookies().get('accessToken')?.value || '';

   const loginApi = new LoginApi();
   const logout = await loginApi.logout(accessToken);

   if (logout) {
      cookies().delete('accessToken');
      cookies().delete({
         name: 'refreshToken',
         path: '/api/auth/refresh-token',
      });

      return NextResponse.json({ success: true });
   }
}
