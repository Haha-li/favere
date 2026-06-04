import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  if (import.meta.env.PROD && context.url.pathname.startsWith('/api/keystatic/')) {
    const { env } = await import('cloudflare:workers');

    Object.defineProperty(context.locals, 'runtime', {
      configurable: true,
      enumerable: false,
      value: {
        env,
      },
    });
  }

  return next();
});
