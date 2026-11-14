import {illustrationRegistration} from './illustration-registration.js?v=20261114framing';

export function illustrationLayout(student,outfit,frame,rect,framing='lobby'){
 const registration=illustrationRegistration[student]?.[outfit];
 if(!registration)return null;
 const anchor=registration.frames[frame]||registration.frames[0];
 const height=framing==='face'?rect.height*1.9:framing==='review'?rect.height*1.25:framing==='portrait'?Math.min(rect.height*.99,rect.width*registration.height/registration.width):Math.min(rect.width*.52,rect.height*.62)/.32;
 const width=height*registration.width/registration.height;
 const crown=rect.height*.0125;
 return {width,height,x:rect.width/2-anchor.x*width,y:crown-anchor.top*height,crown,center:rect.width/2};
}

// Use exactly the canvas framing while the atlas is loading.
export function positionIllustrationFallback(img,student,outfit,host,framing='lobby'){
 const layout=illustrationLayout(student,outfit,0,host.getBoundingClientRect(),framing);
 for(const prop of ['width','height','left','top','transform','maxHeight'])img.style[prop]='';
 if(!layout)return;
 Object.assign(img.style,{width:`${layout.width}px`,height:`${layout.height}px`,left:`${layout.x}px`,top:`${layout.y}px`,transform:'none',maxHeight:'none'});
}

export function portraitHeadX(student,outfit='uniform'){
 return illustrationRegistration[student]?.[outfit]?.frames[0]?.x??.5;
}
