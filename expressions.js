// Facial atlas registration: source eye/mouth landmarks align with the approved portrait.
export const expressionNames=['neutral','smile','happy','angry','disappointed','cry'];
export const expressionLabels=['평소','미소','활짝','삐침','실망','울먹'];
export const expressionRigs={
 haru:{target:[[495,353],[650,312],[590,444]],source:[[190,290],[313,258],[264,357]]},
 nagi:{target:[[519,334],[665,303],[608,408]],source:[[198,290],[326,271],[272,365]]},
 shiori:{target:[[525,347],[676,325],[614,430]],source:[[208,269],[327,253],[276,341]]},
 rei:{target:[[525,347],[680,331],[613,429]],source:[[202,286],[337,268],[281,362]]}
};
export function faceTransform(rig){
 const [[x1,y1],[x2,y2],[x3,y3]]=rig.target,d=x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2);
 return [0,1].map(k=>{const [a,b,c]=rig.source.map(p=>p[k]);return [(a*(y2-y3)+b*(y3-y1)+c*(y1-y2))/d,(a*(x3-x2)+b*(x1-x3)+c*(x2-x1))/d,(a*(x2*y3-x3*y2)+b*(x3*y1-x1*y3)+c*(x1*y2-x2*y1))/d];});
}
export const expressionFragment=`precision mediump float;
varying vec2 v_uv; uniform sampler2D u_texture; uniform sampler2D u_faces;
uniform vec3 u_mapX; uniform vec3 u_mapY; uniform vec2 u_left; uniform vec2 u_right; uniform vec2 u_mouth;
uniform float u_expression;
float oval(vec2 p,vec2 c,vec2 r){return 1.0-smoothstep(.68,1.0,length((p-c)/r));}
// Replace the original eyebrow as well as the eyelid. Keep the feathered edge
// outside both lines; a translucent edge through either line creates a ghost.
float eyePatch(vec2 p,vec2 c,float tear){
 float brow=1.0-smoothstep(.78,1.0,length((p-c-vec2(0.0,-64.0))/vec2(76.0,43.0)));
 float eye=1.0-smoothstep(.78,1.0,length((p-c)/vec2(79.0,57.0)));
 float tears=tear*oval(p,c+vec2(0.0,30.0),vec2(57.0,57.0));
 return max(max(brow,eye),tears);
}
vec4 face(float e,vec4 base,vec2 p){
 if(e<.5)return base;
 vec2 at=vec2(dot(u_mapX,vec3(p,1.0)),dot(u_mapY,vec3(p,1.0)));
 vec2 cell=vec2(mod(e,3.0),floor(e/3.0));
 vec2 uv=(at+cell*512.0)/vec2(1536.0,1024.0);uv.y=1.0-uv.y;
 vec4 ink=texture2D(u_faces,uv);
 float tear=step(4.5,e);
 // Mouth patch ends above the jaw. The portrait owns the chin and silhouette.
 float mouth=1.0-smoothstep(.86,1.0,length((p-u_mouth)/vec2(70.0,42.0)));
 float mask=max(max(eyePatch(p,u_left,tear),eyePatch(p,u_right,tear)),mouth);
 return vec4(mix(base.rgb,ink.rgb,mask*ink.a),base.a);
}
void main(){vec4 base=texture2D(u_texture,v_uv);vec2 p=vec2(v_uv.x,1.0-v_uv.y)*vec2(1199.0,1312.0);gl_FragColor=face(u_expression,base,p);}`;
