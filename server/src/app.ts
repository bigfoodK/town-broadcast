import Fs from 'fs';
import Koa from 'koa';
import Http from 'http';
import Https from 'https';
import WebSocket from 'ws';
import Speaker from 'speaker';
import Router from './router';
import AmpPower from './ampPower';
import redirectHttps from './redirectHttps';

const httpServer = Http.createServer();

const httpsServer = Https.createServer({
  key: Fs.readFileSync('./key/key.pem'),
  cert: Fs.readFileSync('./key/cert.pem'),
});

const webSocketServer = new WebSocket.Server({ server: httpsServer });
webSocketServer.on('connection', ws => {
  AmpPower.turnOn();

  const speaker = new Speaker({
    bitDepth: 16,
    channels: 1,
    sampleRate: 48000,
  });
  
  ws.onmessage = message => {
    speaker.write(message.data);
  };

  ws.onclose = () => {
    if(webSocketServer.clients.size) return;
    AmpPower.turnOff();
  };

  console.log('connected');
});

const app = new Koa();
app.use(redirectHttps);
app.use(Router.routes());

httpServer.on('request', app.callback());
httpServer.listen(3000);
httpsServer.on('request', app.callback());
httpsServer.listen(3001);
