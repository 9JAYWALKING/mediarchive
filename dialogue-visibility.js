// Only speech panels expire; questions and answer choices remain available.
export function createDialogueVisibility(panel,{duration=10000,onHide=()=>{},suspended=false}={}){
 let timer=null,held=suspended;
 const cancel=()=>{if(timer!==null)clearTimeout(timer);timer=null;};
 const arm=()=>{cancel();if(!held&&!panel.hidden)timer=setTimeout(()=>{timer=null;panel.hidden=true;onHide();},duration);};
 return {
  show(){panel.hidden=false;arm();},
  suspend(){held=true;cancel();},
  resume(){held=false;arm();},
  cancel,
  get hidden(){return panel.hidden;}
 };
}
