import Fs from 'fs';
import Koa from 'koa';
import Path from 'path';
import Mime from 'mime';

const rootDir = '../client/build'

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

async function getFileStatAsync(path: string) {
  try {
    const stats = await Fs.promises.stat(path);
    return stats;
  } catch (e) {
    if(e.code === 'ENOENT') return false;
    throw e;
  }
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
