import Router from 'koa-router';
import servePublic from './servePublic';

const router = new Router();

router.get('/', (ctx, next) => {
  ctx.redirect('/index.html');
});

router.get('/:path*', servePublic);

export = router;
