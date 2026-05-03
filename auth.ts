import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth-config';

const handler = NextAuth(authConfig);

export default handler;
export const authOptions = authConfig;
