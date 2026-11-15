(() => {
 const screen=document.getElementById('launchScreen'),status=document.getElementById('launchStatus'),actions=document.getElementById('launchActions'),enter=document.getElementById('launchEnter');
 let ready=false,closed=false,slow=false;
 function finish(){
  if(closed)return;closed=true;clearTimeout(slowTimer);clearTimeout(stallTimer);
  delete document.documentElement.dataset.boot;document.querySelector('main.phone')?.removeAttribute('inert');
  screen.classList.add('is-leaving');setTimeout(()=>screen.remove(),500);
 }
 function stalled(){if(closed)return;slow=true;status.textContent=ready?'학생을 불러오고 있어':'연결을 확인해 줘';status.style.letterSpacing='0';actions.hidden=false;enter.hidden=!ready;}
 const slowTimer=setTimeout(()=>{if(ready)stalled();else slow=true;},12000);
 const stallTimer=setTimeout(stalled,25000);
 enter.onclick=()=>{document.getElementById('stage')?.classList.remove('is-changing');finish();};document.getElementById('launchRetry').onclick=()=>location.reload();
 window.mediarchiveBoot={uiReady(){ready=true;if(slow)stalled();},finish,fail:stalled};
 // Module download/syntax failures happen before app.js can report its own state.
 window.addEventListener('error',event=>{if(event.target?.id==='appModule')stalled();},true);
})();
