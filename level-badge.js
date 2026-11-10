export function displayLevel(value){const n=Number(value);return Number.isFinite(n)?Math.max(1,Math.floor(n)):1;}
export function paintLevelBadge(target,value){
 const level=displayLevel(value),text=String(level);
 if(!target.querySelector('.levelDigits')){const label=document.createElement('small'),number=document.createElement('strong');label.className='levelLabel';label.textContent='LV';number.className='levelDigits';target.replaceChildren(label,number);}
 target.classList.add('levelMark');const digits=target.querySelector('.levelDigits');if(digits.textContent!==text)digits.textContent=text;target.dataset.digits=text.length;target.setAttribute('aria-label',`레벨 ${text}`);
 return level;
}
