import Router from 'koa-router';
import servePublic from './servePublic';
import receiveVoice from './receiveVoice';
import login from './login';

const router = new Router();

router.get('/', (ctx, next) => {
  ctx.redirect('/index.html');
});

router.post('/login', login);

router.get('/voice', receiveVoice);

router.get('/:path*', servePublic);

export = router;
