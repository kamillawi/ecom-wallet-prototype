// Subtle motion and direct manipulation, using the original design assets.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
for(const id of ['7408:71967','7375:5195']){
 const candidates=$$('[data-node-id="'+id+'"]').filter(e=>e.textContent.includes('Åpne mitt forbruk')||e.textContent.includes('Se alle kjøp og kvitteringer'));
 candidates.forEach(e=>e.classList.add('wallet-glass'));
}
['7406:71298','7406:71304','7406:71309','7434:75925'].forEach((id,i)=>{const e=node(id);e.classList.add('wallet-sparkle');e.style.animationDelay=(i*-.8)+'s';});
const vipLabel=$('p',node('7406:71060'));vipLabel.style.whiteSpace='normal';vipLabel.textContent='Alltid VIP poeng';
let transferTimer,transfer;
function cancelTransfer(){clearTimeout(transferTimer);transfer?.remove();transfer=null;node('7388:50355').removeAttribute('aria-busy');}
bind(node('7388:50355'),()=>{
 if(transfer)return;
 if(reducedMotion.matches){show('pay');return;}
 node('7388:50355').setAttribute('aria-busy','true');
 node('7388:50355').animate([{transform:'scale(1)'},{transform:'scale(.95)'},{transform:'scale(1)'}],{duration:220,easing:'ease-out'});
 transfer=document.createElement('div');transfer.className='vipps-transfer';transfer.setAttribute('role','status');
 const logo=$('img',node('I7406:71059;2905:6552;2199:3501')).cloneNode();logo.alt='Vipps';
 transfer.append(logo);const msg=document.createElement('p');msg.textContent='Vipps, så er du ferdig ✨';transfer.append(msg);
 for(let i=0;i<4;i++){const star=document.createElement('span');star.className='orbit-star';star.textContent='✦';star.setAttribute('aria-hidden','true');transfer.append(star);}
 $('#checkout').append(transfer);
 transferTimer=setTimeout(()=>{cancelTransfer();show('pay');},700);
},'Fortsett med Vipps');

// A draggable three-card carousel. Selection is shared with the checkout.
const cardWindow=node('7406:71121');
cardWindow.classList.add('wallet-card-window');cardWindow.setAttribute('role','group');cardWindow.setAttribute('aria-label','Velg betalingskort. Dra eller bruk piltastene.');
const cards=[
 {slide:node('7406:71122'),art:node('7406:71123'),name:'Danske Bank debet',available:230},
 {slide:node('7406:71129'),art:node('7406:71130'),name:'Bank Norwegian',available:73650},
 {slide:node('7406:71136'),art:node('7406:71137'),name:'Danske Bank kreditt',available:0}
];
let selectedCard=1,drag=null,suppressClick=false;
const cardStatus=document.createElement('span');cardStatus.className='motion-status';cardStatus.setAttribute('aria-live','polite');cardWindow.append(cardStatus);
const dots=document.createElement('div');dots.className='wallet-card-dots';cardWindow.append(dots);
const payButton=$('#pay button');
function renderCards(offset=0){
 cards.forEach((card,i)=>{
  const distance=i-selectedCard;
  card.slide.style.transform='translateX('+(93.5+distance*170+offset)+'px) scale('+(distance===0?1:.82)+')';
  card.slide.style.opacity=distance===0?'1':'.8';card.slide.style.zIndex=distance===0?'2':'1';
  card.slide.tabIndex=distance===0?0:-1;card.slide.setAttribute('aria-pressed',String(distance===0));
  card.art.classList.remove('selected-card');
  dots.children[i].setAttribute('aria-current',String(distance===0));
 });
 state.card=cards[selectedCard].name;
 const payable=state.quantity*34990-(state.gift?3000:0);
 payButton.disabled=cards[selectedCard].available<payable;
 payButton.textContent=payButton.disabled?'Ikke nok penger på kortet':'Betal med Face ID';
 cardStatus.textContent=state.card+' valgt. '+amount(cards[selectedCard].available)+' kr tilgjengelig.';
}
function selectCard(index){selectedCard=Math.max(0,Math.min(2,index));renderCards();}
cards.forEach((card,i)=>{
 card.slide.classList.add('wallet-card-slide');card.slide.setAttribute('role','button');card.slide.setAttribute('aria-label','Velg '+card.name);card.slide.dataset.cardIndex=i;
 card.art.onclick=null;card.art.onkeydown=null;card.art.removeAttribute('role');card.art.removeAttribute('tabindex');card.art.removeAttribute('aria-label');
 card.slide.onclick=()=>{if(!suppressClick)selectCard(i);};
 const dot=document.createElement('button');dot.type='button';dot.className='wallet-card-dot';dot.setAttribute('aria-label','Velg '+card.name);dot.onclick=()=>selectCard(i);dots.append(dot);
});
cardWindow.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();selectCard(selectedCard+(e.key==='ArrowRight'?1:-1));cards[selectedCard].slide.focus();}else if((e.key==='Enter'||e.key===' ')&&e.target.dataset.cardIndex){e.preventDefault();selectCard(Number(e.target.dataset.cardIndex));}};
cardWindow.onpointerdown=e=>{
 if(e.button!==0||e.target.closest('.wallet-card-dots'))return;
 drag={x:e.clientX,y:e.clientY,lastX:e.clientX,lastTime:performance.now(),velocity:0,moved:false,axis:null,clickedIndex:e.target.closest('[data-card-index]')?.dataset.cardIndex};
 cardWindow.setPointerCapture(e.pointerId);
};
cardWindow.onpointermove=e=>{
 if(!drag)return;
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(!drag.axis&&Math.max(Math.abs(dx),Math.abs(dy))>7)drag.axis=Math.abs(dx)>Math.abs(dy)?'x':'y';
 if(drag.axis!=='x')return;
 drag.moved=true;cardWindow.classList.add('dragging');
 const now=performance.now();drag.velocity=(e.clientX-drag.lastX)/Math.max(1,now-drag.lastTime);drag.lastX=e.clientX;drag.lastTime=now;
 const atEdge=(selectedCard===0&&dx>0)||(selectedCard===2&&dx<0);
 renderCards(atEdge?dx*.25:dx);
};
function endDrag(e,cancelled=false){
 if(!drag)return;const gesture=drag;drag=null;cardWindow.classList.remove('dragging');
 if(gesture.moved){suppressClick=true;setTimeout(()=>suppressClick=false,0);
  const dx=e.clientX-gesture.x;
  selectCard(!cancelled&&(Math.abs(dx)>45||Math.abs(gesture.velocity)>.5)?selectedCard+(dx<0?1:-1):selectedCard);
 }else{if(gesture.clickedIndex!==undefined)selectCard(Number(gesture.clickedIndex));}
 renderCards();
}
cardWindow.onpointerup=e=>endDrag(e);cardWindow.onpointercancel=e=>endDrag(e,true);
renderCards();

// A real visual switch: animate the preview without changing export settings.
const exportToggle=node('7432:75616');exportToggle.classList.add('wallet-switch');
const exportTrack=document.createElement('span');exportTrack.className='switch-track';exportTrack.setAttribute('aria-hidden','true');
const exportKnob=document.createElement('span');exportKnob.className='switch-knob';exportTrack.append(exportKnob);exportToggle.append(exportTrack);
let exportTimer;
function cancelTogglePreview(){clearTimeout(exportTimer);exportToggle.classList.remove('preview-off');}
const previousExportClick=exportToggle.onclick;exportToggle.onclick=e=>{cancelTogglePreview();previousExportClick(e);};
function previewToggle(){cancelTogglePreview();if(!state.export||reducedMotion.matches)return;exportToggle.classList.add('preview-off');exportTimer=setTimeout(()=>exportToggle.classList.remove('preview-off'),600);}

// The savings card comes alive when scrolled into view.
const savings=node('7430:8792'),gift=node('7430:8798');
gift.classList.add('wallet-gift');node('I7430:8798;19751:1014;19259:1879').classList.add('wallet-ribbon');
node('7430:8836').classList.add('wallet-savings-progress');
const savingsTitle=node('7430:8795');savingsTitle.innerHTML='Sommerferie <span class="wallet-sun" aria-hidden="true">☀️</span>';
node('7430:8838').innerHTML='På vei <span class="wallet-plane" aria-hidden="true">✈️</span>';
let savingsPlayed=false;
function animateSavings(){if(reducedMotion.matches)return;savings.classList.remove('saving-active');void savings.offsetWidth;savings.classList.add('saving-active');savingsPlayed=true;}
const savingsObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&current==='economy'&&!savingsPlayed)animateSavings();},{threshold:.35});savingsObserver.observe(savings);
function savingsBurst(){
 animateSavings();if(reducedMotion.matches)return;
 for(let i=0;i<7;i++){const star=document.createElement('span');star.className='saving-spark';star.textContent='✦';star.setAttribute('aria-hidden','true');star.style.setProperty('--dx',((i-3)*16)+'px');star.style.setProperty('--dy',(-32-Math.abs(i-3)*9)+'px');savings.append(star);setTimeout(()=>star.remove(),950);}
}
bind(rounding,()=>dialog('Rund opp og spar','<p>Velg hvor mye du vil spare til Sommerferie ved hvert kjøp.</p><label>Beløp per kjøp</label><select><option>10 kr</option><option>25 kr</option><option>50 kr</option></select>',d=>{const chosen=$('select',d).value;closeModal();savingsBurst();toast('Sparing på '+chosen+' per kjøp er aktivert i prototypen.')}),'Aktiver sparing');
document.addEventListener('wallet:screen',e=>{
 cancelTransfer();cancelTogglePreview();
 if(e.detail.id==='pay')selectCard(cards.findIndex(c=>c.name===state.card));
 if(e.detail.id==='details')previewToggle();
 if(e.detail.id==='economy'){savingsPlayed=false;savings.classList.remove('saving-active');savingsObserver.unobserve(savings);savingsObserver.observe(savings);}
});
document.addEventListener('wallet:sync',()=>{const index=cards.findIndex(c=>c.name===state.card);if(index>=0)selectedCard=index;renderCards();});
const overviewCard=node('7420:73482');
const overviewLink=node('7421:73864');
overviewCard.classList.add('wallet-overview-card');
overviewLink.classList.add('wallet-overview-link');
overviewLink.textContent='Se hele oversikten ›';
node('7420:73850').classList.add('wallet-overview-badge');
node('7420:73854').classList.add('wallet-overview-ring');
// Keep the cue and the click target on the economy card itself.
const overviewRow=node('7420:73481');
overviewRow.onclick=null;overviewRow.onkeydown=null;
overviewRow.removeAttribute('role');overviewRow.removeAttribute('tabindex');overviewRow.removeAttribute('aria-label');
bind(overviewCard,()=>show('economy'),'Åpne min økonomi');
document.addEventListener('wallet:screen',e=>{
 overviewCard.classList.remove('overview-cue');
 if(e.detail.id==='spending'&&!reducedMotion.matches){void overviewCard.offsetWidth;overviewCard.classList.add('overview-cue');}
});
