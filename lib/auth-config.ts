import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';

export const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error('Phone and password required');
        }

        const user = await db.getUserByPhone(credentials.phone);
        if (!user) {
          throw new Error('Invalid credentials');
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password || ''
        );

        if (!passwordMatch) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          phone: user.phone,
          name: user.full_name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'yordi-ekub-secret-key-change-in-production',
} satisfies NextAuthOptions;
