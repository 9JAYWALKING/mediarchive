import {defaultExamDate} from './schedule-data.js';
export const tracks=['Wiki','J','JBL'];
export const haruLessons=[1,2,6];
export function koreanDate(now=Date.now()){return new Date(now+9*3600000).toISOString().slice(0,10);}
export function validDate(value){if(typeof value!=='string'||!/^20\d{2}-\d{2}-\d{2}$/.test(value))return false;const ms=Date.parse(value+'T00:00:00Z');return Number.isFinite(ms)&&new Date(ms).toISOString().slice(0,10)===value;}
export function examCountdown(date,now=Date.now()){
 const target=validDate(date)?date:defaultExamDate;
 const days=Math.round((Date.parse(target+'T00:00:00Z')-Date.parse(koreanDate(now)+'T00:00:00Z'))/86400000);
 return {days,label:days>0?'D−'+days:days===0?'D-DAY':'D+'+Math.abs(days)};
}
export function normalizeChoice(raw){return {lecture:haruLessons.includes(Number(raw?.lecture))?Number(raw.lecture):1,track:tracks.includes(raw?.track)?raw.track:'Wiki'};}
export function normalizePreferences(raw){return {examDate:validDate(raw?.examDate)?raw.examDate:defaultExamDate,choice:normalizeChoice(raw?.choice)};}
export function shiftDate(date,amount){return new Date(Date.parse(date+'T00:00:00Z')+amount*86400000).toISOString().slice(0,10);}
