import type { APIRoute } from 'astro';
import { ADMIN_AUTH_COOKIE, ADMIN_LOGIN_PATH } from '@/lib/admin-auth';

export const prerender = false;

function redirectToLogin(): Response {
  return new Response(null, {
    status: 303,
    headers: {
      location: `${ADMIN_LOGIN_PATH}?logged_out=1`,
      'cache-control': 'no-store',
    },
  });
}

function clearAdminSession(cookies: Parameters<APIRoute>[0]['cookies']): void {
  cookies.delete(ADMIN_AUTH_COOKIE, {
    path: '/',
    sameSite: 'lax',
    secure: import.meta.env.PROD,
  });
}

export const GET: APIRoute = ({ cookies }) => {
  clearAdminSession(cookies);
  return redirectToLogin();
};

export const POST: APIRoute = ({ cookies }) => {
  clearAdminSession(cookies);
  return redirectToLogin();
};
