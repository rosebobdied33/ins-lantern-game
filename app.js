const stores=[
  [
    "绿洲",
    "城市里的精神绿洲，让音乐与快乐生长",
    "循着花灯走进绿洲，今夜的好戏随音乐开场。",
    "B1"
  ],
  [
    "INS TOWN",
    "藏着微醺魔法的小镇，等你来做客",
    "灯火点亮魔法小镇，一场奇遇从碰杯开始。",
    "1F"
  ],
  [
    "HUSH",
    "纯正嘻哈，自有态度与声量。",
    "花灯亮起，低频入场，和你的 Crew 一起闹游园。",
    "2F"
  ],
  [
    "upperwood",
    "复古氛围与轻松律动，让夜晚慢下来",
    "灯影摇曳，旋律漫开，在游园深处自在片刻。",
    "2F"
  ],
  [
    "RADI",
    "让低频拉近距离，让邂逅自然发生",
    "循着低频穿过灯影，下一场好戏，是与你相遇。",
    "3F"
  ],
  [
    "KZ",
    "为现场而来，让热爱在音乐中回响",
    "花灯为序，现场开篇，把今夜唱成游园的回响。",
    "3F"
  ],
  [
    "CC",
    "男孩们的高能社交场，让快乐尽兴登场",
    "星灯亮起，快乐开场，今夜你也是好戏的主角。",
    "4F"
  ],
  [
    "得体",
    "藏进暗处，让身体跟着声音寻找方向",
    "游园有明灯，也有暗场，循声走进得体的夜。",
    "4F"
  ],
  [
    "FRIENDS",
    "不必解释的抽象俱乐部，快乐自有逻辑",
    "百戏游园，抽象开演，和 FRIENDS 一起不按常理出场。",
    "5F"
  ],
  [
    "La fin",
    "欧美流行音乐的快乐老家，熟悉又上头",
    "灯下响起熟悉的副歌，让全场合唱成为今夜好戏。",
    "6F"
  ],
  [
    "Jump",
    "跳进 2016，让熟悉的旋律再次沸腾",
    "花灯一亮，回忆开场，跟着那年的旋律跳进今夜。",
    "6F"
  ],
  [
    "便利店",
    "边吃边蹦边干杯，快乐补给随时就位",
    "逛到这里，快乐续杯，为下一场好戏补满兴致。",
    ""
  ],
  [
    "INSHOST",
    "今夜尽兴游园，贴心照应始终在场",
    "灯火深处，安心做客，你的游园兴致由我们照应。",
    ""
  ],
  [
    "INSLAND",
    "音乐与城市在此相遇，每一晚都有新故事",
    "一灯一场戏，一步一重境，来百戏游园遇见你的夜。",
    ""
  ]
];
const $ = id => document.getElementById(id);
const shuffle = input => { const a=[...input]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SCORE_KEY='ins-lantern-times-v3';
const T=TimeRecords;
let startedAt=0;
let deck=[],selected=[],matched=[],playing=false,locked=false,deadline=0,timer=null,turn=0,recommended=null;
let points=0,combo=0,comboPoints=0,attempts=0,lastSecond=61,player='游园客',currentResult=null;
let audioContext=null,soundOn=true,storageAvailable=true;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
function readScores(){try{const raw=JSON.parse(localStorage.getItem(SCORE_KEY)||'[]');return Array.isArray(raw)?raw.filter(T.valid).sort(T.compare).slice(0,100):[];}catch{storageAvailable=false;return [];}}
let scores=readScores();
function art(id){return `<div class="art"><img src="assets/lanterns/${id}.png" alt="${stores[id][0]}花灯" draggable="false"></div>`;}
function initAudio(){if(!soundOn)return;try{audioContext??=new(window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});}catch{soundOn=false;updateSound();}}
function beep(frequency=520,length=.11,volume=.06){if(!soundOn||!audioContext||audioContext.state!=='running'||document.hidden)return;const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(volume,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+length);osc.connect(gain);gain.connect(audioContext.destination);osc.start();osc.stop(audioContext.currentTime+length);}
function updateSound(){$('sound').textContent=soundOn?'声音：开':'声音：关';$('sound').setAttribute('aria-pressed',String(soundOn));}
function clearUrgency(){document.body.classList.remove('urgent-mode','last-three');$('countdown').classList.add('hidden');$('countdown').textContent='';$('time').classList.remove('urgent');}
function prepare(){turn++;clearInterval(timer);playing=false;locked=false;selected=[];matched=[];recommended=null;points=0;combo=0;comboPoints=0;attempts=0;lastSecond=61;currentResult=null;clearUrgency();
 const chosen=shuffle([...Array(12).keys()]).slice(0,6);deck=shuffle([...chosen,...chosen]);
 $('board').innerHTML=deck.map((id,i)=>`<button class="card tone-${id%6}" data-index="${i}" aria-label="第 ${i+1} 盏花灯，未翻开"><span class="back" aria-hidden="true"><i>✦</i><small>百戏游园</small><em>INS LAND</em></span>${art(id)}<span class="card-name">${stores[id][0]}</span></button>`).join('');
 $('count').textContent='0';$('progress').style.width='0%';$('time').textContent='01:00';$('live-score').textContent='0';$('combo').textContent='每对 +100';$('guide').disabled=true;$('guide').textContent='点亮花灯，解锁目的地';$('recommend-art').innerHTML=art(2);$('result-content').innerHTML='<span class="small-badge">花灯签 · 等待揭晓</span><h3>今晚，随光而行</h3><p>找到 6 对花灯，<br>让夜晚替你选一个目的地。</p>';$('message').textContent='翻开两盏花灯，寻找相同图案。';updateBest();$('elapsed-time').textContent='0.00';
}
function start(){const name=$('player-name').value.trim();player=name.slice(0,12)||'游园客';if($('result-dialog').open)$('result-dialog').close();if($('modal').open)$('modal').close();prepare();initAudio();playing=true;startedAt=performance.now();deadline=startedAt+60000;$('start-cover').classList.add('hidden');$('board').inert=false;timer=setInterval(tick,33);$('board').children[0].focus({preventScroll:true});}
function tick(){if(!playing)return;const remaining=Math.max(0,Math.ceil((deadline-performance.now())/1000));$('elapsed-time').textContent=T.format(T.elapsed(performance.now(),startedAt));$('time').textContent=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
 if(remaining<=10&&remaining>0){document.body.classList.add('urgent-mode');document.body.classList.toggle('last-three',remaining<=3);$('time').classList.add('urgent');$('countdown').classList.remove('hidden');$('countdown').textContent=remaining;if(lastSecond!==remaining){$('countdown').style.animation='none';void $('countdown').offsetWidth;$('countdown').style.animation='';beep(remaining<=3?880:640,.14,.09);if(remaining===10)$('message').textContent='最后 10 秒！抓紧点亮剩下的花灯。';}}
 lastSecond=remaining;if(remaining===0)finish(false);
}
function updateBest(){const best=T.completed(scores)[0];$('best').textContent=best?T.format(best.elapsedCs)+' 秒':'—';}
function recordResult(won,remaining){const bonus=won?remaining*10:0;const score=points+bonus;const elapsedCs=won?T.elapsed(performance.now(),startedAt):6000;const entry={id:crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random(),name:player,score,matched:matched.length,attempts,won,elapsedCs,date:Date.now()};scores=storageAvailable?readScores():scores;const rank=T.rank(scores,entry);scores.push(entry);scores.sort(T.compare);scores=scores.slice(0,100);try{localStorage.setItem(SCORE_KEY,JSON.stringify(scores));}catch{storageAvailable=false;}return {...entry,rank,bonus,base:matched.length*100,comboPoints};}
function finish(won){if(!playing)return;const remaining=Math.max(0,Math.ceil((deadline-performance.now())/1000));playing=false;locked=true;clearInterval(timer);turn++;clearUrgency();$('board').inert=true;currentResult=recordResult(won,remaining);$('live-score').textContent=currentResult.score;updateBest();$('elapsed-time').textContent=T.format(currentResult.elapsedCs);
 if(matched.length){recommended=matched[Math.floor(Math.random()*matched.length)];const s=stores[recommended];$('recommend-art').innerHTML=art(recommended);$('result-content').innerHTML=`<span class="small-badge">${won?'全部点亮':'已点亮的相遇'} · 今晚的花灯签</span><h3>${s[0]}</h3><p>${s[1]}</p><span class="floor-inline">${s[3]?s[3]+'':'楼层待确认'}</span>`;$('guide').disabled=false;$('guide').textContent='查看门店指引 →';}
 $('message').textContent=won?'✦ 你的花灯已点亮，今晚的好戏在这里。':`时间到！点亮 ${matched.length} 家门店，下一局继续。`;beep(won?780:240,.35,.07);showResult();
}
function rankRows(){return T.completed(scores).slice(0,5).map(s=>{const rank=T.rank(scores,s);return '<li class="'+(currentResult?.id===s.id?'is-you':'')+'"><span class="rank-no">'+String(rank).padStart(2,'0')+'</span><span>'+escapeHTML(s.name)+(currentResult?.id===s.id?'<small>本局</small>':'')+'</span><strong>'+T.format(s.elapsedCs)+'<em> 秒</em></strong></li>';}).join('');}
function showResult(){const r=currentResult;if(!r)return;const rankText=r.won?(r.rank>100?'100+':r.rank):'—';$('result-body').innerHTML='<div class="eyebrow">'+(r.won?'YOUR CHALLENGE TIME':'UNTIL WE MEET AGAIN')+'</div><h2>'+(r.won?'灯火全明，快意游园':'游园未尽，下局再会')+'</h2><div class="final-score final-time"><strong>'+T.format(r.elapsedCs)+'<em>秒</em></strong><span>'+(r.won?'本次通关用时 · 越快越好':'挑战已用时 · 本次未通关')+'</span></div><div class="result-metrics"><div><strong>'+r.matched+'<em> / 6</em></strong><span>点亮门店</span></div><div><strong>'+r.score+'</strong><span>本局积分</span></div><div><strong>'+rankText+'</strong><span>'+(r.won?'本机速度排名':'未进入速度榜')+'</span></div></div><div class="score-breakdown"><span>配对 '+r.base+'</span><span>连击 '+r.comboPoints+'</span><span>时间奖励 '+r.bonus+'</span></div><div class="rank-heading"><h3>游园竞速榜</h3><span>TOP 5 · 用时越短越靠前</span></div><ol class="ranking">'+(rankRows()||'<li class="empty-rank">还没有通关记录，下一局等你上榜。</li>')+'</ol><p class="storage-note">'+(storageAvailable?'本机榜单 · 仅限成功通关 · 相同用时并列排名。旧版积分成绩不参与竞速排名。':'成绩暂时无法保存，当前榜单仅在本次会话内有效。')+'</p><div class="result-actions"><button class="primary" id="play-again">再挑战一次 ↻</button><button class="secondary" id="see-destination">'+(recommended!==null?'查看我的目的地 →':'逛逛全部门店 →')+'</button></div>';$('play-again').onclick=start;$('see-destination').onclick=()=>{$('result-dialog').close();recommended!==null?detail(recommended):directory();};$('result-dialog').showModal();}
function leaderboard(){$('modal-content').innerHTML='<div class="eyebrow">LOCAL SPEED RECORDS</div><h2>游园竞速榜</h2><p class="muted">仅限成功通关 · 用时越短排名越高 · 相同用时并列</p><ol class="ranking">'+(rankRows()||'<li class="empty-rank">还没有通关记录，来创造第一个纪录吧。</li>')+'</ol><p class="storage-note">展示本机最快 5 条记录。榜单保存在当前浏览器中，清除浏览器数据会清除榜单。旧版积分记录不混入竞速榜。</p>';if(!$('modal').open)$('modal').showModal();}

$('board').onclick=e=>{const c=e.target.closest('.card');if(!c||!playing||locked)return;if(performance.now()>=deadline){tick();return;}const i=Number(c.dataset.index);if(selected.includes(i)||matched.includes(deck[i]))return;c.classList.add('face');c.setAttribute('aria-label',stores[deck[i]][0]+'花灯');beep(400+selected.length*80,.05,.025);selected.push(i);if(selected.length<2)return;locked=true;attempts++;const[a,b]=selected,epoch=turn;
 if(deck[a]===deck[b]){matched.push(deck[a]);combo++;const extra=Math.max(0,combo-1)*20;comboPoints+=extra;points+=100+extra;[a,b].forEach(n=>{const card=$('board').children[n];card.classList.add('matched');card.disabled=true;});$('count').textContent=matched.length;$('progress').style.width=matched.length/6*100+'%';$('live-score').textContent=points;$('combo').textContent=combo>1?`${combo} 连击 · +${100+extra}`:'配对成功 · +100';$('message').textContent=`点亮 ${stores[deck[a]][0]}！${combo>1?combo+' 连击，手感正好。':'继续寻找下一盏灯。'}`;beep(720,.12,.04);selected=[];locked=false;if(matched.length===6)finish(true);
 }else{combo=0;$('combo').textContent='连击中断 · 再试试';setTimeout(()=>{if(epoch!==turn)return;[a,b].forEach(n=>{const card=$('board').children[n];card.classList.remove('face');card.setAttribute('aria-label',`第 ${n+1} 盏花灯，未翻开`);});selected=[];locked=false;},750);}
};
function detail(id){const s=stores[id];$('modal-content').innerHTML=`<article class="detail"><div class="eyebrow">YOUR NEXT DESTINATION</div><h2>${s[0]}</h2>${id<12?`<div class="detail-art tone-${id%6}">${art(id)}</div>`:''}${s[1]?`<h4>关于门店</h4><p>${s[1]}</p>`:''}<h4>今晚的精彩</h4><p>${s[2]}</p><div class="floor">${s[3]?'楼层 · '+s[3]+'':'楼层 · 待确认'}<small>${s[3]?'按楼层前往，现场入口请参照场内导视。':'当前资料未提供楼层，请向现场工作人员咨询。'}</small></div><button class="text-button" id="back-stores">← 查看全部门店</button></article>`;$('back-stores').onclick=directory;if(!$('modal').open)$('modal').showModal();}
function directory(){$('modal-content').innerHTML='<div class="eyebrow">FIND YOUR NIGHT</div><h2>每盏灯，都是一个目的地</h2><div class="store-grid">'+stores.map((s,i)=>`<button class="store-option" data-store="${i}">${i<12?art(i):'<span class="store-symbol">✦</span>'}<span>${s[0]}<small>${s[3]?s[3]+'':'楼层待确认'} ↗</small></span></button>`).join('')+'</div>';$('modal-content').querySelectorAll('[data-store]').forEach(b=>b.onclick=()=>detail(Number(b.dataset.store)));if(!$('modal').open)$('modal').showModal();}
$('start').onclick=start;$('restart').onclick=start;$('guide').onclick=()=>recommended!==null&&detail(recommended);$('directory').onclick=directory;$('rank-button').onclick=leaderboard;$('close').onclick=()=>$('modal').close();$('result-close').onclick=()=>$('result-dialog').close();$('sound').onclick=()=>{soundOn=!soundOn;if(soundOn)initAudio();updateSound();};$('result-dialog').addEventListener('close',()=>{$('restart').focus({preventScroll:true});});
$('mini-stores').innerHTML=[0,3,5,6,9,10].map(id=>`<button class="mini-store" data-store="${id}"><div class="mini-art tone-${id%6}">${art(id)}</div><span>${stores[id][0]}</span></button>`).join('');$('mini-stores').querySelectorAll('button').forEach(b=>b.onclick=()=>detail(Number(b.dataset.store)));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&playing)tick();});prepare();$('board').inert=true;updateSound();

// Confirmed by the user: floor order runs from B1 at bottom to 6F at top.
const floorLevels=[['6F',[10,9]],['5F',[8]],['4F',[6,7]],['3F',[4,5]],['2F',[3,2]],['1F',[1]],['B1',[0]]];
$('floor-levels').innerHTML=floorLevels.map(([floor,ids])=>'<section class="floor-level"><strong>'+floor+'</strong><div>'+ids.map(id=>'<button class="floor-shop" data-store="'+id+'" aria-label="'+stores[id][0]+'，'+floor+'楼层">'+art(id)+'<span>'+stores[id][0]+'</span></button>').join('')+'</div></section>').join('');
$('floor-levels').querySelectorAll('[data-store]').forEach(b=>b.onclick=()=>detail(Number(b.dataset.store)));
$('unknown-floors').onclick=directory;
$('enter-garden').onclick=()=>{document.body.classList.remove('at-cover');$('welcome').classList.add('hidden');$('game-world').inert=false;$('start').focus({preventScroll:true});};
