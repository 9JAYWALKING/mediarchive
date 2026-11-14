import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {generateMoc3} from './moc3writer.js';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const png=fs.readFileSync('assets/momo-live-v1.png'),W=png.readUInt32BE(16),H=png.readUInt32BE(20);
if(W!==1024||H!==1536)throw Error('Recalibrate Momo for changed portrait dimensions.');
const C=100,R=120,vertices=[],uvs=[],triangles=[];
for(let y=0;y<=R;y++)for(let x=0;x<=C;x++){vertices.push({x:x/C*W,y:y/R*H});uvs.push(x/C,y/R);}
for(let y=0;y<R;y++)for(let x=0;x<C;x++){const i=y*(C+1)+x;triangles.push([i,i+1,i+C+1],[i+1,i+C+2,i+C+1]);}
const parameters=[{id:'ParamBreath',min:0,max:1,default:.5},{id:'ParamAngleX',min:-1,max:1,default:0},{id:'ParamEyeLOpen',min:0,max:1,default:1},{id:'ParamBodyAngle',min:-1,max:1,default:0},{id:'ParamHairSway',min:-1,max:1,default:0}];
const keys=[[0,1],[-1,0,1],[1],[-1,0,1],[-1,1]],frames=[];
for(const hair of keys[4])for(const body of keys[3])for(const eye of keys[2])for(const angle of keys[1])for(const breath of keys[0])frames.push(vertices.map(v=>{
 let{x,y}=v;
 // A continuous mesh keeps the neck/jaw and hairstyle connected at every keyform.
 // The head stays rigid; only the tails, body and neck transition bend.
 const head=Math.exp(-Math.pow(Math.max(0,v.y-550)/300,4));
 const a=angle*.036*head,px=x-520,py=y-650;
 x=520+px*Math.cos(a)-py*Math.sin(a);y=650+px*Math.sin(a)+py*Math.cos(a);
 for(const [hx,hy,rx,ry,amp] of [[150,900,120,460,13],[865,910,125,470,-11]]){
  const weight=Math.exp(-Math.pow((v.x-hx)/rx,4)-Math.pow((v.y-hy)/ry,4));
  x+=hair*amp*weight;y+=hair*amp*.16*weight;
 }
 const ba=body*.009,bx=x-W/2,by=y-1420;
 x=W/2+bx*Math.cos(ba)-by*Math.sin(ba);y=1420+bx*Math.sin(ba)+by*Math.cos(ba);
 const chest=Math.exp(-Math.pow((v.y-1000)/330,2));
 x+=(v.x-W/2)*(breath-.5)*.006*chest;y-=(breath-.5)*5*Math.max(0,1-v.y/H);
 return{x,y};
}));
let minArea=Infinity;
for(const frame of frames)for(const[a,b,c]of triangles){const p=frame[a],q=frame[b],r=frame[c];minArea=Math.min(minArea,(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x));}
if(minArea<=0)throw Error('Momo mesh inversion: '+minArea);
const project={canvas:{width:W,height:H},nodes:[{id:'root',type:'group'},{id:'art',type:'part',parent:'root',mesh:{vertices,uvs,triangles}}],parameters};
const region={atlasIndex:0,srcWidth:W,srcHeight:H,srcX:0,srcY:0,cropW:W,cropH:H,width:W,height:W,x:0,y:0};
const bytes=generateMoc3({project,regions:new Map([['art',region]]),atlasSize:W,numAtlases:1,bakedRig:{keys,frames}});
fs.writeFileSync('assets/momo.moc3',Buffer.from(bytes));
fs.writeFileSync('assets/momo.model3.json',JSON.stringify({Version:3,FileReferences:{Moc:'momo.moc3',Textures:['momo-live-v1.png']},Groups:[{Target:'Parameter',Name:'EyeBlink',Ids:['ParamEyeLOpen']}]},null,2));
console.log(`Momo: ${vertices.length} vertices, ${frames.length} keyforms, minimum triangle area ${minArea.toFixed(2)}, ${bytes.byteLength} bytes`);
