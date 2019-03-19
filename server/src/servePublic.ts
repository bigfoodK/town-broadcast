import Fs from 'fs';
import Koa from 'koa';
import Path from 'path';
import Mime from 'mime';
import ServerConfig from './serverConfig';

const rootDir = ServerConfig.publicRoot;

export default async function servePublic(ctx: Koa.Context, next: () => Promise<any>) {
  const normalizedPath = Path.normalize(ctx.params.path || '/');
  const isUpperPath = normalizedPath.startsWith('../') || normalizedPath.startsWith('..\\') || normalizedPath === '..';

  if(isUpperPath) {
    ctx.status = 403;
    return;
  }

  const filePath = Path.join(rootDir, normalizedPath);
  const stat = await getFileStatAsync(filePath);

  if(!stat || stat.isDirectory()) {
    ctx.status = 404;
    return;
  }

  sendFile(ctx, filePath, stat.size, false);
}

function getFileStatAsync(path: string): Promise<Fs.Stats | false> {
  return new Promise((resolve, reject) => {
    Fs.stat(path, (error, stats) => {
      if(error) {
        if(error.code === 'ENOENT') resolve(false);
        reject(error);
      }
      resolve(stats);
    })
  });
}

function sendFile(ctx: Koa.Context, filePath: string, size: number, isDownload: boolean) {
  const contentType = isDownload
    ? 'application/octet-stream'
    : getMimeTypeFromExtname(filePath);

  ctx.set('Content-Type', contentType);
  ctx.set('Content-Length', `${size}`);
  ctx.body = Fs.createReadStream(filePath);
}

function getMimeTypeFromExtname(filePath: string) {
  return Mime.getType(filePath) || 'application/octet-stream';
}
