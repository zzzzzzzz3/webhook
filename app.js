const Koa = require('koa');
const koarouter = require('koa-router');
const child_process = require('child_process');
const bodyparser = require('koa-bodyparser');

const app = new Koa();
const router = koarouter();

//添加异步处理函数（处理中间件），函数会顺序执行
app.use(async (ctx,next)=>{
    console.log(`Process: ${ctx.request.method} ${ctx.request.url}`);
    await next(); //调用下一个函数
})

app.use(async (ctx,next)=>{
    const start_time = new Date().getTime();
    await next();
    const ms = new Date().getTime() - start_time;
    console.log(`Time cost: ${ms}`)
})

// app.use(async (ctx,next)=>{
//     await next();
//     ctx.response.type = 'text/html';
//     ctx.response.body = '<h1>Hello,KOA</h1>';
// })

// app.use(formidable());
// 在使用router前先添加bodyparser
app.use(bodyparser());

router.get('/hello/:name',async (ctx,next)=>{
    const name = ctx.params.name;
    ctx.response.body = `<h1>Hello,${name}</h1>`;
})

router.get('/',async (ctx,next)=>{
    const name = ctx.params.name;
    ctx.response.body = `<h1>Welcome Koa</h1>`;
})

// 处理post请求
router.post('/sign',async (ctx,next)=>{
    console.log(ctx.request.body);
    const name = ctx.request.body.name || "";
    const password = ctx.request.body.password || "";

    console.log(`sign in with name: ${name} password: ${password}`);
    if (name === 'koa' && password === '12345') {
        ctx.response.body = `<h1>Welcome, ${name}!</h1>`;
    } else {
        ctx.response.body = `<h1>Login failed!</h1>
        <p><a href="/">Try again</a></p>`;
    }
})

//处理github hook
router.post('/pull',async (ctx,next)=>{
    console.log(ctx.request.body);
    child_process.execFile("/Users/Liangfei/Desktop/koa/pull.sh",[],{
        env:{
            PATH:process.env.PATH,
            HOME:process.env.HOME
        }
    },(err,stderr,stdout)=>{
        console.log(err.toString()); 
	if(err){
            ctx.body = `--------------change error-------------\n${err.toString()}\n`;
	}else{
            ctx.body = `--------------change success-------------\n${ctx.request.body.toString()}\n`;
	}
    });
})

app.use(router.routes());


app.listen(3001);
console.log('app started at port 3000');
