import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export type AccessTokenPayload = {
   sub: string;
   sessionId: string;
};

function createRefeshToken(): string {
   return crypto.randomBytes(64).toString('base64url');
}

function createAccessToken(payload: AccessTokenPayload): string {
   return jwt.sign(payload, process.env.JWT_SECRET_KEY as string, {
      expiresIn: '1d',
   });
}

export { createAccessToken, createRefeshToken };
