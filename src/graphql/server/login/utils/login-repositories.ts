import jwt from 'jsonwebtoken';

export function createJwtToken(payload: { id: string }) {
   return jwt.sign(payload, process.env.JWL_SECRET_KEY as string, {
      expiresIn: '1d',
   });
}
