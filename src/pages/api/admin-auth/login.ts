import type { APIRoute } from 'astro';
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_LOGIN_PATH,
  createAdminSession,
  getAdminAuthConfig,
  getAdminSessionCookieOptions,
  normalizeAdminNextPath,
  verifyAdminPassword,
} from '@/lib/admin-auth';

export const prerender = false;

function redirectToLogin(error: string, next: string): Response {
  const searchParams = new URLSearchParams({
    error,
    next,
  });

  return new Response(null, {
    status: 303,
    headers: {
      location: `${ADMIN_LOGIN_PATH}?${searchParams.toString()}`,
      'cache-control': 'no-store',
    },
  });
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const formData = await request.formData();
  const next = normalizeAdminNextPath(formData.get('next'));
  const password = formData.get('password');
  const config = getAdminAuthConfig(locals);

  if (!config.password) {
    return redirectToLogin('missing-config', next);
  }

  if (typeof password !== 'string' || !(await verifyAdminPassword(password, config))) {
    return redirectToLogin('invalid', next);
  }

  const session = await createAdminSession(config);
  cookies.set(ADMIN_AUTH_COOKIE, session.value, getAdminSessionCookieOptions(session.expires));

  return new Response(null, {
    status: 303,
    headers: {
      location: next,
      'cache-control': 'no-store',
    },
  });
};
