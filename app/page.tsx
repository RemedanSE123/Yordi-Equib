import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth-config';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authConfig);

  if (session) {
    redirect('/dashboard');
  }

  redirect('/login');
}
