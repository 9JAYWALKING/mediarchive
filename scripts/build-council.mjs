import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {generateMoc3} from './moc3writer.js';
process.chdir(fileURLToPath(new URL('..',import.meta.url)));
const rigs=[
 {id:'shiori',eyes:[[525,347,46,32],[676,325,44,32]],pivot:[610,550],headBase:350,headFalloff:280,headAngle:.041,bodyAngle:.010,chestY:790,hair:[{x:805,y:420,rx:67,ry:112,amp:5},{x:397,y:482,rx:80,ry:100,amp:3}]},
 {id:'rei',eyes:[[525,347,47,35],[680,331,45,35]],pivot:[610,550],headBase:350,headFalloff:280,headAngle:.034,bodyAngle:.008,chestY:780,hair:[{x:316,y:890,rx:94,ry:328,amp:8},{x:880,y:890,rx:87,ry:325,amp:8},{x:466,y:700,rx:29,ry:155,amp:2}]}
];
for(const rig of rigs){
 const png=fs.readFileSync('assets/'+rig.id+'-v1.png'),W=png.readUInt32BE(16),H=png.readUInt32BE(20);
 // Reference coordinates were inspected against the 1199 x 1312 illustrations.
 if(W!==1199||H!==1312)throw Error('Recalibrate the inspected eye/hair regions before changing image dimensions.');
 const C=100,R=112,vertices=[],uvs=[],triangles=[];
 for(let y=0;y<=R;y++)for(let x=0;x<=C;x++){vertices.push({x:x/C*W,y:y/R*H});uvs.push(x/C,y/R);}
 for(let y=0;y<R;y++)for(let x=0;x<C;x++){const i=y*(C+1)+x;triangles.push([i,i+1,i+C+1],[i+1,i+C+2,i+C+1]);}
 const parameters=[{id:'ParamBreath',min:0,max:1,default:.5},{id:'ParamAngleX',min:-1,max:1,default:0},{id:'ParamEyeLOpen',min:0,max:1,default:1},{id:'ParamBodyAngle',min:-1,max:1,default:0},{id:'ParamHairSway',min:-1,max:1,default:0}];
 const keys=[[0,1],[-1,0,1],[0,1],[-1,0,1],[-1,1]],frames=[];
 for(const hair of keys[4])for(const body of keys[3])for(const eye of keys[2])for(const angle of keys[1])for(const breath of keys[0]){
  frames.push(vertices.map(v=>{
   let {x,y}=v;
   for(const [ex,ey,rx,ry] of rig.eyes){const dx=Math.abs((v.x-ex)/rx),dy=Math.abs((v.y-ey)/ry),wx=Math.max(0,1-dx**4),wy=dy<.5?1:Math.max(0,(1-dy)/.5);y+=(ey-v.y)*(1-eye)*wx*wy*.9;}
   for(const h of rig.hair){const weight=Math.exp(-Math.pow((v.x-h.x)/h.rx,4)-Math.pow((v.y-h.y)/h.ry,4));x+=hair*h.amp*weight;y+=hair*h.amp*.13*weight;}
   const head=Math.exp(-Math.pow(Math.max(0,v.y-rig.headBase)/rig.headFalloff,4)),a=angle*rig.headAngle*head,[cx,cy]=rig.pivot,px=x-cx,py=y-cy;
   x=cx+px*Math.cos(a)-py*Math.sin(a);y=cy+px*Math.sin(a)+py*Math.cos(a);
   const ba=body*rig.bodyAngle,bx=x-600,by=y-1170;x=600+bx*Math.cos(ba)-by*Math.sin(ba);y=1170+bx*Math.sin(ba)+by*Math.cos(ba);
   const chest=Math.exp(-Math.pow((v.y-rig.chestY)/260,2));x+=(v.x-600)*(breath-.5)*.007*chest;y-=(breath-.5)*5.5*Math.max(0,1-v.y/H);
   return {x,y};
  }));
 }
 let minArea=Infinity;
 for(const frame of frames)for(const [a,b,c] of triangles){const p=frame[a],q=frame[b],r=frame[c];minArea=Math.min(minArea,(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x));}
 if(minArea<=0)throw Error(rig.id+' mesh inversion: '+minArea);
 const project={canvas:{width:W,height:H},nodes:[{id:'root',type:'group'},{id:'art',type:'part',parent:'root',mesh:{vertices,uvs,triangles}}],parameters};
 const region={atlasIndex:0,srcWidth:W,srcHeight:H,srcX:0,srcY:0,cropW:W,cropH:H,width:W,height:W,x:0,y:0};
 const bytes=generateMoc3({project,regions:new Map([['art',region]]),atlasSize:W,numAtlases:1,bakedRig:{keys,frames}});
 fs.writeFileSync('assets/'+rig.id+'.moc3',Buffer.from(bytes));
 fs.writeFileSync('assets/'+rig.id+'.model3.json',JSON.stringify({Version:3,FileReferences:{Moc:rig.id+'.moc3',Textures:[rig.id+'-v1.png']},Groups:[{Target:'Parameter',Name:'EyeBlink',Ids:['ParamEyeLOpen']}]},null,2));
 console.log(`${rig.id}: ${vertices.length} vertices, ${frames.length} keyforms, min triangle area ${minArea.toFixed(2)}, ${bytes.byteLength} bytes`);
}
