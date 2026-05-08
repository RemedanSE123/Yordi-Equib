import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
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
          sessionId: randomUUID(),
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
        token.sessionId = randomUUID();
      }
      if (!token.sessionId) token.sessionId = randomUUID();
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
  events: {
    async signIn(message) {
      try {
        const userId = (message.user as any)?.id;
        if (!userId) return;

        await db.logAudit({
          user_id: userId,
          action: 'LOGIN_SUCCESS',
          table_name: 'auth_sessions',
          new_data: {
            event: 'LOGIN_SUCCESS',
            provider: message.account?.provider || 'credentials',
            session_id: (message.user as any)?.sessionId || null,
            occurred_at: new Date().toISOString(),
          },
        });

        await db.logAudit({
          user_id: userId,
          action: 'SESSION_START',
          table_name: 'auth_sessions',
          new_data: {
            event: 'SESSION_START',
            provider: message.account?.provider || 'credentials',
            session_id: (message.user as any)?.sessionId || null,
            occurred_at: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to write signIn audit event', error);
      }
    },
    async signOut(message) {
      try {
        const tokenUserId = (message.token as any)?.id || (message.token as any)?.sub;
        const sessionUserId = (message.session as any)?.user?.id;
        const userId = tokenUserId || sessionUserId;
        if (!userId) return;

        await db.logAudit({
          user_id: userId,
          action: 'MANUAL_LOGOUT',
          table_name: 'auth_sessions',
          new_data: {
            event: 'MANUAL_LOGOUT',
            session_id: (message.token as any)?.sessionId || null,
            occurred_at: new Date().toISOString(),
          },
        });

        await db.logAudit({
          user_id: userId,
          action: 'SESSION_END',
          table_name: 'auth_sessions',
          new_data: {
            event: 'SESSION_END',
            session_id: (message.token as any)?.sessionId || null,
            occurred_at: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Failed to write signOut audit event', error);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'yordi-ekub-secret-key-change-in-production',
} satisfies NextAuthOptions;
