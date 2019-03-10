import Koa from 'koa';
import Router from './router';

const app = new Koa();

app.use(Router.routes());

app.listen(3000);
