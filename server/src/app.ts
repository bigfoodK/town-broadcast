import Koa from 'koa';
import Http from 'http';
import WebSocket from 'ws';
import Speaker from 'speaker';
import Router from './router';

const speaker = new Speaker({
  bitDepth: 16,
  channels: 1,
  sampleRate: 48000,
});

const app = new Koa();
app.use(Router.routes());

const server = Http.createServer();

const webSocketServer = new WebSocket.Server({ server });
webSocketServer.on('connection', ws => {
  ws.on('message', message => {
    speaker.write(message);
  })
  console.log('connected');
});

server.on('request', app.callback());
server.listen(3000);
