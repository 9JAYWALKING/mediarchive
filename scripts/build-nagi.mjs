import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {generateMoc3} from './moc3writer.js';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const W=1199,H=1312,C=100,R=112,vertices=[],uvs=[],triangles=[];
for(let y=0;y<=R;y++)for(let x=0;x<=C;x++){vertices.push({x:x/C*W,y:y/R*H});uvs.push(x/C,y/R);}
for(let y=0;y<R;y++)for(let x=0;x<C;x++){const i=y*(C+1)+x;triangles.push([i,i+1,i+C+1],[i+1,i+C+2,i+C+1]);}
const parameters=[
 {id:'ParamBreath',min:0,max:1,default:.5},
 {id:'ParamAngleX',min:-1,max:1,default:0},
 {id:'ParamEyeLOpen',min:0,max:1,default:1},
 {id:'ParamBodyAngle',min:-1,max:1,default:0},
 {id:'ParamHairSway',min:-1,max:1,default:0}
];
const keys=[[0,1],[-1,0,1],[0,1],[-1,0,1],[-1,1]],frames=[];
// First parameter varies fastest, as expected by the binary keyform writer.
for(const hair of keys[4])for(const body of keys[3])for(const eye of keys[2])for(const angle of keys[1])for(const breath of keys[0]){
 frames.push(vertices.map(v=>{
  let {x,y}=v;
  for(const [ex,ey,rx,ry] of [[519,334,46,34],[665,303,43,34]]){
   const dx=Math.abs((v.x-ex)/rx),dy=Math.abs((v.y-ey)/ry);
   const wx=Math.max(0,1-dx**4),wy=dy<.5?1:Math.max(0,(1-dy)/.5);
   y+=(ey-v.y)*(1-eye)*wx*wy*.90;
  }
  // Feathered tail/ribbon deformation, delayed independently at runtime.
  const tail=Math.exp(-Math.pow((v.x-770)/92,4)-Math.pow((v.y-596)/171,4));
  const tailLength=Math.max(0,Math.min(1,(v.y-405)/300));
  x+=hair*8*tail*tailLength;y+=hair*2.5*tail*tailLength;
  const head=Math.exp(-Math.pow(Math.max(0,v.y-330)/270,4));
  const a=angle*.047*head,px=x-600,py=y-520;
  x=600+px*Math.cos(a)-py*Math.sin(a);y=520+px*Math.sin(a)+py*Math.cos(a);
  const bodyAngle=body*.012,bx=x-600,by=y-1170;
  x=600+bx*Math.cos(bodyAngle)-by*Math.sin(bodyAngle);y=1170+bx*Math.sin(bodyAngle)+by*Math.cos(bodyAngle);
  const chest=Math.exp(-Math.pow((v.y-760)/260,2));
  x+=(v.x-600)*(breath-.5)*.008*chest;y-=(breath-.5)*6*Math.max(0,1-v.y/H);
  return {x,y};
 }));
}
let minArea=Infinity;
for(const frame of frames)for(const [a,b,c] of triangles){const p=frame[a],q=frame[b],r=frame[c];minArea=Math.min(minArea,(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x));}
if(minArea<=0)throw Error('Mesh triangle inversion: '+minArea);
const project={canvas:{width:W,height:H},nodes:[{id:'root',type:'group'},{id:'art',type:'part',parent:'root',mesh:{vertices,uvs,triangles}}],parameters};
const region={atlasIndex:0,srcWidth:W,srcHeight:H,srcX:0,srcY:0,cropW:W,cropH:H,width:W,height:W,x:0,y:0};
const data=generateMoc3({project,regions:new Map([['art',region]]),atlasSize:W,numAtlases:1,bakedRig:{keys,frames}});
fs.writeFileSync('assets/nagi.moc3',Buffer.from(data));
fs.writeFileSync('assets/nagi.model3.json',JSON.stringify({Version:3,FileReferences:{Moc:'nagi.moc3',Textures:['nagi-v1.png']},Groups:[{Target:'Parameter',Name:'EyeBlink',Ids:['ParamEyeLOpen']}]},null,2));
console.log(`Nagi: ${vertices.length} vertices, ${frames.length} frames, min triangle area ${minArea.toFixed(2)}, ${data.byteLength} bytes.`);
