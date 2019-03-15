import Router from 'koa-router';
import servePublic from './servePublic';
import receiveVoice from './receiveVoice';

const router = new Router();

router.get('/', (ctx, next) => {
  ctx.redirect('/index.html');
});

router.get('/voice', receiveVoice);

router.get('/:path*', servePublic);

export = router;
