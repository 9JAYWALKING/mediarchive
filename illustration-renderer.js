import {appearanceFor,subscribeWardrobe} from './wardrobe-service.js?v=20261114senaBlack6';
import {createExpressionPerformance} from './expression-direction.js?v=20261114senaBlack6';

// Complete expression illustrations: no overlapping eyes, eyebrows or jaw patches.
export async function createIllustration(canvas,options={}){
 const context=canvas.getContext('2d');if(!context)throw Error('Canvas unavailable');
 const student=options.personality,acting=createExpressionPerformance(student),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let disposed=false,raf=0,last=0,time=0,selection=options.outfit||'auto',appearance=null,art=null,request=0,motion=!reduced.matches,expression='smile',reaction=0,look=0;
 let frame=0,previous=0,changedAt=0;
 const cleanups=[];
 const on=(target,name,fn)=>{target.addEventListener(name,fn);cleanups.push(()=>target.removeEventListener(name,fn));};
 const visible=()=>!document.hidden&&(options.isVisible?options.isVisible():document.querySelector('.phone')?.dataset.view==='home');
 function requestDraw(){if(!raf&&!disposed&&visible())raf=requestAnimationFrame(draw);}
 function draw(now){
  raf=0;if(disposed||!visible()||!art)return;
  const dt=last?Math.min(80,now-last):0;last=now;time+=dt;
  const pose=acting.frame(time,{animate:motion});expression=pose.expression;
  const next=expression==='cry'?3:['angry','disappointed'].includes(expression)?2:['happy','smile'].includes(expression)&&pose.phase!=='rest'?1:0;
  if(next!==frame){previous=frame;frame=next;changedAt=time;}
  const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;
  const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  context.setTransform(dpr,0,0,dpr,0,0);context.clearRect(0,0,rect.width,rect.height);
  const cellW=art.naturalWidth/2,cellH=art.naturalHeight/2;
  const height=options.framing==='face'?rect.height*1.9:options.framing==='review'?rect.height*1.25:options.framing==='portrait'?Math.min(rect.height*.99,rect.width*cellH/cellW):Math.max(rect.height*.99,rect.width*1.34);
  const width=height*cellW/cellH,t=time/1000,active=motion&&!reduced.matches;
  const bob=active?Math.sin(t*1.7)*1.8:0,tilt=active?Math.sin(t*.7)*.006+look*.003+Math.sin(t*7)*Math.max(0,reaction-time)/1200*.008:0;
  context.save();context.translate(rect.width/2,height*.7+bob);context.rotate(tilt);
  const drawCell=(index,alpha)=>{context.globalAlpha=alpha;context.drawImage(art,(index%2)*cellW,Math.floor(index/2)*cellH,cellW,cellH,-width/2,-height*.7,width,height);};
  // A short fade replaces whole sprites; never layer facial features.
  const progress=reduced.matches?1:Math.min(1,(time-changedAt)/130);
  if(progress<1&&previous!==frame)drawCell(previous,1-progress);drawCell(frame,progress);context.restore();
  canvas.dataset.live2d='ready';canvas.dataset.renderer='illustration';canvas.dataset.expression=expression;canvas.dataset.performance=pose.phase;canvas.dataset.talking=String(pose.talking);
  if(active||acting.active||progress<1)raf=requestAnimationFrame(draw);
 }
 async function setOutfit(value='auto'){
  if(disposed||!['auto','uniform','casual','sleep'].includes(value))return false;
  const next=appearanceFor(student,value);if(!next?.atlas)return false;
  selection=value;const token=++request;canvas.dataset.outfitLoading='true';
  try{const img=new Image();img.src=next.atlas;await img.decode();if(disposed||token!==request)return false;art=img;appearance=next;canvas.dataset.outfit=next.id;canvas.dataset.outfitLoading='false';options.onAppearanceChange?.(next);requestDraw();return true;}
  catch{if(!disposed&&token===request){canvas.dataset.outfitLoading='false';options.onAppearanceError?.();}return false;}
 }
 function destroy(){if(disposed)return;disposed=true;request++;cancelAnimationFrame(raf);for(const clean of cleanups)clean();art=null;canvas.width=1;canvas.height=1;}
 function visibility(){if(!visible()){cancelAnimationFrame(raf);raf=0;}else{last=0;requestDraw();}}
 on(document,'visibilitychange',visibility);on(window,'resize',requestDraw);
 on(reduced,'change',()=>{if(reduced.matches)motion=false;options.onMotionChange?.(motion);requestDraw();});
 const root=options.visibilityRoot||document.querySelector('.phone');if(root){const observer=new MutationObserver(visibility);observer.observe(root,{attributes:true,attributeFilter:['open','hidden','data-view']});cleanups.push(()=>observer.disconnect());}
 cleanups.push(subscribeWardrobe(()=>{if(selection==='auto')setOutfit('auto');}));
 if(options.signal){on(options.signal,'abort',destroy);if(options.signal.aborted){destroy();throw new DOMException('Cancelled','AbortError');}}
 if(!await setOutfit(selection)){destroy();throw Error('Illustration could not load');}
 return {speak(line,pageText){acting.speak(pageText?{...(typeof line==='string'?{text:line}:line),text:pageText}:line,time);requestDraw();},autoExpression(){acting.auto(time);requestDraw();},setExpression(value,duration=0){acting.set(value,time,duration);requestDraw();},prepareExpressions:()=>Promise.resolve(),setOutfit,get outfit(){return appearance?.id;},get expression(){return expression;},get motion(){return motion;},setMotion(value){motion=!!value&&!reduced.matches;requestDraw();},look(value){look=Math.max(-1,Math.min(1,value));requestDraw();},react(){reaction=time+1000;requestDraw();},destroy,model:null};
}
