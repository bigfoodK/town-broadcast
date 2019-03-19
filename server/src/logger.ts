import Koa from 'koa';

export default async function Logger(ctx: Koa.Context, next: () => Promise<any>) {
  const startTime = Date.now();
  await next();
  const date = new Date();
  console.log(`${ctx.ip} [${date.toLocaleString()}] ${ctx.method} ${ctx.url} ${ctx.status || 500} ${ctx.length || 0} ${Date.now() - startTime}ms`);
}
