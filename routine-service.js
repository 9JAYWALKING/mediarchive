import {classTime} from './class-time.js';
import {routineContext,routineDue} from './routine-engine.js';
import {routinePool} from './routine-dialogue.js';
const KEY='heart-companion-v1-routine';
let history={seen:[],recent:{}},getFlags=()=>({});
try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(raw&&typeof raw==='object')history={lastAt:Number(raw.lastAt)||0,seen:Array.isArray(raw.seen)?raw.seen.filter(x=>typeof x==='string').slice(-80):[],recent:raw.recent&&typeof raw.recent==='object'?raw.recent:{}};}catch{}
export function configureRoutine(flags){getFlags=flags;}
export function configuredRoutineContext(now=Date.now()){return routineContext(now,classTime.lessons(now),getFlags().meals);}
export function routineLine(student,{now=Date.now(),force=false,blocked=false}={}){
 const flags=getFlags(),ctx=routineContext(now,classTime.lessons(now),flags.meals);
 if(!force&&!routineDue(ctx,history,now,{...flags,blocked:blocked||flags.blocked}))return null;
 const pool=routinePool(student,ctx,flags.growth),key=`${student}:${pool.key}`,old=history.recent[key];
 const choices=pool.lines.map((text,i)=>({text,i})).filter(x=>pool.lines.length===1||x.i!==old);
 const selected=choices[Math.floor(Math.random()*choices.length)];
 history.recent[key]=selected.i;history.lastAt=now;history.seen=[...history.seen.filter(x=>x!==ctx.key),ctx.key].slice(-80);
 try{localStorage.setItem(KEY,JSON.stringify(history));}catch{}
 return {text:selected.text,group:'routine',phase:ctx.phase};
}
