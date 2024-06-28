import { UserApi } from "@/graphql/createUser/data-source";
import  jwt  from "jsonwebtoken";
import { cookies } from "next/headers";

async function verifyJwtToken(token: string) {
   try {
      const { id } = jwt.verify(token, process.env.JWL_SECRET_KEY as string) as jwtTokenId;

      const userApi = new UserApi()
      userApi.initialize({} as any)
      const foundUser = await userApi.getUser(id);

      if (foundUser.token !== token) return "";

      return id;

   } catch (error) {
      console.log(error);
      return "";
   }
}

export async function userIsLoggedIn() {
   let loggedUserId = '';

   const headerCookie = cookies().get('auth-token');


   if (headerCookie && headerCookie.value) {
      loggedUserId = await verifyJwtToken(headerCookie.value);
   }

   return loggedUserId
}
