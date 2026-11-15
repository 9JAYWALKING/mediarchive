// One small, preloaded atlas; no additional renderer or animation loop.
export const arrivals = Object.freeze({
 haru:    {cell:0, name:'하루', line:'가고 있어! 자리 비워 둬!', motion:'hop', duration:'1.05s'},
 nagi:    {cell:1, name:'나기', line:'응… 지금 네 쪽으로 갈게.', motion:'sway', duration:'2.4s'},
 shiori:  {cell:2, name:'시오리', line:'펜도 챙겼어. 금방 갈게.', motion:'step', duration:'1.4s'},
 rei:     {cell:3, name:'레이', line:'기다려. 내가 갈 테니까.', motion:'nod', duration:'2.2s'},
 ritsu:   {cell:4, name:'리츠', line:'셋, 둘… 발소리 들려?', motion:'rock', duration:'1.6s'},
 ibuki:   {cell:5, name:'이부키', line:'이부키 등장까지… 하나, 둘!', motion:'hop', duration:'.85s'},
 mio:     {cell:6, name:'미오', line:'따뜻한 거 가져갈게. 잠깐만.', motion:'sway', duration:'2.8s'},
 sena:    {cell:7, name:'세나', line:'찾았다. 거기 있었네.', motion:'nod', duration:'2.6s'},
 aoi:     {cell:8, name:'아오이', line:'이쪽이 빠르겠다. 금방 가!', motion:'step', duration:'1.1s'},
 akari:   {cell:9, name:'아카리', line:'불렀어? …가고 있지롱.', motion:'cat', duration:'1.8s'},
 momo:    {cell:10,name:'모모', line:'선배가 가잖아! …앗, 잠깐!', motion:'wobble', duration:'1.55s'},
 tsumugi: {cell:11,name:'츠무기', line:'소매만 걷고. 바로 갈게.', motion:'rock', duration:'1.9s'}
});

export function createStudentArrival(host) {
 host.classList.add('studentArrival');
 host.setAttribute('role','status');
 host.setAttribute('aria-live','polite');
 host.setAttribute('aria-atomic','true');
 host.hidden=true;
 const bubble=document.createElement('span');bubble.className='arrivalBubble';
 const sprite=document.createElement('span');sprite.className='arrivalSprite';sprite.setAttribute('aria-hidden','true');
 const retry=document.createElement('button');retry.type='button';retry.className='arrivalRetry';retry.textContent='다시 불러오기';retry.hidden=true;
 host.replaceChildren(bubble,sprite,retry);
 let hideTimer=null,active=0;
 const clear=()=>{clearTimeout(hideTimer);hideTimer=null;};
 function show(id,token) {
  clear();active=token;
  const entry=arrivals[id]||arrivals.haru;
  host.hidden=false;host.classList.remove('is-leaving','is-error');
  host.dataset.motion=entry.motion;
  host.style.setProperty('--arrival-duration',entry.duration);
  sprite.style.backgroundPosition=`${entry.cell%4*100/3}% ${Math.floor(entry.cell/4)*50}%`;
  bubble.textContent=entry.line;
  host.setAttribute('aria-label',`${entry.name} 오는 중`);
  retry.hidden=true;retry.onclick=null;
 }
 function ready(token) {
  if(token!==active)return;
  clear();host.classList.add('is-leaving');
  hideTimer=setTimeout(()=>{if(token===active)host.hidden=true;},180);
 }
 function failed(token,onRetry) {
  if(token!==active)return;
  clear();host.hidden=false;host.classList.remove('is-leaving');host.classList.add('is-error');
  host.removeAttribute('aria-label');bubble.textContent='';retry.hidden=false;retry.onclick=onRetry;
 }
 const pause=()=>host.classList.toggle('is-paused',document.hidden);
 document.addEventListener('visibilitychange',pause);pause();
 function cancel(token){clear();active=token;host.hidden=true;}
 return {show,ready,failed,cancel};
}
