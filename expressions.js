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
export const expressionRigs={
 ritsu:{size:[1108,1420],protect:[738,355,35,52],target:[[473,365],[628,342],[562,453]],source:[[208,302],[337,287],[280,385]],outfits:{casual:{target:[[489,365],[642,342],[577,453]],protect:[755,354,36,52]},sleep:{target:[[475,365],[630,342],[565,453]],protect:[738,355,35,52]}}},
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
uniform vec3 u_mapX; uniform vec3 u_mapY; uniform vec2 u_left; uniform vec2 u_right; uniform vec2 u_mouth;
uniform vec4 u_fringe; uniform vec4 u_protect;
uniform float u_preserveHair;
uniform vec3 u_eyeLeftX,u_eyeLeftY,u_eyeRightX,u_eyeRightY;
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
vec4 paint(float e,vec4 base,vec2 p,float mask,bool eyeFeature){
 if(e<0.0)return base;
 vec2 at=vec2(dot(u_mapX,vec3(p,1.0)),dot(u_mapY,vec3(p,1.0)));
 bool feature=u_preserveHair>.5&&eyeFeature;
 vec2 eye=distance(p,u_left)<distance(p,u_right)?u_left:u_right;
 if(feature){vec3 local=vec3(p-eye,1.0);at=distance(p,u_left)<distance(p,u_right)?vec2(dot(u_eyeLeftX,local),dot(u_eyeLeftY,local)):vec2(dot(u_eyeRightX,local),dot(u_eyeRightY,local));}
 vec2 cell=vec2(mod(e,3.0),floor(e/3.0));
 vec2 uv=(at+cell*512.0)/vec2(1536.0,1024.0);uv.y=1.0-uv.y;
 vec4 ink=texture2D(u_faces,uv);
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
 if(u_protect.z>0.0)faceMask*=smoothstep(.75,1.0,length((p-u_protect.xy)/u_protect.zw));
 
 vec4 face=paint(u_browPose,base,p,faceMask,u_preserveHair>.5);
 float lids=max(1.0-smoothstep(.8,1.0,length((p-u_left)/vec2(78.0,39.0))),1.0-smoothstep(.8,1.0,length((p-u_right)/vec2(78.0,39.0))));
 float eyes=u_blink>=0.0?u_blink:u_eyePose;
 if(u_preserveHair>.5){
  if(u_blink<0.0&&(u_eyePose==1.0||u_eyePose==0.0))eyes=-1.0;
  lids=max(1.0-smoothstep(.9,1.0,length((p-u_left)/vec2(90.0,46.0))),1.0-smoothstep(.9,1.0,length((p-u_right)/vec2(90.0,46.0))));

  if(u_browPose>4.5)lids=max(lids,max(oval(p,u_left+vec2(0.0,29.0),vec2(63.0,53.0)),oval(p,u_right+vec2(0.0,29.0),vec2(63.0,53.0))));
 }
 face=paint(eyes,face,p,lids,true);
 // A single mouth replaces the old one; jaw pixels always belong to the portrait.
 float mouth=1.0-smoothstep(.86,1.0,length((p-u_mouth)/vec2(70.0,42.0)));
 gl_FragColor=paint(u_mouthPose,face,p,mouth,false);
}`;
