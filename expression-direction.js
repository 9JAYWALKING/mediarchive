import {dialogueGroups} from './dialogue.js';
import {routineLines} from './routine-dialogue.js';
import {mealLines} from './meal-dialogue.js';
import {illustratedStudents} from './character-data.js';
import {characterStories} from './character-stories.js';

const names={s:'smile',h:'happy',a:'angry',d:'disappointed',c:'cry',f:'soft',z:'sleepy',n:'calm'};
// One authored cue per line, rather than guessing emotion from punctuation.
export const lobbyCues={
 greeting:'s h h f s s h s',morning:'s z f h',night:'s z s f',return:'h s s f h',
 early:'h h a f h s n h',start:'h s s f h h s s',
 touch:'f h n a h a s h f s d s',tease:'a a a s h s a f a s',
 quiet:'s s n f s h s s f s',long:'s s s n f s',pause:'h h s s h s',
 resume:'h s h h s n',finish:'f h a s s f h f',shortFinish:'s d s s',
 sister:'s a h h f d n h',everyday:'h s s a a h h s',
 bond:'f s f d f s d f',encourage:'s n s s f s n s'
};
export const studentCues={haru:'a s h h',nagi:'s d f s s f',shiori:'n s f s d a a s s n s f',rei:'n a d a n s s f d s a f'};
export const storyCues={
 'lost-snack':'n h n n d n d a',
 'rabbit-stamp':'n n a f a s s f',
 'one-empty-slot':'n s n s n s s h d'
};
const routineCues={
 haru:{sleep:'z s',wake:'h z',morning:'s h',class:'n a',lunch:'h s',break:'h s',review:'h s',dinner:'h a',evening:'s n',home:'s s',bed:'z f',pathology:'s',lateDinner:'s',firstEvening:'h',dayOff:'h'},
 nagi:{sleep:'z n',wake:'f z',morning:'s s',class:'n s',lunch:'s f',break:'s s',review:'n s',dinner:'s f',evening:'s z',home:'n s',bed:'z f',pathology:'n',lateDinner:'n',firstEvening:'s',dayOff:'s'},
 shiori:{sleep:'a n',wake:'s n',morning:'n a',class:'n a',lunch:'a s',break:'n s',review:'n n',dinner:'n s',evening:'n s',home:'n s',bed:'z n',pathology:'n',lateDinner:'n',firstEvening:'s',dayOff:'s'},
 rei:{sleep:'n z',wake:'s n',morning:'n s',class:'n n',lunch:'s n',break:'s n',review:'n n',dinner:'s f',evening:'n s',home:'n s',bed:'n f',pathology:'n',lateDinner:'n',firstEvening:'n',dayOff:'s'}
};
const mealCues={
 haru:{before:'h s f',during:'a s',ending:'h s f',after1:'a z s',after2:'s a s'},
 nagi:{before:'s s n',during:'s f',ending:'f s s',after1:'z n s',after2:'s z s'},
 shiori:{before:'n a s',during:'n s',ending:'f n s',after1:'a n z',after2:'z n s'},
 rei:{before:'s n f',during:'s s',ending:'f s n',after1:'z n s',after2:'s n f'}
};
export const authoredExpressions=new Map();
function register(student,lines,cues){
 const list=cues.split(' ');
 if(lines.length!==list.length||list.some(c=>!names[c]))throw Error('Invalid expression cues: '+student);
 lines.forEach((text,i)=>authoredExpressions.set(student+'\n'+text,names[list[i]]));
}
for(const [group,bank] of Object.entries(dialogueGroups))register('haru',bank.lines,lobbyCues[group]);
for(const student of illustratedStudents){register(student.id,student.lines,studentCues[student.id]);authoredExpressions.set(student.id+'\n'+student.greeting,'smile');}
for(const [student,bank] of Object.entries(routineLines))for(const [phase,lines] of Object.entries(bank))register(student,lines,routineCues[student][phase]);
for(const [student,bank] of Object.entries(mealLines))for(const [phase,lines] of Object.entries(bank))register(student,lines,mealCues[student][phase]);
for(const story of characterStories)story.beats.forEach((beat,i)=>register(beat.speaker,[beat.text],storyCues[story.id].split(' ')[i]));

export function dialogueExpression(student,line){
 const value=typeof line==='string'?{text:line}:line||{};
 if(['neutral',...Object.values(names)].includes(value.expression))return value.expression;
 const authored=authoredExpressions.get(student+'\n'+value.text);
 if(authored)return authored;
 // Dynamic timetable/lecture text has no fixed line key: use its context.
 if(['sleep','bed'].includes(value.phase))return 'sleepy';
 if(value.group==='tease')return 'angry';
 if(value.group==='advice')return 'calm';
 if(['class','review'].includes(value.phase))return 'calm';
 return 'smile';
}

const idleChoices={haru:['soft','calm','soft'],nagi:['soft','sleepy','soft'],shiori:['calm','soft','calm'],rei:['calm','soft','calm']};
export function createExpressionPerformance(student,{random=Math.random}={}){
 let cue=null,pinned=null,nextIdle=12000+random()*6000,idleUntil=0,idle='smile';
 function defer(now){idleUntil=0;nextIdle=now+12000+random()*8000;}
 return {
  speak(line,now=0){const text=typeof line==='string'?line:line?.text||'';pinned=null;cue={expression:dialogueExpression(student,line),start:now,end:now+Math.min(7500,Math.max(3800,[...text].length*100))};defer(cue.end);},
  set(name,now=0,duration=0){cue=null;pinned={expression:name,end:duration?now+duration:Infinity};defer(now+duration);},
  auto(now=0){pinned=null;cue=null;defer(now);},
  frame(now,{animate=true}={}){
   if(pinned){if(now<pinned.end)return {expression:pinned.expression,talking:false,phase:'manual'};pinned=null;defer(now);}
   if(cue){if(now<cue.end)return {expression:cue.expression,talking:animate&&now-cue.start<850,phase:now-cue.start<850?'talk':'line'};cue=null;defer(now);}
   if(!animate)return {expression:'smile',talking:false,phase:'rest'};
   if(now>=nextIdle){const choices=idleChoices[student]||idleChoices.haru;idle=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];idleUntil=now+2200+random()*1500;nextIdle=idleUntil+12000+random()*8000;}
   return {expression:now<idleUntil?idle:'smile',talking:false,phase:now<idleUntil?'idle':'rest'};
  },
  get active(){return !!cue||!!(pinned&&Number.isFinite(pinned.end));}
 };
}

// Three short eyelid poses, never a vertical compression of the face mesh.
export function blinkPose(age){return age<0||age>=.19?'open':age<.035?'half':age<.12?'closed':'half';}
