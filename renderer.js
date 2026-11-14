import {createCharacter as createLive2D} from './character-renderer.js?v=20261114momoLive4';
import {illustrationStudents} from './illustration-students.js?v=20261114momoLive4';
import {createIllustration} from './illustration-renderer.js?v=20261114momoLive4';
export function createCharacter(canvas,options={}){return illustrationStudents.some(s=>s.id===options.personality&&s.renderer==='illustration')?createIllustration(canvas,options):createLive2D(canvas,options);}
