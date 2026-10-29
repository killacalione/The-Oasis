import { createServer } from 'node:http';import { Store } from './store.js';import { attachRoutes,invitation,settings,base } from './http.js';
const {port,directory}=settings(),store=new Store(directory),invite=invitation(directory),server=createServer();attachRoutes(server,store,invite);
await new Promise<void>(resolve=>server.listen(port,'127.0.0.1',resolve));console.log(`Workshop: ${base(server)}`);
const close=()=>server.close(()=>{store.close();process.exit(0);});process.on('SIGINT',close);process.on('SIGTERM',close);process.on('message',m=>{if((m as {type?:string})?.type==='shutdown')close();});
