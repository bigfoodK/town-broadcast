import Koa from 'koa';
import ServerConfig from './serverConfig';

export default async function redirectHttps(ctx: Koa.Context, next: () => Promise<any>) {
  if(!ctx.secure) ctx.redirect(`https://${ctx.hostname}:${ServerConfig.https.port}${ctx.path}`);
  await next();
}