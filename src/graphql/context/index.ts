export async function context({ req, res }: { req: any, res: any }) {
   // let loggedUserId = await authorizationUserWithBearerToken(req);

   // if (!loggedUserId) {
   //    if (req && req.headers && req.headers.cookie) {
   //       const { jwtToken } = cookieParser(req.headers.cookie);
   //       loggedUserId = await verifyJwtToken(jwtToken);
   //    }
   // }

   return {
      loggedUserId: '',
      res,
      // filterParams: (params) => {
      //    return new URLSearchParams(params);
      // }
   }
}
