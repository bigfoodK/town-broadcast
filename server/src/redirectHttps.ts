import Koa from 'koa';

export default async function redirectHttps(ctx: Koa.Context, next: () => Promise<any>) {
  if(!ctx.secure) ctx.redirect(`https://${ctx.hostname}:3001${ctx.path}`);
  await next();
}