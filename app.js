'use strict';
const $=id=>document.getElementById(id), storageKey='crystal-studio-v1';
const defaults={settings:{active:false,price:100,end:'',included:'Colazione e bottiglia di Prosecco',cta:'Scrivici per le disponibilità'},drafts:[],variant:0};
let state;try{state={...defaults,...JSON.parse(localStorage.getItem(storageKey)||'{}')}}catch{state=structuredClone(defaults)}
const basePhotos=[{id:'b1',name:'Foto Crystal 1',src:'assets/foto_crystal_1.png'},{id:'b2',name:'Foto Crystal 2',src:'assets/foto_crystal_2.png'},{id:'b3',name:'Foto Crystal 3',src:'assets/foto_crystal_3.png'},{id:'b4',name:'Story originale Crystal',src:'assets/story_originale.png'}];let githubPhotos=[];let userPhotos=[];let current={};let lastBlob=null;let renderTicket=0;let lastPhotoId='';
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));return true}catch(e){toast('Memoria del dispositivo piena o non disponibile: esporta un backup');return false}}function toast(msg){$('toast').textContent=msg;$('toast').style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').style.display='none',3200)}
function tab(t){document.querySelectorAll('main>section').forEach(s=>s.classList.toggle('hidden',s.id!==t));document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));if(t==='calendar')renderDrafts();if(t==='photos')renderPhotos();window.scrollTo(0,0)}document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
const weekThemes=['relax','suite','romance','suite','weekend','offer','relax'];const weekLabels=['Lunedì · Riparti con calma','Martedì · Scopri la suite','Mercoledì · Esperienza di coppia','Giovedì · Dettagli Crystal','Venerdì · Weekend speciale','Sabato · Promozione (se attiva)','Domenica · Pianifica il relax'];
const templates={relax:[['Il tuo momento di relax','Ogni tanto serve soltanto fermarsi. ✨ Concediti un momento tutto tuo da Crystal Luxury Apartment, a Capurso. {cta}.'],['Stacca la spina. Riscopri il relax.','La settimana corre veloce. Il relax può aspettarti da Crystal Luxury Apartment. 🛁 {cta}.'],['Una pausa che vale la pena vivere','Un’atmosfera speciale, il tempo per rallentare e un soggiorno da ricordare. ✨ {cta}.']],suite:[['Scopri Crystal Luxury Apartment','Un soggiorno pensato per chi cerca privacy, comfort e un’esperienza diversa a Capurso. ✨ {cta}.'],['Il tuo rifugio a Capurso','Scopri gli ambienti di Crystal Luxury Apartment attraverso le nostre foto reali. 🖤 {cta}.'],['I dettagli fanno la differenza','Ogni dettaglio contribuisce a rendere speciale una pausa dalla routine. Scopri Crystal. {cta}.']],romance:[['Un momento solo per voi','Le occasioni più belle si vivono insieme. 🥂 Sorprendi una persona speciale con una pausa a Crystal Luxury Apartment. {cta}.'],['Sorprendi chi ami','Un’esperienza da condividere, lontano dalla frenesia quotidiana. ✨ Crystal Luxury Apartment · Capurso. {cta}.'],['Il tempo insieme è prezioso','Regalatevi il tempo di stare insieme. Scoprite Crystal Luxury Apartment. ❤️ {cta}.']],weekend:[['Il weekend merita qualcosa di speciale','Il fine settimana è l’occasione perfetta per cambiare ritmo. 🥂 Crystal Luxury Apartment · Capurso. {cta}.'],['Il tuo prossimo weekend comincia qui','Un’idea per sorprendere chi ami e ritrovare un po’ di tranquillità. ✨ {cta}.'],['Questo weekend scegli il relax','Lascia fuori la routine e concediti un’esperienza diversa. Crystal Luxury Apartment · Capurso. {cta}.']],offer:[['Una notte speciale da {price} €','✨ Promozione Crystal: {price} € a notte, {included}. Offerta valida fino al {end}. Disponibilità e condizioni da confermare. {cta}.'],['La tua pausa da {price} €','🥂 Crystal Luxury Apartment · {price} € a notte con {included}. Fino al {end}, salvo disponibilità. {cta}.']]};
const hashtags={relax:['#CrystalLuxuryApartment','#Capurso','#RelaxPuglia','#WeekendInPuglia','#BariProvincia','#MomentiDiRelax','#PugliaDaScoprire'],suite:['#CrystalLuxuryApartment','#Capurso','#SuitePuglia','#SoggiornoInPuglia','#Bari','#HospitalityPuglia','#Puglia'],romance:['#CrystalLuxuryApartment','#FugaRomantica','#Capurso','#WeekendDiCoppia','#PugliaRomantica','#BariProvincia','#IdeeRegalo'],weekend:['#CrystalLuxuryApartment','#WeekendPuglia','#Capurso','#BariProvincia','#WeekendRomantico','#RelaxDiCoppia','#Puglia'],offer:['#CrystalLuxuryApartment','#PromoSoggiorno','#Capurso','#BariProvincia','#WeekendPuglia','#RelaxPuglia']};
function offerValid(){let s=state.settings;let d=new Date(),today=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');return !!(s.active&&s.price>0&&s.end&&s.end>=today)}function themeToday(){let t=weekThemes[(new Date().getDay()+6)%7];return t==='offer'&&!offerValid()?'romance':t}
let photoBag=[];
function choosePhoto(){
  const photos=creativePhotos();if(!photos.length)return basePhotos[0];
  const ids=new Set(photos.map(p=>p.id));
  photoBag=photoBag.filter(id=>ids.has(id));
  if(!photoBag.length){
    photoBag=photos.map(p=>p.id);
    for(let i=photoBag.length-1;i>0;i--){const j=rand(i+1);[photoBag[i],photoBag[j]]=[photoBag[j],photoBag[i]]}
    if(photoBag.length>1&&photoBag[photoBag.length-1]===lastPhotoId){[photoBag[0],photoBag[photoBag.length-1]]=[photoBag[photoBag.length-1],photoBag[0]]}
  }
  const id=photoBag.pop();lastPhotoId=id;
  return photos.find(p=>p.id===id)||photos[0];
}
let previousHeadline='',previousCaption='';
function chooseHeadline(t){const pool=creative[t].hooks.filter(x=>tokens(x)!==previousHeadline);return tokens(pick(pool.length?pool:creative[t].hooks))}
function rand(n){if(n<=1)return 0;let v=new Uint32Array(1);if(globalThis.crypto&&crypto.getRandomValues){crypto.getRandomValues(v);return v[0]%n}return Math.floor(Math.random()*n)}
function pick(a){return a[rand(a.length)]}
const creative={
relax:{hooks:['Il lusso di rallentare','Fuori il rumore. Dentro il relax.','Qui il tempo cambia ritmo','Una pausa tutta tua','Il relax ha un indirizzo','Un momento da ricordare','La tua parentesi di tranquillità','Spegni la routine'],open:['Ci sono momenti in cui basta cambiare atmosfera.','Il miglior programma? Prendersi del tempo.','Le giornate corrono, ma puoi scegliere di rallentare.','A volte il vero lusso è avere tempo per sé.'],body:['Lasciati ispirare dagli ambienti di Crystal Luxury Apartment a Capurso.','Scopri un soggiorno pensato per una pausa dalla quotidianità.','Un invito a vivere un’esperienza diversa alle porte di Bari.'],end:['Quale momento sceglieresti per staccare?','Con chi condivideresti questa pausa?','Salva questa idea per il tuo prossimo soggiorno.']},
suite:{hooks:['Entra nel mondo Crystal','Scopri i dettagli','Una suite, tante emozioni','Il tuo angolo speciale','Non è una notte qualunque','La bellezza dei dettagli','Scopri la nostra atmosfera','Uno spazio da vivere'],open:['Ogni ambiente racconta una storia.','I dettagli trasformano un soggiorno in un ricordo.','Hai già visto gli interni della nostra suite?'],body:['Queste sono fotografie autentiche di Crystal Luxury Apartment, a Capurso.','Scopri gli spazi della nostra struttura attraverso immagini reali.','Privacy e atmosfera per un soggiorno da vivere con calma.'],end:['Quale dettaglio ti incuriosisce di più?','Salva il post per riscoprire Crystal.','Scorri e immagina la tua prossima pausa.']},
romance:{hooks:['Solo voi due','Il tempo insieme conta','Una sorpresa da condividere','Per chi ami','La vostra prossima fuga','Un ricordo da creare','L’amore merita una pausa','Una serata speciale'],open:['Le sorprese migliori sono quelle vissute insieme.','Quando è stata l’ultima volta che vi siete dedicati del tempo?','Non serve andare lontano per cambiare atmosfera.'],body:['Scopri Crystal Luxury Apartment a Capurso per una pausa di coppia.','Un’idea per condividere un momento diverso dal solito.','Regalatevi un soggiorno lontano dalla routine.'],end:['Tagga chi porteresti con te.','A chi faresti questa sorpresa?','Salva l’idea per un’occasione speciale.']},
weekend:{hooks:['Weekend, ci sei?','Il piano perfetto per due','Il tuo prossimo weekend','Cambia programma','Una fuga vicino Bari','Questo weekend scegli te','Un weekend da vivere','La pausa che aspettavi'],open:['Il weekend si avvicina: hai già un programma?','Il venerdì porta sempre voglia di cambiare aria.','Non tutti i weekend devono essere uguali.'],body:['Scopri Crystal Luxury Apartment a Capurso, in provincia di Bari.','Una proposta per chi desidera una pausa diversa.','Un soggiorno da organizzare con chi vuoi.'],end:['Salva questo spunto per il prossimo weekend.','Con chi partiresti?','Scrivici per conoscere le date disponibili.']},
offer:{hooks:['La tua prossima pausa','Una proposta Crystal','Un soggiorno speciale','Regalati una notte diversa','La tua occasione di relax'],open:['Una proposta da segnare in agenda.','Hai voglia di concederti una pausa?','Scopri la promozione attualmente confermata.'],body:['La promozione attiva è di {price} € a notte con {included}, fino al {end}, salvo disponibilità e condizioni.','Fino al {end}: soggiorno a {price} € a notte con {included}, secondo disponibilità.'],end:['Contattaci per verificare le date.','Chiedici disponibilità e condizioni.']}
};
// Titoli pubblicitari aggiuntivi: rotazione casuale senza ripetizioni consecutive.
const extraHooks={
 relax:['Il tuo lusso quotidiano','Un respiro di bellezza','Dimentica il resto','La pausa che ti meriti','La bellezza di fermarsi','La notte cambia ritmo','Regalati un momento','Lascia fuori il mondo','Qui comincia il relax','Il piacere di scegliere te'],
 suite:['Non chiamarla solo notte','Il dettaglio che sorprende','Un mondo tutto da scoprire','Benvenuti da Crystal','Un posto fuori dall’ordinario','Vivi qualcosa di diverso','La suite dei tuoi desideri','Scopri il tuo prossimo ricordo','Una notte da raccontare','Il fascino di Crystal'],
 romance:['Sorprendila davvero','La vostra notte speciale','Due cuori, una fuga','Perdersi insieme','Solo noi, per una notte','L’amore ha bisogno di tempo','Il regalo siete voi','Una sorpresa indimenticabile','Il vostro momento è ora','Un invito a innamorarsi'],
 weekend:['Questo weekend si cambia','Scappa dalla routine','Hai già un piano migliore?','La fuga che mancava','Una notte tutta da vivere','Il weekend comincia qui','Il tuo piano per due','Il bello arriva venerdì','Prenota un ricordo','Il weekend che desideri'],
 offer:['Il relax ti aspetta','Una notte da scegliere','Un invito speciale','La tua occasione Crystal','Il momento giusto è ora','Sorprendi chi ami','La tua fuga esclusiva']
};
for(const [key,hooks] of Object.entries(extraHooks))creative[key].hooks.push(...hooks);
const visualLayouts=['left-classic','right-classic','left-modern','right-modern','left-romance','right-signature'];
const palettes=[{gold:'#d8b77e',white:'#fff9ef',dark:'#0d0b0a'},{gold:'#e2c18f',white:'#ffffff',dark:'#15100d'},{gold:'#bfa57d',white:'#f8f0e5',dark:'#17120f'}];
function buildCaption(t,kind){let v=creative[t],op=pick(v.open),body=pick(v.body),end=pick(v.end),cta=state.settings.cta;let intros=['✨','🖤','🥂',''];let sep=pick(['\n\n','\n',' — ']);return `${pick(intros)} ${op}`.trim()+sep+tokens(body)+'\n\n🥂 Bottiglia di Prosecco inclusa e colazione inclusa.\n\n'+end+'\n'+cta+'.'}
function buildTags(t){let a=[...hashtags[t]],extra=['#CrystalLuxuryApartment','#Capurso','#PugliaDaVivere','#BariProvincia','#VisitPuglia','#SoggiornoRomantico','#EsperienzeInPuglia','#RelaxInPuglia','#PugliaTravel','#SuiteLovers'];let all=[...new Set([...a,...extra])],chosen=[];while(all.length&&chosen.length<rand(3)+6){chosen.push(all.splice(rand(all.length),1)[0])}return chosen.join(' ')}
function buildScript(headline){let openings=['Dettaglio della porta o ingresso reale','Inquadratura ravvicinata di un dettaglio autentico','Panoramica lenta della stanza','Particolare della vasca, se presente nel video'];let middles=['Movimento morbido verso la zona notte','Cambio inquadratura su un altro dettaglio reale','Breve ripresa degli ambienti con luce naturale'];return `IDEA REEL · 12–18 secondi · Solo riprese originali\n0–3 s: ${pick(openings)}.\n3–9 s: ${pick(middles)}.\n9–14 s: mostra un dettaglio diverso della suite.\n14–18 s: titolo «${headline}» e invito «${state.settings.cta}».\nUsa musica disponibile e autorizzata nel social. La copertina non è un video.`}
function allPhotos(){return [...basePhotos,...githubPhotos,...userPhotos]}
// Le foto autentiche caricate hanno priorità rispetto alle vecchie grafiche promozionali.
function creativePhotos(){return (githubPhotos.length||userPhotos.length)?[...githubPhotos,...userPhotos]:basePhotos}
const githubFolder='https://api.github.com/repos/fv2ctn8mzy-stack/crystal-studio/contents/assets?ref=main';
const photoExtensions=/\.(png|jpe?g|webp|gif|avif)$/i;
async function refreshGithubPhotos(notify=false){
  const status=$('githubPhotoStatus');
  if(status)status.textContent='Controllo nuove fotografie su GitHub…';
  try{
    const response=await fetch(githubFolder,{cache:'no-store',headers:{'Accept':'application/vnd.github+json'}});
    if(!response.ok)throw Error(response.status===403?'Limite temporaneo GitHub API':'GitHub HTTP '+response.status);
    const items=await response.json();
    if(!Array.isArray(items))throw Error('Risposta GitHub non valida');
    const known=new Set(basePhotos.map(p=>p.src.split('/').pop().toLowerCase()));
    githubPhotos=items.filter(x=>x.type==='file'&&photoExtensions.test(x.name)&&!known.has(x.name.toLowerCase()))
      .map(x=>({id:'gh-'+x.name,name:x.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').slice(0,70),src:'assets/'+encodeURIComponent(x.name)}));
    if(status)status.textContent=`${githubPhotos.length} nuove fotografie trovate su GitHub · ${basePhotos.length} iniziali`;
    photoBag=[];fillPhotos();renderPhotos();
    if(notify)toast(`${githubPhotos.length} nuove foto disponibili`);
  }catch(e){
    if(status)status.textContent='Aggiornamento GitHub non disponibile. Le foto iniziali e quelle locali restano utilizzabili.';
    if(notify)toast('Impossibile aggiornare GitHub: '+e.message);
  }
}

function tokens(t){const s=state.settings;return t.replaceAll('{price}',s.price).replaceAll('{included}',s.included).replaceAll('{end}',s.end?new Date(s.end+'T12:00:00').toLocaleDateString('it-IT'):'').replaceAll('{cta}',s.cta)}
function makeContent(){let t=$('theme').value==='auto'?themeToday():$('theme').value;if(t==='offer'&&!offerValid()){t='relax';toast('Promozione non confermata: uso il tema Relax.')}let kind=$('kind').value;let previous=current.photo;let photo=choosePhoto();let headline=chooseHeadline(t);let layout=pick(visualLayouts.filter(x=>x!==current.layout));let palette=rand(palettes.length);let caption=buildCaption(t,kind);for(let attempt=0;attempt<5&&caption===previousCaption;attempt++)caption=buildCaption(t,kind);previousCaption=caption;previousHeadline=headline;current={kind,theme:t,photo:photo.id,layout,palette,headline,caption,hashtags:buildTags(t),script:buildScript(headline)};$('photoSelect').value=current.photo;$('headline').value=current.headline;$('caption').value=current.caption;$('hashtags').value=current.hashtags;$('reelScript').value=current.script;draw()}
function sync(){current.headline=$('headline').value;current.caption=$('caption').value;current.hashtags=$('hashtags').value;current.script=$('reelScript').value;current.photo=$('photoSelect').value;current.kind=$('kind').value}
function loadImg(src){return new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src})}
function wrap(ctx,text,maxWidth,maxLines){let words=text.split(/\s+/),lines=[],line='';for(let w of words){let next=line?line+' '+w:w;if(ctx.measureText(next).width>maxWidth&&line){lines.push(line);line=w}else line=next}if(line)lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);while(ctx.measureText(lines[maxLines-1]+'…').width>maxWidth)lines[maxLines-1]=lines[maxLines-1].slice(0,-1);lines[maxLines-1]+='…'}return lines}
async function draw(){
 sync();const ticket=++renderTicket,canvas=$('canvas'),ctx=canvas.getContext('2d');
 const W=1080,H=current.kind==='post'?1350:1920;canvas.width=W;canvas.height=H;
 const photo=allPhotos().find(p=>p.id===current.photo)||creativePhotos()[0]||basePhotos[0];let im;
 try{im=await loadImg(photo.src)}catch{toast('Fotografia non disponibile: verifica la libreria');return}
 if(ticket!==renderTicket)return;
 const pal=palettes[(current.palette||0)%palettes.length]||palettes[0];
 const gold=pal.gold,white='#f9f5ee',scale=H/1920;
 const layout=visualLayouts.includes(current.layout)?current.layout:'left-classic';
 const onLeft=layout.startsWith('left');const panelW=layout.includes('modern')?520:layout.includes('romance')?490:500;
 const panelX=onLeft?0:W-panelW,photoX=onLeft?panelW:0,photoW=W-panelW;
 const headline=(current.headline||'Una notte speciale').trim();
 const promo=current.theme==='offer'&&offerValid();
 const fs=n=>Math.round(n*Math.max(.77,scale));
 const Y=n=>n*scale;
 const align=onLeft?'left':'right',pad=onLeft?56:W-56;
 ctx.fillStyle='#111015';ctx.fillRect(0,0,W,H);
 // Foto sempre protagonista: 52–55% della larghezza, senza oscurarla.
 const ratio=Math.max(photoW/im.width,H/im.height),sw=photoW/ratio,sh=H/ratio;
 const focus=layout.includes('modern')?.63:layout.includes('romance')?.43:.5;
 const sx=Math.max(0,(im.width-sw)*focus),sy=Math.max(0,(im.height-sh)*.5);
 ctx.drawImage(im,sx,sy,sw,sh,photoX,0,photoW,H);
 // Pannello editoriale opaco ispirato alla locandina di riferimento.
 const grad=ctx.createLinearGradient(panelX,0,panelX+panelW,H);
 grad.addColorStop(0,'#15141a');grad.addColorStop(.6,'#0e0e13');grad.addColorStop(1,'#19151a');
 ctx.fillStyle=grad;ctx.fillRect(panelX,0,panelW,H);
 // Sottile separatore oro e ombra sul bordo della fotografia.
 ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(onLeft?panelW:photoW-9,0,9,H);
 ctx.fillStyle=gold;ctx.fillRect(onLeft?panelW-2:photoW,0,2,H);
 function txt(t,x,y,size,color=white,font='Arial',weight='normal',a=align){
  ctx.fillStyle=color;ctx.textAlign=a;ctx.textBaseline='alphabetic';ctx.font=`${weight} ${size}px ${font}`;ctx.fillText(t,x,y);
 }
 function rule(y,len=145){ctx.fillStyle=gold;ctx.fillRect(onLeft?pad:pad-len,Y(y),len,2)}
 function multiline(t,maxWidth,size,maxLines){
  ctx.font=`bold ${size}px Georgia`;const words=t.split(/\s+/),lines=[];let line='';
  for(const word of words){let next=line?line+' '+word:word;
   if(line&&ctx.measureText(next).width>maxWidth){lines.push(line);line=word}else line=next;
  }if(line)lines.push(line);
  return lines.length<=maxLines?lines:null;
 }
 const titleMax=panelW-112;
 let titleSize=fs(layout.includes('modern')?80:86),lines;
 while(titleSize>=fs(43)){lines=multiline(headline,titleMax,titleSize,4);if(lines)break;titleSize-=2}
 lines=lines||multiline(headline,titleMax,fs(42),10)||[headline];
 const titleY=layout.includes('modern')?205:190;
 rule(73,125);
 txt('CRYSTAL',pad,Y(126),fs(33),gold,'Georgia');
 txt('L U X U R Y  A P A R T M E N T',pad,Y(151),fs(12),white);
 let lineY=Y(titleY+65);
 for(const line of lines){txt(line,pad,lineY,titleSize,white,'Georgia','bold');lineY+=titleSize*1.14}
 rule(Math.max(470,(lineY/scale)+38),135);
 const descriptor=pick(['SUITE ESCLUSIVA','UN SOGGIORNO SPECIALE','IL TUO MOMENTO','ESPERIENZA DI COPPIA','RELAX E PRIVACY']);
 const benefitY=Math.max(Y(565),lineY+Y(100));
 txt(descriptor,pad,benefitY,fs(24),gold,'Arial','bold');
 txt('A CAPURSO · BARI',pad,benefitY+Y(36),fs(20),white);
 const detailY=Math.max(Y(745),benefitY+Y(115));
 const details=[['✦','BOTTIGLIA DI','PROSECCO INCLUSA'],['✦','COLAZIONE','INCLUSA'],['✦','UN MOMENTO','DA RICORDARE']];
 details.forEach(([symbol,l1,l2],i)=>{
  const yy=detailY+i*Y(151);
  txt(symbol,pad,yy,fs(30),gold,'Georgia');
  txt(l1,pad,yy+Y(40),fs(24),white,'Arial','bold');
  txt(l2,pad,yy+Y(74),fs(23),white);
 });
 const footer=H-Y(245);
 rule(footer/scale-55,140);
 if(promo)txt(`${state.settings.price} € / NOTTE`,pad,footer-Y(13),fs(33),gold,'Georgia','bold');
 const boxW=panelW-100,boxX=onLeft?50:W-panelW+50,boxY=H-Y(202),boxH=Y(112);
 ctx.fillStyle='rgba(9,9,12,.75)';ctx.strokeStyle=gold;ctx.lineWidth=2;
 ctx.fillRect(boxX,boxY,boxW,boxH);ctx.strokeRect(boxX,boxY,boxW,boxH);
 txt('SCRIVICI SU WHATSAPP',boxX+boxW/2,boxY+Y(43),fs(20),white,'Arial','bold','center');
 txt('PER PRENOTARE',boxX+boxW/2,boxY+Y(81),fs(24),gold,'Arial','bold','center');
 txt('CRYSTAL LUXURY APARTMENT · CAPURSO',boxX+boxW/2,H-Y(45),fs(12),white,'Arial','normal','center');
 lastBlob=null;
}
function canvasBlob(){return new Promise(resolve=>$('canvas').toBlob(resolve,'image/png'))}async function saveImage(share=false){sync();await draw();let blob=await canvasBlob();if(!blob){toast('Esportazione non riuscita');return}let name=`crystal_${current.kind}_${new Date().toISOString().slice(0,10)}.png`;if(share&&navigator.share&&navigator.canShare){let file=new File([blob],name,{type:'image/png'});if(navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Crystal Luxury Apartment',text:current.caption+'\n'+current.hashtags});return}catch(e){if(e.name==='AbortError')return}}}let url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast(share?'Immagine scaricata: condividila dal tuo iPhone':'PNG pronto per il download')}
function fillPhotos(){let s=$('photoSelect'),old=s.value;s.innerHTML='';allPhotos().forEach(p=>{let o=document.createElement('option');o.value=p.id;o.textContent=p.name;s.appendChild(o)});s.value=allPhotos().some(p=>p.id===old)?old:choosePhoto().id}
function renderPhotos(){let g=$('photosGrid');g.innerHTML='';allPhotos().forEach(p=>{let d=document.createElement('div');d.className='card';let i=document.createElement('img');i.className='photo';i.src=p.src;i.alt=p.name;let n=document.createElement('div');n.className='small';n.textContent=p.name;d.append(i,n);if(p.id.startsWith('u')){let b=document.createElement('button');b.className='secondary';b.textContent='Rimuovi';b.onclick=async()=>{await dbDelete(p.id);userPhotos=userPhotos.filter(x=>x.id!==p.id);fillPhotos();renderPhotos()};d.append(b)}g.append(d)})}
function renderDrafts(){let g=$('drafts');g.innerHTML='';if(!state.drafts.length){g.innerHTML='<p class="muted">Non hai ancora salvato bozze.</p>';return}state.drafts.slice().reverse().forEach((d,idx)=>{let e=document.createElement('div');e.className='day';let title=document.createElement('strong');title.textContent=`${d.kind.toUpperCase()} · ${d.date} · ${d.headline}`;let buttons=document.createElement('div');buttons.className='controls';let open=document.createElement('button');open.className='secondary';open.textContent='Apri';open.onclick=()=>{current={...d};$('kind').value=d.kind;fillPhotos();$('photoSelect').value=d.photo;$('headline').value=d.headline;$('caption').value=d.caption;$('hashtags').value=d.hashtags;$('reelScript').value=d.script;tab('create');draw()};let del=document.createElement('button');del.className='secondary';del.textContent='Elimina';del.onclick=()=>{state.drafts=state.drafts.filter(x=>x.id!==d.id);persist();renderDrafts()};buttons.append(open,del);e.append(title,buttons);g.append(e)})}
function renderWeek(){let g=$('week');g.innerHTML='';weekLabels.forEach((name,i)=>{let d=document.createElement('div');d.className='day';d.textContent=name+(i===5?' · solo se l’offerta è confermata':'');g.append(d)})}
function downloadFile(name,blob){let a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function openDb(){return new Promise((res,rej)=>{let r=indexedDB.open('crystal-studio-images',1);r.onupgradeneeded=()=>r.result.createObjectStore('images',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}async function dbAll(){let db=await openDb();return new Promise((res,rej)=>{let t=db.transaction('images','readonly'),r=t.objectStore('images').getAll();r.onsuccess=()=>{db.close();res(r.result)};r.onerror=()=>rej(r.error)})}async function dbPut(p){let db=await openDb();return new Promise((res,rej)=>{let t=db.transaction('images','readwrite');t.objectStore('images').put(p);t.oncomplete=()=>{db.close();res()};t.onerror=()=>rej(t.error)})}async function dbDelete(id){let db=await openDb();return new Promise((res,rej)=>{let t=db.transaction('images','readwrite');t.objectStore('images').delete(id);t.oncomplete=()=>{db.close();res()};t.onerror=()=>rej(t.error)})}
async function imageData(file){return new Promise((resolve,reject)=>{let img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{let scale=Math.min(1,1800/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);resolve(c.toDataURL('image/jpeg',.83))};img.onerror=reject;img.src=url})}
$('upload').onchange=async e=>{for(let f of e.target.files){if(!f.type.startsWith('image/'))continue;try{let p={id:'u'+Date.now()+Math.random().toString(36).slice(2,7),name:f.name.slice(0,70),src:await imageData(f)};await dbPut(p);userPhotos.push(p)}catch{toast('Spazio esaurito o foto non supportata')}}fillPhotos();renderPhotos();toast('Foto aggiunte all’archivio locale')};
$('refreshGithubPhotos').onclick=()=>refreshGithubPhotos(true);$('generate').onclick=()=>{state.variant++;persist();makeContent()};$('variation').onclick=()=>{state.variant++;persist();makeContent()};$('redraw').onclick=draw;$('photoSelect').onchange=draw;$('kind').onchange=makeContent;$('theme').onchange=makeContent;$('download').onclick=()=>saveImage(false);$('share').onclick=()=>saveImage(true);$('copyCaption').onclick=async()=>{sync();let txt=current.caption+'\n\n'+current.hashtags;try{await navigator.clipboard.writeText(txt);toast('Didascalia e hashtag copiati')}catch{toast('Seleziona e copia manualmente il testo')}};
$('saveDraft').onclick=()=>{sync();state.drafts.push({...current,id:Date.now(),date:new Date().toLocaleDateString('it-IT')});if(persist())toast('Bozza salvata sul dispositivo')};
$('todayGenerate').onclick=()=>{$('theme').value='auto';tab('create');makeContent()};$('todayRefresh').onclick=()=>{state.variant++;persist();$('theme').value='auto';tab('create');makeContent()};
$('saveSettings').onclick=()=>{state.settings={active:$('offerActive').checked,price:Number($('price').value),end:$('offerEnd').value,included:$('included').value.trim(),cta:$('cta').value.trim()};persist();toast('Impostazioni salvate');makeContent()};
$('export').onclick=async()=>{let data={version:1,state,photos:await dbAll()};downloadFile('crystal-studio-backup.json',new Blob([JSON.stringify(data)],{type:'application/json'}))};$('import').onchange=async e=>{try{let o=JSON.parse(await e.target.files[0].text());if(o.version!==1||!o.state||!Array.isArray(o.photos))throw Error();state={...defaults,...o.state};persist();for(let p of o.photos)if(p.id&&p.src&&p.name)await dbPut(p);userPhotos=await dbAll();fillPhotos();renderPhotos();renderDrafts();toast('Backup ripristinato')}catch{toast('Backup non valido')}};
async function init(){let d=new Date();$('todayDate').textContent=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(d).toUpperCase();let s=state.settings;$('offerActive').checked=s.active;$('price').value=s.price;$('offerEnd').value=s.end;$('included').value=s.included;$('cta').value=s.cta;try{userPhotos=await dbAll()}catch{toast('Archivio locale non disponibile')};fillPhotos();renderWeek();renderPhotos();makeContent();refreshGithubPhotos();let g=$('homeList');['story','post','reel'].forEach((k,i)=>{let card=document.createElement('div');card.className='card';let h=document.createElement('h3');h.textContent=['Story del giorno','Post del giorno','Idea Reel del giorno'][i];let p=document.createElement('p');p.className='muted';p.textContent=['Grafica verticale pronta da personalizzare.','Foto reale, testo e hashtag da copiare.','Copertina e scaletta per girare un Reel reale.'][i];let b=document.createElement('button');b.className='secondary';b.textContent='Apri proposta';b.onclick=()=>{$('kind').value=k;$('theme').value='auto';tab('create');makeContent()};card.append(h,p,b);g.append(card)});if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{})}init();
