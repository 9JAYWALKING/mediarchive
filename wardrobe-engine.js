import {koreanDate,shiftDate} from './game-state.js';
import {mealsForDate} from './meals-engine.js';

export const outfitLabels={uniform:'교복',casual:'사복',sleep:'잠옷'};
export const wardrobeDefaults={version:1,uniformAt:'07:00',sleepAt:'23:00',dinnerAt:'19:00'};
const validTime=value=>typeof value==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const minutes=value=>Number(value.slice(0,2))*60+Number(value.slice(3));
export function wardrobeSettingsError(value){
 if(!value||!['uniformAt','sleepAt','dinnerAt'].every(key=>validTime(value[key])))return '시간을 확인해 줘.';
 const waking=(minutes(value.sleepAt)-minutes(value.uniformAt)+1440)%1440;
 if(waking<360||waking>1320)return '교복과 잠옷 사이를 6–22시간으로 정해 줘.';
 return '';
}
export function normalizeWardrobe(raw){
 const candidate={...wardrobeDefaults};
 for(const key of ['uniformAt','sleepAt','dinnerAt'])if(validTime(raw?.[key]))candidate[key]=raw[key];
 return wardrobeSettingsError(candidate)?{...wardrobeDefaults}:candidate;
}
// Calendar arithmetic stays in Korea time, including dinners ending after midnight.
export function outfitContext(now=Date.now(),settings=wardrobeDefaults,meals=null){
 const prefs=normalizeWardrobe(settings),date=koreanDate(now),at=(day,time)=>Date.parse(day+'T'+time+':00+09:00');
 const todayUniform=at(date,prefs.uniformAt),wakeDate=now<todayUniform?shiftDate(date,-1):date;
 const uniformAt=at(wakeDate,prefs.uniformAt);
 let sleepAt=at(wakeDate,prefs.sleepAt);if(sleepAt<=uniformAt)sleepAt+=86400000;
 const nextUniform=uniformAt+86400000;
 if(now>=sleepAt)return {id:'sleep',label:outfitLabels.sleep,nextAt:nextUniform,dinnerAt:null};
 const dinner=[wakeDate,shiftDate(wakeDate,1)].flatMap(day=>mealsForDate(meals,day)).filter(meal=>meal.id==='dinner'&&meal.at>=uniformAt&&meal.at<sleepAt).sort((a,b)=>a.at-b.at)[0];
 let dinnerAt=dinner?.until??at(wakeDate,prefs.dinnerAt);
 if(!dinner&&dinnerAt<uniformAt)dinnerAt+=86400000;
 const casual=dinnerAt>=uniformAt&&now>=dinnerAt;
 return {id:casual?'casual':'uniform',label:outfitLabels[casual?'casual':'uniform'],nextAt:casual? sleepAt:Math.min(dinnerAt>=uniformAt?dinnerAt:Infinity,sleepAt),dinnerAt};
}
