import Koa from 'koa';
import WebSocket from 'ws';
import Crypto from 'crypto';
import Speaker from 'speaker';
import AmpPower from './ampPower';

const speaker = new Speaker({
  bitDepth: 16,
  channels: 1,
  sampleRate: 48000,
});

const clients: Set<WebSocket> = new Set();

const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

export default async function receiveVoice(ctx: Koa.Context, next: () => Promise<any>) {
  const method = ctx.method;
  const upgrade = (typeof ctx.headers['upgrade'] === 'string')
    ? ctx.headers['upgrade'].toLowerCase()
    : null
  const key = (typeof ctx.headers['sec-websocket-key'] === 'string')
    ? ctx.headers['sec-websocket-key'].trim()
    : null
  const version = Number(ctx.headers['sec-websocket-version']);
  
  if(!shouldUpgrade(method, upgrade, key, version)) return ctx.throw(400);
  doUpgrade(ctx, key);
}

function shouldUpgrade(method: string, upgrade:string, key: string, version: number) {
  if(
    method !== 'GET'
    || upgrade !== 'websocket'
    || !key
    || !keyRegex.test(key)
    || (version !== 8 && version !== 13)
  ) return false;
  return true;
}

function doUpgrade(ctx: Koa.Context, key: string) {
  const digest = Crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');
  ctx.status = 101;
  ctx.message = 'Switching Protocols';
  ctx.set('Upgrade', 'websocket');
  ctx.set('Connection', 'Upgrade');
  ctx.set('Sec-WebSocket-Accept', digest);
  
  const websocket = new WebSocket(null);
 
  if(ctx.login) {
    websocket.onclose = () => {
      clients.delete(websocket);
    }
  
    if(clients.size > 0) disconnectAll();
    handleData(websocket);
    clients.add(websocket);
  } else {
    websocket.onopen = () => {
      setTimeout(() => {
        websocket.close(4401, 'Unauthorized');
      }, 400);
    }
  }
  // TODO: Have to figure out what the second parameter is
  websocket.setSocket(ctx.socket, Buffer.alloc(0));
}

function handleData(websocket: WebSocket) {
  AmpPower.turnOn();
  
  websocket.onmessage = message => {
    speaker.write(message.data);
  };

  websocket.onclose = () => {
    if(clients.size > 0) return;
    AmpPower.turnOff();
  };
}

function disconnectAll() {
  clients.forEach(websocket => {
    websocket.close(4409, 'Other device connected');
  });
}