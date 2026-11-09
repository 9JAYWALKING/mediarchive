import {expressionRigs,expressionNames,faceTransform,expressionFragment} from './expressions.js';
// Cubism Core evaluates actual .moc3 keyforms; this draws the resulting mesh.
// Each viewer owns its visibility and releases GPU/Core resources on close.
export async function createCharacter(canvas, options={}){
 const core=window.Live2DCubismCore;
 if(!core)throw Error('캐릭터를 불러오지 못했어요. 연결을 확인해 주세요.');
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
 if(!gl)throw Error('이 브라우저에서 움직임을 표시할 수 없어요.');
 let moc,model,program,texture,faceTexture,observer,raf=0,disposed=false,contextLost=false;
 const buffers=[],shaders=[],listeners=[];
 const on=(target,type,fn)=>{target.addEventListener(type,fn);listeners.push(()=>target.removeEventListener(type,fn));};
 function destroy(){
  if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer?.disconnect();
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
  const img=new Image();img.src=new URL(manifest.FileReferences.Textures[0],manifestURL).href;await img.decode();
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
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const faceRig=expressionRigs[options.personality||'haru'];
  let expression=0,previousExpression=0,expressionBlend=1,expressionStarted=0,expressionUntil=0,facesReady=false;
  const exprLocation=gl.getUniformLocation(program,'u_expression'),prevLocation=gl.getUniformLocation(program,'u_previous'),blendLocation=gl.getUniformLocation(program,'u_blend');
  gl.uniform1i(gl.getUniformLocation(program,'u_texture'),0);gl.uniform1i(gl.getUniformLocation(program,'u_faces'),1);
  faceTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,faceTexture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0);
  if(faceRig){const map=faceTransform(faceRig);gl.uniform3fv(gl.getUniformLocation(program,'u_mapX'),map[0]);gl.uniform3fv(gl.getUniformLocation(program,'u_mapY'),map[1]);for(const [i,name] of ['u_left','u_right','u_mouth'].entries())gl.uniform2fv(gl.getUniformLocation(program,name),faceRig.target[i]);}
  let faceLoad=null;
  function loadFaces(){if(!faceRig)return Promise.resolve(false);if(faceLoad)return faceLoad;faceLoad=(async()=>{try{const art=new Image();art.src=new URL(`expressions/${options.personality||'haru'}-v1.png`,manifestURL).href;await art.decode();if(disposed||contextLost)return false;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,faceTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,art);gl.activeTexture(gl.TEXTURE0);facesReady=true;canvas.dataset.expressions='ready';requestDraw();return true;}catch{canvas.dataset.expressions='unavailable';return false;}})();return faceLoad;}
  function setExpression(name,{duration=0}={}){const next=expressionNames.indexOf(name);if(next<0||disposed)return;previousExpression=expression;expression=next;expressionBlend=0;expressionStarted=performance.now();expressionUntil=duration?expressionStarted+duration:0;canvas.dataset.expression=name;loadFaces().then(requestDraw);requestDraw();}
  gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.DEPTH_TEST);
  const profiles={
   haru:{speed:.72,breath:1.45,head:.34,body:.55,hair:.68,lag:2.5,damping:4.5,look:.65,react:.9,hold:1.5,blink:3.2,open:.16},
   nagi:{speed:.57,breath:1.12,head:.34,body:.55,hair:.68,lag:2.5,damping:3.1,look:.48,react:.7,hold:2,blink:4,open:.20},
   shiori:{speed:.76,breath:1.30,head:.29,body:.36,hair:.5,lag:3.4,damping:5.1,look:.60,react:.76,hold:1.4,blink:3.5,open:.15},
   rei:{speed:.49,breath:1.08,head:.24,body:.29,hair:.62,lag:1.8,damping:3.5,look:.43,react:.58,hold:1.9,blink:4.3,open:.19}
  };
  const profile=profiles[options.personality]||profiles.haru,speed=profile.speed;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let motion=!reduced.matches,last=0,phase=0,target=0,angle=0,hair=0,blinkStart=-10,nextBlink=profile.blink-.4,forcedBlink=false,reactUntil=0;
  const ids=model.parameters.ids;const set=(id,v)=>{const i=ids.indexOf(id);if(i>=0)model.parameters.values[i]=v;};
  const phone=document.querySelector('.phone');
  const offstage=()=>document.hidden||(options.isVisible?!options.isVisible():phone?.dataset.view!=='home');
  function fail(){contextLost=true;cancelAnimationFrame(raf);raf=0;canvas.dataset.live2d='unavailable';if(options.onError)options.onError();else{document.querySelector('#fallback').hidden=false;document.querySelector('#loadStatus').textContent='화면을 다시 불러오려면 새로고침해 주세요.';}}
  function draw(now){
   raf=0;if(disposed||contextLost||offstage())return;
   if(now-last<1000/30){raf=requestAnimationFrame(draw);return;}
   const dt=Math.min((now-last)/1000,.08);last=now;if(motion)phase+=dt;
   let eye=1;
   if(motion){
    if(phase>nextBlink||forcedBlink){blinkStart=phase;nextBlink=phase+profile.blink+Math.random()*3.5;forcedBlink=false;}
    const b=phase-blinkStart,open=profile.open;
    if(b<.07)eye=1-Math.sin(Math.PI*.5*b/.07);else if(b<.10)eye=0;else if(b<.10+open)eye=1-Math.cos(Math.PI*.5*(b-.10)/open);
    if(reactUntil&&phase>reactUntil){target=0;reactUntil=0;}
    angle+=(target-angle)*(1-Math.exp(-dt*profile.damping));
    const hairTarget=profile.hair*Math.sin(phase*speed-.9)+angle*.35;hair+=(hairTarget-hair)*(1-Math.exp(-dt*profile.lag));
   }else{angle=0;hair=0;}
   const emotionAge=(now-expressionStarted)/1000,emotionTilt=expression===3?Math.sin(emotionAge*16)*.09*Math.exp(-emotionAge*2):expression===4?-.15:expression===5?-.1+.015*Math.sin(phase*12):expression===2?.06*Math.sin(phase*3):0;
   set('ParamBreath',motion?.5+.44*Math.sin(phase*profile.breath):.5);
   set('ParamAngleX',motion?Math.max(-1,Math.min(1,angle+emotionTilt+profile.head*Math.sin(phase*speed)+.08*Math.sin(phase*1.17))):0);
   set('ParamBodyAngle',motion?profile.body*Math.sin(phase*speed-.65):0);
   set('ParamHairSway',motion?Math.max(-1,Math.min(1,hair)):0);set('ParamEyeLOpen',expression===2?1:eye);model.update();
   if(expressionUntil&&now>=expressionUntil)setExpression('neutral');
   expressionBlend=reduced.matches?1:Math.min(1,(now-expressionStarted)/260);
   gl.uniform1f(exprLocation,facesReady?expression:0);gl.uniform1f(prevLocation,facesReady?previousExpression:0);gl.uniform1f(blendLocation,expressionBlend);
   const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
   if(rect.width<=0||rect.height<=0)return;
   const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
   const imageH=options.framing==='face'?rect.height*2.5:options.framing==='portrait'?Math.min(rect.height*.99,rect.width*(img.height/img.width)*1.25):Math.max(rect.height*.99,rect.width*1.34);
   gl.uniform2f(scale,imageH/rect.width*2,imageH/rect.height*2);gl.uniform1f(offset,1-imageH/rect.height+(options.framing==='face'?0:-.025));
   gl.bindBuffer(gl.ARRAY_BUFFER,posBuffer);gl.bufferData(gl.ARRAY_BUFFER,model.drawables.vertexPositions[0],gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);gl.drawElements(gl.TRIANGLES,model.drawables.indexCounts[0],gl.UNSIGNED_SHORT,0);model.drawables.resetDynamicFlags();
   canvas.dataset.live2d='ready';if(motion||expressionBlend<1||expressionUntil)raf=requestAnimationFrame(draw);
  }
  function requestDraw(){if(!raf&&!disposed&&!contextLost&&!offstage())raf=requestAnimationFrame(draw);}
  function visibility(){if(offstage()){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();requestDraw();}}
  observer=new MutationObserver(visibility);observer.observe(options.visibilityRoot||phone,{attributes:true,attributeFilter:options.visibilityRoot?['open','hidden']:['data-view']});
  on(document,'visibilitychange',visibility);on(window,'resize',requestDraw);
  on(reduced,'change',e=>{if(e.matches){motion=false;requestDraw();options.onMotionChange?.(motion);}});
  on(canvas,'webglcontextlost',e=>{e.preventDefault();fail();});
  if(options.signal)on(options.signal,'abort',destroy);
  requestDraw();
  return {setExpression,prepareExpressions:loadFaces,get expression(){return expressionNames[expression];},get motion(){return motion;},setMotion(value){motion=!!value;requestDraw();},look(value){target=Math.max(-1,Math.min(1,value))*profile.look;reactUntil=0;requestDraw();},react(){forcedBlink=true;target=(Math.random()-.5)*profile.react;reactUntil=phase+profile.hold;requestDraw();},destroy,model};
 }catch(error){destroy();throw error;}
}
