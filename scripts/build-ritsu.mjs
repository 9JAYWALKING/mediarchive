import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {generateMoc3} from './moc3writer.js';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const png=fs.readFileSync('assets/ritsu-v1.png'),W=png.readUInt32BE(16),H=png.readUInt32BE(20);
if(W!==1108||H!==1420)throw Error('Recalibrate Ritsu for changed portrait dimensions.');
const C=100,R=112,vertices=[],uvs=[],triangles=[];
for(let y=0;y<=R;y++)for(let x=0;x<=C;x++){vertices.push({x:x/C*W,y:y/R*H});uvs.push(x/C,y/R);}
for(let y=0;y<R;y++)for(let x=0;x<C;x++){const i=y*(C+1)+x;triangles.push([i,i+1,i+C+1],[i+1,i+C+2,i+C+1]);}
const parameters=[{id:'ParamBreath',min:0,max:1,default:.5},{id:'ParamAngleX',min:-1,max:1,default:0},{id:'ParamEyeLOpen',min:0,max:1,default:1},{id:'ParamBodyAngle',min:-1,max:1,default:0},{id:'ParamHairSway',min:-1,max:1,default:0}];
const keys=[[0,1],[-1,0,1],[0,1],[-1,0,1],[-1,1]],frames=[];
for(const hair of keys[4])for(const body of keys[3])for(const eye of keys[2])for(const angle of keys[1])for(const breath of keys[0])frames.push(vertices.map(v=>{
 let {x,y}=v;
 // Blink is rendered by the face atlas; this compatibility parameter stays 1 at runtime.
 for(const [ex,ey] of [[473,365],[628,342]]){const dx=Math.abs((v.x-ex)/48),dy=Math.abs((v.y-ey)/35);y+=(ey-v.y)*(1-eye)*Math.max(0,1-dx**4)*(dy<.5?1:Math.max(0,(1-dy)/.5))*.9;}
 for(const [hx,hy,rx,ry,amp] of [[341,435,58,118,4],[758,449,61,110,5]]){const weight=Math.exp(-Math.pow((v.x-hx)/rx,4)-Math.pow((v.y-hy)/ry,4));x+=hair*amp*weight;y+=hair*amp*.13*weight;}
 const head=Math.exp(-Math.pow(Math.max(0,v.y-370)/290,4)),a=angle*.038*head,px=x-550,py=y-580;
 x=550+px*Math.cos(a)-py*Math.sin(a);y=580+px*Math.sin(a)+py*Math.cos(a);
 const ba=body*.009,bx=x-W/2,by=y-1250;x=W/2+bx*Math.cos(ba)-by*Math.sin(ba);y=1250+bx*Math.sin(ba)+by*Math.cos(ba);
 const chest=Math.exp(-Math.pow((v.y-850)/280,2));x+=(v.x-W/2)*(breath-.5)*.007*chest;y-=(breath-.5)*5.5*Math.max(0,1-v.y/H);
 return {x,y};
}));
let minArea=Infinity;
for(const frame of frames)for(const [a,b,c] of triangles){const p=frame[a],q=frame[b],r=frame[c];minArea=Math.min(minArea,(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x));}
if(minArea<=0)throw Error('Ritsu mesh inversion: '+minArea);
const project={canvas:{width:W,height:H},nodes:[{id:'root',type:'group'},{id:'art',type:'part',parent:'root',mesh:{vertices,uvs,triangles}}],parameters};
const region={atlasIndex:0,srcWidth:W,srcHeight:H,srcX:0,srcY:0,cropW:W,cropH:H,width:W,height:W,x:0,y:0};
const bytes=generateMoc3({project,regions:new Map([['art',region]]),atlasSize:W,numAtlases:1,bakedRig:{keys,frames}});
fs.writeFileSync('assets/ritsu.moc3',Buffer.from(bytes));
fs.writeFileSync('assets/ritsu.model3.json',JSON.stringify({Version:3,FileReferences:{Moc:'ritsu.moc3',Textures:['ritsu-v1.png']},Groups:[{Target:'Parameter',Name:'EyeBlink',Ids:['ParamEyeLOpen']}]},null,2));
console.log(`Ritsu: ${vertices.length} vertices, ${frames.length} keyforms, min area ${minArea.toFixed(2)}; ${bytes.byteLength} bytes`);
