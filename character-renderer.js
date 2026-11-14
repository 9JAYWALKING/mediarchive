import {expressionRigs,expressionNames,facialParts,faceTransform,expressionFragment} from './expressions.js?v=20261114momoLive4';
import {createExpressionPerformance,dialogueExpression,blinkPose} from './expression-direction.js?v=20261114momoLive4';
import {appearanceFor,subscribeWardrobe} from './wardrobe-service.js?v=20261114momoLive4';
// Cubism Core evaluates actual .moc3 keyforms; this draws the resulting mesh.
// Each viewer owns its visibility and releases GPU/Core resources on close.
export async function createCharacter(canvas, options={}){
 const core=window.Live2DCubismCore;
 if(!core)throw Error('캐릭터를 불러오지 못했어요. 연결을 확인해 주세요.');
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
 if(!gl)throw Error('이 브라우저에서 움직임을 표시할 수 없어요.');
 let moc,model,program,texture,faceTexture,observer,raf=0,disposed=false,contextLost=false,appearanceRequest=0;
 const buffers=[],shaders=[],listeners=[];
 const on=(target,type,fn)=>{target.addEventListener(type,fn);listeners.push(()=>target.removeEventListener(type,fn));};
 function destroy(){
  if(disposed)return;disposed=true;appearanceRequest++;cancelAnimationFrame(raf);observer?.disconnect();
  for(const remove of listeners)remove();
  model?.release();moc?._release();
  if(!contextLost){for(const b of buffers)gl.deleteBuffer(b);for(const s of shaders)gl.deleteShader(s);if(texture)gl.deleteTexture(texture);if(faceTexture)gl.deleteTexture(faceTexture);if(program)gl.deleteProgram(program);if(options.releaseContext)gl.getExtension('WEBGL_lose_context')?.loseContext();}
  canvas.dataset.live2d='disposed';
 }
 try{
  const manifestURL=new URL(options.manifest||'./assets/haru.model3.json',document.baseURI);
  const response=await fetch(manifestURL,{signal:options.signal});if(!response.ok)throw Error('캐릭터를 불러오지 못했어요.');
  const manifest=await response.json();
  const modelResponse=await fetch(new URL(manifest.FileReferences.Moc,manifestURL),{signal:options.signal});if(!modelResponse.ok)throw Error('캐릭터를 불러오지 못했어요.');
  moc=core.Moc.fromArrayBuffer(await modelResponse.arrayBuffer());if(!moc)throw Error('캐릭터를 열지 못했어요.');
  model=core.Model.fromMoc(moc);if(!model)throw Error('움직임을 시작하지 못했어요.');
  const uniformURL=new URL(manifest.FileReferences.Textures[0],manifestURL).href,studentId=options.personality||'haru';
  let appearanceSelection=['uniform','casual','sleep'].includes(options.outfit)?options.outfit:'auto';
  let appearance=appearanceFor(studentId,appearanceSelection),textureURL=appearance?new URL(appearance.portrait,document.baseURI).href:uniformURL;
  let img=new Image();img.src=textureURL;
  try{await img.decode();}catch(error){if(textureURL===uniformURL)throw error;img=new Image();img.src=uniformURL;await img.decode();textureURL=uniformURL;appearance=appearanceFor(studentId,'uniform');canvas.dataset.outfitError='true';}
  if(options.signal?.aborted)throw new DOMException('Cancelled','AbortError');
  function shader(type,src){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('화면을 열지 못했어요.');return s;}
  program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 a_pos;attribute vec2 a_uv;uniform vec2 u_scale;uniform float u_y;varying vec2 v_uv;void main(){v_uv=a_uv;gl_Position=vec4(a_pos*u_scale+vec2(0.0,u_y),0.0,1.0);}'));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,expressionFragment));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('화면을 열지 못했어요.');gl.useProgram(program);
  const pos=gl.getAttribLocation(program,'a_pos'),uv=gl.getAttribLocation(program,'a_uv'),scale=gl.getUniformLocation(program,'u_scale'),offset=gl.getUniformLocation(program,'u_y');
  const makeBuffer=()=>{const b=gl.createBuffer();buffers.push(b);return b;},posBuffer=makeBuffer(),uvBuffer=makeBuffer(),indices=makeBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,uvBuffer);gl.bufferData(gl.ARRAY_BUFFER,model.drawables.vertexUvs[0],gl.STATIC_DRAW);gl.enableVertexAttribArray(uv);gl.vertexAttribPointer(uv,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,model.drawables.indices[0],gl.STATIC_DRAW);
  function makeTexture(art){const value=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,value);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,art);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return value;}
  texture=makeTexture(img);
  const faceRig=expressionRigs[options.personality||'haru'];
  if(faceRig?.size&&(img.naturalWidth!==faceRig.size[0]||img.naturalHeight!==faceRig.size[1]))throw Error('원화와 표정 크기가 맞지 않아요. 새로고침해 주세요.');
  let expression=1,expressionStarted=0,facesReady=false,activeTime=0;
  const acting=createExpressionPerformance(studentId);
  const faceLocations=Object.fromEntries(['browPose','eyePose','mouthPose','blink'].map(name=>[name,gl.getUniformLocation(program,'u_'+name)]));
  gl.uniform1i(gl.getUniformLocation(program,'u_texture'),0);gl.uniform1i(gl.getUniformLocation(program,'u_faces'),1);
  faceTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,faceTexture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0);
  let rig=null;
  const featureLocations=Object.fromEntries(['browLeft','browRight','eyeLeft','eyeRight','mouth'].flatMap(name=>['X','Y'].map(axis=>[name+axis,gl.getUniformLocation(program,'u_'+name+axis)])));
  const mouthScaleLocation=gl.getUniformLocation(program,'u_mouthScale');
  function featureMap(name,map){if(!map)return;const[a,b,c,d,x,y]=map;gl.uniform3f(featureLocations[name+'X'],a,b,x);gl.uniform3f(featureLocations[name+'Y'],c,d,y);}
  function alignFace(outfit){
   rig=faceRig?{...faceRig,...faceRig.outfits?.[outfit]}:null;
   gl.uniform1f(gl.getUniformLocation(program,'u_registered'),rig?.registered?1:0);
   gl.uniform2fv(gl.getUniformLocation(program,'u_artSize'),rig?.size||[1199,1312]);
   gl.uniform1f(gl.getUniformLocation(program,'u_preserveHair'),rig?.preserveHair?1:0);
   gl.uniform1f(gl.getUniformLocation(program,'u_hairGuard'),rig?.hairGuard?1:0);
   if(rig?.eyes)for(const [i,side] of ['Left','Right'].entries()){const [a,b,c,d,x,y]=rig.eyes[i];gl.uniform3fv(gl.getUniformLocation(program,'u_eye'+side+'X'),[a,b,x]);gl.uniform3fv(gl.getUniformLocation(program,'u_eye'+side+'Y'),[c,d,y]);}
   if(rig){const map=faceTransform(rig);gl.uniform3fv(gl.getUniformLocation(program,'u_mapX'),map[0]);gl.uniform3fv(gl.getUniformLocation(program,'u_mapY'),map[1]);for(const [i,name] of ['u_left','u_right','u_mouth'].entries())gl.uniform2fv(gl.getUniformLocation(program,name),rig.target[i]);const [left,right]=rig.target;gl.uniform4fv(gl.getUniformLocation(program,'u_fringe'),[left[0]-85,Math.min(left[1],right[1])-125,right[0]+85,Math.max(left[1],right[1])+20]);}
   gl.uniform4fv(gl.getUniformLocation(program,'u_protect'),rig?.protect||[0,0,0,0]);
  }
  alignFace(appearance?.id||'uniform');
  let faceLoad=null;
  function loadFaces(){if(!faceRig)return Promise.resolve(false);if(faceLoad)return faceLoad;faceLoad=(async()=>{try{const art=new Image();art.src=new URL(faceRig.atlas||`expressions/${options.personality||'haru'}-v1.png`,manifestURL).href;await art.decode();if(disposed||contextLost)return false;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,faceTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,art);gl.activeTexture(gl.TEXTURE0);facesReady=true;canvas.dataset.expressions='ready';requestDraw();return true;}catch{canvas.dataset.expressions='unavailable';return false;}})();return faceLoad;}
  function setExpression(name,{duration=0}={}){if(!expressionNames.includes(name)||disposed)return;acting.set(name,activeTime,duration);loadFaces().then(requestDraw);requestDraw();}
  function speak(line,pageText){if(disposed)return;const text=typeof line==='string'?line:line?.text||'';acting.speak({text:pageText||text,expression:dialogueExpression(studentId,line)},activeTime);loadFaces().then(requestDraw);requestDraw();}
  function autoExpression(){acting.auto(activeTime);requestDraw();}
  gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.DEPTH_TEST);
  const profiles={
   momo:{speed:.68,breath:1.28,head:.32,body:.42,hair:.70,lag:2.5,damping:4.1,look:.60,react:.85,hold:1.6,blink:3.6,open:.17},
   ritsu:{speed:.56,breath:1.12,head:.29,body:.34,hair:.56,lag:2.4,damping:3.8,look:.48,react:.65,hold:1.8,blink:4,open:.18},
   haru:{speed:.72,breath:1.45,head:.34,body:.55,hair:.68,lag:2.5,damping:4.5,look:.65,react:.9,hold:1.5,blink:3.2,open:.16},
   nagi:{speed:.57,breath:1.12,head:.34,body:.55,hair:.68,lag:2.5,damping:3.1,look:.48,react:.7,hold:2,blink:4,open:.20},
   shiori:{speed:.76,breath:1.30,head:.29,body:.36,hair:.5,lag:3.4,damping:5.1,look:.60,react:.76,hold:1.4,blink:3.5,open:.15},
   rei:{speed:.49,breath:1.08,head:.24,body:.29,hair:.62,lag:1.8,damping:3.5,look:.43,react:.58,hold:1.9,blink:4.3,open:.19}
  };
  const profile=profiles[options.personality]||profiles.haru,speed=profile.speed;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  async function setOutfit(selection='auto'){
   if(!['auto','uniform','casual','sleep'].includes(selection)||disposed||contextLost)return false;
   appearanceSelection=selection;const request=++appearanceRequest,next=appearanceFor(studentId,selection);
   if(!next)return false;const url=new URL(next.portrait,document.baseURI).href;
   if(url===textureURL){canvas.dataset.outfitLoading='false';return true;}
   canvas.dataset.outfitLoading='true';
   try{
    const art=new Image();art.src=url;await art.decode();
    if(disposed||contextLost||request!==appearanceRequest)return false;
    if(art.naturalWidth!==img.naturalWidth||art.naturalHeight!==img.naturalHeight)throw Error('복장 크기가 맞지 않아요.');
    const replacement=makeTexture(art),oldTexture=texture;texture=replacement;gl.deleteTexture(oldTexture);
    img=art;textureURL=url;appearance=next;alignFace(next.id);
    canvas.dataset.outfit=next.id;canvas.dataset.outfitLoading='false';delete canvas.dataset.outfitError;
    options.onAppearanceChange?.(next);requestDraw();return true;
   }catch{
    if(!disposed&&request===appearanceRequest){canvas.dataset.outfitLoading='false';canvas.dataset.outfitError='true';options.onAppearanceError?.();}
    return false;
   }
  }
  let motion=!reduced.matches,last=0,phase=0,target=0,angle=0,hair=0,blinkStart=-10,nextBlink=profile.blink-.4,forcedBlink=false,reactUntil=0;
  const ids=model.parameters.ids;const set=(id,v)=>{const i=ids.indexOf(id);if(i>=0)model.parameters.values[i]=v;};
  const phone=document.querySelector('.phone');
  const offstage=()=>document.hidden||(options.isVisible?!options.isVisible():phone?.dataset.view!=='home');
  function fail(){contextLost=true;cancelAnimationFrame(raf);raf=0;canvas.dataset.live2d='unavailable';if(options.onError)options.onError();else{document.querySelector('#fallback').hidden=false;document.querySelector('#loadStatus').textContent='화면을 다시 불러오려면 새로고침해 주세요.';}}
  function draw(now){
   raf=0;if(disposed||contextLost||offstage())return;
   if(now-last<1000/30){raf=requestAnimationFrame(draw);return;}
   const dt=Math.min((now-last)/1000,.08);last=now;activeTime+=dt*1000;if(motion)phase+=dt;
   let blink='open';
   const pose=acting.frame(activeTime,{animate:motion});
   const nextExpression=expressionNames.indexOf(pose.expression);
   if(nextExpression!==expression){expression=nextExpression;expressionStarted=now;}
   canvas.dataset.expression=pose.expression;canvas.dataset.performance=pose.phase;canvas.dataset.talking=String(pose.talking);
   if(motion){
    if(phase>nextBlink||forcedBlink){blinkStart=phase;nextBlink=phase+profile.blink+Math.random()*3.5;forcedBlink=false;}
    blink=blinkPose(phase-blinkStart);
    if(reactUntil&&phase>reactUntil){target=0;reactUntil=0;}
    angle+=(target-angle)*(1-Math.exp(-dt*profile.damping));
    const hairTarget=profile.hair*Math.sin(phase*speed-.9)+angle*.35;hair+=(hairTarget-hair)*(1-Math.exp(-dt*profile.lag));
   }else{angle=0;hair=0;}
   const emotionAge=(now-expressionStarted)/1000,emotionTilt=expression===3?Math.sin(emotionAge*16)*.09*Math.exp(-emotionAge*2):expression===4?-.15:expression===5?-.1+.015*Math.sin(phase*12):expression===2?.06*Math.sin(phase*3):0;
   set('ParamBreath',motion?.5+.44*Math.sin(phase*profile.breath):.5);
   set('ParamAngleX',motion?Math.max(-1,Math.min(1,angle+emotionTilt+profile.head*Math.sin(phase*speed)+.08*Math.sin(phase*1.17))):0);
   set('ParamBodyAngle',motion?profile.body*Math.sin(phase*speed-.65):0);
   set('ParamHairSway',motion?Math.max(-1,Math.min(1,hair)):0);
   // The baked eye compression stretched skin/eyelashes. Keep that mesh open.
   set('ParamEyeLOpen',1);model.update();
   const face=facialParts(studentId,pose.expression,{talking:pose.talking,blink});
   const blinkArt=face.blink;
   if(rig?.registered){const eye=blinkArt>=0?blinkArt:face.eyes;for(const[i,side]of ['Left','Right'].entries()){featureMap('brow'+side,rig.features[i][face.brow]);featureMap('eye'+side,rig.features[i][eye]);}featureMap('mouth',rig.features[2][face.mouth]);}
   gl.uniform1f(mouthScaleLocation,face.mouthScale);
   gl.uniform1f(faceLocations.browPose,facesReady?face.brow:-1);
   gl.uniform1f(faceLocations.eyePose,facesReady?face.eyes:-1);
   gl.uniform1f(faceLocations.mouthPose,facesReady?face.mouth:-1);
   gl.uniform1f(faceLocations.blink,facesReady?blinkArt:-1);
   canvas.dataset.blink=blink;
   const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,studentId==='momo'?3:2);
   if(rect.width<=0||rect.height<=0)return;
   const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
   const imageH=options.framing==='face'?rect.height*2.5:options.framing==='review'?rect.height*1.65:options.framing==='portrait'?Math.min(rect.height*.99,rect.width*(img.height/img.width)*1.25):Math.max(rect.height*.99,rect.width*1.34);
   gl.uniform2f(scale,imageH/rect.width*2,imageH/rect.height*2);gl.uniform1f(offset,1-imageH/rect.height+(['face','review'].includes(options.framing)?0:-.025));
   gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);gl.bufferData(gl.ARRAY_BUFFER,model.drawables.vertexPositions[0],gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);gl.drawElements(gl.TRIANGLES,model.drawables.indexCounts[0],gl.UNSIGNED_SHORT,0);model.drawables.resetDynamicFlags();
   canvas.dataset.live2d='ready';canvas.dataset.renderer='live2d';options.onFrame?.({canvas,expression:pose.expression,talking:pose.talking,blink});if(motion||acting.active)raf=requestAnimationFrame(draw);
  }
  function requestDraw(){if(!raf&&!disposed&&!contextLost&&!offstage())raf=requestAnimationFrame(draw);}
  function visibility(){if(offstage()){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();if(appearanceSelection==='auto'&&canvas.dataset.outfitError)setOutfit('auto');requestDraw();}}
  observer=new MutationObserver(visibility);observer.observe(options.visibilityRoot||phone,{attributes:true,attributeFilter:options.visibilityRoot?['open','hidden']:['data-view']});
  on(document,'visibilitychange',visibility);on(window,'resize',requestDraw);
  on(window,'online',()=>{if(appearanceSelection==='auto'&&canvas.dataset.outfitError)setOutfit('auto');});
  on(reduced,'change',e=>{if(e.matches){motion=false;requestDraw();options.onMotionChange?.(motion);}});
  on(canvas,'webglcontextlost',e=>{e.preventDefault();fail();});
  if(options.signal)on(options.signal,'abort',destroy);
  canvas.dataset.outfit=appearance?.id||'uniform';options.onAppearanceChange?.(appearance);
  listeners.push(subscribeWardrobe(()=>{if(appearanceSelection==='auto')setOutfit('auto');}));
  await loadFaces();if(options.signal?.aborted)throw new DOMException('Cancelled','AbortError');
  requestDraw();
  return {speak,autoExpression,setOutfit,get outfit(){return appearance?.id||'uniform';},setExpression,prepareExpressions:loadFaces,get expression(){return expressionNames[expression];},get motion(){return motion;},setMotion(value){motion=!!value;requestDraw();},look(value){target=Math.max(-1,Math.min(1,value))*profile.look;reactUntil=0;requestDraw();},react(){if(phase-blinkStart>1.5)forcedBlink=true;target=(Math.random()-.5)*profile.react;reactUntil=phase+profile.hold;requestDraw();},destroy,model};
 }catch(error){destroy();throw error;}
}
