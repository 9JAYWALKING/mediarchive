import {bondStories} from './bond-story-data.js?v=20261110ritsu';

export const bondStudents=['haru','nagi','shiori','rei','ritsu'];
const stamp=n=>Number.isFinite(n)&&n>0?Math.floor(n):0;
export const bondStory=id=>bondStories.find(s=>s.id===id);
export const bondLevel=score=>1+Math.floor(Math.max(0,Number(score)||0)/100);
export function storyTimeline(story,entry){
 const result=[];
 for(const [index,beat] of story.beats.entries()){
  result.push({...beat,key:`beat:${index}`,choiceIndex:index});
  const selected=entry?.choices?.[index];
  if(beat.choices&&Number.isInteger(selected)&&beat.choices[selected]){
   const choice=beat.choices[selected];
   result.push({speaker:'teacher',text:choice.text,key:`answer:${index}`});
   choice.reply.forEach((line,i)=>result.push({...line,key:`reply:${index}:${i}`}));
  }
 }
 return result;
}
export function normalizeBondStories(raw){
 const peaks=Object.fromEntries(bondStudents.map(id=>[id,Math.max(1,Math.min(10000,Math.floor(Number(raw?.peaks?.[id])||1)))]));
 const map=new Map();
 for(const value of Array.isArray(raw?.events)?raw.events:[]){
  const story=bondStory(value?.id);if(!story||!stamp(value.unlockedAt))continue;
  const choices={};for(const [i,b] of story.beats.entries())if(b.choices&&[0,1].includes(value.choices?.[i]))choices[i]=value.choices[i];
  const dmChoice=[0,1].includes(value.dmChoice)?value.dmChoice:null;
  const e={id:story.id,unlockedAt:stamp(value.unlockedAt),readAt:stamp(value.readAt),dmChoice,replyAt:dmChoice===null?0:stamp(value.replyAt),startedAt:dmChoice===null?0:stamp(value.startedAt),cursor:Math.max(0,Math.floor(Number(value.cursor)||0)),choices,completedAt:0,followupReadAt:0,updatedAt:stamp(value.updatedAt)||stamp(value.unlockedAt)};
  const timeline=storyTimeline(story,e),firstUnanswered=timeline.findIndex(n=>n.choices&&!Object.hasOwn(choices,n.choiceIndex));
  e.cursor=Math.min(e.cursor,timeline.length-1,firstUnanswered<0?Infinity:firstUnanswered);
  if(!e.startedAt)e.cursor=0;
  if(stamp(value.completedAt)&&e.startedAt&&firstUnanswered<0&&e.cursor===timeline.length-1){e.completedAt=stamp(value.completedAt);e.followupReadAt=stamp(value.followupReadAt);}
  const old=map.get(e.id);if(!old||e.completedAt&&!old.completedAt||!!e.completedAt===!!old.completedAt&&e.updatedAt>old.updatedAt)map.set(e.id,e);
 }
 return {version:1,peaks,events:[...map.values()].sort((a,b)=>a.unlockedAt-b.unlockedAt||a.id.localeCompare(b.id))};
}
export function mergeBondStories(a,b){
 const left=normalizeBondStories(a),right=normalizeBondStories(b),map=new Map(left.events.map(e=>[e.id,e]));
 for(const incoming of right.events){const old=map.get(incoming.id);if(!old){map.set(incoming.id,incoming);continue;}
  const winner=old.completedAt&&!incoming.completedAt?old:incoming.completedAt&&!old.completedAt?incoming:old.updatedAt>=incoming.updatedAt?old:incoming;
  map.set(incoming.id,{...winner,unlockedAt:Math.min(old.unlockedAt,incoming.unlockedAt),readAt:Math.max(old.readAt,incoming.readAt),followupReadAt:Math.max(old.followupReadAt,incoming.followupReadAt)});
 }
 return normalizeBondStories({peaks:Object.fromEntries(bondStudents.map(id=>[id,Math.max(left.peaks[id],right.peaks[id])])),events:[...map.values()]});
}
export function unlockBondStories(raw,levels,now=Date.now()){
 const state=normalizeBondStories(raw);
 for(const id of bondStudents){state.peaks[id]=Math.max(state.peaks[id],Math.min(10000,Math.floor(Number(levels[id])||1)));
  const stories=bondStories.filter(s=>s.student===id).sort((a,b)=>a.level-b.level);
  for(const story of stories){const existing=state.events.find(e=>e.id===story.id);if(existing){if(!existing.completedAt)break;continue;}
   if(state.peaks[id]>=story.level)state.events.push({id:story.id,unlockedAt:now,updatedAt:now});break;
  }
 }
 return normalizeBondStories(state);
}
export function storyUnread(entry){return (!entry.readAt?1:0)+(entry.completedAt&&!entry.followupReadAt?1:0);}
export function changeBondStory(raw,id,action,payload,now=Date.now()){
 const state=normalizeBondStories(raw),e=state.events.find(x=>x.id===id),story=bondStory(id);if(!e||!story)return null;
 if(action==='read'){e.readAt=e.readAt||now;if(e.completedAt)e.followupReadAt=e.followupReadAt||now;}
 else if(action==='reply'){if(e.dmChoice!==null||![0,1].includes(payload))return null;e.dmChoice=payload;e.replyAt=now;e.readAt=e.readAt||now;}
 else if(action==='start'){if(e.dmChoice===null||e.completedAt)return null;e.startedAt=e.startedAt||now;}
 else {
  if(!e.startedAt||e.completedAt)return null;
  const timeline=storyTimeline(story,e),beat=timeline[e.cursor];
  if(action==='choose'){if(!beat?.choices||Object.hasOwn(e.choices,beat.choiceIndex)||![0,1].includes(payload))return null;e.choices[beat.choiceIndex]=payload;e.cursor++;}
  else if(action==='next'){if(beat?.choices&&!Object.hasOwn(e.choices,beat.choiceIndex)||e.cursor>=timeline.length-1)return null;e.cursor++;}
  else if(action==='complete'){if(e.cursor!==timeline.length-1||timeline.some(b=>b.choices&&!Object.hasOwn(e.choices,b.choiceIndex)))return null;e.completedAt=now;}
  else return null;
 }
 e.updatedAt=now;return normalizeBondStories(state);
}
