import {tsumugiFaceRig} from './tsumugi-face-rig.js?v=20261115tsumugiLive1';
import {tsumugiBlinkRig} from './tsumugi-blink-rig.js?v=20261115tsumugiLive1';
import {akariFaceRig} from './akari-face-rig.js?v=20261115tsumugiLive1';
import {akariBlinkRig} from './akari-blink-rig.js?v=20261115tsumugiLive1';
import {aoiFaceRig} from './aoi-face-rig.js?v=20261115aoiLive2';
import {aoiBlinkRig} from './aoi-blink-rig.js?v=20261115aoiLive2';
import {mioFaceRig} from './mio-face-rig.js?v=20261115mioLive1';
import {mioBlinkRig} from './mio-blink-rig.js?v=20261115mioLive1';
import {ritsuFaceRig} from './ritsu-face-rig.js?v=20261111ritsuExpressions';
import {momoFaceRig} from './momo-face-rig.js?v=20261114momoLive4';
import {senaFaceRig} from './sena-face-rig.js?v=20261115senaLive5';
import {ibukiFaceRig} from './ibuki-face-rig.js?v=20261115ibukiLive2';
import {ibukiBlinkRig} from './ibuki-blink-rig.js?v=20261115ibukiLive2';
// Facial atlas registration: source eye/mouth landmarks align with the approved portrait.
export const expressionNames=['neutral','smile','happy','angry','disappointed','cry','soft','sleepy','calm'];
export const expressionLabels=['평소','미소','활짝','삐침','실망','울먹','눈웃음','나른','차분'];
export function expressionPose(name){
 const i=expressionNames.indexOf(name);
 if(i===0)return {brow:-1,eyes:-1,mouth:-1};
 if(i===6)return {brow:1,eyes:2,mouth:1};
 if(i===7)return {brow:1,eyes:4,mouth:1};
 if(i===8)return {brow:0,eyes:0,mouth:0};
 return {brow:i,eyes:i,mouth:i};
}
export function facialParts(student,name,{talking=false,blink='open'}={}){
 if(student==='tsumugi'){
  const face=name==='calm'?{brow:1,eyes:1,mouth:1}:expressionPose(name);
  const mouth=talking&&['neutral','smile','soft','calm'].includes(name)?0:face.mouth;
  return {...face,mouth,blink:face.eyes===2||blink==='open'?-1:blink==='closed'?2:4,mouthScale:1};
 }
 if(student==='akari'){
  // The approved cheerful face has open almond eyes, so it also needs blinks.
  // Her quiet expressions rest on the original closed smile, not a speaking mouth.
  const face=['calm','soft'].includes(name)?{brow:1,eyes:1,mouth:1}:expressionPose(name);
  const mouth=talking&&['neutral','smile','soft','calm'].includes(name)?0:face.mouth;
  return {...face,mouth,blink:blink==='open'?-1:blink==='closed'?2:4,mouthScale:1};
 }
 const face=expressionPose(name),positive=['smile','happy','soft'].includes(name);
 const mouth=talking?(student==='haru'?-1:['momo','sena','ibuki','mio','aoi','akari'].includes(student)?(positive||['ibuki','mio','aoi','akari'].includes(student)&&name==='neutral'?0:face.mouth):student==='ritsu'&&!positive?face.mouth:2):face.mouth;
 return {...face,mouth,blink:face.eyes===2||blink==='open'?-1:blink==='closed'?2:4,mouthScale:student==='ritsu'&&talking&&positive&&name!=='happy'?.76:1};
}
export const expressionRigs={
 tsumugi:{size:[1024,1536],blinkBrowGuard:true,atlas:'expressions/tsumugi-live-v1.png',blinkAtlas:'expressions/tsumugi-blink-v1.png',blinkFeatures:tsumugiBlinkRig.uniform.features,preserveHair:true,registered:true,lidShape:[94,53,.19,-45],mouthRadius:[64,38,48],...tsumugiFaceRig.uniform,source:[[212,270],[332,246],[283,338]],outfits:{casual:{...tsumugiFaceRig.casual,blinkFeatures:tsumugiBlinkRig.casual.features},sleep:{...tsumugiFaceRig.sleep,blinkFeatures:tsumugiBlinkRig.sleep.features}}},
 akari:{size:[1024,1536],blinkBrowGuard:true,atlas:'expressions/akari-live-v6.png',blinkAtlas:'expressions/akari-blink-v3.png',blinkFeatures:akariBlinkRig.uniform.features,preserveHair:true,registered:true,lidShape:[82,35,.28,-29],mouthRadius:[64,34,46],...akariFaceRig.uniform,source:[[212,304],[343,268],[296,378]],outfits:{casual:{...akariFaceRig.casual,blinkFeatures:akariBlinkRig.casual.features},sleep:{...akariFaceRig.sleep,blinkFeatures:akariBlinkRig.sleep.features}}},
 aoi:{size:[1024,1536],atlas:'expressions/aoi-live-v1.png',blinkAtlas:'expressions/aoi-blink-v1.png',blinkFeatures:aoiBlinkRig.uniform.features,preserveHair:true,registered:true,lidShape:[82,35,.23,-29],mouthRadius:[64,34,46],...aoiFaceRig.uniform,source:[[175,307],[324,275],[269,394]],outfits:{casual:{...aoiFaceRig.casual,blinkFeatures:aoiBlinkRig.casual.features},sleep:{...aoiFaceRig.sleep,blinkFeatures:aoiBlinkRig.sleep.features}}},
 mio:{size:[1024,1536],atlas:'expressions/mio-live-v1.png',blinkAtlas:'expressions/mio-blink-v1.png',blinkFeatures:mioBlinkRig.uniform.features,preserveHair:true,registered:true,lidShape:[82,35,.23,-29],mouthRadius:[65,34,46],...mioFaceRig.uniform,source:[[212,300],[342,280],[290,379]],outfits:{casual:{...mioFaceRig.casual,blinkFeatures:mioBlinkRig.casual.features},sleep:{...mioFaceRig.sleep,blinkFeatures:mioBlinkRig.sleep.features}}},
 ibuki:{size:[1024,1536],atlas:'expressions/ibuki-live-v1.png',blinkAtlas:'expressions/ibuki-blink-v1.png',blinkFeatures:ibukiBlinkRig.uniform.features,preserveHair:true,registered:true,lidShape:[84,38,.20,-30],mouthRadius:[65,36,48],...ibukiFaceRig.uniform,source:[[192,307],[318,285],[264,375]],outfits:{casual:{...ibukiFaceRig.casual,blinkFeatures:ibukiBlinkRig.casual.features},sleep:{...ibukiFaceRig.sleep,blinkFeatures:ibukiBlinkRig.sleep.features}}},
 sena:{size:[1024,1536],atlas:'expressions/sena-live-v1.png',preserveHair:true,registered:true,brownHairGuard:true,mouthRadius:[70,38,45],...senaFaceRig.uniform,source:[[205,323],[340,291],[289,396]],outfits:{casual:senaFaceRig.casual,sleep:senaFaceRig.sleep}},
 momo:{size:[1024,1536],atlas:'expressions/momo-live-v2.png',preserveHair:true,registered:true,hairGuard:true,...momoFaceRig.uniform,source:[[214,288],[365,255],[307,370]],outfits:{casual:momoFaceRig.casual,sleep:momoFaceRig.sleep}},
 ritsu:{size:[1108,1420],preserveHair:true,registered:true,protect:[738,355,35,52],...ritsuFaceRig.uniform,source:[[208,302],[337,287],[280,385]],outfits:{casual:{...ritsuFaceRig.casual,protect:[755,354,36,52]},sleep:{...ritsuFaceRig.sleep,protect:[738,355,35,52]}}},
 haru:{target:[[495,353],[650,312],[590,444]],source:[[190,290],[313,258],[264,357]]},
 nagi:{target:[[519,334],[665,303],[608,408]],source:[[198,290],[326,271],[272,365]]},
 shiori:{preserveHair:true,eyes:[[.790032,-.01309,.024466,.790127,209.5,272.1],[.786832,-.00909,-.006334,.770527,326.5,256.5]],target:[[525,347],[676,325],[614,430]],source:[[208,269],[327,253],[276,341]]},
 // Keep the pearl clip (or its unadorned sleep counterpart) from the outfit.
 rei:{preserveHair:true,eyes:[[.830436,.005854,-.010416,.824593,208,287.5],[.840436,.009854,.001584,.904193,336.25,275.65]],protect:[759,250,57,37],target:[[525,347],[680,331],[613,429]],source:[[202,286],[337,268],[281,362]]}
};
export function faceTransform(rig){
 const [[x1,y1],[x2,y2],[x3,y3]]=rig.target,d=x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2);
 return [0,1].map(k=>{const [a,b,c]=rig.source.map(p=>p[k]);return [(a*(y2-y3)+b*(y3-y1)+c*(y1-y2))/d,(a*(x3-x2)+b*(x1-x3)+c*(x2-x1))/d,(a*(x2*y3-x3*y2)+b*(x3*y1-x1*y3)+c*(x1*y2-x2*y1))/d];});
}
export const expressionFragment=`precision mediump float;
varying vec2 v_uv; uniform sampler2D u_texture; uniform sampler2D u_faces; uniform vec2 u_artSize;
uniform sampler2D u_blinkFaces; uniform float u_hasBlinkAtlas;
uniform vec3 u_mapX; uniform vec3 u_mapY; uniform vec2 u_left; uniform vec2 u_right; uniform vec2 u_mouth;
uniform vec4 u_fringe; uniform vec4 u_protect;
uniform float u_preserveHair,u_hairGuard,u_brownHairGuard;
uniform float u_customLids,u_blinkBrowGuard;
uniform vec3 u_mouthRadius;
uniform vec4 u_lidShape;
uniform vec3 u_eyeLeftX,u_eyeLeftY,u_eyeRightX,u_eyeRightY;
uniform float u_registered,u_mouthScale;
uniform vec3 u_browLeftX,u_browLeftY,u_browRightX,u_browRightY,u_mouthX,u_mouthY;
uniform float u_browPose; uniform float u_eyePose; uniform float u_mouthPose; uniform float u_blink;
float oval(vec2 p,vec2 c,vec2 r){return 1.0-smoothstep(.68,1.0,length((p-c)/r));}
// Replace the original eyebrow as well as the eyelid. Keep the feathered edge
// outside both lines; a translucent edge through either line creates a ghost.
float eyePatch(vec2 p,vec2 c,float tear){
 float brow=1.0-smoothstep(.78,1.0,length((p-c-vec2(0.0,-64.0))/vec2(76.0,43.0)));
 float eye=1.0-smoothstep(.78,1.0,length((p-c)/vec2(79.0,57.0)));
 float tears=tear*oval(p,c+vec2(0.0,30.0),vec2(57.0,57.0));
 return max(max(brow,eye),tears);
}
vec4 paint(float e,vec4 base,vec2 p,float mask,int part){
 if(e<0.0)return base;
 vec2 at=vec2(dot(u_mapX,vec3(p,1.0)),dot(u_mapY,vec3(p,1.0)));
 bool feature=u_preserveHair>.5&&part<2;
 vec2 eye=distance(p,u_left)<distance(p,u_right)?u_left:u_right;
 if(feature){vec3 local=vec3(p-eye,1.0);at=distance(p,u_left)<distance(p,u_right)?vec2(dot(u_eyeLeftX,local),dot(u_eyeLeftY,local)):vec2(dot(u_eyeRightX,local),dot(u_eyeRightY,local));}
 if(u_registered>.5){
  if(e==1.0)return base;
  if(part==0){vec3 local=vec3(p-eye,1.0);at=distance(p,u_left)<distance(p,u_right)?vec2(dot(u_browLeftX,local),dot(u_browLeftY,local)):vec2(dot(u_browRightX,local),dot(u_browRightY,local));}
  if(part==2){vec3 local=vec3((p-u_mouth)/u_mouthScale,1.0);at=vec2(dot(u_mouthX,local),dot(u_mouthY,local));}
 }
 vec2 cell=vec2(mod(e,3.0),floor(e/3.0));
 vec2 uv=(at+cell*512.0)/vec2(1536.0,1024.0);uv.y=1.0-uv.y;
 vec4 ink=texture2D(u_faces,uv);
 if(part==1&&u_blink>=0.0&&u_hasBlinkAtlas>.5)ink=texture2D(u_blinkFaces,uv);
 return vec4(mix(base.rgb,ink.rgb,mask*ink.a),base.a);
}
void main(){
 vec4 base=texture2D(u_texture,v_uv);
 vec2 p=vec2(v_uv.x,1.0-v_uv.y)*u_artSize;
 float tear=step(4.5,u_browPose);
 // One continuous forehead region prevents split patches through the fringe.
 float fringe=smoothstep(u_fringe.x,u_fringe.x+22.0,p.x)*(1.0-smoothstep(u_fringe.z-22.0,u_fringe.z,p.x))*smoothstep(u_fringe.y,u_fringe.y+28.0,p.y)*(1.0-smoothstep(u_fringe.w-22.0,u_fringe.w,p.y));
 float faceMask=max(fringe,max(eyePatch(p,u_left,tear),eyePatch(p,u_right,tear)));
 // Register each eye/brow locally; never replace a rectangular fringe region.
 if(u_preserveHair>.5)faceMask=max(eyePatch(p,u_left,tear),eyePatch(p,u_right,tear));
 // Momo's opaque pink fringe stays attached to the original mesh, including
 // strands crossing the brow. Only exposed skin and brow ink can change.
 vec2 nearEye=distance(p,u_left)<distance(p,u_right)?u_left:u_right;
 float pinkHair=smoothstep(.0,.025,base.b-base.g)*smoothstep(.12,.23,base.r-base.g);
 float hairCover=u_hairGuard*pinkHair*(1.0-smoothstep(-18.0,-5.0,p.y-nearEye.y));
 // Protect Sena's brown fringe above the lids, excluding the dark brow ink.
 vec3 above=texture2D(u_texture,v_uv+vec2(0.0,12.0/u_artSize.y)).rgb;
 // Brown eyebrow ink has the same hue as hair. Protect only a continuous
 // hair region, not isolated ink with exposed skin immediately above it.
 float hairAbove=1.0-smoothstep(.68,.78,above.r);
 float brownHair=hairAbove*smoothstep(.28,.36,base.r)*(1.0-smoothstep(.67,.76,base.r))*(1.0-smoothstep(.12,.19,base.r-base.g));
 hairCover=max(hairCover,u_brownHairGuard*brownHair*(1.0-smoothstep(-23.0,-10.0,p.y-nearEye.y)));
 faceMask*=1.0-hairCover;
 if(u_protect.z>0.0)faceMask*=smoothstep(.75,1.0,length((p-u_protect.xy)/u_protect.zw));
 
 vec4 face=paint(u_browPose,base,p,faceMask,0);
 float lids=max(1.0-smoothstep(.8,1.0,length((p-u_left)/vec2(78.0,39.0))),1.0-smoothstep(.8,1.0,length((p-u_right)/vec2(78.0,39.0))));
 float eyes=u_blink>=0.0?u_blink:u_eyePose;
 if(u_preserveHair>.5){
  if(u_blink<0.0&&(u_eyePose==1.0||u_eyePose==0.0))eyes=-1.0;
  lids=max(1.0-smoothstep(.9,1.0,length((p-u_left)/vec2(90.0,46.0))),1.0-smoothstep(.9,1.0,length((p-u_right)/vec2(90.0,46.0))));
  if(u_brownHairGuard>.5||u_customLids>.5){
   // Follow each character's eye line; blinking must not replace the brows.
   vec4 shape=u_lidShape;
   // Ibuki's open, curious eyes rise higher than her narrowed upset eyes.
   // Clear the entire original upper lash without touching lowered sad brows.
   if(u_customLids>.5&&(u_browPose<2.5||u_browPose>4.5))shape=vec4(94.0,53.0,shape.z,-54.0);
   // Akari's lowered brows must survive the neutral blink atlas unchanged.
   if(u_blinkBrowGuard>.5&&u_blink>=0.0)shape.w=u_lidShape.w;
   vec2 l=p-u_left,r=p-u_right;l.y+=l.x*shape.z;r.y+=r.x*shape.z;
   float leftLid=(1.0-smoothstep(.9,1.0,length(l/shape.xy)))*smoothstep(shape.w,shape.w+3.0,l.y);
   float rightLid=(1.0-smoothstep(.9,1.0,length(r/shape.xy)))*smoothstep(shape.w,shape.w+3.0,r.y);
   lids=max(leftLid,rightLid);
  }

  if(u_browPose>4.5&&u_blink<0.0)lids=max(lids,max(oval(p,u_left+vec2(0.0,29.0),vec2(63.0,53.0)),oval(p,u_right+vec2(0.0,29.0),vec2(63.0,53.0))));
 }
 face=paint(eyes,face,p,lids*(1.0-hairCover),1);
 // A blink replaces eyelids, not the tear tracks beneath them.
 if(u_registered>.5&&u_browPose>4.5&&u_blink>=0.0){
  float tears=max(oval(p,u_left+vec2(0.0,45.0),vec2(48.0,42.0))*smoothstep(u_left.y+27.0,u_left.y+31.0,p.y),oval(p,u_right+vec2(0.0,45.0),vec2(48.0,42.0))*smoothstep(u_right.y+27.0,u_right.y+31.0,p.y));
  face=paint(u_browPose,face,p,tears,0);
 }
 // A single mouth replaces the old one; jaw pixels always belong to the portrait.
 // Momo's laugh extends below the resting smile; keep the feathered edge
 // outside the entire mouth while ending safely above her original chin.
 vec2 mouthRadius=vec2(u_mouthRadius.x,p.y<u_mouth.y?u_mouthRadius.y:u_mouthRadius.z);
 float mouth=1.0-smoothstep(.86,1.0,length((p-u_mouth)/mouthRadius));
 gl_FragColor=paint(u_mouthPose,face,p,mouth,2);
}`;
