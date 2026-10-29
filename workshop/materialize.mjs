import { readdir,lstat,mkdir,copyFile,writeFile,readFile } from 'node:fs/promises';
import { constants } from 'node:fs';import path from 'node:path';import { fileURLToPath,pathToFileURL } from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url));
async function walk(directory,prefix=''){const out=[];for(const entry of await readdir(directory,{withFileTypes:true})){const rel=path.posix.join(prefix,entry.name),full=path.join(directory,entry.name);if(entry.isSymbolicLink())throw new Error('Source links are not permitted.');if(entry.isDirectory())out.push(...await walk(full,rel));else if(entry.isFile())out.push([rel,full]);}return out;}
async function noLinks(target){for(let current=target;;current=path.dirname(current)){try{if((await lstat(current)).isSymbolicLink())throw new Error(`Destination crosses a symbolic link: ${current}`);}catch(error){if(error.code!=='ENOENT')throw error;}if(path.dirname(current)===current)break;}}
export async function materialize({lesson,into}){
  if(!Number.isInteger(lesson)||lesson<1||lesson>8)throw new Error('Choose a lesson from1 through8.');
  if(!into)throw new Error('An explicit --into destination is required.');const destination=path.resolve(into);await noLinks(destination);
  for(const protectedDirectory of ['template','steps']){const relative=path.relative(path.join(root,protectedDirectory),destination);if(relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative)))throw new Error('Do not materialize inside course source.');}
  try{const existing=await lstat(destination);if(!existing.isDirectory()||(await readdir(destination)).length)throw new Error('Destination must be absent or an empty directory. Nothing was overwritten.');}catch(error){if(error.code!=='ENOENT')throw error;}
  const files=new Map(await walk(path.join(root,'template')));for(let n=1;n<=lesson;n++){for(const [name,source]of await walk(path.join(root,'steps',String(n).padStart(2,'0'))))files.set(name,source);if(n===2)files.delete('src/client/app.js');}
  const manifest=JSON.parse(await readFile(path.join(root,'manifest.json'),'utf8'));const description=manifest.find(item=>item.lesson===lesson);
  await mkdir(destination,{recursive:true});for(const [name,source]of files){const target=path.join(destination,...name.split('/'));await mkdir(path.dirname(target),{recursive:true});await noLinks(target);await copyFile(source,target,constants.COPYFILE_EXCL);}
  await writeFile(path.join(destination,'lesson.json'),JSON.stringify({lesson,title:description.title,referenceRevision:'753ba4ffe15394f96f2dbbb6811d0fe20fee1522'},null,2)+'\n',{flag:'wx'});
  return{lesson,destination,files:files.size+1};
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){const args=process.argv.slice(2);if(args.includes('--help'))console.log('node workshop/materialize.mjs --lesson 1..8 --into ABSENT_OR_EMPTY_FOLDER\nGenerates files only. No install, build, server or settings change.');else{if(args.length!==4||args[0]!=='--lesson'||args[2]!=='--into')throw new Error('Use --lesson N --into PATH; see --help.');console.log(JSON.stringify(await materialize({lesson:Number(args[1]),into:args[3]})));}}
