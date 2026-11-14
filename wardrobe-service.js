import {normalizeWardrobe,wardrobeSettingsError,outfitContext} from './wardrobe-engine.js';
import {outfitFor} from './wardrobe-data.js?v=20261114senaBlack6';

export const wardrobeKey='heart-companion-wardrobe-v1';
let settings=normalizeWardrobe(null),getMeals=()=>null,started=false,lastId=null;
const listeners=new Set();
try{settings=normalizeWardrobe(JSON.parse(localStorage.getItem(wardrobeKey)||'null'));}catch{}
export const wardrobeSettings=()=>({...settings});
export const currentOutfit=(now=Date.now())=>outfitContext(now,settings,getMeals());
export function appearanceFor(student,selection='auto'){
 return outfitFor(student,selection==='auto'?currentOutfit().id:selection);
}
export function refreshWardrobe(force=false){
 const context=currentOutfit();document.documentElement.dataset.outfit=context.id;
 if(force||context.id!==lastId){lastId=context.id;for(const listener of listeners)listener(context);}
}
export function configureWardrobe(meals){
 getMeals=meals;refreshWardrobe(true);
 if(started)return;started=true;
 setInterval(()=>{if(!document.hidden)refreshWardrobe();},15000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshWardrobe();});
 window.addEventListener('pageshow',()=>refreshWardrobe());
 window.addEventListener('storage',event=>{
  if(event.key===wardrobeKey){try{settings=normalizeWardrobe(JSON.parse(event.newValue||'null'));refreshWardrobe(true);}catch{}}
 });
}
export function subscribeWardrobe(listener){listeners.add(listener);return ()=>listeners.delete(listener);}
export function saveWardrobe(value){
 if(wardrobeSettingsError(value))return false;
 const next=normalizeWardrobe(value);
 try{localStorage.setItem(wardrobeKey,JSON.stringify(next));}catch{return false;}
 settings=next;refreshWardrobe(true);return true;
}
