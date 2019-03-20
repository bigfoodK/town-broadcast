import Fs from 'fs';
import Koa from 'koa';
import Http from 'http';
import Https from 'https';
import BodyParser from 'koa-body';
import Greenlock from 'greenlock-koa';
import ServerConfig from './serverConfig';
import Router from './router';
import redirectHttps from './redirectHttps';
import authenticate from './authenticate';
import Logger from './logger';

const greenlock = Greenlock.create(ServerConfig.greenlock);

const app = new Koa();
app.use(Logger);
app.use(redirectHttps);
app.use(BodyParser({
  multipart: true,
}));
app.use(authenticate);
app.use(Router.routes());

const httpServer = ServerConfig.debug
  ? Http.createServer(app.callback())
  : Http.createServer(greenlock.middleware(app.callback()));

const httpsServer = ServerConfig.debug
  ? Https.createServer({
      key: Fs.readFileSync(ServerConfig.https.keyPath),
      cert: Fs.readFileSync(ServerConfig.https.certPath),
    }, app.callback())
  : Https.createServer(greenlock.tlsOptions, greenlock.middleware(app.callback()));

httpServer.listen(ServerConfig.http.port, undefined, undefined, () => {
  const date = new Date();
  console.log(`http server running on ${ServerConfig.http.port} [${date.toLocaleString()}]`);
});

httpsServer.listen(ServerConfig.https.port, undefined, undefined, () => {
  const date = new Date();
  console.log(`https server running on ${ServerConfig.https.port} [${date.toLocaleString()}]`);
});
