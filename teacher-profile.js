const KEY='mediarchive-teacher-v1';
export function normalizeTeacher(raw){return {name:typeof raw?.name==='string'?raw.name.trim().slice(0,16):'',lobby:typeof raw?.lobby==='string'?raw.lobby:'haru',lastStudy:typeof raw?.lastStudy==='string'?raw.lastStudy:'',updatedAt:Number(raw?.updatedAt)||0};}
let profile=normalizeTeacher(null);try{profile=normalizeTeacher(JSON.parse(localStorage.getItem(KEY)||'null'));}catch{}
export const teacherProfile=()=>({...profile});
export const teacherName=()=>profile.name;
export const teacherAddress=()=>profile.name?`${profile.name} 선생님`:'선생님';
export function personalize(text){return String(text||'').replaceAll('{teacher} 선생님',teacherAddress()).replaceAll('{teacher}',profile.name||'선생님');}
export function saveTeacher(patch){const next=normalizeTeacher({...profile,...patch,updatedAt:Date.now()});try{localStorage.setItem(KEY,JSON.stringify(next));profile=next;return true;}catch{return false;}}
export function teacherLevel(levels){return 1+levels.reduce((n,level)=>n+Math.max(0,(Number(level)||1)-1),0);}
export function preventAppZoom(){
 for(const type of ['gesturestart','gesturechange','gestureend','dblclick'])document.addEventListener(type,e=>e.preventDefault(),{passive:false});
 document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault();},{passive:false});
 document.addEventListener('wheel',e=>{if(e.ctrlKey)e.preventDefault();},{passive:false});
}
