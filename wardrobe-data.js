import {illustratedStudents} from './character-data.js?v=20261114momoLive4';
import {outfitLabels} from './wardrobe-engine.js';

export function outfitFor(studentId,id='uniform'){
 const student=illustratedStudents.find(student=>student.id===studentId);
 if(!student)return null;
 const outfit=Object.hasOwn(outfitLabels,id)?id:'uniform';
 if(student.outfits)return {id:outfit,label:outfitLabels[outfit],...student.outfits[outfit]};
 return {id:outfit,label:outfitLabels[outfit],portrait:outfit==='uniform'?student.portrait:`./assets/wardrobe/${studentId}-${outfit}-v1.png`};
}
