import { createHash } from 'crypto';

function hashToken(data: string): string {
   return createHash('sha256').update(data).digest('hex');
}

export { hashToken };
