import Koa from 'koa';
import ServerConfig from './serverConfig';
import { renewToken } from './authenticate';
import hashPassword from './hashPassword';

export default async function login(ctx: Koa.Context, next: () => Promise<any>) {  
  const password = ctx.request.body.password;
  if(typeof password !== 'undefined') {
    const hash = await hashPassword(ctx.request.body.password || '');
    if(hash === ServerConfig.auth.password) renewToken(ctx);
  }
  ctx.status = 204;
  await next();
}