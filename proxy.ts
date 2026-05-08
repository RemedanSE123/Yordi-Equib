import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function proxy() {
    return undefined;
  },
  {
    pages: {
      signIn: '/login',
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*'],
};
