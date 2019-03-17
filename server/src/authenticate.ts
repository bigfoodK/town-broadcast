import Koa from 'koa';
import Jwt from 'jsonwebtoken';
import ServerConfig from './serverConfig';

let lastToken = '';

export default async function authenticate(ctx: Koa.Context, next: () => Promise<any>) {
  const clientToken = ctx.cookies.get('session');

  if(await isVerified(clientToken)) {
    ctx.login = true;
    renewToken(ctx);
  } else {
    ctx.cookies.set('session', '');
  }
  
  await next();
}

function isVerified(token: string) {
 return new Promise(resolve => {
  if(lastToken !== token) return resolve(false);

  Jwt.verify(token, ServerConfig.auth.sessionKey, (error) => {
    if(error) return resolve(false);
    return resolve(true);
  })
 });
}

export function renewToken(ctx: Koa.Context) {
  const newToken = Jwt.sign({}, ServerConfig.auth.sessionKey, {
    expiresIn: `${ServerConfig.auth.expiresIn}ms`,
  });
  ctx.cookies.set('session', newToken, { 
    maxAge: ServerConfig.auth.expiresIn,
    httpOnly: false,
  });
  lastToken = newToken;
}