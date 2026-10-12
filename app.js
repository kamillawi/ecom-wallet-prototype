const labels={checkout:'Handlekurv',pay:'Vipps hurtigkasse',success:'Bekreftelse',spending:'Mitt forbruk',details:'Kjøpsdetaljer',economy:'Min økonomi'};
const state={quantity:1,gift:true,card:'Bank Norwegian',paid:false,delivery:'Torggata',export:true};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const node=(id)=>$('[data-node-id="'+id+'"]');
const amount=(n)=>Math.round(n).toLocaleString('nb-NO').replaceAll('\u00a0',' ');
let current='checkout',historyStack=[],lastFocus;
for(const [key,label]of Object.entries(labels)){let b=document.createElement('button');b.textContent=label;b.dataset.screen=key;b.innerHTML='<span>'+('0'+(Object.keys(labels).indexOf(key)+1)).slice(-2)+'</span>'+label;b.onclick=()=>show(key);$('.nav').append(b);}
function show(id,push=true){if(push&&id!==current)historyStack.push(current);current=id;$$('.screen').forEach(s=>s.hidden=s.id!==id);$$('.nav button').forEach(b=>{b.classList.toggle('active',b.dataset.screen===id);b.setAttribute('aria-current',b.dataset.screen===id?'step':'false')});closeModal();sync();window.scrollTo({top:0,behavior:'instant'});document.dispatchEvent(new CustomEvent('wallet:screen',{detail:{id}}));}
function bind(el,fn,label,role='button'){if(!el)return;el.setAttribute('role',role);el.tabIndex=0;if(label)el.setAttribute('aria-label',label);el.onclick=e=>{e.stopPropagation();fn()};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}};}
function byText(root,text,fn){let p=$$('p,button',root).find(p=>p.textContent.trim()===text);bind(p,fn,text);}
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').hidden=true,3200);}
function dialog(title,body,onConfirm){lastFocus=document.activeElement;const d=$('.dialog');d.innerHTML='<h2 id="dialog-title">'+title+'</h2>'+body+'<button class="confirm">Bekreft</button><button class="cancel">Avbryt</button>';$('#modal').hidden=false;$('.confirm',d).onclick=()=>onConfirm(d);$('.cancel',d).onclick=closeModal;d.focus();}
function closeModal(){if(!$('#modal').hidden){$('#modal').hidden=true;lastFocus?.focus();}}
$('#modal').onclick=e=>{if(e.target===$('#modal'))closeModal()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#modal').hidden)closeModal();else if(historyStack.length)show(historyStack.pop(),false)}if(e.key==='Tab'&&!$('#modal').hidden){const els=$$('button,input,select,[tabindex="0"]',$('.dialog'));const first=els[0],last=els.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===$('.dialog'))){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
bind(node('7388:50355'),()=>show('pay'),'Fortsett med Vipps');
bind(node('7388:50357'),()=>dialog('Fortsett uten Vipps','<p>Velg å fortsette med vanlig kasse eller gå tilbake til Vipps hurtigkasse.</p><label>E-post</label><input type="email" placeholder="deg@eksempel.no">',()=>{closeModal();toast('Vanlig kasse er simulert i denne prototypen.')}),'Fortsett uten Vipps');
bind(node('I7388:50329;48303:30474;7388:50328'),()=>toast('Du er i handlekurven.'),'Tilbake til handlekurv');
bind(node('I7388:50338;11652:79138'),()=>{state.quantity=Math.max(1,state.quantity-1);sync()},'Fjern én vare');
bind(node('I7388:50338;11652:79136'),()=>{state.quantity++;sync()},'Legg til én vare');
bind(node('7406:71082'),()=>{state.gift=!state.gift;sync()},'Bruk gavekort','switch');
bind(node('7406:71370'),()=>dialog('Velg levering','<p>Velg pakkeboksen for dette kjøpet.</p><label for="delivery">Pakkeboks</label><select id="delivery"><option>Torggata</option><option>Bjørvika</option><option>Grünerløkka</option></select>',d=>{state.delivery=$('select',d).value;closeModal();sync();toast('Levering oppdatert.')}),'Endre levering');
byText($('#pay'),'Betal med Face ID',()=>dialog('Bekreft kjøpet','<p>'+amount(state.quantity*34990-(state.gift?3000:0))+' kr med '+state.card+'.</p><p>Face ID simuleres i prototypen.</p>',()=>{state.paid=true;show('success');toast('Kjøpet er bekreftet i prototypen.')})); 
bind(node('7408:71967'),()=>show('spending'),'Åpne mitt forbruk');
bind(node('7420:73505'),()=>show('details'),'Åpne kjøpet hos Elkjøp');
byText($('#spending'),'Se alle kjøp og kvitteringer',()=>show('details'));
byText($('#spending'),'Min økonomi',()=>show('economy'));
byText($('#spending'),'Søk',()=>dialog('Søk i kjøp','<label>Søk etter butikk</label><input id="search" placeholder="Elkjøp">',d=>{let term=$('input',d).value.toLowerCase();closeModal();if(!term||'elkjøp macbook'.includes(term))show('details');else toast('Ingen kjøp funnet for «'+term+'».')}));
bind(node('7432:75612'),()=>show('share'),'Del kvittering');
byText($('#details'),'Send som utlegg',()=>recipient('jobbportalen'));
bind(node('7432:75616'),()=>{state.export=!state.export;sync();toast(state.export?'Automatisk eksport er aktivert i prototypen.':'Automatisk eksport er deaktivert.')},'Automatisk eksport til jobbportalen','switch');
function receipt(){dialog('Kvittering fra Elkjøp','<p>9. oktober 2026 · #EK-48217</p><p>MacBook Pro 16″ · Sølv · 512 GB</p><p>Varer: '+amount(state.quantity*34990)+' kr<br>Gavekort: '+(state.gift?'3 000':'0')+' kr<br>Betalt: '+amount(state.quantity*34990-(state.gift?3000:0))+' kr</p>',()=>closeModal());$('.confirm').textContent='Ferdig';}
byText($('#details'),'Åpne kvitteringen',receipt);byText($('#share'),'Åpne kvitteringen',receipt);
function recipient(name){dialog('Del kvitteringen','<p>Velg mottaker. Deling simuleres.</p><label>Mottaker</label><input value="'+(name==='Familie eller gruppe'?'Familien Gladlaks':name==='jobbportalen'?'Jobbportalen':'')+'" placeholder="Navn eller gruppe">',d=>{let v=$('input',d).value.trim();if(!v){$('input',d).focus();return}show('details');toast('Kvitteringen er delt med '+v+' i prototypen.');});}
for(const [id,name]of [['7432:75848','Familie eller gruppe'],['7432:75867','jobbportalen'],['7432:75853','En venn'],['7432:75858','Kjøper på Finn']])bind(node(id),()=>recipient(name),name);
byText($('#details'),'Legg til familiens utgifter',()=>recipient('Familie eller gruppe'));
byText($('#details'),'Merk som kjøp i eget foretak',()=>dialog('Merk som kjøp i foretak','<p>Før kjøpet på ENK Vippsi.</p>',()=>{closeModal();toast('Kjøpet er merket for ENK Vippsi i prototypen.')}));
byText($('#details'),'Spor pakken',()=>dialog('Pakken din','<p>Posten har mottatt pakken.<br>På vei til '+state.delivery+'.<br>Anslått levering: 16. oktober.</p>',closeModal));
$$('[data-name*="Tab"]',document).filter(e=>e.textContent.trim()==='Forbruk').forEach(e=>bind(e,()=>show('spending'),'Mitt forbruk'));
for(const txt of ['Familie','Utlegg','Meg'])byText($('#economy'),txt,()=>{toast(txt==='Meg'?'Viser din økonomi.':'Viser '+txt.toLowerCase()+' i prototypen.');});
byText($('#economy'),'Se alle',()=>toast('Alle kategorier vises nedenfor.'));
byText($('#economy'),'Legg til flere kort eller kontoer',()=>dialog('Legg til kort eller konto','<label>Bank</label><select><option>Danske Bank</option><option>DNB</option><option>Bank Norwegian</option></select>',()=>{closeModal();toast('Banktilkobling simulert.')})); 
$('#reset').onclick=()=>{Object.assign(state,{quantity:1,gift:true,card:'Bank Norwegian',paid:false,delivery:'Torggata',export:true});historyStack=[];show('checkout',false);toast('Prototypen er nullstilt.')};
function setText(id,value){let el=node(id);if(el)el.textContent=value;}
function sync(){
 const total=state.quantity*34990,paid=total-(state.gift?3000:0);
 setText('I7388:50338;11652:79137',state.quantity);setText('I7388:50336;21150:71880;21150:71771',state.quantity+' '+(state.quantity===1?'vare':'varer'));setText('7388:50342',amount(total)+' kr');setText('7388:50346',amount(total)+' kr');
 setText('7406:71433',amount(total)+' kr');setText('7406:71436',state.gift?'-3 000 kr':'0 kr');setText('7406:71442',amount(paid)+' kr');
 node('7406:71082').setAttribute('aria-checked',state.gift);node('7406:71082').style.opacity=state.gift?'1':'.4';
 setText('7406:71068','Pakkeboks '+state.delivery);
 setText('7408:71665',amount(total)+' kr');setText('7408:71668',state.gift?'-3 000 kr':'0 kr');setText('7408:71674',amount(paid)+' kr');
 setText('7432:75582','Elkjøp · '+amount(paid)+' kr betalt med kort');setText('7432:75587','På vei til '+state.delivery);setText('7408:71992',state.delivery+' · Estimert 16. oktober');
 setText('7420:73511',amount(paid)+' kr');setText('7420:73779','Ubetalt '+amount(paid)+' kr');
 node('7432:75616').setAttribute('aria-checked',state.export);node('7432:75616').style.opacity=state.export?'1':'.4';
 document.dispatchEvent(new CustomEvent('wallet:sync'));
}
show('checkout',false);
bind(node('7406:71123'),()=>toast('Dette kortet har 230 kr tilgjengelig. Velg Bank Norwegian for dette kjøpet.'),'Velg Danske Bank debetkort');
bind(node('7406:71130'),()=>{state.card='Bank Norwegian';node('7406:71130').classList.add('selected-card');toast('Bank Norwegian er valgt.');},'Velg Bank Norwegian');
bind(node('7406:71137'),()=>toast('Dette kortet har ikke nok penger. Velg Bank Norwegian for dette kjøpet.'),'Velg Danske Bank kredittkort');
bind(node('7420:73481'),()=>show('economy'),'Åpne min økonomi');
byText($('#spending'),'Se hele oversikten',()=>show('economy'));
bind(node('7430:8510'),()=>show('spending'),'Tilbake til mitt forbruk');
const rounding=$$('p',$('#economy')).find(p=>p.textContent.includes('Rund opp kjøp og spar resten'));
bind(rounding,()=>dialog('Rund opp og spar','<p>Velg hvor mye du vil spare til Sommerferie ved hvert kjøp.</p><label>Beløp per kjøp</label><select><option>10 kr</option><option>25 kr</option><option>50 kr</option></select>',d=>{closeModal();toast('Sparing på '+$('select',d).value+' per kjøp er aktivert i prototypen.')}),'Aktiver sparing');
for(const p of $$('#economy p').filter(p=>p.textContent.trim().endsWith('›'))){if(p===rounding)continue;bind(p,()=>{if(p.textContent.includes('Kvitteringer'))show('details');else dialog('Detaljer','<p>'+p.textContent.replace('›','')+'</p><p>Dette er simulerte økonomidata.</p>',closeModal);},'Se detaljer');}
for(const name of ['Godt Brød','Ruter']){const el=$$('[data-name]',$('#spending')).find(e=>e.dataset.name.startsWith(name+' ·'));bind(el,()=>dialog('Kjøp hos '+name,'<p>Betalt med Danske Bank · '+(name==='Ruter'?'42':'95')+' kr.</p>',closeModal),'Åpne kjøp hos '+name);}
function fitMobile(){const ratio=Math.min(1,(window.innerWidth-16)/402);$('#device').style.zoom=ratio;}
window.addEventListener('resize',fitMobile);fitMobile();
bind($('#node-7338_310'),()=>show('spending'),'Tilbake til mitt forbruk');
const shareTitle=node('7432:75827');
const shareHeader=document.createElement('div');
shareHeader.style.cssText='display:flex;align-items:center;gap:12px;width:100%;min-height:44px';
const shareBack=document.createElement('button');
shareBack.type='button';
shareBack.setAttribute('aria-label','Tilbake til kjøpsdetaljer');
shareBack.style.cssText='display:flex;align-items:center;justify-content:center;width:44px;height:44px;flex:none;border:0;border-radius:50%;background:#8d8d8d;color:black;padding:0';
shareBack.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6 8 12 14 18" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="square" stroke-linejoin="miter"/></svg>';
shareBack.onclick=()=>{if(historyStack.at(-1)==='details')historyStack.pop();show('details',false);};
shareTitle.before(shareHeader);
shareHeader.append(shareBack,shareTitle);
$('#share').style.height='635px';
const detailsBack=shareBack.cloneNode(true);
detailsBack.setAttribute('aria-label','Tilbake til mitt forbruk');
detailsBack.onclick=()=>{if(historyStack.at(-1)==='spending')historyStack.pop();show('spending',false);};
const detailsHeading=node('7432:75574'),detailsTitleGroup=node('7432:75575');
detailsHeading.style.gap='12px';
detailsHeading.prepend(detailsBack);
detailsTitleGroup.style.width='242px';
node('7432:75576').style.fontSize='24px';
