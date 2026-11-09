// Only speech panels expire; questions and answer choices remain available.
export function createDialogueVisibility(panel,{duration=10000,onHide=()=>{}}={}){
 let timer=null;
 const cancel=()=>{if(timer!==null)clearTimeout(timer);timer=null;};
 return {
  show(){cancel();panel.hidden=false;timer=setTimeout(()=>{timer=null;panel.hidden=true;onHide();},duration);},
  cancel,
  get hidden(){return panel.hidden;}
 };
}
