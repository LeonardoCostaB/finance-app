import { LoginApi } from '@/graphql/server/login/data-source';
import { cookies } from 'next/headers';

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

      return new Response(null, { status: 200 });
   }
}
