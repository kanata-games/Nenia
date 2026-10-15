(function(){
const SAVE='neenia-chronicle-v1';
const START_AGE=14, YEAR_SEC=6;

const ACTS=[
 {k:'farm',  n:'畑仕事',     s:'畑', g:1,   d:'金貨をこつこつ稼ぐ', u:()=>true, uh:''},
 {k:'sword', n:'素振り',     s:'剣', g:0,   d:'冒険がはかどる',     u:L=>L.farm>=5, uh:'畑仕事 Lv5'},
 {k:'book',  n:'読書',       s:'書', g:0,   d:'すべての上達が早くなる', u:L=>L.farm>=10, uh:'畑仕事 Lv10'},
 {k:'trade', n:'行商',       s:'商', g:7,   d:'まとまった金貨',     u:L=>L.book>=10&&L.farm>=15, uh:'読書 Lv10・畑仕事 Lv15'},
 {k:'adv',   n:'冒険',       s:'旅', g:20,  d:'たくさんの金貨',     u:L=>L.sword>=20, uh:'素振り Lv20'},
 {k:'magic', n:'魔法の研究', s:'魔', g:5,   d:'読書の効果が倍に',   u:L=>L.book>=25, uh:'読書 Lv25'},
 {k:'pray',  n:'星への祈り', s:'祈', g:0,   d:'この人生の寿命がのびる', u:L=>L.magic>=10, uh:'魔法の研究 Lv10'},
 {k:'king',  n:'王の政務',   s:'王', g:120, d:'国を治めて大もうけ', u:L=>L.trade>=30&&L.adv>=25&&L.magic>=25, uh:'行商30・冒険25・魔法25'},
 {k:'fish',  st:1, n:'釣り',       s:'釣', g:6,     d:'のんびり金貨',         u:L=>L.farm>=5, uh:'畑仕事 Lv5'},
 {k:'ship',  st:1, n:'船の交易',   s:'船', g:260,   d:'海を越えて大もうけ',   u:L=>L.trade>=20&&L.fish>=10, uh:'行商20・釣り10'},
 {k:'music', st:2, n:'宮廷楽団',   s:'楽', g:0,     d:'すべての上達が早くなる', u:L=>L.book>=15, uh:'読書 Lv15'},
 {k:'knight',st:2, n:'騎士団',     s:'騎', g:900,   d:'王都を守ってお給金',   u:L=>L.adv>=25&&L.sword>=30, uh:'冒険25・素振り30'},
 {k:'wind',  st:3, n:'風読み',     s:'風', g:0,     d:'年をとるのがゆっくりに', u:L=>L.magic>=20, uh:'魔法の研究 Lv20'},
 {k:'cloud', st:3, n:'雲の交易',   s:'雲', g:6000,  d:'空の島どうしを結ぶ',   u:L=>L.ship>=25&&L.wind>=10, uh:'船の交易25・風読み10'},
 {k:'starread',st:4,n:'星詠み',    s:'星', g:0,     d:'記憶のかけらが多くもらえる', u:L=>L.pray>=15, uh:'星への祈り Lv15'},
 {k:'starking',st:4,n:'星の海の王',s:'冠', g:90000, d:'星々を治める',         u:L=>L.king>=30&&L.cloud>=20, uh:'王の政務30・雲の交易20'},
 {k:'moonfl',st:5, n:'月の花摘み', s:'月', g:3e6,   d:'銀の花を集める',       u:L=>L.starking>=20, uh:'星の海の王 Lv20'},
 {k:'dream', st:5, n:'夢見',       s:'夢', g:0,     d:'すべての稼ぎが増える', u:L=>L.starread>=20, uh:'星詠み Lv20'},
 {k:'weave', st:6, n:'光の紡ぎ',   s:'紡', g:2e8,   d:'物語の糸を紡ぐ',       u:L=>L.moonfl>=25, uh:'月の花摘み Lv25'},
 {k:'tune',  st:6, n:'時の調律',   s:'時', g:0,     d:'寿命がのびる',         u:L=>L.dream>=20, uh:'夢見 Lv20'},
];
const STAGES=[
 {n:'村',     thr:0,   c:'#5f8a3a', hi:'畑と小川のある、小さな村'},
 {n:'港町',   thr:20,  c:'#2f73a8', hi:'潮風と船の汽笛がひびく港町'},
 {n:'王都',   thr:100, c:'#a24e6a', hi:'お城と市場がにぎわう王都'},
 {n:'空の島', thr:400, c:'#a8760f', hi:'雲の上にうかぶ空の島'},
 {n:'星の海', thr:1000,c:'#5b4fb0', hi:'星々が波のようにゆれる星の海'},
 {n:'月の庭', thr:2500,c:'#4a6a9a', hi:'銀の花が咲く、静かな月の庭'},
 {n:'はじまりの光', thr:6000,c:'#c0902a', hi:'すべての物語が生まれる、はじまりの光'},
];
const stage=()=>S.meta.stage||0;
const SUPS=[
 {k:'bless',n:'星の加護',     d:'すべての上達 ×1.5',            cost:l=>Math.ceil(Math.pow(1.7,l))},
 {k:'gold', n:'黄金のしずく', d:'すべての稼ぎ ×2',              cost:l=>Math.ceil(Math.pow(1.8,l))},
 {k:'memo', n:'澄んだ記憶',   d:'記憶のかけら ×1.5',            cost:l=>Math.ceil(2*Math.pow(1.8,l))},
 {k:'road', n:'近道の星図',   d:'舞台に必要なかけら -15%（最大4）', cost:l=>3+l*3, max:4},
];
const sup=k=>(S.meta.sup&&S.meta.sup[k])||0;
const PUPS=[
 {k:'art',  n:'挿絵',           d:'稼ぎと上達 ×3',                         cost:l=>Math.pow(2,l)},
 {k:'pen',  n:'語り部の筆',     d:'星のしずく ×1.5',                       cost:l=>Math.pow(2,l)},
 {k:'after',n:'あとがき',       d:'寿命 +15歳',                            cost:l=>1+l},
 {k:'open', n:'書き出しの一行', d:'リセット後、1つ先の舞台から始まる（最大3）', cost:l=>2+l*2, max:3},
];
const pg=k=>(S.meta.pup&&S.meta.pup[k])||0;
const pageMult=()=>(1+0.25*(S.meta.pageTotal||0))*Math.pow(3,pg('art'));
const pageGain=()=>stage()>=4?Math.floor(Math.sqrt((S.meta.starTotal||0)/5)):0;
const wantAutoPage=()=>S.autoPage&&stage()>=4&&pageGain()>=Math.max(1,S.meta.pageTotal||0);
function markFirst(k){const st=S.meta.stats; if(st&&st.first[k]===undefined)st.first[k]=st.play+st.away}
function fmtDur(t){t=Math.floor(t||0); const d=Math.floor(t/86400), h=Math.floor(t%86400/3600), m=Math.floor(t%3600/60), sec=t%60;
  if(d)return `${d}日${h}時間${m}分`; if(h)return `${h}時間${m}分`; if(m)return `${m}分${sec}秒`; return `${sec}秒`}
function dexAdd(cat,key){const M=S.meta; if(!M.dex)return; if(!M.dex[cat][key]){M.dex[cat][key]=1; M.dexN=(M.dexN||0)+1}}
const allEvents=()=>EVENTS.concat(...STAGE_EV);
const starMult=()=>1+0.1*(S.meta.starTotal||0);
const thr=i=>Math.ceil(STAGES[i].thr*(1-0.15*sup('road')));
const starGain=()=>stage()>=2?Math.floor(Math.sqrt((S.meta.memTotal||0)/20)*Math.pow(1.5,pg('pen'))*peff('astarte')*consKama()):0;
const wantAutoStar=()=>S.autoStar&&stage()>=2&&starGain()>=Math.max(2,S.meta.starTotal||0);
const LOOK={farm:['work','hoe','sprout'],sword:['work','sword',''],book:['sit','book',''],trade:['walk','bag',''],adv:['walk','',''],
 magic:['cast','','spark'],pray:['pray','','spark'],king:['wave','',''],fish:['sit','rod','ripple'],ship:['walk','bag',''],
 music:['strum','lute','note'],knight:['walk','sword',''],wind:['cast','','leaf'],cloud:['walk','bag',''],starread:['sit','scope','spark'],starking:['wave','','spark'],moonfl:['work','','sprout'],dream:['sit','','spark'],weave:['cast','','spark'],tune:['pray','','note']};
const stGold=()=>Math.pow(2,stage()), stExp=()=>Math.pow(1.5,stage());
const STAGE_EV=[[],
 [['港で珍しい貝を見つけた',1],['カモメにパンを取られた',0],['船乗りに海の歌を教わった',0],['灯台のてっぺんから夕日を見た',0]],
 [['王都のパレードを見物した',0],['お城の庭師と友だちになった',0],['王様の落とし物を届けてお礼をもらった',3],['大聖堂の鐘の音で目が覚めた',0]],
 [['雲の上で昼寝した',0],['風に乗る鳥と並んで歩いた',0],['空から金色の羽が降ってきた',2],['虹のはしっこを見つけた',0]],
 [['星の海で流れ星をすくった',2],['遠い星の住人と手紙をやりとりした',0],['銀河の灯台守と夜通し話した',0],['月のうさぎにお餅をもらった',0]],
 [['銀の花で冠を編んだ',0],['月の泉に自分の顔が映った',0],['眠れない月の子に子守歌を歌った',0],['花の蜜が金色に光った',3]],
 [['光の中で、むかしの自分に手をふった',0],['物語の最初の一文字を見つけた',0],['光の糸がほどけて歌になった',0],['まぶしい朝がずっと続いた',2]]];
const ITEMS=[
 {k:'hat',    n:'わら帽子',       c:40,    g:['farm',2],      d:'畑仕事の稼ぎ ×2'},
 {k:'woodsw', n:'木刀',           c:150,   e:['sword',1.5],   d:'素振りの上達 ×1.5'},
 {k:'candle', n:'ろうそく',       c:400,   e:['book',1.5],    d:'読書の上達 ×1.5'},
 {k:'shrine', n:'神殿への寄付',   c:500,   gr:3, mem:0.1,     d:'この人生でもらえる記憶のかけら +10%'},
 {k:'bed',    n:'ふかふかベッド', c:1200,  e:['*',1.2],       d:'すべての上達 ×1.2'},
 {k:'cart',   n:'荷車',           c:3000,  g:['trade',2],     d:'行商の稼ぎ ×2'},
 {k:'armor',  n:'革のよろい',     c:9000,  e:['adv',1.5],     d:'冒険の上達 ×1.5'},
 {k:'orb',    n:'水晶玉',         c:30000, e:['magic',2],     d:'魔法の上達 ×2'},
 {k:'house',  n:'小さな家',       c:80000, e:['*',1.5],       d:'すべての上達 ×1.5'},
 {k:'castle', n:'お城',           c:2e6,   g:['king',2],      d:'王の政務の稼ぎ ×2'},
 {k:'rod',    st:1, n:'よくしなる釣り竿', c:5000,  g:['fish',2],     d:'釣りの稼ぎ ×2'},
 {k:'sail',   st:1, n:'大きな帆',   c:2e5,  g:['ship',2],     d:'船の交易の稼ぎ ×2'},
 {k:'shield', st:2, n:'騎士の盾',   c:1e6,  g:['knight',2],   d:'騎士団の稼ぎ ×2'},
 {k:'balloon',st:3, n:'気球',       c:3e7,  g:['cloud',2],    d:'雲の交易の稼ぎ ×2'},
 {k:'scope',  st:4, n:'大望遠鏡',   c:1e8,  e:['starread',2], d:'星詠みの上達 ×2'},
 {k:'scrown', st:4, n:'星の冠',     c:1e9,  g:['starking',2], d:'星の海の王の稼ぎ ×2'},
 {k:'basket', st:5, n:'銀の花かご', c:1e10, g:['moonfl',2],   d:'月の花摘みの稼ぎ ×2'},
 {k:'spool',  st:6, n:'金の糸巻き', c:1e12, g:['weave',2],    d:'光の紡ぎの稼ぎ ×2'},
];
const il=k=>+(S.life.items[k]||0);
const icost=i=>i.c*Math.pow(i.gr||6,il(i.k));
function itemExp(k){let m=1; ITEMS.forEach(i=>{if(i.e&&(i.e[0]==='*'||i.e[0]===k)){const l=il(i.k); if(l)m*=Math.pow(i.e[1],l)}}); return m}
function itemGold(k){let m=1; ITEMS.forEach(i=>{if(i.g&&i.g[0]===k){const l=il(i.k); if(l)m*=Math.pow(i.g[1],l)}}); return m}
function buyItem(i){const c=icost(i); if(S.life.gold<c)return false; S.life.gold-=c; const l=il(i.k)+1; S.life.items[i.k]=l;
  if(l===1)addLog(`${i.n}を買った`); else if(l%5===0)addLog(`${i.n}を Lv${l} まで強化した`); return true}
const UPS=[
 {k:'life',  n:'長寿の泉',     d:'寿命 +5歳（のびるほど効きめはゆるやかに）', cost:l=>Math.ceil(2*Math.pow(1.4,l))},
 {k:'exp',   n:'早熟の才',     d:'すべての上達 +25%',      cost:l=>4+l*4},
 {k:'inh',   n:'ひいおばあの遺産', d:'生まれた時の金貨が増える', cost:l=>3+l*3},
 {k:'slow',  n:'時の砂時計',   d:'年をとるのが10%ゆっくり（最大5）', cost:l=>8+l*6, max:5},
];
const EVENTS=[
 ['村祭りでおだんごをもらった',0],['道で金貨を拾った',1],['猫に懐かれた',0],['星がとてもきれいな夜だった',0],
 ['旅の吟遊詩人から歌を教わった',0],['畑で大きなかぶが採れた',1],['雨宿りした小屋で昼寝した',0],['友だちと川で魚を釣った',0],
 ['古い宝箱を見つけた',3],['風邪をひいて一日寝ていた',0],['となり村のパン屋さんと仲良くなった',0],['流れ星にお願いをした',0],
];
const TITLES=[[0,'村の子'],[40,'働き者'],[100,'旅人'],[180,'町の名士'],[280,'英雄'],[400,'賢王'],[560,'伝説の人']];

/* ---------- 仲間 ---------- */
const PARTY=[
 {k:'umimi',  n:'ウミミ',     kind:'ペット', img:'img/umimi0.webp', w:52, h:42, face:-1, slot:46, small:1,
  join:'はじめて生まれ変わったとき', cond:M=>M.lifeNo>=2, bonus:'記憶のかけら', eff:l=>1+0.03*l,
  lines:['みゅ〜','（ぴょこぴょこ）','つきのかけら、みっけ！','みゅっ！','（すりすり）']},
 {k:'umine',  n:'海音',       kind:'仲間', img:'img/umine.webp', w:70, h:94, face:1, slot:-92,
  join:'はじめて「港町」に着いたとき', cond:M=>!!M.dex.st[1], bonus:'すべての上達', eff:l=>1+0.05*l,
  lines:['次はどこへ旅しよっか！','水の魔法、見ててね！','ネーニアちゃん、いっしょに行こ！','わぁ、きれいな景色〜！','旅っていいよね！','この先には何があるのかな？']},
 {k:'seiten', n:'青天',       kind:'仲間', img:'img/seiten.webp', w:70, h:94, face:1, slot:96,
  join:'はじめて「王都」に着いたとき', cond:M=>!!M.dex.st[2], bonus:'すべての稼ぎ', eff:l=>1+0.06*l,
  lines:['おつかれさま。今日もがんばったね','……ここ、静かで好き','明日もがんばろうね','ん、ちょっとひとやすみ','ネーニア、むりしすぎないでね']},
 {k:'astarte',n:'アスターテ', kind:'仲間', img:'img/astarte.webp', w:70, h:94, face:-1, slot:-172,
  join:'はじめて星還りしたとき', cond:M=>(M.stats&&M.stats.starAll>0)||(M.vol||1)>1||(M.mythTotal||0)>0, bonus:'星のしずく・星明かり', eff:l=>1+0.03*l,
  lines:['……月がきれい','星還りの道案内なら、まかせて','ふふ、ネーニアは働き者だね','この鎌？ 星を刈るためのもの','夜は好き。静かだから']},
];
const pj=k=>S.meta.party&&S.meta.party[k];
const peff=k=>{const p=pj(k); return p?PARTY.find(x=>x.k===k).eff(p.lv):1};
const bondReq=lv=>120*Math.pow(1.3,lv);

/* ---------- 星座盤 ---------- */
const CONS=[
 {k:'usagi',n:'月うさぎ座',  ox:16, oy:14, stat:'記憶のかけら',  per:'+10%', done:'×2',
  pts:[[10,62],[22,18],[32,58],[46,16],[52,60],[82,70],[104,54]]},
 {k:'tsue', n:'魔女の杖座',  ox:232,oy:10, stat:'すべての上達',  per:'×1.15', done:'×2',
  pts:[[8,104],[28,84],[48,64],[66,44],[82,22],[102,36],[80,52]]},
 {k:'neko', n:'黒猫座',      ox:124,oy:104,stat:'すべての稼ぎ',  per:'×1.2', done:'×2',
  pts:[[16,44],[22,10],[44,30],[64,10],[70,44],[44,64],[104,74]]},
 {k:'kama', n:'大鎌座',      ox:12, oy:162,stat:'星のしずく・星明かり', per:'+10%', done:'×2',
  pts:[[8,112],[28,92],[48,72],[68,52],[58,22],[94,10],[112,40]]},
 {k:'yumi', n:'エルフの弓座',ox:236,oy:156,stat:'寿命',          per:'+2歳', done:'+20歳',
  pts:[[22,8],[6,50],[22,94],[60,104],[60,8],[40,52],[106,52]]},
];
const lit=k=>(S.meta.board&&S.meta.board[k])||0;
const litTotal=()=>CONS.reduce((a,c)=>a+lit(c.k),0);
const consDone=()=>CONS.filter(c=>lit(c.k)>=7).length;
const boardCost=()=>Math.ceil(20*Math.pow(1.36,litTotal()));
function cmul(k,base){const n=lit(k); return Math.pow(base,n)*(n>=7?2:1)}
const consMem=()=>(1+0.1*lit('usagi'))*(lit('usagi')>=7?2:1);
const consKama=()=>(1+0.1*lit('kama'))*(lit('kama')>=7?2:1);
const consLife=()=>2*lit('yumi')+(lit('yumi')>=7?20:0);
function lightStar(c){
  if(!c||lit(c.k)>=7)return false; const cost=boardCost(); if((S.meta.sl||0)<cost)return false;
  S.meta.sl-=cost; S.meta.board[c.k]=lit(c.k)+1; jumpAt=Date.now();
  if(lit(c.k)>=7){addLog(`星座「${c.n}」がつながった！`,true); toast(`星座「${c.n}」が完成しました`)}
  return true;
}
const slRate=()=>{const M=S.meta; const b=Math.sqrt(M.starTotal||0)+2*Math.sqrt(M.pageTotal||0)+3*(M.mythTotal||0); if(!b)return 0;
  return 0.01*b*mythMult()*peff('astarte')*consKama()*Math.pow(2,mpg('name'))*(hasR(75)?2:1)};

/* ---------- 神話 ---------- */
const MPUPS=[
 {k:'grace',  n:'女神の加護',     d:'稼ぎと上達 ×3',                                cost:l=>Math.pow(3,l)},
 {k:'name',   n:'語り継がれる名', d:'星明かり ×2',                                  cost:l=>Math.pow(2,l)},
 {k:'promise',n:'はじまりの約束', d:'神話のあと、しずく+3・頁+1 を持ってはじまる', cost:l=>2+l*2},
 {k:'blood',  n:'英雄の血',       d:'才能が星還り・新しい巻でも消えない',          cost:()=>3, max:1},
];
const mpg=k=>(S.meta.mpup&&S.meta.mpup[k])||0;
const mythMult=()=>(1+0.5*(S.meta.mythTotal||0))*Math.pow(3,mpg('grace'));
const canMyth=()=>(S.meta.pageTotal||0)>=20&&consDone()>=3;
const mythGain=()=>canMyth()?Math.floor(Math.sqrt((S.meta.pageTotal||0)/20)+consDone()/3):0;
const wantAutoMyth=()=>S.autoMyth&&canMyth()&&mythGain()>=Math.max(1,S.meta.mythTotal||0);

/* ---------- 実績 ---------- */
const ACH=[]; (function(){
  const A=(k,n,d,c,cat)=>ACH.push({k,n,d,c,cat});
  [1,5,10,25,50,100,250,500,1000].forEach(x=>A('life'+x,`${x}回目の人生`,`第${x}の人生をむかえる`,M=>M.lifeNo>=x,'人生'));
  [80,100,150,200].forEach(x=>A('age'+x,`${x}歳`,`${x}歳まで生きる`,M=>(M.bestAge||0)>=x,'人生'));
  [3,5,7,9,11,13,15,17,19,21,23].forEach(x=>A('gold'+x,`金貨 ${fmt(Math.pow(10,x))}`,`ひとつの人生で金貨を ${fmt(Math.pow(10,x))} 稼ぐ`,M=>(M.bestEarn||0)>=Math.pow(10,x),'金貨'));
  [10,25,50].forEach(x=>A('item'+x,`道具 Lv${x}`,`どれかの道具を Lv${x} まで強化する`,M=>(M.bestItem||0)>=x,'金貨'));
  ACTS.forEach(a=>[[25,'見習い'],[50,'一人前'],[100,'名人']].forEach(([x,t])=>A(`act_${a.k}_${x}`,`${a.n}の${t}`,`${a.n}を Lv${x} にする`,M=>(M.bestLv&&M.bestLv[a.k]||0)>=x,'活動')));
  STAGES.forEach((s,i)=>{if(i)A('st'+i,`${s.n}へ`,`はじめて「${s.n}」にたどり着く`,M=>!!M.dex.st[i],'舞台')});
  [1,5,10,25,50].forEach(x=>A('star'+x,`星還り ${x}回`,`星還りを ${x}回する`,M=>(M.stats.starAll||0)>=x,'転生'));
  [1,5,10,25].forEach(x=>A('vol'+x,`新しい巻 ${x}回`,`新しい巻を ${x}回はじめる`,M=>(M.stats.volAll||0)>=x,'転生'));
  [1,3,5].forEach(x=>A('myth'+x,`神話 ${x}回`,`神話になる ×${x}`,M=>(M.stats.mythAll||0)>=x,'転生'));
  PARTY.forEach(p=>{A('pj_'+p.k,`${p.n}と出会う`,`${p.n}が${p.kind==='ペット'?'ついてくる':'仲間になる'}`,M=>!!(M.party&&M.party[p.k]),'仲間');
    [10,30].forEach(x=>A(`pb_${p.k}_${x}`,`${p.n}となかよし Lv${x}`,`${p.n}のなかよしを Lv${x} にする`,M=>(M.party&&M.party[p.k]&&M.party[p.k].lv||0)>=x,'仲間'))});
  CONS.forEach(c=>A('cons_'+c.k,c.n,`星座「${c.n}」をつなぐ`,M=>(M.board&&M.board[c.k]||0)>=7,'星座'));
  A('consAll','星座盤の完成','星座をぜんぶつなぐ',M=>CONS.every(c=>(M.board&&M.board[c.k]||0)>=7),'星座');
  [25,50,75,90].forEach(x=>A('dex'+x,`図鑑 ${x}`,`図鑑を ${x}項目うめる`,M=>(M.dexN||0)>=x,'記録'));
  [[1,'1時間'],[6,'6時間'],[24,'1日'],[72,'3日'],[168,'1週間']].forEach(([h,t])=>A('time'+h,`${t}の旅`,`合計の時間が${t}になる`,M=>(M.stats.play+M.stats.away)>=h*3600,'記録'));
  [1,10,50].forEach(x=>A('met'+x,`流れ星 ${x}`,`ふしぎな流れ星を ${x}回見る`,M=>(M.meteors||0)>=x,'記録'));
})();
const ACH_R=[[10,'出来事で拾う金貨 ×3'],[25,'ときどき「ふしぎな流れ星」が流れる'],[50,'寿命 +10歳'],[75,'星明かり ×2'],[100,'稼ぎと上達 ×2、ネーニアに金の冠'],[120,'仲間のなかよしが2倍の速さで上がる']];
const achN=()=>S.meta.achN||0;
const hasR=n=>achN()>=n;
const achMult=()=>(1+0.01*achN())*(hasR(100)?2:1);
function checkAch(){
  const M=S.meta;
  ACTS.forEach(a=>{const v=S.life.lv[a.k]||0; if(v>(M.bestLv[a.k]||0))M.bestLv[a.k]=v});
  if(S.life.age>(M.bestAge||0))M.bestAge=S.life.age;
  if((S.life.earned||0)>(M.bestEarn||0))M.bestEarn=S.life.earned;
  ITEMS.forEach(i=>{const l=il(i.k); if(l>(M.bestItem||0))M.bestItem=l});
  ACH.forEach(a=>{if(!M.ach[a.k]&&a.c(M)){M.ach[a.k]=1; M.achN=(M.achN||0)+1;
    if(!offlineRun){toast(`実績「${a.n}」`); addLog(`実績「${a.n}」を達成した`)}
    const r=ACH_R.find(x=>x[0]===M.achN); if(r){addLog(`ごほうび：${r[1]}`,true); if(!offlineRun)setTimeout(()=>toast(`ごほうび：${r[1]}`),1400)}}});
}
function checkParty(){
  const M=S.meta;
  PARTY.forEach(p=>{if(!M.party[p.k]&&p.cond(M)){M.party[p.k]={lv:0,xp:0};
    addLog(`${p.n}が${p.kind==='ペット'?'ついてくるようになった':'仲間になった'}！`,true);
    if(!offlineRun)toast(`${p.n}が${p.kind==='ペット'?'ついてくるようになった':'仲間になった'}！`)}});
}
let offlineRun=false;

function freshLife(meta){
  const lv={},exp={}; ACTS.forEach(a=>{lv[a.k]=0;exp[a.k]=0});
  return {gold:meta?Math.floor(100*(Math.pow(3,meta.up.inh)-1)/2):0, age:START_AGE, act:'farm', lv, exp, items:{}, seen:{farm:1}, log:[]};
}
let S;
function newGame(){
  const meta={party:{},board:{},sl:0,slTotal:0,myth:0,mythTotal:0,mythNo:0,mpup:{},ach:{},achN:0,bestLv:{},bestAge:0,bestEarn:0,bestItem:0,meteors:0,stats:{started:Date.now(),play:0,away:0,first:{},starAll:0,volAll:0,mythAll:0},page:0,pageTotal:0,vol:1,pup:{},dex:{st:{0:1},ac:{farm:1},ti:{},ev:{}},dexN:2,star:0,starTotal:0,starNo:0,sup:{},mem:0,talent:{},up:{life:0,exp:0,inh:0,slow:0},lives:[],lifeNo:1};
  ACTS.forEach(a=>meta.talent[a.k]=0);
  S={meta,life:freshLife(null),auto:true,autoShop:true,autoReb:true,autoUp:true,autoStar:true,autoPage:true,autoMyth:true,speed:1,dead:false,savedAt:Date.now()};
  addLog('この世に生まれ落ちた。まずは畑を手伝おう',true);
}
function load(){
  try{const raw=localStorage.getItem(SAVE); if(raw){S=JSON.parse(raw); return true}}catch(e){}
  return false;
}
function save(){S.savedAt=Date.now(); try{localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}}

const lifespan=()=>{const b=S.meta.up.life*5+S.life.lv.pray*0.25+15*pg('after')+0.3*(S.life.lv.tune||0)+consLife()+(hasR(50)?10:0); return 50+130*(1-Math.exp(-b/130))};
const ageRate=()=>(1-0.1*S.meta.up.slow)/YEAR_SEC/(1+0.5*(1-Math.exp(-(S.life.lv.wind||0)/50)));
const req=lv=>Math.floor(40*Math.pow(1.13,lv));
const has=k=>!!S.life.items[k];
function expMult(k){
  const L=S.life.lv;
  let m=(1+0.04*S.meta.talent[k])*(1+0.25*S.meta.up.exp)*(1+0.012*L.book*(L.magic>0?1+L.magic*0.04:1));
  m*=itemExp(k);
  if(k==='adv')m*=1+0.02*L.sword;
  m*=1+0.01*(L.music||0); m*=stExp()*starMult()*Math.pow(1.5,sup('bless'))*pageMult()*(1+0.01*(S.meta.dexN||0))*mythMult()*achMult()*peff('umine')*cmul('tsue',1.15);
  return m;
}
function goldRate(k){
  const a=ACTS.find(x=>x.k===k); let g=a.g*(1+0.15*S.life.lv[k]);
  g*=itemGold(k);
  return g*stGold()*starMult()*Math.pow(2,sup('gold'))*pageMult()*(1+0.02*(S.life.lv.dream||0))*mythMult()*achMult()*peff('seiten')*cmul('neko',1.2);
}
const unlocked=a=>stage()>=(a.st||0)&&a.u(S.life.lv);
const totalLv=()=>Object.values(S.life.lv).reduce((a,b)=>a+b,0);
function title(){let t=TITLES[0][1]; TITLES.forEach(([n,x])=>{if(totalLv()>=n)t=x}); return t}

function addLog(text,big){S.life.log.unshift({a:Math.floor(S.life.age),t:text,b:!!big}); if(S.life.log.length>80)S.life.log.pop()}

let autoT=0;
function step(dt){
  if(S.dead){if(S.autoReb){S.rebT=(S.rebT??3)-dt; if(S.rebT<=0)rebirth()} return}
  const L=S.life, prevYear=Math.floor(L.age);
  L.age+=dt*ageRate();
  let a=ACTS.find(x=>x.k===L.act); if(!a||!unlocked(a)){a=ACTS[0];L.act='farm'}
  L.exp[a.k]+=Math.min(1e290,20*expMult(a.k)*dt);
  for(let g=0;g<2000&&L.exp[a.k]>=req(L.lv[a.k]);g++){
    L.exp[a.k]-=req(L.lv[a.k]); L.lv[a.k]++;
    jumpAt=Date.now();
    if(L.lv[a.k]%10===0)addLog(`${a.n}が Lv${L.lv[a.k]} になった`);
  }
  const inc=Math.min(1e300,goldRate(a.k)*dt); L.gold+=inc; L.earned=(L.earned||0)+inc;
  {const M=S.meta, sp=hasR(120)?2:1;
   PARTY.forEach(p=>{const q=M.party[p.k]; if(!q||q.lv>=50)return; q.xp+=dt*sp;
     while(q.lv<50&&q.xp>=bondReq(q.lv)){q.xp-=bondReq(q.lv); q.lv++; if(q.lv%5===0){addLog(`${p.n}とのなかよしが Lv${q.lv} になった`); if(!offlineRun)toast(`${p.n}となかよし Lv${q.lv}`)}}});
   const r=slRate(); if(r){M.sl=(M.sl||0)+r*dt; M.slTotal=(M.slTotal||0)+r*dt}
   if(hasR(25)){M.metT=(M.metT??(90+Math.random()*90))-dt; if(M.metT<=0){M.metT=90+Math.random()*90; meteor()}}}
  ACTS.forEach(x=>{if(!L.seen[x.k]&&unlocked(x)){L.seen[x.k]=1;dexAdd('ac',x.k);addLog(`「${x.n}」ができるようになった！`,true);toast(`「${x.n}」が解放されました`)}});
  if(Math.floor(L.age)>prevYear&&Math.random()<0.3){
    const pool=EVENTS.concat(STAGE_EV[stage()]||[]); const e=pool[Math.floor(Math.random()*pool.length)]; dexAdd('ev',e[0]);
    if(e[1]){const g=Math.ceil((goldRate(L.act)+1)*YEAR_SEC*e[1]*(hasR(10)?3:1));L.gold+=g;addLog(`${e[0]}（金貨+${fmt(g)}）`)}else addLog(e[0]);
  }
  autoT+=dt;
  if(autoT>=1){autoT=0; dexAdd('ti',title()); checkParty(); checkAch(); if(S.auto)autoPick(); if(S.autoShop)autoBuy(); if(S.autoUp)autoUpgrade()}
  if(L.age>=lifespan())die();
}
function autoPick(){
  const L=S.life, open=ACTS.filter(unlocked);
  // gold-poor? keep earning. Otherwise raise the lowest-level thing, favouring newer ones.
  const nextItem=ITEMS.find(i=>!L.items[i.k]);
  let best=null,score=1e9;
  open.forEach((a,i)=>{
    let s=L.lv[a.k]-i*1.5-S.meta.talent[a.k]*0.3;
    if(nextItem&&L.gold<nextItem.c*0.2&&a.g>0)s-=6;
    if(s<score){score=s;best=a}
  });
  if(best)L.act=best.k;
}
function autoUpgrade(){
  let bought=false;
  for(;;){
    let best=null,bc=Infinity;
    UPS.forEach(u=>{const l=S.meta.up[u.k]; if(u.max&&l>=u.max)return; const c=u.cost(l); if(c<bc){bc=c;best=u}});
    if(!best||S.meta.mem<bc)break;
    S.meta.mem-=bc; S.meta.up[best.k]++; bought=true;
  }
  for(;;){
    let best=null,bc=Infinity;
    SUPS.forEach(u=>{const l=sup(u.k); if(u.max&&l>=u.max)return; const c=u.cost(l); if(c<bc){bc=c;best=u}});
    if(!best||(S.meta.star||0)<bc)break;
    S.meta.star-=bc; S.meta.sup[best.k]=sup(best.k)+1; bought=true;
  }
  for(;;){
    let best=null,bc=Infinity;
    PUPS.forEach(u=>{const l=pg(u.k); if(u.max&&l>=u.max)return; const c=u.cost(l); if(c<bc){bc=c;best=u}});
    if(!best||(S.meta.page||0)<bc)break;
    S.meta.page-=bc; S.meta.pup[best.k]=pg(best.k)+1; bought=true;
  }
  for(;;){
    let best=null,bc=Infinity;
    MPUPS.forEach(u=>{const l=mpg(u.k); if(u.max&&l>=u.max)return; const c=u.cost(l); if(c<bc){bc=c;best=u}});
    if(!best||(S.meta.myth||0)<bc)break;
    S.meta.myth-=bc; S.meta.mpup[best.k]=mpg(best.k)+1; bought=true;
  }
  for(let n=0;n<40;n++){const c=CONS.find(c=>lit(c.k)<7); if(!c||!lightStar(c))break; bought=true}
  if(bought&&['reb','starr','page','myth','board'].includes(curTab))renderPane();
}
function autoBuy(){
  for(let n=0;n<60;n++){
    let best=null,bc=Infinity;
    ITEMS.forEach(i=>{if((i.st||0)>stage())return; const c=icost(i); if(c<bc){bc=c;best=i}});
    if(!best||!buyItem(best))break;
  }
}

function die(){
  const L=S.life, M=S.meta;
  const gain=Math.max(1,Math.floor((totalLv()/12+L.age/15+(L.lv.king>0?5:0))*(1+0.02*(L.lv.starread||0))*Math.pow(1.5,sup('memo'))*(1+0.1*(S.meta.pageTotal||0))*(1+0.1*il('shrine'))*peff('umimi')*consMem()));
  ACTS.forEach(a=>{M.talent[a.k]=Math.max(M.talent[a.k],L.lv[a.k])});
  M.mem+=gain; M.memTotal=(M.memTotal||0)+gain;
  const st0=stage(); advanceStage();
  S.stageUp=stage()>st0?STAGES[stage()].n:null;
  if(S.stageUp)toast(`${S.stageUp}にたどり着いた！`);
  if(S.autoUp)autoUpgrade();
  const bestA=ACTS.reduce((b,a)=>L.lv[a.k]>L.lv[b.k]?a:b,ACTS[0]);
  M.lives.unshift({st:st0,no:M.lifeNo,age:Math.floor(L.age),title:title(),best:`${bestA.n} Lv${L.lv[bestA.k]}`,gain});
  if(M.lives.length>30)M.lives.pop();
  addLog(`${Math.floor(L.age)}歳で静かに生涯を終えた`,true);
  S.dead=true; S.lastGain=gain; S.rebT=S.stageUp?6:3; save(); showDeath(); renderPane();
}
function rebirth(){
  if(wantAutoMyth()){becomeMyth();return}
  if(wantAutoPage()){newVolume();return}
  if(wantAutoStar()){starReturn();return}
  S.meta.lifeNo++; S.life=freshLife(S.meta); S.dead=false;
  if(S.stageUp){addLog(`${STAGES[stage()].hi}で、第${S.meta.lifeNo}の人生がはじまった`,true)}
  else addLog(`第${S.meta.lifeNo}の人生がはじまった。前世の記憶がうっすら残っている`,true);
  S.stageUp=null;
  $('veil').hidden=true; renderPane(); save();
}

function starReturn(){
  const M=S.meta, g=starGain(); if(g<=0)return;
  M.star=(M.star||0)+g; M.starTotal=(M.starTotal||0)+g; M.starNo=(M.starNo||0)+1; if(M.stats)M.stats.starAll=(M.stats.starAll||0)+1; markFirst('star');
  M.mem=0; M.memTotal=0; M.stage=pg('open'); UPS.forEach(u=>M.up[u.k]=0); if(!mpg('blood'))ACTS.forEach(a=>M.talent[a.k]=0);
  M.lifeNo++; M.lives.unshift({st:0,no:M.lifeNo-1,age:0,title:'星還り',best:`${M.starNo}回目の星還り`,gain:0});
  S.life=freshLife(M); S.dead=false; S.stageUp=null; applyStage();
  if(S.autoUp)autoUpgrade();
  addLog(`星に還り、しずくを${g}つ授かった。もう一度、歩きはじめる`,true);
  S.starCard=g; S.cardKind='star'; showStarCard(); renderPane(); save();
}
function newVolume(){
  const M=S.meta, g=pageGain(); if(g<=0)return;
  M.page=(M.page||0)+g; M.pageTotal=(M.pageTotal||0)+g; M.vol=(M.vol||1)+1; markFirst('vol'); M.stats.volAll=(M.stats.volAll||0)+1;
  M.star=0; M.starTotal=0; M.starNo=0; M.sup={};
  M.mem=0; M.memTotal=0; M.stage=pg('open'); UPS.forEach(u=>M.up[u.k]=0); if(!mpg('blood'))ACTS.forEach(a=>M.talent[a.k]=0);
  M.lifeNo++; M.lives.unshift({st:0,no:M.lifeNo-1,age:0,title:'新しい巻',best:`第${M.vol}巻へ`,gain:0});
  S.life=freshLife(M); S.dead=false; S.stageUp=null; applyStage();
  if(S.autoUp)autoUpgrade();
  addLog(`年代記の第${M.vol-1}巻を書き終え、物語の頁を${g}枚授かった。第${M.vol}巻のはじまり`,true);
  S.starCard=g; S.cardKind='page'; showStarCard(); renderPane(); save();
}
function becomeMyth(){
  const M=S.meta, g=mythGain(); if(g<=0)return;
  M.myth=(M.myth||0)+g; M.mythTotal=(M.mythTotal||0)+g; M.mythNo=(M.mythNo||0)+1; M.stats.mythAll=(M.stats.mythAll||0)+1; markFirst('myth');
  M.page=0; M.pageTotal=0; M.pup={}; M.vol=1;
  M.star=0; M.starTotal=0; M.starNo=0; M.sup={};
  M.board={}; M.sl=0;
  M.mem=0; M.memTotal=0; M.stage=0; UPS.forEach(u=>M.up[u.k]=0); ACTS.forEach(a=>M.talent[a.k]=0);
  const pr=mpg('promise'); if(pr){M.star+=3*pr; M.starTotal+=3*pr; M.page+=pr; M.pageTotal+=pr}
  M.lifeNo++; M.lives.unshift({st:0,no:M.lifeNo-1,age:0,title:'神話',best:`${M.mythNo}つめの神話`,gain:0});
  S.life=freshLife(M); S.dead=false; S.stageUp=null; applyStage();
  if(S.autoUp)autoUpgrade();
  addLog(`ネーニアの年代記は神話になった。神話の欠片を${g}つ授かり、また村からはじまる`,true);
  S.starCard=g; S.cardKind='myth'; showStarCard(); renderPane(); save();
}
function showStarCard(){
  if(S.cardKind==='myth'){
    $('dcard').innerHTML=`<p class="arrive" style="color:#c0506e">${S.meta.mythNo}つめの神話</p><h2>神話の欠片 +${S.starCard}</h2>
     <p>何冊もの年代記は、ひとつの神話として語り継がれることになりました。星座も、本も、すべて夜空にかえします。</p>
     <p class="gain num">稼ぎと上達 ×${fmt(mythMult())}</p>
     <button class="big-btn" id="starOk">また村から</button>`;
    $('veil').hidden=false;
    const close=()=>{S.starCard=0;$('veil').hidden=true};
    $('starOk').addEventListener('click',close);
    if(S.autoReb)setTimeout(()=>{if(S.starCard)close()},6000);
    return;
  }
  if(S.cardKind==='page'){
    $('dcard').innerHTML=`<p class="arrive" style="color:#b0702a">第${S.meta.vol}巻のはじまり</p><h2>物語の頁 +${S.starCard}</h2>
     <p>しずくも、かけらも、すべて一冊の本に綴じました。新しい巻のネーニアは、前の巻の物語に背中を押されて歩きだします。</p>
     <p class="gain num">稼ぎと上達 ×${fmt(pageMult())}</p>
     <button class="big-btn" id="starOk">ページをめくる</button>`;
    $('veil').hidden=false;
    const close=()=>{S.starCard=0;$('veil').hidden=true};
    $('starOk').addEventListener('click',close);
    if(S.autoReb)setTimeout(()=>{if(S.starCard)close()},5000);
    return;
  }
  $('dcard').innerHTML=`<p class="arrive" style="color:#6a5fc4">星還り</p><h2>星のしずく +${S.starCard}</h2>
   <p>記憶のかけらも才能も星に還しました。そのかわり、しずくの光がずっと背中を押してくれます。</p>
   <p class="gain num">稼ぎと上達 ×${starMult().toFixed(1)}</p>
   <button class="big-btn" id="starOk">村からはじめる</button>`;
  $('veil').hidden=false;
  const close=()=>{S.starCard=0;$('veil').hidden=true};
  $('starOk').addEventListener('click',close);
  if(S.autoReb)setTimeout(()=>{if(S.starCard)close()},5000);
}
function advanceStage(){
  const M=S.meta; M.stage=M.stage||0;
  while(M.stage<STAGES.length-1&&(M.memTotal||0)>=thr(M.stage+1)){M.stage++;dexAdd('st',M.stage);markFirst('s'+M.stage)}
  applyStage();
}
function applyStage(){try{document.documentElement.style.setProperty('--stage',STAGES[stage()].c)}catch(e){}}
let sceneKey='', lastLog=null, bubT=0, jumpAt=0, jumpSeen=0, heroX=0, heroDir=1;
function moveHero(dt){
  if(!S||S.dead)return;
  const lk=LOOK[S.life.act]||LOOK.farm, walking=lk[0]==='walk';
  if(walking){heroX+=heroDir*26*dt; if(heroX>170){heroX=170;heroDir=-1} if(heroX<-170){heroX=-170;heroDir=1}}
  else{heroX+=(0-heroX)*Math.min(1,dt*1.5); if(Math.abs(heroX)<1)heroDir=1}
  $('hero').setAttribute('transform',`translate(${(480+heroX).toFixed(1)} 150)`);
  $('flip').setAttribute('transform',heroDir<0?'scale(-1 1)':'');
  const b=$('bubble'); if(!b.hidden){const sc=$('scene').getBoundingClientRect(), r=$('flip').getBoundingClientRect();
    const left=Math.min(sc.width-b.offsetWidth-8,Math.max(8,r.left-sc.left+r.width*0.62)); b.style.left=left+'px'}
}
const SVGNS='http://www.w3.org/2000/svg';
let partyKey='', partyEls={}, cbT=0, cbNext=12, cbWho=null;
function buildParty(){
  const g=$('party'); g.innerHTML=''; $('petFront').innerHTML=''; partyEls={};
  PARTY.forEach((p,i)=>{if(!pj(p.k))return;
    const m=document.createElementNS(SVGNS,'g'); m.setAttribute('class','pm');
    m.innerHTML=`<g class="pmJump"><g class="pmBob" style="animation-delay:${-i*0.7}s"><g class="pmFlip"><image href="${p.img}" x="${-p.w/2}" y="${-p.h}" width="${p.w}" height="${p.h}"/></g></g></g>`;
    (p.small?$('petFront'):g).appendChild(m);
    partyEls[p.k]={g:m,flip:m.querySelector('.pmFlip'),img:m.querySelector('image'),x:p.slot,dir:1,ft:0,fr:0,p};
  });
}
function updateParty(dt){
  const key=PARTY.filter(p=>pj(p.k)).map(p=>p.k).join();
  if(key!==partyKey){partyKey=key; buildParty()}
  $('party').classList.toggle('gone',!!S.dead); $('petFront').classList.toggle('gone',!!S.dead);
  Object.values(partyEls).forEach(e=>{
    const p=e.p, tx=Math.max(-205,Math.min(205,heroX+p.slot*(heroDir<0?-1:1)));
    const dx=tx-e.x; e.x+=dx*Math.min(1,dt*(p.small?2.4:1.6));
    const moving=Math.abs(dx)>3;
    e.dir=moving?Math.sign(dx):(e.x<heroX?1:-1);
    e.g.setAttribute('transform',`translate(${(480+e.x).toFixed(1)} ${p.small?152:147})`);
    e.flip.setAttribute('transform',e.dir===p.face?'':'scale(-1 1)');
    e.g.classList.toggle('mv',moving&&!p.small);
    if(p.k==='umimi'){e.ft+=dt; const per=moving?.35:1.1;
      if(e.ft>per){e.ft=0; e.fr=(e.fr+1)%2; e.img.setAttribute('href',cbWho==='umimi'?'img/umimi8.webp':`img/umimi${e.fr}.webp`)}}
  });
  // companion chatter
  cbT+=dt; const b=$('cbubble');
  if(!b.hidden&&cbT>4.2){b.hidden=true; cbWho=null}
  if(cbT>cbNext&&!S.dead){
    const ks=Object.keys(partyEls); if(ks.length){const k=ks[Math.floor(Math.random()*ks.length)], p=partyEls[k].p;
      b.innerHTML=`<b>${p.n}</b>${p.lines[Math.floor(Math.random()*p.lines.length)]}`; b.hidden=false; cbWho=k}
    cbT=0; cbNext=22+Math.random()*26;
  }
  if(!b.hidden&&cbWho&&partyEls[cbWho]){const sc=$('scene').getBoundingClientRect(), r=partyEls[cbWho].g.getBoundingClientRect();
    b.style.left=Math.min(sc.width-b.offsetWidth-8,Math.max(8,r.left-sc.left+r.width*0.55))+'px';
    b.style.top=Math.max(4,r.top-sc.top-b.offsetHeight-6)+'px'}
}
function meteor(){
  const M=S.meta; M.meteors=(M.meteors||0)+1;
  const g=Math.ceil((goldRate(S.life.act)+1)*60); S.life.gold+=g; S.life.earned=(S.life.earned||0)+g;
  const r=slRate(); if(r)M.sl=(M.sl||0)+r*30;
  if(offlineRun)return;
  addLog(`ふしぎな流れ星を見た（金貨+${fmt(g)}）`); toast('ふしぎな流れ星！');
  try{const m=document.createElementNS(SVGNS,'g'); m.innerHTML='<path d="M0 0 L46 -22"/><circle r="3"/>'; $('meteors').appendChild(m);
    const x=560+Math.random()*360, y=10+Math.random()*30;
    const an=m.animate([{transform:`translate(${x}px,${y}px)`,opacity:0},{opacity:1,offset:.15},{transform:`translate(${x-420}px,${y+200}px)`,opacity:0}],{duration:1700,easing:'ease-in'});
    an.onfinish=()=>m.remove();}catch(e){}
}
function updateScene(){
  const L=S.life, st=stage(), hero=$('hero');
  const key=L.act+'|'+st+'|'+hasR(100);
  if(key!==sceneKey){
    sceneKey=key;
    const lk=LOOK[L.act]||LOOK.farm;
    hero.setAttribute('class',`pose-${lk[0]} prop-${lk[1]||'none'} fx-${lk[2]||'none'}${L.act==='king'||L.act==='starking'||hasR(100)?' crowned':''}`);
    STAGES.forEach((_,i)=>{$('sc'+i).style.display=i===st?'':'none'});
    $('skyRect').setAttribute('fill',`url(#sky${st})`);
  }
  hero.classList.toggle('gone',!!S.dead);
  if(jumpAt!==jumpSeen&&Date.now()-jumpAt<300){jumpSeen=jumpAt; const j=$('jumpW'); j.classList.remove('jump'); void j.getBoundingClientRect(); j.classList.add('jump')}
  const grow=Math.min(1,0.84+(L.age-START_AGE)*0.03);
  $('heroIn').setAttribute('transform',`scale(${grow.toFixed(3)})`);
  const top=L.log[0];
  if(top&&top!==lastLog){lastLog=top; const b=$('bubble'); b.textContent=top.t.length>30?top.t.slice(0,29)+'…':top.t; b.hidden=false; bubT=Date.now()}
  if(!$('bubble').hidden&&Date.now()-bubT>3800)$('bubble').hidden=true;
}
function makeStars(){
  const g=$('stars'); let h='';
  for(let i=0;i<70;i++){const x=(i*137.5)%960, y=(i*53.7)%130, r=(i%5===0)?1.8:1;
    h+=`<circle class="${i%3?'':'twinkle'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="#fff" style="animation-delay:${-(i%7)*.4}s"/>`}
  g.innerHTML=h;
}
/* ---------- view ---------- */
const $=id=>document.getElementById(id);
function fmt(n){n=Math.floor(n); if(!isFinite(n))return '∞'; if(n<1e4)return n.toLocaleString('ja-JP');
  const U=['万','億','兆','京','垓','秭','穣','溝','澗','正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数'];
  let k=Math.min(U.length,Math.floor(Math.log10(n)/4)); const v=n/Math.pow(10,4*k);
  if(k===U.length&&v>=1e4)return (n/1e68).toExponential(1).replace('e+','e')+'無量大数';
  return (v<10?v.toFixed(1):Math.floor(v))+U[k-1]}

const actEls={};
function buildActs(){
  const box=$('acts'); box.innerHTML='';
  ACTS.forEach(a=>{
    const b=document.createElement('button'); b.className='act'; b.id='act-'+a.k;
    b.innerHTML=`<span class="seal">${a.s}</span><span class="nm">${a.n}<em></em></span><span class="lv num">Lv <b>0</b></span><span class="bar"><i></i></span><span class="lock" hidden></span>`;
    b.addEventListener('click',()=>{if(S.dead||!unlocked(a))return; S.life.act=a.k; if(S.auto){S.auto=false;syncToggles();toast('自分で選んだので、おまかせ行動をオフにしました')} render()});
    box.appendChild(b); actEls[a.k]={b,em:b.querySelector('em'),lv:b.querySelector('.lv b'),bar:b.querySelector('.bar i'),barW:b.querySelector('.bar'),lock:b.querySelector('.lock')};
  });
}
function buildRibbon(){
  const r=$('ribbon'); r.querySelectorAll('.tick').forEach(t=>t.remove());
  const span=lifespan()-START_AGE;
  for(let y=20;y<lifespan();y+=10){const t=document.createElement('span');t.className='tick num';t.style.left=((y-START_AGE)/span*100)+'%';t.textContent=y;r.appendChild(t)}
}
let ribbonLife=0;
function render(){
  const L=S.life, M=S.meta;
  $('gold').textContent=fmt(L.gold); $('mem').textContent=fmt(M.mem);
  $('dropBox').hidden=!(M.starTotal||stage()>=2); $('drop').textContent=fmt(M.star||0);
  $('pageBox').hidden=!(M.pageTotal||stage()>=4); $('pageN').textContent=fmt(M.page||0);
  $('slBox').hidden=!(M.slTotal||slRate()); $('slN').textContent=fmt(M.sl||0);
  $('mythBox').hidden=!(M.mythTotal||canMyth()); $('mythN').textContent=fmt(M.myth||0);
  $('lifeNo').textContent=`${M.mythNo?`神話${M.mythNo}・`:''}${(M.vol||1)>1?`第${M.vol}巻・`:''}第${M.lifeNo}の人生`;
  const ls=lifespan(); if(Math.floor(ls)!==ribbonLife){ribbonLife=Math.floor(ls);buildRibbon()}
  const p=Math.min(1,(L.age-START_AGE)/(ls-START_AGE));
  $('rfill').style.width=(p*100)+'%'; $('rme').style.left=Math.min(96,Math.max(4,p*100))+'%'; $('rme').textContent=Math.floor(L.age)+'歳';
  $('age').textContent=Math.floor(L.age); $('life').textContent=Math.floor(ls);
  $('title').textContent='肩書き：'+title();
  const st=stage(), nx=STAGES[st+1], cur=STAGES[st], tot=M.memTotal||0;
  $('stName').textContent=cur.n;
  const bonus=st?`稼ぎ ×${fmt(stGold())}・上達 ×${stExp().toFixed(1)} ／ `:'';
  if(nx){$('stFill').style.width=Math.max(0,Math.min(100,(tot-thr(st))/(thr(st+1)-thr(st))*100))+'%'; $('stNext').textContent=`${bonus}次の舞台「${nx.n}」まで 記憶のかけら ${fmt(tot)} / ${fmt(thr(st+1))}`}
  else{$('stFill').style.width='100%'; $('stNext').textContent=`${bonus}最後の舞台にたどり着きました`}
  ACTS.forEach(a=>{
    const e=actEls[a.k], ok=unlocked(a);
    const far=(a.st||0)>st+1; e.b.hidden=far; if(far)return;
    e.b.disabled=!ok; e.b.classList.toggle('on',L.act===a.k&&!S.dead);
    e.lv.textContent=L.lv[a.k];
    e.lock.hidden=ok; e.barW.hidden=!ok;
    if(!ok){e.lock.textContent=(a.st||0)>st?`「${STAGES[a.st].n}」に着くと解放`:'解放条件：'+a.uh; e.em.textContent=''}
    else{
      e.bar.style.width=(L.exp[a.k]/req(L.lv[a.k])*100)+'%';
      const tal=M.talent[a.k]?` ・才能${M.talent[a.k]}`:'';
      e.em.textContent=(a.g?`金貨 +${fmt(goldRate(a.k))}/秒`:a.d)+tal;
    }
  });
  if(['shop','reb','starr','page','myth','board'].includes(curTab))refreshButtons();
  if(['party','board'].includes(curTab)){paneT=(paneT||0)+1; if(paneT>10){paneT=0;renderPane()}}
  updateScene();
}

let curTab='shop', paneT=0;
function renderPane(){
  const p=$('pane'); p.innerHTML='';
  if(curTab==='shop'){
    p.insertAdjacentHTML('beforeend','<p class="note">道具は何度でも強化できて、強化するたびに効き目が重なります。そのぶん値段も上がっていきます。生まれ変わると無くなります。</p>');
    ITEMS.filter(i=>(i.st||0)<=stage()).forEach(i=>p.insertAdjacentHTML('beforeend',`<div class="item" data-i="${i.k}"><span class="t">${i.n} <span class="num lvl" style="color:var(--muted);font-weight:500"></span></span><span class="d">${i.d}（強化ごと）</span><button></button></div>`));
    p.querySelectorAll('.item[data-i]').forEach(el=>el.querySelector('button').addEventListener('click',()=>{
      const i=ITEMS.find(x=>x.k===el.dataset.i); if(S.dead)return; if(buyItem(i))render();
    }));
  }else if(curTab==='reb'){
    p.insertAdjacentHTML('beforeend','<p class="note">人生を終えるたびに「記憶のかけら」がたまります。ここで使うと、次の人生からずっと効きます。上達した技は「才能」として残り、次の人生で伸びやすくなります。</p>');
    UPS.forEach(u=>p.insertAdjacentHTML('beforeend',`<div class="item star-up" data-u="${u.k}"><span class="t">${u.n} <span class="num" style="color:var(--muted);font-weight:500">Lv${S.meta.up[u.k]}</span></span><span class="d">${u.d}</span><button></button></div>`));
    p.querySelectorAll('.item').forEach(el=>el.querySelector('button').addEventListener('click',()=>{
      const u=UPS.find(x=>x.k===el.dataset.u), l=S.meta.up[u.k], c=u.cost(l);
      if((u.max&&l>=u.max)||S.meta.mem<c)return;
      S.meta.mem-=c; S.meta.up[u.k]++; renderPane(); render(); save();
    }));
  }else if(curTab==='log'){
    const ul=document.createElement('ul'); ul.className='log';
    S.life.log.forEach(l=>ul.insertAdjacentHTML('beforeend',`<li class="${l.b?'big':''}"><span class="num">${l.a}歳</span>${l.t}</li>`));
    p.appendChild(ul);
  }else if(curTab==='starr'){
    const M=S.meta, g=starGain(), ok=stage()>=2;
    p.insertAdjacentHTML('beforeend',`<p class="note">星還りをすると、記憶のかけら・転生の泉の強化・才能・舞台がぜんぶリセットされて、村からやり直しになります。そのかわり「星のしずく」がもらえます。しずくは手に入れた数だけ、稼ぎと上達がずっと +10% になり、星の祭壇で強化にも使えます。「星還り 自動」がオンなら、もらえるしずくがこれまでの合計以上（最低2）になったときに自動で還ります。</p>
     <div class="item" style="background:color-mix(in srgb,var(--bg) 80%,#6a5fc4)"><span class="t">${ok?`いま還ると しずく +${g}`:'「王都」にたどり着くと星還りできます'}</span>
      <span class="d">これまでのしずく ${fmt(M.starTotal||0)}（稼ぎ・上達 ×${starMult().toFixed(1)}）・星還り ${M.starNo||0}回</span>
      <button id="starGo" ${ok&&g>0?'':'disabled'}>星に還る</button></div>
     <p class="note" style="margin-top:6px">星の祭壇（しずくで強化）</p>`);
    SUPS.forEach(u=>p.insertAdjacentHTML('beforeend',`<div class="item star-up" data-s="${u.k}"><span class="t">${u.n} <span class="num" style="color:var(--muted);font-weight:500">Lv${sup(u.k)}</span></span><span class="d">${u.d}</span><button></button></div>`));
    let armed=0;
    $('starGo').addEventListener('click',e=>{
      if(Date.now()-armed>4000){armed=Date.now();e.target.textContent='もう一度押すと還ります';setTimeout(()=>{if(e.target.isConnected)e.target.textContent='星に還る'},4000);return}
      starReturn();
    });
    p.querySelectorAll('.item[data-s]').forEach(el=>el.querySelector('button').addEventListener('click',()=>{
      const u=SUPS.find(x=>x.k===el.dataset.s), l=sup(u.k), c=u.cost(l);
      if((u.max&&l>=u.max)||(S.meta.star||0)<c)return;
      S.meta.star-=c; S.meta.sup[u.k]=l+1; renderPane(); render(); save();
    }));
  }else if(curTab==='page'){
    const M=S.meta, g=pageGain(), ok=stage()>=4;
    p.insertAdjacentHTML('beforeend',`<p class="note">年代記を一冊書き終えて、新しい巻をはじめます。星のしずく・星の祭壇の強化も含めて、これまでのものはすべてリセットされます。そのかわり「物語の頁」がもらえて、1枚につき稼ぎと上達がずっと +25% になります。頁は下の「物語の机」で強化にも使えます。図鑑とこれまでの記録は消えません。</p>
     <div class="item" style="background:color-mix(in srgb,var(--bg) 80%,#b0702a)"><span class="t">${ok?`いま新しい巻をはじめると 頁 +${g}`:'「星の海」にたどり着くと新しい巻をはじめられます'}</span>
      <span class="d">これまでの頁 ${fmt(M.pageTotal||0)}（稼ぎ・上達 ×${fmt(pageMult())}）・いまは第${M.vol||1}巻</span>
      <button id="pageGo" ${ok&&g>0?'':'disabled'}>新しい巻へ</button></div>
     <p class="note" style="margin-top:6px">物語の机（頁で強化）</p>`);
    PUPS.forEach(u=>p.insertAdjacentHTML('beforeend',`<div class="item star-up" data-p="${u.k}"><span class="t">${u.n} <span class="num" style="color:var(--muted);font-weight:500">Lv${pg(u.k)}</span></span><span class="d">${u.d}</span><button></button></div>`));
    let armed=0;
    $('pageGo').addEventListener('click',e=>{
      if(Date.now()-armed>4000){armed=Date.now();e.target.textContent='もう一度押すとはじまります';setTimeout(()=>{if(e.target.isConnected)e.target.textContent='新しい巻へ'},4000);return}
      newVolume();
    });
    p.querySelectorAll('.item[data-p]').forEach(el=>el.querySelector('button').addEventListener('click',()=>{
      const u=PUPS.find(x=>x.k===el.dataset.p), l=pg(u.k), c=u.cost(l);
      if((u.max&&l>=u.max)||(S.meta.page||0)<c)return;
      S.meta.page-=c; S.meta.pup[u.k]=l+1; renderPane(); render(); save();
    }));
  }else if(curTab==='myth'){
    const M=S.meta, g=mythGain(), ok=canMyth();
    p.insertAdjacentHTML('beforeend',`<p class="note">何冊もの年代記を、ひとつの神話にします。頁・物語の机・星座盤・星明かり・しずく・かけら、ぜんぶリセットされて村からはじまります。そのかわり「神話の欠片」がもらえて、1つにつき稼ぎと上達がずっと +50% になります。仲間・実績・図鑑・記録は消えません。</p>
     <div class="item" style="background:color-mix(in srgb,var(--bg) 80%,#c0506e)"><span class="t">${ok?`いま神話になると 欠片 +${g}`:'物語の頁を 20枚 集めて、星座を3つつなぐと神話になれます'}</span>
      <span class="d">これまでの欠片 ${fmt(M.mythTotal||0)}（稼ぎ・上達 ×${fmt(mythMult())}）・神話 ${M.mythNo||0}回</span>
      <button id="mythGo" ${ok&&g>0?'':'disabled'}>神話になる</button></div>
     <p class="note" style="margin-top:6px">神話の泉（欠片で強化）</p>`);
    MPUPS.forEach(u=>p.insertAdjacentHTML('beforeend',`<div class="item star-up" data-m="${u.k}"><span class="t">${u.n} <span class="num" style="color:var(--muted);font-weight:500">Lv${mpg(u.k)}</span></span><span class="d">${u.d}</span><button></button></div>`));
    let armed=0;
    $('mythGo').addEventListener('click',e=>{
      if(Date.now()-armed>4000){armed=Date.now();e.target.textContent='もう一度押すと神話になります';setTimeout(()=>{if(e.target.isConnected)e.target.textContent='神話になる'},4000);return}
      becomeMyth();
    });
    p.querySelectorAll('.item[data-m]').forEach(el=>el.querySelector('button').addEventListener('click',()=>{
      const u=MPUPS.find(x=>x.k===el.dataset.m), l=mpg(u.k), c=u.cost(l);
      if((u.max&&l>=u.max)||(S.meta.myth||0)<c)return;
      S.meta.myth-=c; S.meta.mpup[u.k]=l+1; renderPane(); render(); save();
    }));
  }else if(curTab==='board'){
    const M=S.meta, r=slRate();
    let svg=`<svg class="boardSvg" viewBox="0 0 360 290" role="img" aria-label="星座盤">`;
    for(let i=0;i<40;i++)svg+=`<circle cx="${(i*83.3)%360}" cy="${(i*47.9)%290}" r=".7" fill="#5a6290"/>`;
    CONS.forEach(c=>{const n=lit(c.k), P=c.pts.map(([x,y])=>[c.ox+x,c.oy+y]);
      svg+=`<g class="${n>=7?'done':''}">`;
      for(let i=1;i<n;i++)svg+=`<line class="ln" x1="${P[i-1][0]}" y1="${P[i-1][1]}" x2="${P[i][0]}" y2="${P[i][1]}"/>`;
      P.forEach(([x,y],i)=>svg+=`<circle class="st ${i<n?'on':i===n?'next':''}" cx="${x}" cy="${y}" r="${i<n?3.4:2.4}"/>`);
      const my=Math.min(...P.map(q=>q[1])), mx=Math.min(...P.map(q=>q[0])); svg+=`<text x="${mx}" y="${my-7}">${c.n} ${n}/7</text></g>`});
    svg+='</svg>';
    p.insertAdjacentHTML('beforeend',`<p class="note">${r?`星明かりが 毎秒 ${r<10?r.toFixed(2):fmt(r)} 降っています。`:'はじめて星還りすると、星明かりが降りはじめます。'}星明かりで星をつなぐと、星座ごとの力がずっと効きます（新しい巻でも消えません。神話になるとリセット）。「転生の泉 自動」がオンなら勝手につながっていきます。</p>${svg}
      <div class="stat"><span>次の星をつなぐのに</span><b>星明かり ${fmt(boardCost())}</b></div>`);
    CONS.forEach(c=>{const n=lit(c.k);
      p.insertAdjacentHTML('beforeend',`<div class="cons" data-c="${c.k}"><span class="t">${c.n} <span class="num" style="color:var(--muted);font-weight:500">${n}/7</span></span><span class="d">${c.stat}：星ひとつ ${c.per}、完成で さらに ${c.done}</span><button></button></div>`)});
    p.querySelectorAll('.cons').forEach(el=>el.querySelector('button').addEventListener('click',()=>{if(lightStar(CONS.find(c=>c.k===el.dataset.c))){renderPane();render();save()}}));
  }else if(curTab==='party'){
    p.insertAdjacentHTML('beforeend','<p class="note">いっしょに旅をする仲間たちです。いっしょにいる時間でなかよしが上がり、そのぶん力を貸してくれます。どんなリセットでも、仲間はずっといっしょです。</p>');
    PARTY.forEach(q=>{const j=pj(q.k);
      p.insertAdjacentHTML('beforeend',`<div class="mate ${j?'':'locked'}"><div class="ph"><img src="${q.img}" alt=""></div>
        <div class="nm">${j?q.n:'？？？'}<span>${j?`${q.kind}・なかよし Lv${j.lv}`:q.kind}</span></div>
        <div class="d">${j?`${q.bonus} ×${q.eff(j.lv).toFixed(2)}${j.lv<50?`（次の Lv まで ${fmtDur(bondReq(j.lv)-j.xp)}）`:'（なかよし最大）'}`:`${q.join}に出会えます`}</div>
        <div class="bar"><i style="width:${j?(j.lv>=50?100:j.xp/bondReq(j.lv)*100):0}%"></i></div></div>`)});
  }else if(curTab==='ach'){
    const M=S.meta, n=achN();
    let h=`<p class="note">実績をひとつ達成するごとに、稼ぎと上達が +1%（いま ×${achMult().toFixed(2)}）。たくさん集めると、ごほうびももらえます。</p>
      <div class="dex-h">達成 <span class="num">${n} / ${ACH.length}</span></div>`;
    ACH_R.forEach(([x,t])=>h+=`<div class="achRow ${n>=x?'ok':''}"><span>${x}個：${t}</span><b>${n>=x?'もらった':`あと${x-n}`}</b></div>`);
    [...new Set(ACH.map(a=>a.cat))].forEach(cat=>{const L=ACH.filter(a=>a.cat===cat);
      h+=`<div class="dex-h">${cat}<span class="num">${L.filter(a=>M.ach[a.k]).length} / ${L.length}</span></div><div class="achGrid">`+
        L.map(a=>`<div class="ach ${M.ach[a.k]?'ok':''}"><b>${a.n}</b>${a.d}</div>`).join('')+'</div>'});
    p.insertAdjacentHTML('beforeend',h);
  }else if(curTab==='dex'){
    const D=S.meta.dex, ev=allEvents();
    const tot=STAGES.length+ACTS.length+TITLES.length+ev.length;
    p.insertAdjacentHTML('beforeend',`<p class="note">これまでに見たもの、たどり着いたものが記録されます。どんなリセットでも消えません。1つ埋まるごとに上達が +1%（いま ×${(1+0.01*(S.meta.dexN||0)).toFixed(2)}）。</p>
      <div class="dex-h">ぜんぶ <span class="num">${S.meta.dexN||0} / ${tot}</span></div>`);
    const sec=(name,list)=>{const n=list.filter(x=>x[1]).length;
      p.insertAdjacentHTML('beforeend',`<div class="dex-h">${name}<span class="num">${n} / ${list.length}</span></div><div class="dex-grid">${list.map(([t,ok])=>`<span class="${ok?'':'no'}">${ok?t:'？？？'}</span>`).join('')}</div>`)};
    sec('舞台',STAGES.map((x,i)=>[x.n,D.st[i]]));
    sec('活動',ACTS.map(a=>[a.n,D.ac[a.k]]));
    sec('称号',TITLES.map(([_,t])=>[t,D.ti[t]]));
    sec('出来事',ev.map(e=>[e[0],D.ev[e[0]]]));
  }else if(curTab==='rec'){
    const M=S.meta, st=M.stats, tot=st.play+st.away;
    const d=new Date(st.started), day=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
    const row=(a,b,c)=>`<div class="stat${c?' big':''}"><span>${a}</span><b>${b}</b></div>`;
    let h=`<p class="note">${st.partial?'記録はこのアップデートから始まっています。':''}画面を開いていた時間と、閉じているあいだに放置で進んだ時間を分けて記録しています。</p>`;
    h+=row('合計の時間',fmtDur(tot),1)+row('画面を開いていた時間',fmtDur(st.play))+row('放置で進んだ時間',fmtDur(st.away))+row('記録をはじめた日',day);
    h+=`<p class="note" style="margin-top:8px">これまでの歩み</p>`;
    h+=row('生きた人生',`${fmt(M.lifeNo)} 回`)+row('星還り',`${fmt(st.starAll||0)} 回`)+row('いまの巻',`第${M.vol||1}巻`)+row('図鑑',`${M.dexN||0} 項目`);
    h+=`<p class="note" style="margin-top:8px">はじめてたどり着いた時間（合計の時間で）</p>`;
    STAGES.forEach((x,i)=>{if(i)h+=row(x.n,st.first['s'+i]!==undefined?fmtDur(st.first['s'+i]):'まだ')});
    h+=row('はじめての星還り',st.first.star!==undefined?fmtDur(st.first.star):'まだ')+row('はじめての新しい巻',st.first.vol!==undefined?fmtDur(st.first.vol):'まだ');
    p.insertAdjacentHTML('beforeend',h);
  }else if(curTab==='save'){
    p.insertAdjacentHTML('beforeend',`<p class="note">データはこのブラウザに自動で保存されています。ページを閉じていても、最大12時間ぶんは次に開いたときにまとめて進みます。別の端末やブラウザに移すとき、念のための控えを取るときは「セーブコード」を使ってください。</p>
     <div class="savebox">
      <button class="big-btn" id="svCopy">セーブコードをコピー</button>
      <textarea id="svCode" rows="4" placeholder="ここにセーブコードを貼りつけて「読み込む」を押す"></textarea>
      <div class="row"><button class="tg" id="svLoad">読み込む</button><button class="tg danger" id="svReset">最初からやり直す</button></div>
     </div>`);
    const ta=$('svCode');
    $('svCopy').addEventListener('click',()=>{
      save(); const code=btoa(unescape(encodeURIComponent(JSON.stringify(S))));
      const fallback=()=>{ta.value=code;ta.focus();ta.select();toast('下の欄のコードを選んでコピーしてください')};
      try{navigator.clipboard.writeText(code).then(()=>toast('セーブコードをコピーしました'),fallback)}catch(e){fallback()}
    });
    $('svLoad').addEventListener('click',()=>{
      try{
        const d=JSON.parse(decodeURIComponent(escape(atob(ta.value.trim()))));
        if(!d||!d.meta||!d.life)throw 0;
        S=d; ribbonLife=0; save(); ta.value='';
        $('veil').hidden=true; if(S.dead)showDeath();
        syncToggles(); render(); toast('セーブコードを読み込みました');
      }catch(e){toast('読み込めませんでした。コードを最後まで貼りつけたか確認してください')}
    });
    let armed=0;
    $('svReset').addEventListener('click',e=>{
      if(Date.now()-armed>4000){armed=Date.now();e.target.textContent='本当に？もう一度押すと消えます';setTimeout(()=>{e.target.textContent='最初からやり直す'},4000);return}
      newGame(); ribbonLife=0; save(); $('veil').hidden=true; syncToggles(); renderPane(); render(); toast('最初からはじめました');
    });
  }else{
    if(!S.meta.lives.length)p.insertAdjacentHTML('beforeend','<p class="note">まだ最初の人生の途中です。寿命をむかえると、ここに記録が残ります。</p>');
    S.meta.lives.forEach(v=>p.insertAdjacentHTML('beforeend',`<div class="past"><b>第${v.no}</b><span>${STAGES[v.st||0].n}・${v.title}・${v.best}</span><span class="num">${v.age}歳 ／ +${v.gain}</span></div>`));
  }
  refreshButtons();
}
function refreshButtons(){
  $('pane').querySelectorAll('.item[data-i]').forEach(el=>{
    const i=ITEMS.find(x=>x.k===el.dataset.i), b=el.querySelector('button'), l=il(i.k), c=icost(i);
    b.disabled=S.life.gold<c||S.dead; b.textContent='金貨 '+fmt(c); el.querySelector('.lvl').textContent=l?'Lv'+l:'';
  });
  $('pane').querySelectorAll('.item[data-m]').forEach(el=>{
    const u=MPUPS.find(x=>x.k===el.dataset.m), l=mpg(u.k), b=el.querySelector('button'), mx=u.max&&l>=u.max;
    b.disabled=mx||(S.meta.myth||0)<u.cost(l); b.textContent=mx?'最大':'欠片 '+u.cost(l);
  });
  $('pane').querySelectorAll('.cons').forEach(el=>{
    const c=CONS.find(x=>x.k===el.dataset.c), b=el.querySelector('button'), full=lit(c.k)>=7;
    b.disabled=full||(S.meta.sl||0)<boardCost(); b.textContent=full?'完成':'星をつなぐ';
  });
  $('pane').querySelectorAll('.item[data-p]').forEach(el=>{
    const u=PUPS.find(x=>x.k===el.dataset.p), l=pg(u.k), b=el.querySelector('button'), mx=u.max&&l>=u.max;
    b.disabled=mx||(S.meta.page||0)<u.cost(l); b.textContent=mx?'最大':'頁 '+u.cost(l);
  });
  $('pane').querySelectorAll('.item[data-s]').forEach(el=>{
    const u=SUPS.find(x=>x.k===el.dataset.s), l=sup(u.k), b=el.querySelector('button'), mx=u.max&&l>=u.max;
    b.disabled=mx||(S.meta.star||0)<u.cost(l); b.textContent=mx?'最大':'しずく '+u.cost(l);
  });
  $('pane').querySelectorAll('.item[data-u]').forEach(el=>{
    const u=UPS.find(x=>x.k===el.dataset.u), l=S.meta.up[u.k], b=el.querySelector('button'), mx=u.max&&l>=u.max;
    b.disabled=mx||S.meta.mem<u.cost(l); b.textContent=mx?'最大':'かけら '+u.cost(l);
  });
}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{
  curTab=t.dataset.t; document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected',x===t)); renderPane();
}));

function showDeath(){
  const v=S.meta.lives[0];
  $('dcard').innerHTML=`${S.stageUp?`<p class="arrive">${S.stageUp}にたどり着いた！</p><p>${STAGES[stage()].hi}。次の人生はここから始まります。</p>`:''}<h2>第${v.no}の人生、おしまい</h2>
   <p>${v.age}歳まで生きて「${v.title}」と呼ばれました。<br>いちばん得意だったのは ${v.best}。</p>
   <p class="gain num">記憶のかけら +${v.gain}</p>
   <p>覚えた技は才能として次の人生に残ります。</p>${S.autoReb?'<p>まもなく自動で生まれ変わります</p>':''}
   <button class="big-btn" id="reborn">生まれ変わる</button>`;
  $('veil').hidden=false; $('reborn').addEventListener('click',rebirth); $('reborn').focus();
}

function syncToggles(){$('tgAuto').setAttribute('aria-pressed',S.auto);$('tgShop').setAttribute('aria-pressed',S.autoShop);$('tgReb').setAttribute('aria-pressed',S.autoReb);$('tgUp').setAttribute('aria-pressed',S.autoUp);$('tgStar').setAttribute('aria-pressed',S.autoStar);$('tgPage').setAttribute('aria-pressed',S.autoPage);$('tgMyth').setAttribute('aria-pressed',S.autoMyth);$('tgSpeed').setAttribute('aria-pressed',S.speed>1)}
$('tgAuto').addEventListener('click',()=>{S.auto=!S.auto;syncToggles()});
$('tgShop').addEventListener('click',()=>{S.autoShop=!S.autoShop;syncToggles()});
$('tgReb').addEventListener('click',()=>{S.autoReb=!S.autoReb;S.rebT=3;syncToggles();if(S.dead)showDeath()});
$('tgUp').addEventListener('click',()=>{S.autoUp=!S.autoUp;syncToggles();if(S.autoUp)autoUpgrade()});
$('tgStar').addEventListener('click',()=>{S.autoStar=!S.autoStar;syncToggles()});
$('tgPage').addEventListener('click',()=>{S.autoPage=!S.autoPage;syncToggles()});
$('tgMyth').addEventListener('click',()=>{S.autoMyth=!S.autoMyth;syncToggles()});
$('tgSpeed').addEventListener('click',()=>{S.speed=S.speed>1?1:2;syncToggles()});

let tt;
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2600)}

/* ---------- boot ---------- */
function start(hotData){
  let loaded=false;
  if(hotData&&hotData.S)S=hotData.S;
  else if(load())loaded=true;
  else newGame();
  if(S.autoReb===undefined)S.autoReb=true;
  if(S.autoUp===undefined)S.autoUp=true;
  if(S.autoStar===undefined)S.autoStar=true;
  S.meta.sup=S.meta.sup||{}; S.meta.star=S.meta.star||0; S.meta.starTotal=S.meta.starTotal||0;
  if(S.autoPage===undefined)S.autoPage=true;
  if(!S.meta.stats)S.meta.stats={started:Date.now(),play:0,away:0,first:{},starAll:S.meta.starNo||0,partial:true};
  if(S.autoMyth===undefined)S.autoMyth=true;
  {const M=S.meta; M.party=M.party||{}; M.board=M.board||{}; M.sl=M.sl||0; M.slTotal=M.slTotal||0; M.myth=M.myth||0; M.mythTotal=M.mythTotal||0; M.mythNo=M.mythNo||0;
   M.mpup=M.mpup||{}; M.ach=M.ach||{}; M.achN=M.achN||0; M.bestLv=M.bestLv||{}; M.meteors=M.meteors||0;
   if(M.bestAge===undefined){M.bestAge=Math.max(S.life.age,...M.lives.map(v=>v.age||0)); ACTS.forEach(a=>M.bestLv[a.k]=Math.max(M.talent[a.k]||0,S.life.lv[a.k]||0))}
   if(M.stats.volAll===undefined)M.stats.volAll=Math.max(0,(M.vol||1)-1);
   if(M.stats.mythAll===undefined)M.stats.mythAll=0;}
  {const M=S.meta; M.pup=M.pup||{}; M.page=M.page||0; M.pageTotal=M.pageTotal||0; M.vol=M.vol||1;
   if(!M.dex){M.dex={st:{},ac:{},ti:{},ev:{}}; M.dexN=0;
     for(let i=0;i<=(M.stage||0);i++)dexAdd('st',i);
     Object.keys(S.life.seen||{}).forEach(k=>dexAdd('ac',k));
     S.life.log.forEach(l=>{allEvents().forEach(e=>{if(l.t.startsWith(e[0]))dexAdd('ev',e[0])})});
     M.lives.forEach(v=>{if(TITLES.some(t=>t[1]===v.title))dexAdd('ti',v.title)});}}
  {const M=S.meta; M.stage=M.stage||0;
   if(M.memTotal===undefined){let spent=0; UPS.forEach(u=>{for(let l=0;l<(M.up[u.k]||0);l++)spent+=u.cost(l)}); M.memTotal=M.mem+spent}
   ACTS.forEach(a=>{if(S.life.lv[a.k]===undefined){S.life.lv[a.k]=0;S.life.exp[a.k]=0} if(M.talent[a.k]===undefined)M.talent[a.k]=0});
   advanceStage();}
  if(loaded){ // offline progress, up to 2 hours
    let away=Math.min(43200,(Date.now()-(S.savedAt||Date.now()))/1000);
    if(away>30&&!(S.dead&&!S.autoReb)){
      const g0=S.life.gold, n0=S.meta.lifeNo, st0=stage(); S.meta.stats.away+=away;
      offlineRun=true; try{while(away>0&&!(S.dead&&!S.autoReb)){step(Math.min(1,away));away-=1}}finally{offlineRun=false}
      const lives=S.meta.lifeNo-n0;
      setTimeout(()=>toast(stage()>st0?`留守のあいだに「${STAGES[stage()].n}」までたどり着きました`
        :lives>0?`留守のあいだに 人生が${lives}回めぐりました`
        :`留守のあいだに 金貨+${fmt(S.life.gold-g0)}`),600);
    }
  }
  checkParty(); checkAch(); makeStars(); lastLog=S.life.log[0]||null;
  buildActs(); syncToggles(); renderPane(); render();
  if(S.dead)showDeath();
  let last=performance.now(), acc=0, saveT=0, recT=0;
  function loop(now){
    let dt=Math.min(0.5,(now-last)/1000); last=now;
    const was=S.dead;
    step(dt*S.speed); moveHero(dt); updateParty(dt); S.meta.stats.play+=dt;
    if(curTab==='rec'){recT+=dt; if(recT>1){recT=0;renderPane()}}
    acc+=dt; saveT+=dt;
    if(acc>0.1){acc=0;render(); if(curTab==='log'&&S.life.log.length&&$('pane').querySelectorAll('li').length!==S.life.log.length)renderPane()}
    if(saveT>5){saveT=0;save()}
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  window.addEventListener('pagehide',save);
}
window.claude?.hot?.snapshot?.(()=>({S}));
window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
})();
