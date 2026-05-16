import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════════════
// 데이터
// ════════════════════════════════════════════════════════════
const ZODIAC_KR=["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
const ZODIAC_EM=["🐭","🐮","🐯","🐰","🐲","🐍","🐴","🐑","🐵","🐔","🐶","🐷"];
const ZODIAC_NUMS={쥐:[3,15,27,39,1,33],소:[4,16,28,40,2,22],호랑이:[5,17,29,41,3,23],토끼:[6,18,30,42,4,24],용:[7,19,31,43,5,25],뱀:[8,20,32,44,6,26],말:[9,21,33,45,7,27],양:[10,22,34,1,8,28],원숭이:[11,23,35,2,9,29],닭:[12,24,36,3,10,30],개:[13,25,37,4,11,31],돼지:[14,26,38,5,12,32]};
const FORTUNE={쥐:["기회가 눈앞에 있습니다","예상치 못한 수입이 생길 날","사람과의 인연이 재물이 됩니다"],소:["성실함이 빛을 발하는 날","느리지만 확실한 행운","오늘은 서두르지 않는 것이 최선"],호랑이:["대담하게 도전하세요! 운이 따릅니다","에너지가 넘치는 하루","승부수를 던질 때입니다"],토끼:["사교적인 만남에서 기회가","작은 것에도 행운이 깃들어","섬세한 판단력이 빛나는 날"],용:["크게 도전하면 크게 얻습니다","오늘의 운은 상승 곡선","자신감을 가지세요"],뱀:["직관을 믿는 날입니다","조용히 기회를 포착하세요","깊이 생각한 후 행동"],말:["활동적인 하루","빠른 결단이 필요","에너지를 집중하세요"],양:["따뜻한 인연이 찾아옵니다","감성이 풍부한 하루","주변의 도움을 받게 됩니다"],원숭이:["기발한 아이디어가 빛납니다","유연하게 대처하면 기회를","예상 밖의 행운"],닭:["꼼꼼함이 성공을 만듭니다","계획대로 움직이면 길합니다","세밀한 부분이 승패를 가릅니다"],개:["신뢰가 재물이 되는 날","충성스러운 인연이 행운을","진심이 통하는 하루"],돼지:["풍요로운 기운이 가득","음식과 관련된 좋은 일","넉넉한 마음이 복을 부릅니다"]};
const DREAM_DICT=[
  {kw:["물","강","바다","비","홍수","파도"],nums:[1,6,11,31,41,16]},
  {kw:["불","화재","폭발","번개","불꽃"],nums:[2,7,12,22,42,32]},
  {kw:["돈","금","지폐","재산","부자"],nums:[3,8,13,23,33,43]},
  {kw:["뱀","구렁이","독사"],nums:[4,9,14,24,44,34]},
  {kw:["돼지","멧돼지"],nums:[5,10,15,25,35,45]},
  {kw:["용","이무기"],nums:[6,11,16,26,36,1]},
  {kw:["호랑이","사자","표범","곰"],nums:[7,12,17,27,37,2]},
  {kw:["하늘","구름","태양","해","빛"],nums:[8,13,18,28,38,3]},
  {kw:["달","별","우주","밤하늘"],nums:[9,14,19,29,39,4]},
  {kw:["죽음","장례","귀신","유령"],nums:[10,15,20,30,40,5]},
  {kw:["결혼","웨딩","신부","신랑"],nums:[11,16,21,31,41,6]},
  {kw:["아이","아기","임신","출산"],nums:[12,17,22,32,42,7]},
  {kw:["산","등산","바위","동굴"],nums:[13,18,23,33,43,8]},
  {kw:["집","아파트","이사"],nums:[14,19,24,34,44,9]},
  {kw:["꽃","나무","풀","숲"],nums:[16,21,26,36,1,11]},
  {kw:["음식","밥","고기","먹"],nums:[17,22,27,37,2,12]},
  {kw:["여행","비행기","배","기차"],nums:[18,23,28,38,3,13]},
  {kw:["보물","다이아","반지"],nums:[24,29,34,44,9,19]},
];

// ════════════════════════════════════════════════════════════
// 유틸
// ════════════════════════════════════════════════════════════
const shuffle=a=>[...a].sort(()=>Math.random()-0.5);
function pickNums(pool,count=6){
  const u=[...new Set(pool)].filter(n=>n>=1&&n<=45);
  const p=shuffle(u).slice(0,count);
  while(p.length<count){const r=Math.floor(Math.random()*45)+1;if(!p.includes(r))p.push(r);}
  return p.sort((a,b)=>a-b);
}
function getZodiac(y){return ZODIAC_KR[(y-1900+1200)%12];}
function getZodiacEm(z){return ZODIAC_EM[ZODIAC_KR.indexOf(z)]||"";}
function getAge(by){return new Date().getFullYear()-by+1;}
function todayStr(){const d=new Date();return`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;}
function ballColor(n){
  if(n<=10)return{bg:"#f9d71c",text:"#000"};
  if(n<=20)return{bg:"#69c8f2",text:"#000"};
  if(n<=30)return{bg:"#ff7272",text:"#fff"};
  if(n<=40)return{bg:"#aaaaaa",text:"#fff"};
  return{bg:"#b0d840",text:"#000"};
}
function matchDream(t){
  const f={};
  DREAM_DICT.forEach(e=>{if(e.kw.some(k=>t.includes(k)))e.nums.forEach(n=>{f[n]=(f[n]||0)+1;});});
  const s=Object.keys(f).map(Number).sort((a,b)=>f[b]-f[a]);
  return pickNums(s.length>=6?s:[...s,...Array.from({length:45},(_,i)=>i+1)]);
}

// SFX
const SFX={
  _ctx:null,
  ctx(){
    if(!this._ctx)try{this._ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
    if(this._ctx&&this._ctx.state==="suspended")this._ctx.resume();
    return this._ctx;
  },
  tone(freq,dur,type='sine',vol=0.2,delay=0){
    const c=this.ctx();if(!c)return;
    const o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);o.type=type;o.frequency.value=freq;
    const t=c.currentTime+delay;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.start(t);o.stop(t+dur+0.05);
  },
  noise(dur=0.08,vol=0.3,cut=2000,delay=0){
    const c=this.ctx();if(!c)return;
    const sz=Math.floor(c.sampleRate*Math.max(dur,0.05));
    const buf=c.createBuffer(1,sz,c.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<sz;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(sz*0.3));
    const src=c.createBufferSource();src.buffer=buf;
    const flt=c.createBiquadFilter();flt.type="bandpass";flt.frequency.value=cut;
    const gain=c.createGain();gain.gain.value=vol;
    src.connect(flt);flt.connect(gain);gain.connect(c.destination);
    src.start(c.currentTime+delay);
  },
  seq(notes,step=0.12,type='sine',vol=0.2){notes.forEach((f,i)=>this.tone(f,step*1.1,type,vol,i*step));},
  boom(baseNum=20){
    // 즉시 폭발음 - setTimeout 없이 Web Audio 스케줄링으로
    const c=this.ctx();if(!c)return;
    const notes=[[523,659,784,1047],[659,784,880,1175],[784,880,1047,1319],[440,554,659,880]];
    const picked=notes[Math.floor(Math.random()*notes.length)];
    picked.forEach((f,i)=>this.tone(f,0.18,"sine",0.22,i*0.08));
    this.tone(100+baseNum*3,0.4,"triangle",0.1,0.05);
    this.noise(0.3,0.35,1200+baseNum*20,0);
  },
  chime(){this.seq([523,659,784,1047],0.12,"sine",0.18);},
  pop(){this.tone(660,0.15,"sine",0.2);this.tone(880,0.1,"sine",0.15,0.1);},
};

// ════════════════════════════════════════════════════════════
// 공통 UI
// ════════════════════════════════════════════════════════════
// 벚꽃 공통
function spawnPetals(){
  return Array.from({length:28},(_,i)=>({
    id:i,
    x:5+Math.random()*90,
    delay:Math.random()*1.8,
    dur:2.5+Math.random()*2,
    size:6+Math.random()*8,
    color:["#ffb7c5","#ffc0cb","#ff9eb5","#ffaab5","#ffe4e8"][i%5],
  }));
}
function PetalOverlay({petals}){
  if(!petals||petals.length===0)return null;
  return(<>
    {petals.map(p=>(
      <div key={p.id} style={{
        position:"fixed",left:`${p.x}%`,top:"-20px",
        width:p.size,height:p.size*0.8,
        borderRadius:"50% 50% 50% 50% / 60% 60% 40% 40%",
        background:`radial-gradient(ellipse at 40% 40%,${p.color}ee,${p.color}99)`,
        pointerEvents:"none",zIndex:9998,
        boxShadow:`0 0 4px ${p.color}66`,
        animation:`petalFall ${p.dur}s ease-in ${p.delay}s forwards`,
      }}/>
    ))}
    <style>{`@keyframes petalFall{
      0%  {top:-20px;transform:rotate(0deg) translateX(0);opacity:1;}
      20% {transform:rotate(72deg) translateX(18px);}
      40% {transform:rotate(144deg) translateX(-18px);}
      60% {transform:rotate(216deg) translateX(22px);}
      80% {transform:rotate(288deg) translateX(-12px);}
      100%{top:110vh;transform:rotate(360deg) translateX(0);opacity:0;}
    }`}</style>
  </>);
}

// 당첨 꿈 팝업
const DREAM_WISHES=[
  {id:"building", em:"🏢", label:"건물주",    msg:"건물주의 꿈 🏢 — 오늘 이 번호가 첫 걸음이 될 거예요"},
  {id:"home",     em:"🏠", label:"내 집 마련", msg:"내 집 마련의 꿈 🏠 — 곧 열쇠를 받을 날이 올 거예요"},
  {id:"travel",   em:"✈️", label:"세계여행",   msg:"세계여행의 꿈 ✈️ — 이 번호가 당신을 하늘로 데려갈 거예요"},
  {id:"invest",   em:"💰", label:"투자·재테크", msg:"현명한 투자자 💰 — 돈이 돈을 버는 날이 올 거예요"},
  {id:"family",   em:"👨‍👩‍👧", label:"가족에게",  msg:"가족을 위한 선물 👨‍👩‍👧 — 가장 따뜻한 당첨이 될 거예요"},
  {id:"study",    em:"🎓", label:"공부·자기계발",msg:"성장하는 나 🎓 — 이 번호로 더 나은 내일을 열어요"},
  {id:"retire",   em:"🌴", label:"조기은퇴",   msg:"자유로운 삶 🌴 — 매일이 휴가인 날을 꿈꿔요"},
  {id:"donate",   em:"💝", label:"기부·나눔",   msg:"나눔의 기쁨 💝 — 가장 빛나는 당첨이 될 거예요"},
];

function WishPopup({onSelect,onClose}){
  const[picked,setPicked]=useState(null);
  const[done,setDone]=useState(false);
  const wish=DREAM_WISHES.find(w=>w.id===picked);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}
      onClick={done?onClose:undefined}>
      <div style={{width:"100%",maxWidth:420,background:"#0f0e1a",
        borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",
        border:"1px solid rgba(249,215,28,0.15)"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,borderRadius:2,background:"#333",margin:"0 auto 16px"}}/>

        {!done?(
          <>
            <div style={{fontSize:15,fontWeight:900,color:"#f9d71c",marginBottom:4,textAlign:"center"}}>
              🎰 1등 당첨되면 뭘 하고 싶으세요?
            </div>
            <div style={{fontSize:11,color:"#555",textAlign:"center",marginBottom:16}}>
              번호와 함께 저장돼요
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {DREAM_WISHES.map(w=>(
                <button key={w.id} onClick={()=>setPicked(w.id)} style={{
                  padding:"14px 8px",borderRadius:12,cursor:"pointer",textAlign:"center",
                  border:`1px solid ${picked===w.id?"#f9d71c":"rgba(255,255,255,0.07)"}`,
                  background:picked===w.id?"rgba(249,215,28,0.1)":"rgba(255,255,255,0.03)",
                  transition:"all .15s"}}>
                  <div style={{fontSize:22,marginBottom:4}}>{w.em}</div>
                  <div style={{fontSize:11,fontWeight:picked===w.id?700:400,
                    color:picked===w.id?"#f9d71c":"#777"}}>{w.label}</div>
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,
                border:"1px solid rgba(255,255,255,0.07)",background:"transparent",
                color:"#555",fontSize:13,cursor:"pointer"}}>건너뛰기</button>
              <button onClick={()=>{if(picked){setDone(true);onSelect(picked);}}} disabled={!picked} style={{
                flex:2,padding:"12px",borderRadius:12,border:"none",
                background:picked?"linear-gradient(135deg,#c8a800,#f9d71c)":"rgba(255,255,255,0.05)",
                color:picked?"#000":"#333",fontSize:13,fontWeight:900,
                cursor:picked?"pointer":"default"}}>💛 저장</button>
            </div>
          </>
        ):(
          <div style={{textAlign:"center",padding:"10px 0 6px"}}>
            <div style={{fontSize:40,marginBottom:12}}>{wish?.em}</div>
            <div style={{fontSize:14,fontWeight:900,color:"#f9d71c",marginBottom:8,lineHeight:1.5}}>
              {wish?.msg}
            </div>
            <div style={{fontSize:11,color:"#555",marginBottom:20}}>번호함에 저장됐어요 ✅</div>
            <button onClick={onClose} style={{padding:"12px 32px",borderRadius:50,border:"none",
              background:"linear-gradient(135deg,#c8a800,#f9d71c)",
              color:"#000",fontSize:14,fontWeight:900,cursor:"pointer"}}>닫기</button>
          </div>
        )}
      </div>
    </div>
  );
}

function CloverPopup({onDone}){
  const[gold,setGold]=useState(false);
  useEffect(()=>{
    const t1=setTimeout(()=>setGold(true),900);
    const t2=setTimeout(()=>onDone(),1800);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      zIndex:9999,pointerEvents:"none"}}>
      <div style={{
        animation:"cloverSpin 0.9s linear infinite",
        fontSize:64,
        filter:gold?"drop-shadow(0 0 20px #f9d71c)":"drop-shadow(0 0 10px #4caf50)",
        transition:"filter 0.4s ease",
      }}>
        {gold?"🌟":"🍀"}
      </div>
      <div style={{marginTop:20,fontSize:13,color:gold?"#f9d71c":"#4caf50",
        fontWeight:700,letterSpacing:1,transition:"color 0.4s"}}>
        {gold?"✨ 행운을 발견했어요!":"행운을 찾는 중..."}
      </div>
      <style>{`@keyframes cloverSpin{0%{transform:rotate(0deg) scale(1)}50%{transform:rotate(180deg) scale(1.2)}100%{transform:rotate(360deg) scale(1)}}`}</style>
    </div>
  );
}

function Balls({nums,size=50}){
  return(
    <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
      {nums.map((n,i)=>{const c=ballColor(n);return(
        <div key={i} style={{width:size,height:size,borderRadius:"50%",
          background:`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:size*0.3,fontWeight:900,color:c.text,
          boxShadow:`0 4px 16px ${c.bg}55`}}>{n}</div>
      );})}
    </div>
  );
}
function NumLine({nums}){
  return(
    <div style={{background:"rgba(249,215,28,0.07)",border:"1px solid rgba(249,215,28,0.2)",
      borderRadius:10,padding:"10px 16px",textAlign:"center",marginTop:10,
      display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>
      {nums.map((n,i)=>{
        const c=ballColor(n);
        return(
          <span key={i} style={{fontSize:16,fontWeight:900,color:c.bg,
            textShadow:`0 0 8px ${c.bg}66`}}>{n}</span>
        );
      })}
    </div>
  );
}
function ActionBtns({nums,mode,onSave,onShare}){
  const[showWish,setShowWish]=useState(false);
  return(
    <>
    {showWish&&<WishPopup
      onSelect={(wishId)=>onSave(nums,mode,wishId)}
      onClose={()=>setShowWish(false)}/>}
    <div style={{display:"flex",gap:8,marginTop:10}}>
      <button onClick={()=>setShowWish(true)} style={{flex:1,padding:"11px",borderRadius:10,
        border:"1px solid rgba(80,200,120,0.25)",background:"rgba(80,200,120,0.08)",
        color:"#50c878",fontSize:13,fontWeight:700,cursor:"pointer"}}>💾 저장</button>
      <button onClick={()=>onShare(nums,mode)} style={{flex:1,padding:"11px",borderRadius:10,
        border:"1px solid rgba(249,215,28,0.2)",background:"rgba(249,215,28,0.06)",
        color:"#f9d71c",fontSize:13,fontWeight:700,cursor:"pointer"}}>📤 공유</button>
    </div>
    </>
  );
}

function ShareModal({data,onClose}){
  if(!data)return null;
  const{nums,mode}=data;
  const text=`🎰 로또 번호\n${mode}\n\n${nums.join('  ')}\n\n이 번호 당첨되면 행운이에요 🍀\n#로또 #행운의번호`;
  const doShare=async()=>{
    if(navigator.share){try{await navigator.share({title:"로또 번호",text});}catch(e){}}
    else{try{await navigator.clipboard.writeText(text);alert("복사됐어요!");}catch(e){}}
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",
      alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:320,borderRadius:20,overflow:"hidden",
        border:"1px solid rgba(249,215,28,0.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:"linear-gradient(160deg,#0d0d28,#1a1535)",padding:"28px 22px 22px",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#555",letterSpacing:3,marginBottom:10}}>🎰 로또 번호</div>
          <div style={{background:"rgba(249,215,28,0.1)",border:"1px solid rgba(249,215,28,0.2)",
            borderRadius:20,padding:"4px 14px",fontSize:12,fontWeight:700,color:"#f9d71c",
            display:"inline-block",marginBottom:18}}>{mode}</div>
          <Balls nums={nums} size={46}/>
          <div style={{marginTop:14,fontSize:17,fontWeight:900,letterSpacing:4,color:"#f9d71c",fontFamily:"monospace"}}>
            {nums.join("  ")}
          </div>
          <div style={{marginTop:14,padding:"10px 0",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
            <div style={{fontSize:10,color:"#444"}}>{todayStr()}</div>
          </div>
        </div>
        <div style={{background:"#0a0a18",padding:"14px 16px",display:"flex",flexDirection:"column",gap:8}}>
          <button onClick={doShare} style={{padding:"13px",borderRadius:12,border:"none",
            background:"linear-gradient(135deg,#f9d71c,#ff9800)",color:"#000",
            fontSize:15,fontWeight:900,cursor:"pointer"}}>📤 공유하기</button>
          <button onClick={onClose} style={{padding:"9px",borderRadius:12,border:"none",
            background:"transparent",color:"#555",fontSize:12,cursor:"pointer"}}>닫기</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 🌅 오늘의 하루
// ════════════════════════════════════════════════════════════
const MOODS=[
  {id:"great",  em:"😊",label:"좋은 하루", nums:[7,17,27,37,1,11]},
  {id:"normal", em:"😐",label:"그저 그럼", nums:[4,14,24,34,2,22]},
  {id:"tired",  em:"😔",label:"피곤한 날", nums:[3,13,23,33,5,15]},
  {id:"excited",em:"🤩",label:"신나는 날", nums:[8,18,28,38,9,19]},
  {id:"angry",  em:"😤",label:"화나는 날", nums:[6,16,26,36,10,20]},
  {id:"scared", em:"😱",label:"무서운 날", nums:[13,22,31,40,4,17]},
];
const WEATHERS=[
  {id:"sunny",em:"☀️",label:"맑음",bonus:5},
  {id:"cloudy",em:"⛅",label:"흐림",bonus:3},
  {id:"rainy",em:"🌧️",label:"비",bonus:7},
  {id:"snow",em:"❄️",label:"눈",bonus:9},
  {id:"wind",em:"💨",label:"바람",bonus:2},
];

// 날씨코드→배경 매핑
// 날씨코드→배경 매핑
function getWeatherTheme(code){
  if(code===null)return{bg:"linear-gradient(160deg,#080818,#101030)",effect:null,label:null};
  if(code<=1)return{bg:"linear-gradient(160deg,#0d1a3a,#1a3060)",effect:"sun",label:"☀️ 맑음"};
  if(code<=3)return{bg:"linear-gradient(160deg,#0a1228,#182040)",effect:"cloud",label:"⛅ 구름"};
  if(code<=49)return{bg:"linear-gradient(160deg,#0a1020,#141828)",effect:"cloud",label:"🌫️ 안개"};
  if(code<=67)return{bg:"linear-gradient(160deg,#050c14,#080f1a)",effect:"rain",label:"🌧️ 비"};
  if(code<=77)return{bg:"linear-gradient(160deg,#0a1428,#0d1c38)",effect:"snow",label:"❄️ 눈"};
  if(code<=82)return{bg:"linear-gradient(160deg,#050c14,#080f1a)",effect:"rain",label:"🌦️ 소나기"};
  return{bg:"linear-gradient(160deg,#04080e,#080c12)",effect:"storm",label:"⛈️ 폭풍"};
}

function TodayScreen({profile,onSave,onShare,onBack}){
  const[mood,setMood]=useState(null);
  const[weather,setWeather]=useState(null);
  const[steps,setSteps]=useState("");
  const[meals,setMeals]=useState(null);
  const[lucky,setLucky]=useState(null);
  const[nums,setNums]=useState(null);
  const[showClover,setShowClover]=useState(false);
  const[petals,setPetals]=useState([]);
  const triggerPetals=()=>{setPetals(spawnPetals());setTimeout(()=>setPetals([]),5000);};
  const[realWeather,setRealWeather]=useState(null);
  const[weatherLabel,setWeatherLabel]=useState(null);
  const[tempInfo,setTempInfo]=useState(null); // {temp, humidity}
  const[ptcls,setPtcls]=useState([]);
  const alive=useRef(true);

  useEffect(()=>{
    alive.current=true;
    const fetchWeather=(lat,lon)=>{
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weathercode,temperature_2m,relative_humidity_2m,precipitation,snowfall,windspeed_10m`)
        .then(r=>r.json()).then(d=>{
          if(!alive.current)return;
          const code=d?.current?.weathercode??0;
          const temp=d?.current?.temperature_2m;
          const humidity=d?.current?.relative_humidity_2m;
          const precipitation=d?.current?.precipitation;
          const snowfall=d?.current?.snowfall;
          const windspeed=d?.current?.windspeed_10m;
          setRealWeather(code);
          if(temp!=null)setTempInfo({temp:Math.round(temp),humidity,precipitation,snowfall,windspeed});
          const t=getWeatherTheme(code);
          setWeatherLabel(t.label);
          if(code<=1)setWeather("sunny");
          else if(code<=49)setWeather("cloudy");
          else if(code<=67)setWeather("rainy");
          else if(code<=77)setWeather("snowy");
          else setWeather("cloudy");
          if(t.effect==="rain"||t.effect==="snow"){
            setPtcls(Array.from({length:28},(_,i)=>({
              id:i,x:Math.random()*100,delay:Math.random()*3,
              size:t.effect==="snow"?3+Math.random()*3:1+Math.random()*0.8,
              dur:t.effect==="snow"?5+Math.random()*4:0.9+Math.random()*0.7,
            })));
          }
        }).catch(()=>{});
    };
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        p=>fetchWeather(p.coords.latitude,p.coords.longitude),
        ()=>fetchWeather(35.1,126.9),{timeout:5000}
      );
    } else fetchWeather(35.1,126.9);
    return()=>{alive.current=false;};
  },[]);

  const theme=getWeatherTheme(realWeather);

  const generate=()=>{
    const pool=[];
    const m=MOODS.find(x=>x.id===mood);
    if(m)pool.push(...m.nums);
    const w=WEATHERS.find(x=>x.id===weather);
    if(w){const b=w.bonus;pool.push(b,b+10>45?b-10:b+10);}
    if(steps){const n=parseInt(steps.replace(/,/g,""));const d=n%100;if(d>=1&&d<=45)pool.push(d);const d2=Math.floor(n/100)%45+1;pool.push(d2);}
    if(meals){pool.push(meals*11>45?meals*5:meals*11,meals*7>45?meals*3:meals*7);}
    if(lucky==="yes"){pool.push(31,42,7);}
    const d=new Date();
    pool.push(d.getDate()>45?d.getDate()%45:d.getDate());
    pool.push(d.getMonth()+1);
    if(profile){const z=getZodiac(parseInt(profile.year));const zn=ZODIAC_NUMS[z];if(zn)pool.push(...zn.slice(0,3));}
    // 온도/습도 반영
    if(tempInfo){
      const t=Math.round(Math.abs(tempInfo.temp))%45+1;
      const h=Math.round(tempInfo.humidity/2)%45+1;
      if(t>=1&&t<=45)pool.push(t);
      if(h>=1&&h<=45)pool.push(h);
    }
    setNums(pickNums(pool));
    SFX.chime();
    triggerPetals();
  };
  const handleGenerate=()=>{setShowClover(true);};

  const canGenerate=mood!==null&&weather!==null;
  const W={minHeight:"100%",background:theme.bg,transition:"background 2s ease",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"20px 16px 32px",boxSizing:"border-box",color:"#fff",position:"relative",overflow:"hidden"};
  const box=(ex={})=>({background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:14,...ex});
  const chip=(sel,color="#f9d71c")=>({
    padding:"10px 14px",borderRadius:12,cursor:"pointer",
    border:`1px solid ${sel?color:"rgba(255,255,255,0.1)"}`,
    background:sel?`${color}18`:"rgba(255,255,255,0.04)",
    color:sel?color:"#777",fontWeight:sel?700:400,fontSize:13,transition:"all .15s"
  });

  return(<div style={W}>
    <PetalOverlay petals={petals}/>
    {/* 날씨 파티클 */}
    {ptcls.length>0&&<div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {ptcls.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:`${p.x}%`,top:"-10px",
          width:p.size,height:theme.effect==="rain"?p.size*8:p.size,
          borderRadius:theme.effect==="snow"?"50%":"1px",
          background:theme.effect==="snow"?"rgba(255,255,255,0.8)":"rgba(105,200,242,0.5)",
          animation:`ptclFall ${p.dur}s linear ${p.delay}s infinite`,
        }}/>
      ))}
    </div>}

    {/* 헤더 */}
    <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,position:"relative",zIndex:1}}>
      <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>🌅 오늘의 하루</div>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",
        borderRadius:50,padding:"7px 14px",fontSize:11,color:"#888",cursor:"pointer"}}>← 홈</button>
    </div>

    {/* 날씨 레이블 */}
    {weatherLabel&&<div style={{width:"100%",maxWidth:420,textAlign:"center",marginBottom:12,position:"relative",zIndex:1}}>
      <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"center",flexWrap:"wrap",
        background:"rgba(255,255,255,0.06)",borderRadius:20,padding:"7px 16px"}}>
        <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>
          {weatherLabel} · 자동선택
        </span>
        {tempInfo&&(<>
          <span style={{fontSize:12,color:"#f9d71c",fontWeight:700}}>🌡️ {tempInfo.temp}°C</span>
          <span style={{fontSize:12,color:"#69c8f2",fontWeight:700}}>💧 {tempInfo.humidity}%</span>
          {tempInfo.precipitation>0&&(
            <span style={{fontSize:12,color:"#69c8f2",fontWeight:700}}>🌧️ {tempInfo.precipitation.toFixed(1)}mm</span>
          )}
          {tempInfo.snowfall>0&&(
            <span style={{fontSize:12,color:"#b0d8ff",fontWeight:700}}>❄️ {tempInfo.snowfall.toFixed(1)}cm</span>
          )}
          {tempInfo.windspeed>10&&(
            <span style={{fontSize:12,color:"#b0d840",fontWeight:700}}>💨 {Math.round(tempInfo.windspeed)}km/h</span>
          )}
        </>)}
      </div>
    </div>}

    <div style={{width:"100%",maxWidth:420,position:"relative",zIndex:1}}>
      {/* 기분 */}
      <div style={{...box({marginBottom:12})}}>
        <div style={{fontSize:12,fontWeight:700,color:"#aaa",marginBottom:10}}>오늘 기분이 어때요?</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {MOODS.map(m=>(<button key={m.id} onClick={()=>setMood(m.id)} style={chip(mood===m.id)}>{m.em} {m.label}</button>))}
        </div>
      </div>

      {/* 날씨 */}
      <div style={{...box({marginBottom:12})}}>
        <div style={{fontSize:12,fontWeight:700,color:"#aaa",marginBottom:10}}>오늘 날씨는?</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {WEATHERS.map(w=>(<button key={w.id} onClick={()=>setWeather(w.id)} style={chip(weather===w.id,"#69c8f2")}>{w.em} {w.label}</button>))}
        </div>
      </div>

      {/* 추가 정보 */}
      <div style={{...box({marginBottom:14})}}>
        <div style={{fontSize:12,fontWeight:700,color:"#aaa",marginBottom:10}}>오늘 더 기록할게요</div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"#666",marginBottom:5}}>👟 오늘 걸음수 (선택)</div>
          <input value={steps} onChange={e=>setSteps(e.target.value.replace(/\D/g,""))} placeholder="예: 8500"
            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
        </div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"#666",marginBottom:5}}>🍚 오늘 밥 몇 번 먹었어요?</div>
          <div style={{display:"flex",gap:8}}>
            {[0,1,2,3,4].map(n=>(<button key={n} onClick={()=>setMeals(n)} style={{
              flex:1,padding:"10px",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:700,
              border:`1px solid ${meals===n?"#f9d71c":"rgba(255,255,255,0.1)"}`,
              background:meals===n?"rgba(249,215,28,0.12)":"rgba(255,255,255,0.04)",
              color:meals===n?"#f9d71c":"#777"}}>{n}번</button>))}
          </div>
        </div>
        <div>
          <div style={{fontSize:11,color:"#666",marginBottom:5}}>🍀 오늘 행운의 순간이 있었나요?</div>
          <div style={{display:"flex",gap:8}}>
            {[["yes","있었어요! 🍀"],["no","없었어요 😅"]].map(([v,l])=>(<button key={v} onClick={()=>setLucky(v)} style={{
              flex:1,padding:"10px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,
              border:`1px solid ${lucky===v?"#50c878":"rgba(255,255,255,0.1)"}`,
              background:lucky===v?"rgba(80,200,120,0.1)":"rgba(255,255,255,0.04)",
              color:lucky===v?"#50c878":"#777"}}>{l}</button>))}
          </div>
        </div>
      </div>

      {showClover&&<CloverPopup onDone={()=>{setShowClover(false);generate();}}/>}
      <button onClick={handleGenerate} disabled={!canGenerate} style={{
        width:"100%",padding:"15px",borderRadius:14,border:"none",
        background:canGenerate?"linear-gradient(135deg,#f9d71c,#ff9800)":"rgba(255,255,255,0.06)",
        color:canGenerate?"#000":"#444",fontSize:16,fontWeight:900,
        cursor:canGenerate?"pointer":"default",
        boxShadow:canGenerate?"0 4px 20px rgba(249,215,28,0.3)":"none",
        transition:"all .2s",marginBottom:14}}>
        🌅 오늘의 번호 뽑기
      </button>

      {nums&&(<div style={{...box({textAlign:"center"}),
        background:"rgba(249,215,28,0.05)",border:"1px solid rgba(249,215,28,0.18)"}}>
        <div style={{fontSize:11,color:"#888",marginBottom:12}}>오늘의 하루로 뽑은 번호</div>
        <Balls nums={nums}/>
        <NumLine nums={nums}/>
        <ActionBtns nums={nums} mode="🌅 오늘의 하루" onSave={onSave} onShare={onShare}/>
      </div>)}
    </div>
    <style>{`
      @keyframes ptclFall{0%{transform:translateY(-10px) rotate(0)}100%{transform:translateY(110vh) rotate(360deg)}}
    `}</style>
  </div>);
}


// ════════════════════════════════════════════════════════════
// 🌙 꿈해몽
// ════════════════════════════════════════════════════════════
const DREAM_FREQ={
  1:13,2:11,3:18,4:11,5:13,6:16,7:16,8:15,9:15,10:12,
  11:13,12:13,13:14,14:9,15:19,16:17,17:13,18:9,19:15,20:12,
  21:12,22:9,23:11,24:14,25:13,26:12,27:22,28:20,29:13,30:15,
  31:14,32:11,33:16,34:11,35:13,36:12,37:17,38:17,39:14,40:13,
  41:10,42:10,43:6,44:10,45:11,
};
const DREAM_MAX_FREQ=22;

function dreamPick(dreamNums){
  const scores={};
  for(let n=1;n<=45;n++){
    scores[n]=(DREAM_FREQ[n]/DREAM_MAX_FREQ)*40+(dreamNums.includes(n)?50:0);
  }
  const sorted=Object.keys(scores).map(Number).sort((a,b)=>scores[b]-scores[a]);
  const top=[...sorted.slice(0,20)].sort(()=>Math.random()-0.5);
  const result=[];
  for(const n of top){if(result.length>=6)break;result.push(n);}
  return result.sort((a,b)=>a-b);
}

function DreamScreen({onSave,onShare,onBack}){
  const TREE={
    "💩 똥꿈":{desc:"재물운이 들어오는 최고의 길몽이에요 💰",
      "💩 똥·대변":[3,8,15,27,33,45],
      "🚽 화장실":[5,13,22,28,36,42],
      "💦 오줌·소변":[7,16,25,31,39,44],
      "🐄 소·황소":[6,14,23,30,38,45],
      "🐖 돼지똥":[4,11,20,28,37,43],
      "🤢 구토·토함":[9,18,27,35,41,3],
    },
    "🐉 동물":{desc:"동물은 꿈에서 힘·변화·직관을 상징해요",
      "🐍 뱀·구렁이":[4,9,14,24,44,34],
      "🐉 용·이무기":[6,11,16,26,36,1],
      "🦁 호랑이·사자":[7,12,17,27,37,2],
      "🐷 돼지·멧돼지":[5,10,15,25,35,45],
      "🐟 물고기":[3,13,23,33,43,8],
      "🐦 새·독수리":[9,19,29,39,4,14],
      "🐝 벌·나비":[11,21,31,41,6,16],
      "🐻 곰·늑대":[8,18,28,38,13,23],
    },
    "💰 재물":{desc:"재물꿈은 현실 풍요와 성취를 암시해요",
      "💵 돈·지폐":[3,8,13,23,33,43],
      "💎 보석·다이아":[24,29,34,44,9,19],
      "🏆 황금·보물":[7,17,27,37,2,12],
      "🎰 복권·당첨":[15,25,35,45,10,20],
      "🌾 수확·풍요":[12,22,32,42,7,17],
      "📈 성공·출세":[16,26,36,1,11,21],
    },
    "🌊 자연":{desc:"자연꿈은 감정의 흐름과 에너지를 담아요",
      "🌊 물·강·바다":[1,6,11,31,41,16],
      "🔥 불·화재":[2,7,12,22,42,32],
      "⛈️ 번개·폭풍":[8,18,28,38,3,13],
      "❄️ 눈·얼음":[14,24,34,44,9,19],
      "🌸 꽃·나무":[16,21,26,36,1,11],
      "🌋 지진·화산":[10,20,30,40,5,15],
    },
    "👥 사람":{desc:"사람꿈은 관계·감정·변화를 반영해요",
      "💀 죽음·장례":[10,15,20,30,40,5],
      "💒 결혼·웨딩":[11,16,21,31,41,6],
      "👶 아이·임신":[12,17,22,32,42,7],
      "😍 연애·키스":[14,24,34,44,9,19],
      "🎓 시험·합격":[13,23,33,43,8,18],
      "👑 왕·대통령":[1,11,21,31,41,6],
    },
    "🏠 장소":{desc:"장소꿈은 현재 내 상황과 심리를 비춰요",
      "🏠 집·아파트":[14,19,24,34,44,9],
      "🏔️ 산·동굴":[25,39,4,17,32,8],
      "🌆 도시·거리":[19,32,43,8,27,44],
      "✈️ 여행·비행기":[18,23,28,38,3,13],
      "🏥 병원·학교":[13,26,4,17,30,41],
      "⛪ 절·교회":[9,19,29,39,14,24],
    },
    "🌙 신비":{desc:"신비꿈은 운명·직감·우주의 메시지예요",
      "🌙 달·별":[27,14,6,33,20,41],
      "☀️ 하늘·태양":[8,13,18,28,38,3],
      "🌈 무지개":[39,23,44,11,36,18],
      "👻 귀신·유령":[3,17,29,42,8,35],
      "🛸 UFO·우주":[44,31,15,38,22,9],
      "🧙 마법·꿈속꿈":[6,16,26,36,1,11],
    },
  };
  const POOP_CAT="💩 똥꿈";
  const cats=Object.keys(TREE);
  const[cat,setCat]=useState(null);
  const[nums,setNums]=useState([]);
  const[picked,setPicked]=useState(null);
  const[sleepTime,setSleepTime]=useState("");  // 취침시간 HH:MM
  const[wakeTime,setWakeTime]=useState("");    // 기상시간 HH:MM
  const floats=["✨","🌙","⭐","💫","🌟","☁️"];

  const[petals,setPetals]=useState([]);
  const triggerPetals=()=>{setPetals(spawnPetals());setTimeout(()=>setPetals([]),5000);};
  const[showClover,setShowClover]=useState(false);
  const[pendingSub,setPendingSub]=useState(null);

  const getTimeParts=(t)=>{
    const[h,m]=(t||"").split(":").map(Number);
    return isNaN(h)||isNaN(m)?null:{h,m};
  };
  const getSleepNums=()=>{
    const pool=[];
    const s=getTimeParts(sleepTime);
    const w=getTimeParts(wakeTime);
    if(s){if(s.h>=1&&s.h<=45)pool.push(s.h);if(s.m>=1&&s.m<=45)pool.push(s.m);}
    if(w){if(w.h>=1&&w.h<=45)pool.push(w.h);if(w.m>=1&&w.m<=45)pool.push(w.m);}
    if(s&&w){
      // 수면 시간(시간 단위) 계산
      let diff=(w.h*60+w.m)-(s.h*60+s.m);
      if(diff<0)diff+=1440; // 자정 넘은 경우
      const hours=Math.round(diff/60);
      if(hours>=1&&hours<=45)pool.push(hours);
    }
    return pool;
  };

  const selectSub=(subKey,vals)=>{setPendingSub({subKey,vals});setShowClover(true);};
  const doSelect=({subKey,vals})=>{
    const timeNums=getSleepNums();
    setPicked(subKey);
    setNums(dreamPick([...vals,...timeNums]));
    SFX.chime();triggerPetals();
  };
  const reset=()=>{setCat(null);setNums([]);setPicked(null);setPendingSub(null);};

  const W={minHeight:"100%",background:"linear-gradient(160deg,#050210,#0a0520,#120830,#0a0520)",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"12px 14px",boxSizing:"border-box",color:"#fff",position:"relative",overflow:"hidden"};

  if(nums.length>0){
    const isPoop=cat===POOP_CAT;
    const dreamNums=TREE[cat][picked];
    return(<div style={W}>
      <PetalOverlay petals={petals}/>
      {showClover&&<CloverPopup onDone={()=>{setShowClover(false);doSelect(pendingSub);}}/>}
      <div style={{textAlign:"center",maxWidth:390,width:"100%",zIndex:1}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,
          background:isPoop?"rgba(139,90,43,0.15)":"rgba(180,74,255,0.1)",
          border:`1px solid ${isPoop?"rgba(139,90,43,0.3)":"rgba(180,74,255,0.2)"}`,
          borderRadius:20,padding:"6px 16px",fontSize:13,
          color:isPoop?"#c8a060":"#b44aff",fontWeight:700,marginBottom:8}}>
          {cat} · {picked}
        </div>
        {isPoop&&<div style={{fontSize:12,color:"#886633",fontWeight:700,marginBottom:8}}>💰 재물운 최고의 꿈!</div>}
        <div style={{background:isPoop?"rgba(139,90,43,0.08)":"rgba(180,74,255,0.06)",
          border:`1px solid ${isPoop?"rgba(139,90,43,0.2)":"rgba(180,74,255,0.15)"}`,
          borderRadius:14,padding:"16px",marginBottom:12}}>
          <div style={{fontSize:11,color:isPoop?"rgba(200,160,96,0.6)":"rgba(180,74,255,0.5)",marginBottom:12,letterSpacing:1}}>꿈해몽 번호</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:10}}>
            {nums.map((n,i)=>{const c=ballColor(n);const isDream=dreamNums.includes(n);return(
              <div key={i} style={{position:"relative"}}>
                <div style={{width:46,height:46,borderRadius:"50%",
                  background:`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,fontWeight:900,color:c.text,
                  boxShadow:isDream?`0 0 0 2.5px ${isPoop?"#c8a060":"#b44aff"},0 4px 16px ${c.bg}55`:`0 4px 16px ${c.bg}44`}}>{n}</div>
                {isDream&&<div style={{position:"absolute",top:-3,right:-3,width:14,height:14,borderRadius:"50%",
                  background:isPoop?"#c8a060":"#b44aff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8}}>
                  {isPoop?"💩":"🌙"}</div>}
              </div>);})}
          </div>
          <NumLine nums={nums}/>
          <div style={{fontSize:10,color:"#555",marginTop:6}}>{isPoop?"💩":"🌙"} = 꿈 직결 · 📊 2025년 당첨 빈도 반영</div>
        </div>
        <ActionBtns nums={nums} mode="🌙 꿈해몽" onSave={onSave} onShare={onShare}/>
        <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"center"}}>
          <button onClick={()=>setNums(dreamPick(dreamNums))} style={{
            background:isPoop?"linear-gradient(135deg,#7a4a00,#c8a060)":"linear-gradient(135deg,#3a0060,#6a0dad)",
            border:"none",borderRadius:50,padding:"11px 20px",fontSize:13,fontWeight:900,color:"#fff",cursor:"pointer"}}>🔄 다시 뽑기</button>
          <button onClick={reset} style={{background:"rgba(255,255,255,0.06)",border:"1px solid #333",
            borderRadius:50,padding:"11px 18px",fontSize:12,color:"#888",cursor:"pointer"}}>← 처음으로</button>
        </div>
      </div>
      <style>{`@keyframes dreamFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>);
  }

  return(<div style={W}>
    {floats.map((f,i)=>(<div key={i} style={{position:"absolute",fontSize:12+i*2,
      left:`${(i*19+3)%95}%`,top:`${(i*27+5)%85}%`,opacity:0.06,pointerEvents:"none"}}>{f}</div>))}
    {showClover&&<CloverPopup onDone={()=>{setShowClover(false);doSelect(pendingSub);}}/>}
    <div style={{width:"100%",maxWidth:390,zIndex:1}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={cat?()=>setCat(null):onBack} style={{background:"none",border:"none",color:"#666",fontSize:13,cursor:"pointer"}}>
          {cat?"← 뒤로":"← 홈"}
        </button>
        <div style={{fontSize:15,fontWeight:900,color:"#b44aff"}}>🌙 꿈해몽</div>
        <div style={{width:40}}/>
      </div>
      <div style={{textAlign:"center",marginBottom:14,padding:"10px 14px",
        background:"rgba(180,74,255,0.05)",borderRadius:12,border:"1px solid rgba(180,74,255,0.1)"}}>
        <div style={{fontSize:13,color:"#b44aff",fontWeight:700,marginBottom:3}}>
          {!cat?"어젯밤 꿈에서 무엇을 봤나요?":cat+" 에서 무엇을 봤나요?"}
        </div>
        <div style={{fontSize:10,color:"#555"}}>꿈 키워드 + 역대 당첨 빈도 조합으로 번호를 뽑아요 · 2025년 기준</div>
      </div>

      {/* 취침/기상 시간 입력 */}
      <div style={{background:"rgba(180,74,255,0.04)",border:"1px solid rgba(180,74,255,0.1)",
        borderRadius:12,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:11,color:"#886699",marginBottom:10,fontWeight:700}}>🌙 수면 시간 (선택)</div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:"#555",marginBottom:4}}>취침</div>
            <input type="time" value={sleepTime} onChange={e=>setSleepTime(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,0.05)",
                border:`1px solid ${sleepTime?"rgba(180,74,255,0.4)":"rgba(255,255,255,0.08)"}`,
                borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:14,
                fontWeight:700,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{color:"#444",fontSize:18,marginTop:14}}>→</div>
          <div style={{flex:1}}>
            <div style={{fontSize:10,color:"#555",marginBottom:4}}>기상</div>
            <input type="time" value={wakeTime} onChange={e=>setWakeTime(e.target.value)}
              style={{width:"100%",background:"rgba(255,255,255,0.05)",
                border:`1px solid ${wakeTime?"rgba(180,74,255,0.4)":"rgba(255,255,255,0.08)"}`,
                borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:14,
                fontWeight:700,outline:"none",boxSizing:"border-box"}}/>
          </div>
          {sleepTime&&wakeTime&&(()=>{
            const s=sleepTime.split(":").map(Number);
            const w=wakeTime.split(":").map(Number);
            let diff=(w[0]*60+w[1])-(s[0]*60+s[1]);
            if(diff<0)diff+=1440;
            const h=Math.floor(diff/60),m=diff%60;
            return(
              <div style={{textAlign:"center",minWidth:52,marginTop:14}}>
                <div style={{fontSize:9,color:"#555"}}>수면</div>
                <div style={{fontSize:13,fontWeight:900,color:"#b44aff"}}>{h}h{m>0?`${m}m`:""}</div>
              </div>
            );
          })()}
        </div>
      </div>
      {!cat&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {cats.map(c=>{
            const isPoop=c===POOP_CAT;
            return(<button key={c} onClick={()=>{SFX.tone(440,0.08,"sine",0.15);setCat(c);}} style={{
              padding:"16px 8px",borderRadius:14,cursor:"pointer",
              border:`1px solid ${isPoop?"rgba(200,160,80,0.35)":"rgba(180,74,255,0.15)"}`,
              background:isPoop?"rgba(139,90,43,0.12)":"rgba(180,74,255,0.05)",
              color:isPoop?"#c8a060":"#ccc",fontSize:isPoop?15:14,fontWeight:700,
              textAlign:"center",transition:"all .2s",
              gridColumn:isPoop?"1 / -1":"auto",
              boxShadow:isPoop?"0 0 20px rgba(200,160,80,0.1)":"none"}}>
              <div>{isPoop?"💩 똥꿈 — 로또 재물운 최고의 꿈":c}</div>
              <div style={{fontSize:9,opacity:0.6,marginTop:4,fontWeight:400}}>
                {TREE[c].desc}
              </div>
            </button>);
          })}
        </div>
      )}
      {cat&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {Object.entries(TREE[cat]).map(([s,vals])=>{
            const isPoop=cat===POOP_CAT;
            return(<button key={s} onClick={()=>{SFX.tone(520,0.08,"sine",0.15);selectSub(s,vals);}} style={{
              padding:"16px 8px",borderRadius:12,cursor:"pointer",
              border:`1px solid ${isPoop?"rgba(200,160,80,0.2)":"rgba(180,74,255,0.15)"}`,
              background:isPoop?"rgba(139,90,43,0.08)":"rgba(180,74,255,0.05)",
              color:isPoop?"#c8a060":"#ccc",fontSize:13,fontWeight:700,
              textAlign:"center",transition:"all .2s"}}>{s}</button>);
          })}
        </div>
      )}
    </div>
    <style>{`@keyframes dreamFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
  </div>);
}


function FortuneScreen({profile,onSave,onShare,onBack}){
  const[now,setNow]=useState(new Date());
  const[nums,setNums]=useState([]);
  const[flipped,setFlipped]=useState(false);
  const[flipping,setFlipping]=useState(false);
  const[petals,setPetals]=useState([]);
  const triggerPetals=()=>{setPetals(spawnPetals());setTimeout(()=>setPetals([]),5000);};
  const[showClover,setShowClover]=useState(false);
  const[stars]=useState(()=>Array.from({length:60},(_,i)=>({
    id:i,x:(i*37+11)%100,y:(i*23+7)%100,
    size:i%7===0?2:i%3===0?1.5:1,twinkle:2+Math.random()*4,delay:Math.random()*3,
  })));
  const alive=useRef(true);

  useEffect(()=>{
    alive.current=true;
    const iv=setInterval(()=>{if(alive.current)setNow(new Date());},1000);
    return()=>{alive.current=false;clearInterval(iv);};
  },[]);

  const hh=now.getHours(),mm=now.getMinutes(),ss=now.getSeconds();
  const yyyy=now.getFullYear(),mo=now.getMonth()+1,dd=now.getDate();
  const y1=parseInt(String(yyyy).slice(0,2)),y2=parseInt(String(yyyy).slice(2,4));
  const toValid=(n)=>n>=1&&n<=45?n:Math.floor(Math.random()*45)+1;

  const generate=()=>{
    const pool=[hh||45,mm||45,ss||45,y1,y2,mo,dd].map(toValid);
    setNums(pickNums(pool));
    setFlipping(true);
    setTimeout(()=>{setFlipped(true);setFlipping(false);SFX.chime();triggerPetals();},600);
  };

  const reset=()=>{setFlipped(false);setFlipping(false);setNums([]);};

  const W={minHeight:"100%",
    background:"linear-gradient(180deg,#020510,#050a20,#030814)",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"12px 14px 24px",boxSizing:"border-box",color:"#fff",
    position:"relative",overflow:"hidden"};

  return(<div style={W}>
    <PetalOverlay petals={petals}/>
    {showClover&&<CloverPopup onDone={()=>{setShowClover(false);generate();}}/>}

    {/* 별자리 배경 */}
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}
      viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {stars.map(s=>(<circle key={s.id} cx={s.x} cy={s.y} r={s.size*0.3} fill="white" opacity={0.5}
        style={{animation:`starTwinkle ${s.twinkle}s ease-in-out ${s.delay}s infinite`}}/>))}
    </svg>

    <div style={{width:"100%",maxWidth:390,zIndex:1}}>
      {/* 헤더 */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#666",fontSize:13,cursor:"pointer"}}>← 홈</button>
        <div style={{fontSize:16,fontWeight:900,color:"#b0d8ff",textShadow:"0 0 12px rgba(150,200,255,0.5)"}}>⭐ 오늘의 운세</div>
        <div style={{width:40}}/>
      </div>

      {/* 실시간 시각 */}
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{fontSize:38,fontWeight:900,letterSpacing:4,color:"#b0d8ff",
          fontFamily:"monospace",textShadow:"0 0 24px rgba(150,200,255,0.5)"}}>
          {String(hh).padStart(2,"0")}:{String(mm).padStart(2,"0")}:{String(ss).padStart(2,"0")}
        </div>
        <div style={{fontSize:12,color:"rgba(150,200,255,0.4)",marginTop:4,letterSpacing:2}}>
          {yyyy}.{String(mo).padStart(2,"0")}.{String(dd).padStart(2,"0")}
        </div>
      </div>

      {/* 타로카드 */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
        <div style={{
          width:200,height:320,perspective:1000,cursor:flipped?"default":"pointer",
        }} onClick={()=>!flipped&&!flipping&&setShowClover(true)}>
          <div style={{
            width:"100%",height:"100%",position:"relative",
            transformStyle:"preserve-3d",
            transition:"transform 0.7s ease",
            transform:flipped?"rotateY(180deg)":"rotateY(0deg)",
          }}>
            {/* 카드 뒷면 (앞에 보이는 면) */}
            <div style={{
              position:"absolute",inset:0,borderRadius:16,
              backfaceVisibility:"hidden",
              background:"linear-gradient(135deg,#0a0520,#1a0840,#0d0630)",
              border:"1px solid rgba(180,150,255,0.3)",
              boxShadow:"0 0 30px rgba(120,80,200,0.3),0 0 60px rgba(120,80,200,0.1)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              overflow:"hidden",
            }}>
              {/* 카드 패턴 */}
              <svg width="100%" height="100%" style={{position:"absolute",inset:0,opacity:0.15}}>
                <defs>
                  <pattern id="cardPat" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="1" fill="#b44aff"/>
                    <line x1="0" y1="10" x2="20" y2="10" stroke="#b44aff" strokeWidth="0.3"/>
                    <line x1="10" y1="0" x2="10" y2="20" stroke="#b44aff" strokeWidth="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#cardPat)"/>
              </svg>
              {/* 카드 테두리 장식 */}
              <div style={{position:"absolute",inset:10,border:"1px solid rgba(180,150,255,0.2)",borderRadius:10}}/>
              <div style={{position:"absolute",inset:16,border:"1px solid rgba(180,150,255,0.1)",borderRadius:6}}/>
              <div style={{fontSize:52,marginBottom:12,animation:"cardFloat 3s ease-in-out infinite"}}>⭐</div>
              <div style={{fontSize:12,color:"rgba(180,150,255,0.7)",fontWeight:700,letterSpacing:2}}>TAP TO REVEAL</div>
              <div style={{fontSize:10,color:"rgba(150,200,255,0.4)",marginTop:6}}>오늘의 운세를 확인하세요</div>
            </div>

            {/* 카드 앞면 (뒤집혀서 보이는 면) */}
            <div style={{
              position:"absolute",inset:0,borderRadius:16,
              backfaceVisibility:"hidden",
              transform:"rotateY(180deg)",
              background:"linear-gradient(135deg,#1a0840,#2a1060,#1a0840)",
              border:"1px solid rgba(180,150,255,0.4)",
              boxShadow:"0 0 40px rgba(120,80,200,0.5)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              padding:16,
            }}>
              {nums.length>0&&(<>
                <div style={{fontSize:11,color:"rgba(180,150,255,0.6)",marginBottom:10,letterSpacing:2}}>
                  {String(hh).padStart(2,"0")}:{String(mm).padStart(2,"0")} 의 운세
                </div>
                <Balls nums={nums} size={38}/>
                <div style={{marginTop:12,display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>
                  {nums.map((n,i)=>{const c=ballColor(n);return(
                    <span key={i} style={{fontSize:13,fontWeight:900,color:c.bg}}>{n}</span>
                  );})}
                </div>
                <div style={{marginTop:14,width:"100%"}}>
                  <ActionBtns nums={nums} mode="⭐ 오늘의운세" onSave={onSave} onShare={onShare}/>
                </div>
              </>)}
            </div>
          </div>
        </div>
      </div>

      {!flipped&&(
        <div style={{textAlign:"center",color:"rgba(150,200,255,0.4)",fontSize:12}}>
          카드를 탭해서 오늘의 운세를 확인하세요 ✨
        </div>
      )}

      {flipped&&(
        <button onClick={reset} style={{
          width:"100%",padding:"13px",borderRadius:14,border:"none",
          background:"rgba(180,150,255,0.1)",
          border:"1px solid rgba(180,150,255,0.2)",
          color:"#b0d8ff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
          🔄 다시 뽑기
        </button>
      )}
    </div>
    <style>{`
      @keyframes starTwinkle{0%,100%{opacity:0.5}50%{opacity:1}}
      @keyframes cardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    `}</style>
  </div>);
}



// ════════════════════════════════════════════════════════════
// 🎆 불꽃놀이
// ════════════════════════════════════════════════════════════
// 전국 로또 명당 데이터 (실제 데이터, 출처: lottis.kr)
const LOTTO_STORES=[
  {id:1, name:"부일카서비스",   addr:"부산 동구",     wins:50,lat:35.1299,lng:129.0437},
  {id:2, name:"스파",           addr:"서울 노원구",   wins:49,lat:37.6560,lng:127.0600},
  {id:3, name:"로또명당인주점", addr:"충남 아산시",   wins:33,lat:36.8031,lng:126.9816},
  {id:4, name:"일등복권편의점", addr:"대구 달서구",   wins:31,lat:35.8474,lng:128.5629},
  {id:5, name:"뉴빅마트",       addr:"부산 기장군",   wins:30,lat:35.2808,lng:129.2197},
  {id:6, name:"로또휴게실",     addr:"경기 용인시",   wins:27,lat:37.2512,lng:127.1310},
  {id:7, name:"로또킹",         addr:"서울 영등포구", wins:22,lat:37.5159,lng:126.9062},
  {id:8, name:"목화휴게소",     addr:"경남 사천시",   wins:21,lat:35.0017,lng:128.0642},
  {id:9, name:"잠실매점",       addr:"서울 송파구",   wins:20,lat:37.5133,lng:127.1002},
  {id:10,name:"오천억복권방",   addr:"광주 서구",     wins:20,lat:35.1547,lng:126.8476},
  {id:11,name:"알리바이",       addr:"광주 광산구",   wins:17,lat:35.1789,lng:126.7953},
  {id:12,name:"나주알리바이",   addr:"전남 나주시",   wins:13,lat:35.0160,lng:126.7103},
  {id:13,name:"천안복권명당",   addr:"충남 천안시",   wins:12,lat:36.8151,lng:127.1139},
  {id:14,name:"대전둔산명당",   addr:"대전 서구",     wins:11,lat:36.3504,lng:127.3845},
  {id:15,name:"전주복권센터",   addr:"전북 전주시",   wins:10,lat:35.8214,lng:127.1088},
  {id:16,name:"순천명당복권",   addr:"전남 순천시",   wins:9, lat:34.9506,lng:127.4872},
  {id:17,name:"여수행운복권",   addr:"전남 여수시",   wins:8, lat:34.7604,lng:127.6622},
  {id:18,name:"목포로또명당",   addr:"전남 목포시",   wins:8, lat:34.8118,lng:126.3922},
  {id:19,name:"GS25양산혜인점",addr:"경남 양산시",   wins:14,lat:35.3558,lng:129.1841},
  {id:20,name:"수원행운복권",   addr:"경기 수원시",   wins:10,lat:37.2636,lng:127.0286},
  {id:21,name:"묵동식품",       addr:"서울 중랑구",   wins:14,lat:37.6062,lng:127.0909},
  {id:22,name:"돈벼락맞는곳",   addr:"부산 동구",     wins:14,lat:35.1260,lng:129.0413},
  {id:23,name:"영화유통",       addr:"울산 남구",     wins:14,lat:35.5389,lng:129.3283},
  {id:24,name:"복권백화점",     addr:"경기 파주시",   wins:16,lat:37.7600,lng:126.7800},
  {id:25,name:"오케이상사",     addr:"서울 서초구",   wins:17,lat:37.5046,lng:127.0057},
];

function locDist(lat1,lng1,lat2,lng2){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function locAngle(lat1,lng1,lat2,lng2){
  const dLng=(lng2-lng1)*Math.PI/180;
  const y=Math.sin(dLng)*Math.cos(lat2*Math.PI/180);
  const x=Math.cos(lat1*Math.PI/180)*Math.sin(lat2*Math.PI/180)-Math.sin(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.cos(dLng);
  return((Math.atan2(y,x)*180/Math.PI)+360)%360;
}
function fmtDist(d){return d<1?`${Math.round(d*1000)}m`:`${d.toFixed(1)}km`;}
function dirLabel(a){return["북","북동","동","남동","남","남서","서","북서"][Math.round(a/45)%8];}
function locPickNums(myLat,myLng,store){
  const dist=locDist(myLat,myLng,store.lat,store.lng);
  const angle=locAngle(myLat,myLng,store.lat,store.lng);
  const dLat=Math.abs(store.lat-myLat);
  const dLng=Math.abs(store.lng-myLng);
  const now=new Date();
  const hh=now.getHours();
  const mm=now.getMinutes();
  const ss=now.getSeconds();

  const distNum=dist<1?Math.round(dist*1000/10):Math.round(dist*10);
  const dirNum=(Math.round(angle/45)%8)+1;
  const latNum=Math.round(dLat*1000);
  const lngNum=Math.round(dLng*1000);
  const winsNum=store.wins;
  // 뽑는 시각 기반 (매번 달라지는 요소)
  const timeNum1=hh%45+1;
  const timeNum2=mm%45+1;
  const timeNum3=ss%45+1;

  const toValid=n=>{if(!n||n<=0)return 45;if(n>45)return n%45||45;return n;};
  const pool=[distNum,dirNum,latNum,lngNum,winsNum,timeNum1,timeNum2,timeNum3].map(toValid).filter(n=>n>=1&&n<=45);
  const u=[...new Set(pool)];
  const p=[...u].sort(()=>Math.random()-0.5).slice(0,6);
  while(p.length<6){const r=Math.floor(Math.random()*45)+1;if(!p.includes(r))p.push(r);}
  return p.sort((a,b)=>a-b);
}

function LocationScreen({onSave,onShare,onBack}){
  const[phase,setPhase]=useState("globe"); // globe → zoomin → locating → map → result
  const[myLoc,setMyLoc]=useState(null);
  const[nearStores,setNearStores]=useState([]);
  const[selected,setSelected]=useState(null);
  const[nums,setNums]=useState([]);
  const[coordInfo,setCoordInfo]=useState(null);
  const[locErr,setLocErr]=useState(false);
  const[petals,setPetals]=useState([]);
  const triggerPetals=()=>{setPetals(spawnPetals());setTimeout(()=>setPetals([]),5000);};

  // 지구본 드래그
  const[globeRot,setGlobeRot]=useState(0);
  const[isDragging,setIsDragging]=useState(false);
  const[hint,setHint]=useState(true);
  const[zoomScale,setZoomScale]=useState(1);
  const[globeOpacity,setGlobeOpacity]=useState(1);
  const[gridOpacity,setGridOpacity]=useState(0);
  const rotRef=useRef(0);
  const velRef=useRef(0);
  const lastX=useRef(0);
  const rafRef=useRef(null);
  const alive=useRef(true);

  // 관성
  useEffect(()=>{
    alive.current=true;
    const inertia=()=>{
      if(!alive.current)return;
      if(!isDragging&&Math.abs(velRef.current)>0.05){
        velRef.current*=0.94;
        rotRef.current=(rotRef.current+velRef.current+360)%360;
        setGlobeRot(rotRef.current);
      }
      rafRef.current=requestAnimationFrame(inertia);
    };
    rafRef.current=requestAnimationFrame(inertia);
    return()=>{alive.current=false;cancelAnimationFrame(rafRef.current);};
  },[isDragging]);

  const onGlobeStart=(e)=>{
    if(phase!=="globe")return;
    setIsDragging(true);setHint(false);
    const x=e.touches?e.touches[0].clientX:e.clientX;
    lastX.current=x;velRef.current=0;
  };
  const onGlobeMove=(e)=>{
    if(!isDragging||phase!=="globe")return;
    const x=e.touches?e.touches[0].clientX:e.clientX;
    const dx=x-lastX.current;
    velRef.current=dx*0.6;
    rotRef.current=(rotRef.current+dx*0.4+360)%360;
    setGlobeRot(rotRef.current);
    lastX.current=x;
  };
  const onGlobeEnd=()=>setIsDragging(false);

  // 확인 버튼 → 줌인 → GPS 감지
  const doConfirm=()=>{
    if(phase!=="globe")return;
    setPhase("zoomin");
    let start=null;const dur=1400;
    const animate=(ts)=>{
      if(!start)start=ts;
      const t=Math.min((ts-start)/dur,1);
      const ease=1-Math.pow(1-t,3);
      setZoomScale(1+ease*10);
      setGlobeOpacity(1-ease);
      setGridOpacity(ease);
      if(t<1)requestAnimationFrame(animate);
      else{
        setPhase("locating");
        // GPS 감지
        const init=(lat,lng,err=false)=>{
          if(!alive.current)return;
          setMyLoc({lat,lng});setLocErr(err);
          const sorted=[...LOTTO_STORES].map(s=>({...s,dist:locDist(lat,lng,s.lat,s.lng)})).sort((a,b)=>a.dist-b.dist).slice(0,6);
          setNearStores(sorted);setPhase("map");
        };
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(
            p=>init(p.coords.latitude,p.coords.longitude),
            ()=>init(37.5665,126.9780,true),{timeout:6000});
        } else init(37.5665,126.9780,true);
      }
    };
    requestAnimationFrame(animate);
  };

  // 지구본 렌더 함수들
  const GR=120,GCX=130,GCY=130;
  const GLAND=[[127,35,22,16,"rgba(60,160,60,0.28)"],[15,48,14,10,"rgba(60,160,60,0.22)"],
    [20,5,13,22,"rgba(60,160,60,0.22)"],[260,45,18,13,"rgba(60,160,60,0.22)"],
    [300,10,12,18,"rgba(60,160,60,0.18)"],[134,25,11,8,"rgba(60,160,60,0.18)"]];

  const renderMeridians=()=>{
    const els=[];
    for(let i=0;i<24;i++){
      const deg=(i*15+globeRot)%360;
      const rad=deg*Math.PI/180;
      const cosVal=Math.cos(rad);
      if(cosVal<-0.05)continue;
      const rx=Math.abs(cosVal)*GR;
      const alpha=Math.max(0,cosVal)*0.3;
      els.push(<ellipse key={i} cx={GCX} cy={GCY} rx={rx} ry={GR}
        fill="none" stroke={`rgba(105,200,242,${alpha})`} strokeWidth="0.6"/>);
    }
    return els;
  };
  const renderParallels=()=>{
    const els=[];
    for(let lat=-80;lat<=80;lat+=10){
      const latRad=lat*Math.PI/180;
      const cosLat=Math.cos(latRad);
      const y=GCY-Math.sin(latRad)*GR;
      const rx=cosLat*GR;
      els.push(<ellipse key={lat} cx={GCX} cy={y} rx={rx} ry={rx*0.06}
        fill="none" stroke={`rgba(105,200,242,${0.1+cosLat*0.12})`} strokeWidth="0.5"/>);
    }
    return els;
  };
  const renderLand=()=>GLAND.map(([lng,lat,rx,ry,color],i)=>{
    const lonRad=((lng+globeRot)*Math.PI/180);
    const latRad=(lat*Math.PI/180);
    const cosLon=Math.cos(lonRad);
    if(cosLon<0.05)return null;
    const x=GCX+Math.sin(lonRad)*GR*0.9;
    const y=GCY-Math.sin(latRad)*GR*0.9;
    return(<ellipse key={i} cx={x} cy={y} rx={rx*cosLon} ry={ry*cosLon*0.55} fill={color} opacity={cosLon}/>);
  });
  const renderPin=()=>{
    const lonRad=((127+globeRot)*Math.PI/180);
    const latRad=(37*Math.PI/180);
    const cosLon=Math.cos(lonRad);
    if(cosLon<0.15)return null;
    const x=GCX+Math.sin(lonRad)*GR*0.9;
    const y=GCY-Math.sin(latRad)*GR*0.9;
    return(<g>
      <circle cx={x} cy={y} r={4*cosLon} fill="#f9d71c"
        style={{filter:"drop-shadow(0 0 6px #f9d71c)"}}/>
      <circle cx={x} cy={y} r={8*cosLon} fill="none"
        stroke="rgba(249,215,28,0.4)" strokeWidth="1"/>
      {cosLon>0.5&&<text x={x} y={y-10*cosLon} textAnchor="middle"
        fontSize={8*cosLon} fill="rgba(249,215,28,0.8)">KR</text>}
    </g>);
  };

  const generate=()=>{
    if(!selected||!myLoc)return;
    const dist=locDist(myLoc.lat,myLoc.lng,selected.lat,selected.lng);
    const angle=locAngle(myLoc.lat,myLoc.lng,selected.lat,selected.lng);
    setCoordInfo({dist,angle,dLat:Math.abs(selected.lat-myLoc.lat),dLng:Math.abs(selected.lng-myLoc.lng)});
    setNums(locPickNums(myLoc.lat,myLoc.lng,selected));
    setPhase("result");SFX.chime();triggerPetals();
  };

  const reset=()=>{setSelected(null);setNums([]);setPhase("map");setCoordInfo(null);};

  // SVG 미니맵
  const MiniMap=()=>{
    if(!myLoc||nearStores.length===0)return null;
    const lats=nearStores.map(s=>s.lat),lngs=nearStores.map(s=>s.lng);
    const minLat=Math.min(...lats,myLoc.lat)-0.2,maxLat=Math.max(...lats,myLoc.lat)+0.2;
    const minLng=Math.min(...lngs,myLoc.lng)-0.2,maxLng=Math.max(...lngs,myLoc.lng)+0.2;
    const MW=360,MH=180;
    const toX=lng=>((lng-minLng)/(maxLng-minLng))*MW;
    const toY=lat=>MH-((lat-minLat)/(maxLat-minLat))*MH;
    const myX=toX(myLoc.lng),myY=toY(myLoc.lat);
    return(
      <svg width="100%" viewBox={`0 0 ${MW} ${MH}`}
        style={{background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)",display:"block",marginBottom:12}}>
        {nearStores.map(s=>{
          const isSel=selected?.id===s.id;
          return(<line key={s.id} x1={myX} y1={myY} x2={toX(s.lng)} y2={toY(s.lat)}
            stroke={isSel?"rgba(249,215,28,0.6)":"rgba(255,255,255,0.06)"}
            strokeWidth={isSel?1.5:0.8} strokeDasharray={isSel?"4,3":"2,4"}/>);
        })}
        {nearStores.map(s=>{
          const isSel=selected?.id===s.id;const r=Math.max(6,Math.min(11,s.wins/5));
          const x=toX(s.lng),y=toY(s.lat);
          return(<g key={s.id} onClick={()=>setSelected(s)} style={{cursor:"pointer"}}>
            {isSel&&<circle cx={x} cy={y} r={r+5} fill="rgba(249,215,28,0.15)"/>}
            <circle cx={x} cy={y} r={r} fill={isSel?"#f9d71c":"rgba(255,150,0,0.7)"}
              stroke={isSel?"#fff":"rgba(255,255,255,0.2)"} strokeWidth={isSel?1.5:1}/>
            <text x={x} y={y-r-3} textAnchor="middle" fontSize={7}
              fill={isSel?"#f9d71c":"rgba(255,255,255,0.5)"} fontWeight={isSel?"bold":"normal"}>
              {s.name.slice(0,4)}
            </text>
          </g>);
        })}
        <circle cx={myX} cy={myY} r={10} fill="rgba(105,200,242,0.2)" stroke="rgba(105,200,242,0.5)" strokeWidth={1}/>
        <circle cx={myX} cy={myY} r={5} fill="#69c8f2"/>
        <text x={myX} y={myY+16} textAnchor="middle" fontSize={7} fill="#69c8f2">나</text>
      </svg>
    );
  };

  const W={minHeight:"100%",background:"linear-gradient(180deg,#010208,#030816,#05122a)",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"10px 14px 24px",boxSizing:"border-box",color:"#fff",
    position:"relative",overflow:"hidden"};

  return(<div style={W}
    onMouseMove={onGlobeMove} onMouseUp={onGlobeEnd} onMouseLeave={onGlobeEnd}
    onTouchMove={onGlobeMove} onTouchEnd={onGlobeEnd}>
    <PetalOverlay petals={petals}/>

    {/* 별 (지구본 phase) */}
    {(phase==="globe"||phase==="zoomin")&&Array.from({length:50},(_,i)=>(
      <div key={i} style={{position:"fixed",
        left:`${(i*37+11)%100}%`,top:`${(i*23+7)%100}%`,
        width:i%7===0?2:1,height:i%7===0?2:1,borderRadius:"50%",
        background:`rgba(255,255,255,${0.1+((i*7)%10)*0.05})`,
        pointerEvents:"none",zIndex:0}}/>
    ))}

    {/* 지구본 phase */}
    {(phase==="globe"||phase==="zoomin")&&(
      <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",zIndex:2,
        opacity:globeOpacity,transform:`scale(${zoomScale})`,transformOrigin:"center center"}}>

        <div style={{fontSize:12,color:"rgba(105,200,242,0.6)",marginBottom:16,
          letterSpacing:3,fontWeight:700}}>📍 우리동네 명당</div>

        <svg width={GCX*2} height={GCY*2}
          onMouseDown={onGlobeStart} onTouchStart={onGlobeStart}
          style={{cursor:isDragging?"grabbing":"grab",overflow:"visible"}}>
          <defs>
            <radialGradient id="gbg" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1e4a8c"/>
              <stop offset="45%" stopColor="#0d2040"/>
              <stop offset="100%" stopColor="#040d1a"/>
            </radialGradient>
            <radialGradient id="gshine" cx="30%" cy="25%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
            </radialGradient>
            <radialGradient id="gshadow" cx="75%" cy="70%" r="40%">
              <stop offset="0%" stopColor="rgba(0,0,20,0.6)"/>
              <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
            </radialGradient>
            <radialGradient id="grim" cx="50%" cy="50%" r="50%">
              <stop offset="80%" stopColor="rgba(105,200,242,0)"/>
              <stop offset="100%" stopColor="rgba(105,200,242,0.12)"/>
            </radialGradient>
            <clipPath id="gclip"><circle cx={GCX} cy={GCY} r={GR}/></clipPath>
          </defs>
          <circle cx={GCX} cy={GCY} r={GR+18} fill="url(#grim)"/>
          <circle cx={GCX} cy={GCY} r={GR+8} fill="none" stroke="rgba(105,200,242,0.08)" strokeWidth="8"/>
          <circle cx={GCX} cy={GCY} r={GR} fill="url(#gbg)"/>
          <g clipPath="url(#gclip)">
            {renderParallels()}{renderMeridians()}{renderLand()}{renderPin()}
            <circle cx={GCX} cy={GCY} r={GR} fill="url(#gshadow)"/>
            <circle cx={GCX} cy={GCY} r={GR} fill="url(#gshine)"/>
          </g>
          <circle cx={GCX} cy={GCY} r={GR} fill="none" stroke="rgba(105,200,242,0.2)" strokeWidth="1"/>
        </svg>

        {hint&&phase==="globe"&&(
          <div style={{marginTop:14,display:"flex",alignItems:"center",gap:8,
            color:"rgba(105,200,242,0.45)",fontSize:12}}>
            <span style={{display:"inline-block",animation:"gswing 1.5s ease-in-out infinite"}}>👈</span>
            <span>좌우로 돌려보세요</span>
            <span style={{display:"inline-block",animation:"gswing 1.5s ease-in-out infinite reverse"}}>👉</span>
          </div>
        )}
        {phase==="globe"&&(
          <button onClick={doConfirm} style={{
            marginTop:20,padding:"13px 32px",borderRadius:50,border:"none",
            background:"linear-gradient(135deg,#0d4a7a,#1a7ac8)",
            color:"#69c8f2",fontSize:14,fontWeight:900,cursor:"pointer",
            boxShadow:"0 4px 24px rgba(105,200,242,0.25)",letterSpacing:1}}>
            📍 이 위치로 확인
          </button>
        )}
      </div>
    )}

    {/* 격자 좌표선 배경 */}
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,
      opacity:phase==="globe"||phase==="zoomin"?gridOpacity:1,transition:"opacity 0.5s"}}>
      <svg width="100%" height="100%" style={{position:"absolute",inset:0}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(105,200,242,0.07)" strokeWidth="0.8"/>
          </pattern>
          <pattern id="gridLarge" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(105,200,242,0.12)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <rect width="100%" height="100%" fill="url(#gridLarge)"/>
        {[0,25,50,75,100].map((y,i)=>(
          <text key={i} x="4" y={`${y}%`} fontSize="7" fill="rgba(105,200,242,0.2)" fontFamily="monospace">
            {(35.5-(i*0.3)).toFixed(1)}°N
          </text>
        ))}
        {[10,30,50,70,90].map((x,i)=>(
          <text key={i} x={`${x}%`} y="99%" fontSize="7" fill="rgba(105,200,242,0.2)" fontFamily="monospace">
            {(126.5+(i*0.3)).toFixed(1)}°E
          </text>
        ))}
      </svg>
    </div>

    {/* 헤더 (map/result/locating phase) */}
    {phase!=="globe"&&phase!=="zoomin"&&(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",maxWidth:400,marginBottom:12,position:"relative",zIndex:1}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#666",fontSize:13,cursor:"pointer"}}>← 홈</button>
      <span style={{fontSize:13,fontWeight:900,color:"#f9d71c"}}>📍 우리동네 명당</span>
      <div style={{width:40}}/>
    </div>
    )}

    <div style={{width:"100%",maxWidth:400,position:"relative",zIndex:1}}>
      {phase==="locating"&&(
        <div style={{textAlign:"center",padding:"60px 0"}}>
          <div style={{fontSize:40,marginBottom:12}}>📍</div>
          <div style={{fontSize:13,color:"#555"}}>내 위치 확인 중...</div>
        </div>
      )}

      {phase==="map"&&myLoc&&(
        <div>
          {locErr&&<div style={{fontSize:10,color:"#555",textAlign:"center",marginBottom:8,padding:"6px",background:"rgba(255,255,255,0.03)",borderRadius:8}}>
            📍 GPS 사용 불가 · 광주 기준으로 표시해요</div>}
          <div style={{fontSize:11,color:"#555",textAlign:"center",marginBottom:10}}>
            지도에서 명당을 탭하거나 아래 목록에서 선택하세요
          </div>
          <MiniMap/>
          {selected&&(
            <div style={{background:"rgba(249,215,28,0.07)",border:"1px solid rgba(249,215,28,0.2)",borderRadius:14,padding:"12px 14px",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:900,color:"#f9d71c",marginBottom:4}}>🏆 {selected.name}</div>
              <div style={{fontSize:10,color:"#555",marginBottom:10}}>{selected.addr} · 1등 {selected.wins}회</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                {[
                  ["📍 거리",fmtDist(locDist(myLoc.lat,myLoc.lng,selected.lat,selected.lng))],
                  ["🧭 방향",dirLabel(locAngle(myLoc.lat,myLoc.lng,selected.lat,selected.lng))],
                  ["↕️ 위도차",`${Math.abs(selected.lat-myLoc.lat).toFixed(4)}°`],
                  ["↔️ 경도차",`${Math.abs(selected.lng-myLoc.lng).toFixed(4)}°`],
                ].map(([k,v])=>(
                  <div key={k} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"6px 10px"}}>
                    <div style={{fontSize:9,color:"#555",marginBottom:1}}>{k}</div>
                    <div style={{fontSize:12,fontWeight:900,color:"#f9d71c"}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{fontSize:9,color:"#443300",textAlign:"center",marginTop:8}}>위 좌표값이 번호로 변환돼요</div>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
            {nearStores.map((s,i)=>{
              const isSel=selected?.id===s.id;
              return(<button key={s.id} onClick={()=>setSelected(s)} style={{
                display:"flex",alignItems:"center",gap:10,
                background:isSel?"rgba(249,215,28,0.08)":"rgba(255,255,255,0.02)",
                border:`1px solid ${isSel?"rgba(249,215,28,0.3)":"rgba(255,255,255,0.05)"}`,
                borderRadius:10,padding:"8px 12px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
                <div style={{fontSize:11,color:isSel?"#f9d71c":"#444",fontWeight:700,minWidth:16}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:isSel?"#f9d71c":"#888"}}>{s.name}</div>
                  <div style={{fontSize:9,color:"#444"}}>{s.addr}</div>
                </div>
                <div style={{fontSize:10,color:"#ff9800",fontWeight:700}}>{s.wins}회</div>
                <div style={{fontSize:10,color:"#333"}}>{fmtDist(s.dist)}</div>
              </button>);
            })}
          </div>
          {showClover&&<CloverPopup onDone={()=>{setShowClover(false);generate();}}/>}
          <button onClick={()=>selected&&setShowClover(true)} disabled={!selected} style={{
            width:"100%",padding:"15px",borderRadius:14,border:"none",
            background:selected?"linear-gradient(135deg,#c8a800,#f9d71c)":"rgba(255,255,255,0.04)",
            color:selected?"#000":"#333",fontSize:15,fontWeight:900,
            cursor:selected?"pointer":"default",
            boxShadow:selected?"0 4px 24px rgba(249,215,28,0.4)":"none",transition:"all .2s"}}>
            📍 이 명당의 기운으로 번호 뽑기
          </button>
        </div>
      )}

      {phase==="result"&&selected&&(
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:13,fontWeight:900,color:"#f9d71c",marginBottom:4}}>🏆 {selected.name}</div>
          <div style={{fontSize:10,color:"#555",marginBottom:12}}>1등 {selected.wins}회 · {fmtDist(coordInfo?.dist||0)}</div>
          {coordInfo&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,color:"#555",textAlign:"center",marginBottom:8}}>
                아래 숫자들이 그대로 번호가 됐어요
              </div>
              <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
                {[
                  ["📍 거리", fmtDist(coordInfo.dist),
                    coordInfo.dist<1?Math.round(coordInfo.dist*100):Math.round(coordInfo.dist*10)],
                  ["🧭 방향", dirLabel(coordInfo.angle),
                    (Math.round(coordInfo.angle/45)%8)+1],
                  ["↕️ 위도차", `${coordInfo.dLat.toFixed(3)}°`,
                    Math.round(coordInfo.dLat*1000)],
                  ["↔️ 경도차", `${coordInfo.dLng.toFixed(3)}°`,
                    Math.round(coordInfo.dLng*1000)],
                  ["🏆 1등", `${selected.wins}회`, selected.wins],
                ].map(([k,v,n])=>{
                  const valid=n<=0?45:n>45?n%45||45:n;
                  const c=ballColor(valid);
                  return(
                    <div key={k} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,
                      padding:"6px 10px",textAlign:"center",minWidth:56}}>
                      <div style={{fontSize:8,color:"#555",marginBottom:3}}>{k}</div>
                      <div style={{fontSize:11,fontWeight:700,color:"#aaa",marginBottom:4}}>{v}</div>
                      <div style={{width:26,height:26,borderRadius:"50%",margin:"0 auto",
                        background:`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:10,fontWeight:900,color:c.text}}>
                        {valid}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <Balls nums={nums}/>
          <NumLine nums={nums}/>
          <div style={{fontSize:10,color:"#444",textAlign:"center",marginTop:8}}>
            📍 {fmtDist(coordInfo?.dist||0)} · {dirLabel(coordInfo?.angle||0)} 방향 · 오늘 이 순간의 기운
          </div>
          <ActionBtns nums={nums} mode="📍 우리동네명당" onSave={onSave} onShare={onShare}/>
          <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"center"}}>
            <button onClick={()=>{setNums(locPickNums(myLoc.lat,myLoc.lng,selected));}} style={{
              background:"linear-gradient(135deg,#c8a800,#f9d71c)",border:"none",borderRadius:50,
              padding:"11px 20px",fontSize:13,fontWeight:900,color:"#000",cursor:"pointer"}}>🔄 다시 뽑기</button>
            <button onClick={reset} style={{background:"rgba(255,255,255,0.06)",border:"1px solid #333",
              borderRadius:50,padding:"11px 18px",fontSize:12,color:"#888",cursor:"pointer"}}>← 명당 재선택</button>
          </div>
        </div>
      )}
    </div>
  <style>{`@keyframes gswing{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}`}</style>
  </div>);
}



function FormulaScreen({onSave,onShare,onBack}){
  const MEMBERS=[
    {id:"father",    label:"아버지", color:"#ff9800", cake:{body:"#ff9800",cream:"#ffe0b2",candle:"#ff5722"}},
    {id:"mother",    label:"어머니", color:"#ff7eb3", cake:{body:"#ff7eb3",cream:"#fce4ec",candle:"#e91e63"}},
    {id:"wife",      label:"아내",   color:"#f06292", cake:{body:"#f06292",cream:"#fce4ec",candle:"#c2185b"}},
    {id:"husband",   label:"남편",   color:"#69c8f2", cake:{body:"#69c8f2",cream:"#e3f2fd",candle:"#1976d2"}},
    {id:"son1",      label:"아들①", color:"#81c784", cake:{body:"#81c784",cream:"#e8f5e9",candle:"#388e3c"}},
    {id:"son2",      label:"아들②", color:"#4db6ac", cake:{body:"#4db6ac",cream:"#e0f2f1",candle:"#00796b"}},
    {id:"son3",      label:"아들③", color:"#26a69a", cake:{body:"#26a69a",cream:"#e0f2f1",candle:"#004d40"}},
    {id:"daughter1", label:"딸①",   color:"#ce93d8", cake:{body:"#ce93d8",cream:"#f3e5f5",candle:"#7b1fa2"}},
    {id:"daughter2", label:"딸②",   color:"#ba68c8", cake:{body:"#ba68c8",cream:"#f3e5f5",candle:"#6a1b9a"}},
    {id:"daughter3", label:"딸③",   color:"#ab47bc", cake:{body:"#ab47bc",cream:"#f3e5f5",candle:"#4a148c"}},
    {id:"friend",    label:"친구",   color:"#ffb74d", cake:{body:"#ffb74d",cream:"#fff8e1",candle:"#f57c00"}},
  ];

  const CakeIcon=({cake,size=40})=>(
    <svg width={size} height={size} viewBox="0 0 40 40">
      {/* 케익 몸통 */}
      <rect x="6" y="18" width="28" height="16" rx="3" fill={cake.body} opacity="0.9"/>
      {/* 크림 상단 */}
      <path d="M6 18 Q10 13 14 18 Q18 13 22 18 Q26 13 30 18 Q34 13 34 18" fill={cake.cream} stroke={cake.body} strokeWidth="0.5"/>
      {/* 초 */}
      <rect x="18" y="8" width="4" height="10" rx="1" fill={cake.candle} opacity="0.9"/>
      {/* 불꽃 */}
      <ellipse cx="20" cy="7" rx="2.5" ry="3.5" fill="#f9d71c" opacity="0.95"/>
      <ellipse cx="20" cy="7.5" rx="1.2" ry="2" fill="#ff9800"/>
      {/* 케익 장식선 */}
      <line x1="6" y1="26" x2="34" y2="26" stroke={cake.cream} strokeWidth="1" opacity="0.5"/>
    </svg>
  );

  const[dates,setDates]=useState({});
  const[sel,setSel]=useState([]);
  const[phone,setPhone]=useState("");
  const[nums,setNums]=useState([]);
  const[petals,setPetals]=useState([]);
  const triggerPetals=()=>{setPetals(spawnPetals());setTimeout(()=>setPetals([]),5000);};
  const[flames,setFlames]=useState(Array.from({length:5},()=>({h:Math.random()*10,flicker:Math.random()})));
  const alive=useRef(true);

  // 저장된 날짜 불러오기
  useEffect(()=>{
    (async()=>{
      try{
        const d=localStorage.getItem("v2_family_dates");
        const s=localStorage.getItem("v2_family_sel");
        if(d)try{setDates(JSON.parse(d));}catch(e){}
        if(s)try{setSel(JSON.parse(s));}catch(e){}
      }catch(e){}
    })();
  },[]);

  useEffect(()=>{
    alive.current=true;
    const iv=setInterval(()=>{if(!alive.current)return;setFlames(prev=>prev.map(f=>({...f,h:Math.random()*10,flicker:Math.random()})));},700);
    return()=>{alive.current=false;clearInterval(iv);};
  },[]);

  const toggleMember=(id)=>{
    setSel(prev=>{
      const next=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id];
      try{localStorage.setItem("v2_family_sel",JSON.stringify(next));}catch(e){}
      return next;
    });
  };
  const setDate=(id,val)=>{
    setDates(prev=>{
      const next={...prev,[id]:val};
      try{localStorage.setItem("v2_family_dates",JSON.stringify(next));}catch(e){}
      return next;
    });
  };

  const generate=()=>{
    const pool=[];
    const today=new Date();
    pool.push(today.getMonth()+1);
    pool.push(today.getDate()>45?today.getDate()%45:today.getDate());
    // 전화번호 뒤 4자리
    if(phone.length===4){
      const p1=parseInt(phone.slice(0,2))%45+1;
      const p2=parseInt(phone.slice(2,4))%45+1;
      if(p1>=1&&p1<=45)pool.push(p1);
      if(p2>=1&&p2<=45)pool.push(p2);
    }
    sel.forEach(id=>{
      const d=dates[id];if(!d)return;
      const parts=d.replace(/\D/g,"");
      if(parts.length>=8){
        const y=parseInt(parts.slice(2,4))%45+1;
        const m=parseInt(parts.slice(4,6));
        const day=parseInt(parts.slice(6,8));
        if(y>=1&&y<=45)pool.push(y);
        if(m>=1&&m<=12)pool.push(m);
        if(day>=1&&day<=31)pool.push(day);
      }
    });
    while(pool.length<6)pool.push(Math.floor(Math.random()*45)+1);
    setNums(pickNums(pool));
    SFX.chime();triggerPetals();
  };

  const canGen=sel.length>0&&sel.every(id=>dates[id]&&dates[id].replace(/\D/g,"").length>=8);

  // 색종이 데이터
  const[confetti]=useState(()=>Array.from({length:25},(_,i)=>({
    id:i,
    x:Math.random()*100,
    dur:6+Math.random()*8,
    delay:-(Math.random()*12),
    size:5+Math.random()*7,
    rotate:Math.random()*360,
    color:["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff9eb5","#c77dff","#ff9800","#69c8f2"][i%8],
    isRect:Math.random()>0.5,
    swing:15+Math.random()*25,
  })));

  const W={minHeight:"100%",background:"linear-gradient(180deg,#080400,#120800,#0a0500)",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"12px 14px 24px",boxSizing:"border-box",color:"#fff",
    position:"relative",overflow:"hidden"};

  const CandleComp=({h,flicker})=>{
    const fh=14+h*0.4;
    const fc=`rgba(255,${140+Math.floor(flicker*80)},20,0.95)`;
    return(<div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <div style={{width:8,height:fh,background:`radial-gradient(ellipse at 50% 80%,${fc},rgba(255,80,0,0.6),transparent)`,
        borderRadius:"50% 50% 30% 30%",filter:`blur(${0.5+flicker*0.5}px)`,
        boxShadow:`0 0 ${6+flicker*6}px rgba(255,150,0,0.6)`,transition:"height 0.5s ease"}}/>
      <div style={{width:1.5,height:4,background:"#888"}}/>
      <div style={{width:10,height:28,background:"linear-gradient(180deg,#f5f0e0,#e8e0c8,#d4c9a8)",
        borderRadius:"2px 2px 3px 3px",boxShadow:"inset -2px 0 4px rgba(0,0,0,0.15)"}}/>
      <div style={{width:16,height:4,background:"linear-gradient(180deg,#c8a870,#a08050)",borderRadius:"0 0 3px 3px"}}/>
    </div>);
  };

  return(<div style={W}>
    <PetalOverlay petals={petals}/>
    {/* 색종이 배경 */}
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {confetti.map(c=>(
        <div key={c.id} style={{
          position:"absolute",
          left:`${c.x}%`,top:"-20px",
          width:c.isRect?c.size:c.size*0.7,
          height:c.isRect?c.size*0.4:c.size,
          borderRadius:c.isRect?"2px":"50%",
          background:c.color,
          opacity:0.25,
          animation:`confettiFall ${c.dur}s ease-in ${c.delay}s infinite`,
          transform:`rotate(${c.rotate}deg)`,
        }}/>
      ))}
    </div>
    <style>{`@keyframes confettiFall{
      0%  {top:-20px;transform:rotate(0deg) translateX(0);opacity:0.3;}
      20% {transform:rotate(120deg) translateX(${15}px);opacity:0.25;}
      40% {transform:rotate(240deg) translateX(-${20}px);}
      60% {transform:rotate(360deg) translateX(${10}px);}
      80% {transform:rotate(480deg) translateX(-${15}px);opacity:0.2;}
      100%{top:110vh;transform:rotate(600deg) translateX(0);opacity:0;}
    }`}</style>
    <div style={{width:"100%",maxWidth:390,position:"relative",zIndex:1}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#666",fontSize:13,cursor:"pointer"}}>← 홈</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:900,color:"#ff9800",textShadow:"0 0 12px rgba(255,150,0,0.5)"}}>가족의 행운</div>
          <div style={{fontSize:10,color:"#664400",marginTop:2}}>가족 생년월일로 번호를 뽑아요</div>
        </div>
        <div style={{width:40}}/>
      </div>

      {/* 촛불 행 */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:18,marginBottom:20,
        padding:"8px 0 6px",borderBottom:"1px solid rgba(255,150,0,0.08)"}}>
        {flames.map((f,i)=><CandleComp key={i} h={f.h} flicker={f.flicker}/>)}
      </div>

      {/* 가족 선택 - 이니셜 아바타 4열 */}
      <div style={{background:"rgba(255,150,0,0.04)",border:"1px solid rgba(255,150,0,0.1)",borderRadius:16,padding:14,marginBottom:12}}>
        <div style={{fontSize:11,color:"#886633",marginBottom:12,fontWeight:700,letterSpacing:1}}>누구의 생년월일을 쓸까요?</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {MEMBERS.map(m=>{
            const isSel=sel.includes(m.id);
            return(<button key={m.id} onClick={()=>{SFX.tone(isSel?300:520,0.08,"sine",0.12);toggleMember(m.id);}} style={{
              display:"flex",flexDirection:"column",alignItems:"center",gap:5,
              background:"none",border:"none",cursor:"pointer",padding:"4px 2px",
              opacity:isSel?1:0.38,transition:"opacity .2s,transform .15s",
              transform:isSel?"scale(1.06)":"scale(1)"}}>
              <div style={{
                width:52,height:52,borderRadius:12,
                background:isSel?`${m.color}22`:"rgba(255,255,255,0.04)",
                border:`2px solid ${isSel?m.color:"rgba(255,255,255,0.1)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .2s",boxShadow:isSel?`0 0 14px ${m.color}44`:"none"}}>
                <CakeIcon cake={m.cake} size={36}/>
              </div>
              <div style={{fontSize:9,color:isSel?m.color:"#555",fontWeight:isSel?700:400,
                transition:"color .2s",textAlign:"center",lineHeight:1.3,whiteSpace:"nowrap"}}>
                {m.label}
              </div>
            </button>);
          })}
        </div>
      </div>

      {/* 날짜 입력 */}
      {sel.length>0&&(
        <div style={{background:"rgba(255,150,0,0.03)",border:"1px solid rgba(255,150,0,0.08)",borderRadius:16,padding:"4px 14px",marginBottom:12}}>
          {sel.map((id,idx)=>{
            const m=MEMBERS.find(x=>x.id===id);
            const done=dates[id]&&dates[id].replace(/\D/g,"").length>=8;
            return(<div key={id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",
              borderBottom:idx<sel.length-1?"1px solid rgba(255,150,0,0.06)":"none"}}>
              <div style={{
                width:40,height:40,borderRadius:10,flexShrink:0,
                background:done?`${m.color}22`:"rgba(255,255,255,0.04)",
                border:`2px solid ${done?m.color:"rgba(255,255,255,0.08)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .3s",opacity:done?1:0.5}}>
                <CakeIcon cake={m.cake} size={28}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,marginBottom:5,fontWeight:700,color:done?m.color:"#665544"}}>
                  {m.label}{done&&<span style={{marginLeft:6,fontSize:10,opacity:0.8}}>✓</span>}
                </div>
                <input value={dates[id]||""}
                  onChange={e=>{
                    const v=e.target.value.replace(/\D/g,"");
                    let fmt=v;
                    if(v.length>4)fmt=v.slice(0,4)+"."+v.slice(4);
                    if(v.length>6)fmt=v.slice(0,4)+"."+v.slice(4,6)+"."+v.slice(6,8);
                    setDate(id,fmt);
                  }}
                  placeholder="YYYY.MM.DD" maxLength={10}
                  style={{width:"100%",background:"rgba(255,255,255,0.04)",
                    border:`1px solid ${done?m.color+"55":"rgba(255,255,255,0.08)"}`,
                    borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:14,
                    boxSizing:"border-box",outline:"none",transition:"border .2s"}}/>
              </div>
            </div>);
          })}
        </div>
      )}

      {sel.length===0&&(<div style={{textAlign:"center",padding:"14px 0",color:"#443322",fontSize:13}}>위에서 가족을 선택해주세요</div>)}

      {/* 전화번호 뒤 4자리 */}
      <div style={{background:"rgba(255,150,0,0.03)",border:"1px solid rgba(255,150,0,0.08)",
        borderRadius:12,padding:"10px 14px",marginBottom:10}}>
        <div style={{fontSize:11,color:"#886633",marginBottom:6,fontWeight:700}}>
          📱 전화번호 뒤 4자리 (선택)
        </div>
        <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,4))}
          placeholder="예: 5849" maxLength={4}
          style={{width:"100%",background:"rgba(255,255,255,0.04)",
            border:`1px solid ${phone.length===4?"#ff9800":"rgba(255,255,255,0.08)"}`,
            borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:16,
            fontWeight:700,boxSizing:"border-box",outline:"none",
            letterSpacing:4,textAlign:"center"}}/>
        {phone.length===4&&<div style={{fontSize:10,color:"#664400",marginTop:4,textAlign:"center"}}>
          번호 풀에 추가돼요
        </div>}
      </div>

      <div style={{fontSize:10,color:"#664400",textAlign:"center",marginBottom:6,marginTop:4}}>
        가족 생년월일 + 오늘 날짜 조합 · 매주 새로운 번호가 나와요
      </div>
      {showClover&&<CloverPopup onDone={()=>{setShowClover(false);generate();}}/>}
      <button onClick={()=>canGen&&setShowClover(true)} disabled={!canGen} style={{
        width:"100%",padding:"15px",borderRadius:14,border:"none",marginTop:4,
        background:canGen?"linear-gradient(135deg,#cc6600,#ff9800)":"rgba(255,255,255,0.04)",
        color:canGen?"#fff":"#443322",fontSize:16,fontWeight:900,
        cursor:canGen?"pointer":"default",
        boxShadow:canGen?"0 4px 24px rgba(255,150,0,0.35)":"none",transition:"all .25s"}}>
        🕯️ 가족의 번호 뽑기
      </button>

      {nums.length>0&&(<div style={{marginTop:16,textAlign:"center",
        background:"rgba(255,150,0,0.05)",border:"1px solid rgba(255,150,0,0.15)",borderRadius:16,padding:"16px 14px"}}>
        <div style={{fontSize:11,color:"#886633",marginBottom:14,letterSpacing:1}}>🕯️ 가족의 행운 번호</div>
        <Balls nums={nums}/><NumLine nums={nums}/>
        <ActionBtns nums={nums} mode="👨‍👩‍👧 가족의행운" onSave={onSave} onShare={onShare}/>
      </div>)}
    </div>
  </div>);
}




function FavoritesScreen({favorites,onSaveFav,onSave,onShare,onBack}){
  const[lifetime,setLifetime]=useState(Array.isArray(favorites)&&favorites.length>0?[...favorites]:[]);
  const[tab,setTab]=useState("lifetime");
  const[petals,setPetals]=useState([]);
  const triggerPetals=()=>{setPetals(spawnPetals());setTimeout(()=>setPetals([]),5000);};
  const[extra,setExtra]=useState([]);
  const[nums,setNums]=useState([]);
  const[editMode,setEditMode]=useState(false);
  const[tempLifetime,setTempLifetime]=useState([]);
  const allNums=Array.from({length:45},(_,i)=>i+1);
  const need=Math.max(0,6-lifetime.length);

  const toggleExtra=(n)=>{
    if(lifetime.includes(n))return;
    SFX.tone(660,0.06,"sine",0.12);
    setExtra(prev=>{if(prev.includes(n))return prev.filter(x=>x!==n);if(prev.length>=need)return prev;return[...prev,n];});
  };
  const toggleTemp=(n)=>{
    SFX.tone(660,0.06,"sine",0.12);
    setTempLifetime(prev=>{if(prev.includes(n))return prev.filter(x=>x!==n);if(prev.length>=6)return prev;return[...prev,n];});
  };
  const generate=()=>{
    if(tab==="neglected"){
      const neglected=Object.entries(DREAM_FREQ).sort((a,b)=>a[1]-b[1]).slice(0,15).map(([n])=>Number(n));
      const p=[...neglected].sort(()=>Math.random()-0.5).slice(0,6).sort((a,b)=>a-b);
      setNums(p);SFX.chime();triggerPetals();return;
    }
    const pool=tab==="lifetime"?lifetime:[...lifetime,...extra];
    const u=[...new Set(pool)].filter(n=>n>=1&&n<=45);
    const p=[...u].sort(()=>Math.random()-0.5).slice(0,6);
    while(p.length<6){const r=Math.floor(Math.random()*45)+1;if(!p.includes(r))p.push(r);}
    setNums(p.sort((a,b)=>a-b));
    SFX.chime();triggerPetals();
  };
  const canGen=tab==="lifetime"?lifetime.length>0:(lifetime.length>0&&(need===0||extra.length===need));

  // 숫자 비 배경 데이터
  const[rainNums]=useState(()=>Array.from({length:20},(_,i)=>({
    id:i,
    num:Math.floor(Math.random()*45)+1,
    x:Math.random()*100,
    dur:8+Math.random()*12,
    delay:-(Math.random()*15),
    size:11+Math.floor(Math.random()*10),
    opacity:0.06+Math.random()*0.1,
  })));

  const W={minHeight:"100%",background:"#07060f",display:"flex",flexDirection:"column",
    color:"#fff",position:"relative",overflow:"hidden"};

  return(<div style={W}>
    <PetalOverlay petals={petals}/>
    {/* 숫자 비 배경 */}
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {rainNums.map(r=>(
        <div key={r.id} style={{
          position:"absolute",left:`${r.x}%`,top:"-40px",
          fontSize:r.size,fontWeight:900,
          color:`rgba(249,215,28,${r.opacity})`,
          fontFamily:"monospace",letterSpacing:0,
          animation:`numRain ${r.dur}s linear ${r.delay}s infinite`,
          userSelect:"none",
        }}>{String(r.num).padStart(2,"0")}</div>
      ))}
    </div>
    <style>{`@keyframes numRain{0%{top:-40px;opacity:0;}5%{opacity:1;}90%{opacity:1;}100%{top:110vh;opacity:0;}}`}</style>
    <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(7,6,15,0.96)",
      borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"14px 16px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#666",fontSize:13,cursor:"pointer"}}>← 홈</button>
        <span style={{fontSize:15,fontWeight:900,color:"#f9d71c"}}>💛 선호번호</span>
        <button onClick={()=>{setEditMode(true);setTempLifetime([...lifetime]);}}
          style={{background:"rgba(249,215,28,0.08)",border:"1px solid rgba(249,215,28,0.2)",
            borderRadius:20,padding:"5px 12px",fontSize:11,color:"#f9d71c",cursor:"pointer"}}>✏️ 편집</button>
      </div>
      <div style={{display:"flex"}}>
        {[{id:"lifetime",label:"🔒 평생번호"},{id:"combined",label:"🔒 + ✨ 선택"},{id:"neglected",label:"🥺 소외번호"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setExtra([]);setNums([]);}} style={{
            flex:1,padding:"11px 8px",border:"none",background:"none",
            color:tab===t.id?"#f9d71c":"#444",fontSize:13,fontWeight:tab===t.id?900:400,cursor:"pointer",
            borderBottom:`2.5px solid ${tab===t.id?"#f9d71c":"transparent"}`,transition:"all .2s"}}>{t.label}</button>
        ))}
      </div>
    </div>

    <div style={{flex:1,padding:"20px 16px 100px",maxWidth:420,width:"100%",margin:"0 auto",boxSizing:"border-box",zIndex:1}}>

      {/* 탭 설명 태그 */}
      <div style={{
        background:"rgba(249,215,28,0.04)",border:"1px solid rgba(249,215,28,0.08)",
        borderRadius:10,padding:"8px 12px",marginBottom:16,
        fontSize:11,color:"#664400",lineHeight:1.7,textAlign:"center"}}>
        {tab==="lifetime"
          ?"🔒 항상 유지되는 나만의 번호 · 매번 뽑기에 포함돼요"
          :tab==="combined"
          ?`🔒 평생번호 ${lifetime.length}개 고정 · ✨ 나머지 ${need}개를 오늘 직접 골라요`
          :"🥺 역대 당첨 빈도가 낮은 번호 · 이번엔 얘네 차례 아닐까요?"}
      </div>

      {/* 평생번호 표시 */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,color:"#886600",marginBottom:10,fontWeight:700,letterSpacing:1,
          display:"flex",justifyContent:"space-between"}}>
          <span>나의 평생번호</span>
          <span style={{color:"#444",fontWeight:400}}>{lifetime.length}개 설정됨</span>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",minHeight:50}}>
          {lifetime.length===0
            ?<div style={{color:"#333",fontSize:12}}>✏️ 편집으로 평생번호를 설정해주세요</div>
            :[...lifetime].sort((a,b)=>a-b).map(n=>{const c=ballColor(n);return(
              <div key={n} style={{width:46,height:46,borderRadius:"50%",position:"relative",
                background:`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:14,fontWeight:900,color:c.text,
                boxShadow:`0 0 0 2.5px #f9d71c,0 4px 16px ${c.bg}55`}}>
                {n}
                <div style={{position:"absolute",top:-3,right:-3,width:13,height:13,borderRadius:"50%",
                  background:"#f9d71c",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7}}>🔒</div>
              </div>);
            })
          }
        </div>
        {lifetime.length>0&&(
          <div style={{fontSize:10,color:"#443300",marginTop:8}}>
            생년월일 · 기념일 · 좋아하는 숫자로 설정하세요
          </div>
        )}
      </div>

      {/* combined 탭 - 추가 선택 */}
      {tab==="combined"&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:"#7733aa",marginBottom:10,fontWeight:700,letterSpacing:1,
            display:"flex",justifyContent:"space-between"}}>
            <span>✨ 오늘의 선택번호</span>
            <span style={{color:"#444",fontWeight:400}}>{extra.length}/{need}개 선택</span>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14,minHeight:50,alignItems:"center",flexWrap:"wrap"}}>
            {[...extra].sort((a,b)=>a-b).map(n=>{const c=ballColor(n);return(
              <div key={n} onClick={()=>toggleExtra(n)} style={{width:46,height:46,borderRadius:"50%",cursor:"pointer",
                background:`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:14,fontWeight:900,color:c.text,
                boxShadow:`0 0 0 2px #b44aff,0 4px 12px ${c.bg}44`}}>{n}</div>
            );})}
            {Array.from({length:need-extra.length},(_,i)=>(
              <div key={i} style={{width:46,height:46,borderRadius:"50%",
                border:"1.5px dashed rgba(180,74,255,0.25)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"rgba(180,74,255,0.25)"}}>+</div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",gap:5,marginBottom:8}}>
            {allNums.map(n=>{
              const isLocked=lifetime.includes(n);const isSel=extra.includes(n);const c=ballColor(n);
              return(<div key={n} onClick={()=>toggleExtra(n)} style={{
                aspectRatio:"1",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:isSel||isLocked?900:400,cursor:isLocked?"default":"pointer",
                background:isLocked||isSel?`radial-gradient(circle at 35% 35%,${c.bg}cc,${c.bg})`:"rgba(255,255,255,0.04)",
                color:isLocked||isSel?c.text:"#333",
                boxShadow:isLocked?"0 0 0 2px #f9d71c":isSel?"0 0 0 1.5px #b44aff":"none",
                opacity:isLocked?0.5:1,transform:isSel?"scale(1.1)":"scale(1)",transition:"all .12s"}}>{n}</div>
              );
            })}
          </div>
          <div style={{fontSize:10,color:"#333",textAlign:"center"}}>🔒 평생번호 제외 · 나머지 {need}개 선택</div>
        </div>
      )}

      {tab==="lifetime"&&lifetime.length>0&&(
        <div style={{background:"rgba(249,215,28,0.04)",border:"1px solid rgba(249,215,28,0.1)",
          borderRadius:14,padding:"12px 16px",marginBottom:16,fontSize:12,color:"#665500",lineHeight:1.7}}>
          평생번호 {lifetime.length}개로 번호를 뽑아요.{lifetime.length<6&&` 나머지 ${6-lifetime.length}개는 랜덤으로 채워져요.`}
        </div>
      )}

      {/* 소외번호 탭 */}
      {tab==="neglected"&&(()=>{
        // DREAM_FREQ 기준 빈도 낮은 순 TOP 15
        const neglected=Object.entries(DREAM_FREQ)
          .sort((a,b)=>a[1]-b[1])
          .slice(0,15)
          .map(([n])=>Number(n));
        return(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:"#555",marginBottom:12,lineHeight:1.7,
              background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 12px"}}>
              📊 2025년 기준 당첨 빈도가 낮은 번호들이에요.<br/>
              <span style={{color:"#443300"}}>"이번엔 얘네 차례 아닐까?" 하는 마음으로 뽑아보세요 🥺</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14}}>
              {neglected.map((n,i)=>{
                const c=ballColor(n);
                const freq=DREAM_FREQ[n];
                return(
                  <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:44,height:44,borderRadius:"50%",
                      background:`radial-gradient(circle at 35% 35%,${c.bg}bb,${c.bg}88)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:13,fontWeight:900,color:c.text,opacity:0.7+i*0.02,
                      border:`1px solid ${c.bg}44`}}>{n}</div>
                    <div style={{fontSize:9,color:"#444"}}>{freq}회</div>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:10,color:"#333",textAlign:"center",marginBottom:8}}>
              위 번호들 중에서 6개를 랜덤으로 뽑아드려요
            </div>
          </div>
        );
      })()}

      {nums.length>0&&(
        <div style={{textAlign:"center",background:"rgba(249,215,28,0.05)",
          border:"1px solid rgba(249,215,28,0.15)",borderRadius:14,padding:"16px 14px",marginBottom:16}}>
          <div style={{fontSize:10,color:"#886600",marginBottom:12}}>
            {tab==="lifetime"
              ?`🔒 평생번호 ${lifetime.length}개로 뽑은 번호${lifetime.length<6?` · 나머지 ${6-lifetime.length}개 랜덤`:""}`
              :tab==="combined"
              ?`🔒 평생 ${lifetime.length}개 + ✨ 선택 ${extra.length}개 조합`
              :"🥺 소외번호 조합 · 이번엔 얘네 차례!"}
          </div>
          <Balls nums={nums}/>
          <NumLine nums={nums}/>
          <ActionBtns nums={nums} mode="💛 선호번호" onSave={onSave} onShare={onShare}/>
        </div>
      )}
    </div>

    {/* 하단 고정 버튼 */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,
      padding:"12px 16px 28px",background:"linear-gradient(transparent,#07060f 40%)",zIndex:10}}>
      {showClover&&<CloverPopup onDone={()=>{setShowClover(false);generate();}}/>}
      <button onClick={()=>{
        if(tab==="neglected"){
          // 소외번호 탭은 canGen 조건 없이 바로
          const neglected=Object.entries(DREAM_FREQ).sort((a,b)=>a[1]-b[1]).slice(0,15).map(([n])=>Number(n));
          setShowClover(true);
        } else if(canGen) setShowClover(true);
      }} disabled={tab!=="neglected"&&!canGen} style={{
        width:"100%",maxWidth:420,display:"block",margin:"0 auto",
        padding:"16px",borderRadius:14,border:"none",
        background:(tab==="neglected"||canGen)?"linear-gradient(135deg,#c8a800,#f9d71c)":"rgba(255,255,255,0.05)",
        color:(tab==="neglected"||canGen)?"#000":"#333",fontSize:16,fontWeight:900,
        cursor:(tab==="neglected"||canGen)?"pointer":"default",
        boxShadow:(tab==="neglected"||canGen)?"0 4px 24px rgba(249,215,28,0.4)":"none",transition:"all .2s"}}>
        {tab==="neglected"?"🥺 소외번호 뽑기":"💛 번호 뽑기"}
      </button>
    </div>

    {/* 편집 바텀시트 */}
    {editMode&&(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",
        display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}}
        onClick={()=>setEditMode(false)}>
        <div style={{width:"100%",maxWidth:420,background:"#0f0e1a",
          borderRadius:"20px 20px 0 0",padding:"20px 16px 36px",
          border:"1px solid rgba(249,215,28,0.12)"}} onClick={e=>e.stopPropagation()}>
          <div style={{width:36,height:4,borderRadius:2,background:"#333",margin:"0 auto 16px"}}/>
          <div style={{fontSize:14,fontWeight:900,color:"#f9d71c",marginBottom:4}}>🔒 평생번호 설정</div>
          <div style={{fontSize:10,color:"#444",marginBottom:6}}>최대 6개 · 항상 유지돼요</div>
          <div style={{fontSize:10,color:"#554400",marginBottom:14,
            background:"rgba(249,215,28,0.05)",borderRadius:8,padding:"6px 10px"}}>
            💡 생년월일 · 기념일 · 좋아하는 숫자로 설정하세요
          </div>
          <div style={{display:"flex",gap:7,justifyContent:"center",marginBottom:14,minHeight:46,flexWrap:"wrap",alignItems:"center"}}>
            {[...tempLifetime].sort((a,b)=>a-b).map(n=>{const c=ballColor(n);return(
              <div key={n} onClick={()=>toggleTemp(n)} style={{width:40,height:40,borderRadius:"50%",cursor:"pointer",
                background:`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:12,fontWeight:900,color:c.text,
                boxShadow:`0 0 0 2px #f9d71c`}}>{n}</div>
            );})}
            {Array.from({length:6-tempLifetime.length},(_,i)=>(
              <div key={i} style={{width:40,height:40,borderRadius:"50%",
                border:"1px dashed rgba(249,215,28,0.15)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"rgba(249,215,28,0.15)"}}>+</div>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(9,1fr)",gap:5,marginBottom:16}}>
            {allNums.map(n=>{const isSel=tempLifetime.includes(n);const c=ballColor(n);return(
              <div key={n} onClick={()=>toggleTemp(n)} style={{
                aspectRatio:"1",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:isSel?900:400,cursor:"pointer",
                background:isSel?`radial-gradient(circle at 35% 35%,${c.bg}cc,${c.bg})`:"rgba(255,255,255,0.05)",
                color:isSel?c.text:"#333",boxShadow:isSel?`0 2px 8px ${c.bg}55`:"none",
                transform:isSel?"scale(1.1)":"scale(1)",transition:"all .12s"}}>{n}</div>
            );})}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setEditMode(false)} style={{flex:1,padding:"13px",borderRadius:12,
              border:"1px solid rgba(255,255,255,0.07)",background:"transparent",color:"#555",fontSize:13,cursor:"pointer"}}>취소</button>
            <button onClick={()=>{setLifetime([...tempLifetime]);onSaveFav([...tempLifetime]);setExtra([]);setNums([]);setEditMode(false);}}
              style={{flex:2,padding:"13px",borderRadius:12,border:"none",
                background:"linear-gradient(135deg,#c8a800,#f9d71c)",
                color:"#000",fontSize:13,fontWeight:900,cursor:"pointer"}}>💛 저장</button>
          </div>
        </div>
      </div>
    )}
    <style>{`@keyframes popIn{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
  </div>);
}


// ════════════════════════════════════════════════════════════
// 🏢 아파트
// ════════════════════════════════════════════════════════════
const SYMS=["🍒","🍋","🔔","💎","⭐","7","🎰"];
const SYM_R={"🍒":[1,12],"🍋":[8,20],"🔔":[14,26],"💎":[22,34],"⭐":[28,40],"7":[36,45],"🎰":[1,45]};
function getSlotNums(reels){
  const[a,b,c]=reels;const r=[];
  const add=(s,hi)=>{const[lo,mx]=SYM_R[s];const p=hi?Math.ceil((lo+mx)/2):lo;r.push(p+Math.floor(Math.random()*(mx-p+1)));};
  if(a===b&&b===c){add(a,true);add(a,true);add(a,false);}
  else if(a===b){add(a,true);add(c,false);}
  else if(b===c){add(b,true);add(a,false);}
  else{add(reels[Math.floor(Math.random()*3)],false);}
  return[...new Set(r)].filter(n=>n>=1&&n<=45);
}

// ════════════════════════════════════════════════════════════
// 🎡 휠 게임
// ════════════════════════════════════════════════════════════
const WHEEL_ZONES=[
  {label:"1-10",color:"#f9d71c",dark:"#c8a800",text:"#000",range:[1,10]},
  {label:"11-20",color:"#69c8f2",dark:"#3a9ac0",text:"#000",range:[11,20]},
  {label:"21-30",color:"#ff7272",dark:"#cc3333",text:"#fff",range:[21,30]},
  {label:"31-40",color:"#b8b8b8",dark:"#888",text:"#fff",range:[31,40]},
  {label:"41-45",color:"#b0d840",dark:"#7aaa10",text:"#000",range:[41,45]},
  {label:"LUCKY",color:"#ff4444",dark:"#aa0000",text:"#fff",range:[1,45]},
  {label:"1-10",color:"#f9d71c",dark:"#c8a800",text:"#000",range:[1,10]},
  {label:"11-20",color:"#69c8f2",dark:"#3a9ac0",text:"#000",range:[11,20]},
  {label:"21-30",color:"#ff7272",dark:"#cc3333",text:"#fff",range:[21,30]},
  {label:"31-40",color:"#b8b8b8",dark:"#888",text:"#fff",range:[31,40]},
];
// 역대 당첨 빈도 TOP10 (LUCKY 구역용)
const LUCKY_NUMS=[27,28,15,3,33,16,37,38,6,7];

function WheelScreen({onSave,onShare,onBack}){
  const[angle,setAngle]=useState(0);
  const[spinning,setSpinning]=useState(false);
  const[petals,setPetals]=useState([]);
  const triggerPetals=()=>{setPetals(spawnPetals());setTimeout(()=>setPetals([]),5000);};
  const[spinCount,setSpinCount]=useState(0);
  const[collected,setCollected]=useState([]);
  const[nums,setNums]=useState([]);
  const[phase,setPhase]=useState("play");
  const[bulbFrame,setBulbFrame]=useState(0);
  const[lastZone,setLastZone]=useState(null);
  const angleRef=useRef(0);
  const collectedRef=useRef([]);
  const alive=useRef(true);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  useEffect(()=>{const iv=setInterval(()=>setBulbFrame(f=>f+1),600);return()=>clearInterval(iv);},[]);

  const doSpin=()=>{
    if(spinning||phase!=="play")return;
    SFX.tone(300,0.15,"triangle",0.18);
    setSpinning(true);
    const extra=720+Math.random()*720;
    const duration=4500;
    const start=Date.now();
    const startA=angleRef.current;

    // 래칫 소리 - 처음엔 빠르게, 점점 느려짐
    let lastTickAngle=0;
    const TICK_EVERY=36; // 매 36도마다 틱 소리
    const tickIv=setInterval(()=>{
      if(!alive.current){clearInterval(tickIv);return;}
      const t=Math.min((Date.now()-start)/duration,1);
      if(t>=1){clearInterval(tickIv);return;}
      const ease=1-Math.pow(1-t,4);
      const curAngle=(startA+extra*ease)%360;
      const diff=Math.abs(curAngle-lastTickAngle);
      if(diff>=TICK_EVERY){
        lastTickAngle=curAngle;
        // 속도에 따라 음정 변화: 빠를수록 높고, 느려질수록 낮아짐
        const speed=1-t; // 0~1 (1=빠름, 0=느림)
        const freq=200+speed*400;
        SFX.tone(freq,0.04,"square",0.08);
      }
    },30);

    const tick=()=>{
      if(!alive.current)return;
      const t=Math.min((Date.now()-start)/duration,1);
      const ease=1-Math.pow(1-t,4);
      angleRef.current=(startA+extra*ease)%360;
      setAngle(angleRef.current);
      if(t<1)requestAnimationFrame(tick);
      else{
        const ptr=((360-angleRef.current%360)+360)%360;
        const zi=Math.floor(ptr/(360/WHEEL_ZONES.length))%WHEEL_ZONES.length;
        const z=WHEEL_ZONES[zi];
        // LUCKY 구역이면 역대 고빈도 번호에서 뽑기
        const num=z.label==="LUCKY"
          ?LUCKY_NUMS[Math.floor(Math.random()*LUCKY_NUMS.length)]
          :z.range[0]+Math.floor(Math.random()*(z.range[1]-z.range[0]+1));
        collectedRef.current=[...collectedRef.current,num];
        setCollected([...collectedRef.current]);
        setLastZone(z);
        setSpinning(false);
        const sc=spinCount+1;
        setSpinCount(sc);
        if(sc>=TOTAL_SPINS){
          setTimeout(()=>{if(alive.current){setNums(pickNums(collectedRef.current));setPhase("result");triggerPetals();}},1500);
        }
      }
    };
    requestAnimationFrame(tick);
  };

  const restart=()=>{
    collectedRef.current=[];
    setCollected([]);setSpinCount(0);setNums([]);setPhase("play");setLastZone(null);angleRef.current=0;setAngle(0);
  };

  const N=WHEEL_ZONES.length;
  const SZ=240,CX=120,CY=120,R=108;
  const BULB_R=132,BULB_COUNT=18;
  const bulbColors=["#f9d71c","#ff7272","#69c8f2","#b0d840","#ff9800"];
  const bulbs=Array.from({length:BULB_COUNT},(_,i)=>{
    const a=(i/BULB_COUNT)*Math.PI*2-Math.PI/2;
    return{x:CX+BULB_R*Math.cos(a),y:CY+BULB_R*Math.sin(a),i};
  });

  const W={minHeight:"100%",
    background:"linear-gradient(180deg,#050210 0%,#0a0520 40%,#080318 100%)",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"10px 14px",boxSizing:"border-box",color:"#fff",position:"relative",overflow:"hidden"};

  if(phase==="result")return(<div style={W}>
    <PetalOverlay petals={petals}/>    <div style={{textAlign:"center",maxWidth:390,width:"100%"}}>
      <div style={{fontSize:44,marginBottom:4}}>🎡</div>
      <h2 style={{fontSize:20,fontWeight:900,color:"#f9d71c",margin:"0 0 4px"}}>행운의 휠 번호</h2>
      <p style={{color:"#555",fontSize:11,marginBottom:14}}>{TOTAL_SPINS}번 스핀 결과</p>
      <Balls nums={nums}/><NumLine nums={nums}/>
      <ActionBtns nums={nums} mode="🎡 행운의휠" onSave={onSave} onShare={onShare}/>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:14}}>
        <button onClick={restart} style={{background:"linear-gradient(135deg,#c8a800,#f9d71c)",border:"none",borderRadius:50,padding:"11px 24px",fontSize:13,fontWeight:900,color:"#000",cursor:"pointer"}}>다시 돌리기 🎡</button>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"1px solid #333",borderRadius:50,padding:"11px 18px",fontSize:12,color:"#888",cursor:"pointer",fontWeight:700}}>← 홈</button>
      </div>
    </div>
  </div>);

  return(<div style={W}>
    <PetalOverlay petals={petals}/>
    {/* 배경 별 */}
    {Array.from({length:20},(_,i)=>(
      <div key={i} style={{position:"absolute",
        left:`${(i*43+7)%100}%`,top:`${(i*31+11)%60}%`,
        width:i%5===0?2:1,height:i%5===0?2:1,borderRadius:"50%",
        background:`rgba(255,255,255,${0.2+((i*7)%10)*0.04})`,
        animation:`twinkle ${3+(i%4)*1.2}s ease-in-out infinite`,
        animationDelay:`${(i%5)*0.4}s`,pointerEvents:"none"}}/>
    ))}

    {/* 관람차 실루엣 배경 */}
    <svg style={{position:"absolute",bottom:0,right:"-10px",opacity:0.07,pointerEvents:"none"}}
      width="180" height="200" viewBox="0 0 180 200">
      {/* 지지대 */}
      <line x1="90" y1="100" x2="60" y2="190" stroke="#f9d71c" strokeWidth="4"/>
      <line x1="90" y1="100" x2="120" y2="190" stroke="#f9d71c" strokeWidth="4"/>
      <line x1="60" y1="190" x2="120" y2="190" stroke="#f9d71c" strokeWidth="3"/>
      {/* 기둥 */}
      <line x1="90" y1="100" x2="90" y2="190" stroke="#f9d71c" strokeWidth="3"/>
      {/* 바깥 원 */}
      <circle cx="90" cy="90" r="72" fill="none" stroke="#f9d71c" strokeWidth="3"/>
      {/* 내부 원 */}
      <circle cx="90" cy="90" r="10" fill="#f9d71c"/>
      {/* 살(spoke) 8개 */}
      {Array.from({length:8},(_,i)=>{
        const a=(i/8)*Math.PI*2;
        return(<line key={i}
          x1="90" y1="90"
          x2={90+72*Math.cos(a)} y2={90+72*Math.sin(a)}
          stroke="#f9d71c" strokeWidth="1.5"/>);
      })}
      {/* 칸 8개 */}
      {Array.from({length:8},(_,i)=>{
        const a=(i/8)*Math.PI*2;
        const cx=90+72*Math.cos(a), cy=90+72*Math.sin(a);
        return(<rect key={i} x={cx-7} y={cy-9} width="14" height="12"
          rx="2" fill="none" stroke="#f9d71c" strokeWidth="1.5"/>);
      })}
    </svg>

    <div style={{width:"100%",maxWidth:390}}>
      {/* 헤더 네온 */}
      <div style={{textAlign:"center",marginBottom:8}}>
        <div style={{fontSize:18,fontWeight:900,letterSpacing:3,color:"#f9d71c",
          textShadow:"0 0 10px #f9d71c,0 0 20px #f9d71c88"}}>LUCKY WHEEL</div>
        <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:4}}>
          {Array.from({length:10},(_,i)=>(
            <div key={i} style={{width:7,height:7,borderRadius:"50%",
              background:bulbColors[(i+bulbFrame)%bulbColors.length],
              boxShadow:`0 0 6px ${bulbColors[(i+bulbFrame)%bulbColors.length]}`,
              opacity:(i+bulbFrame)%3===0?0.3:1,transition:"all .3s"}}/>
          ))}
        </div>
      </div>

      {/* 휠 */}
      <div style={{position:"relative",width:SZ+60,height:SZ+60,margin:"0 auto",
        display:"flex",alignItems:"center",justifyContent:"center"}}>
        {/* 바깥 전구 */}
        <svg width={SZ+60} height={SZ+60} style={{position:"absolute",inset:0}}>
          {bulbs.map((b,i)=>{
            const on=(i+bulbFrame)%3!==0;
            const col=bulbColors[i%bulbColors.length];
            return(<circle key={i} cx={b.x+30} cy={b.y+30} r={5}
              fill={on?col:"#1a0a2a"}
              style={{filter:on?`drop-shadow(0 0 5px ${col})`:"none",transition:"all .3s"}}/>);
          })}
        </svg>
        {/* 포인터 */}
        <div style={{position:"absolute",top:4,left:"50%",transform:"translateX(-50%)",zIndex:20}}>
          <div style={{width:0,height:0,borderLeft:"10px solid transparent",
            borderRight:"10px solid transparent",borderTop:"22px solid #ff4444",
            filter:"drop-shadow(0 2px 4px rgba(255,68,68,0.8))"}}/>
        </div>
        {/* 휠 SVG */}
        <svg width={SZ} height={SZ} style={{transform:`rotate(${angle}deg)`,position:"relative",zIndex:5}}>
          <defs>
            {WHEEL_ZONES.map((z,i)=>(
              <radialGradient key={i} id={`wg${i}`} cx="30%" cy="30%">
                <stop offset="0%" stopColor={z.color}/>
                <stop offset="100%" stopColor={z.dark}/>
              </radialGradient>
            ))}
          </defs>
          {WHEEL_ZONES.map((z,i)=>{
            const sa=(i/N)*2*Math.PI-Math.PI/2;
            const ea=((i+1)/N)*2*Math.PI-Math.PI/2;
            const x1=CX+R*Math.cos(sa),y1=CY+R*Math.sin(sa);
            const x2=CX+R*Math.cos(ea),y2=CY+R*Math.sin(ea);
            const ma=(sa+ea)/2;
            const tx=CX+(R*0.65)*Math.cos(ma),ty=CY+(R*0.65)*Math.sin(ma);
            return(<g key={i}>
              <path d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`}
                fill={`url(#wg${i})`} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5}/>
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
                fontSize={9} fontWeight="900" fill={z.text}
                transform={`rotate(${(i+0.5)*360/N},${tx},${ty})`}>{z.label}</text>
            </g>);
          })}
          <circle cx={CX} cy={CY} r={20} fill="#0a0518" stroke="rgba(249,215,28,0.4)" strokeWidth={2}/>
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fontSize={13}>🎡</text>
        </svg>
      </div>

      {/* 결과 메시지 */}
      <div style={{height:28,display:"flex",alignItems:"center",justifyContent:"center",margin:"4px 0"}}>
        {lastZone&&!spinning&&spinCount<TOTAL_SPINS&&(
          <div style={{fontSize:14,fontWeight:900,color:lastZone.color,
            textShadow:`0 0 8px ${lastZone.color}`,animation:"popIn .6s ease-out"}}>
            🎯 {lastZone.label==="LUCKY"?"🍀 LUCKY! 고빈도 번호!":lastZone.label+" 구역!"}
          </div>
        )}
        {spinning&&<div style={{color:"#888",fontSize:12,animation:"pulse .4s infinite"}}>🎡 돌아가는 중...</div>}
      </div>

      {/* 수집 번호 */}
      {collected.length>0&&<div style={{display:"flex",gap:5,justifyContent:"center",
        marginBottom:8,flexWrap:"wrap"}}>
        {collected.map((n,i)=>{const c=ballColor(n);return(
          <div key={i} style={{width:28,height:28,borderRadius:"50%",
            background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:11,fontWeight:900,color:c.text}}>{n}</div>
        );})}
      </div>}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#666",fontSize:12,cursor:"pointer"}}>← 홈</button>
        <span style={{fontSize:11,color:"#555"}}>스핀 {spinCount}/{TOTAL_SPINS}</span>
        <div style={{width:40}}/>
      </div>

      <button onClick={doSpin} disabled={spinning} style={{
        width:"100%",padding:"14px",borderRadius:14,border:"none",
        background:!spinning?"linear-gradient(135deg,#c8a800,#f9d71c)":"rgba(255,255,255,0.04)",
        color:!spinning?"#000":"#444",fontSize:17,fontWeight:900,
        cursor:!spinning?"pointer":"default",
        boxShadow:!spinning?"0 4px 24px rgba(249,215,28,0.45)":"none"}}>
        {spinning?"돌아가는 중...":"🎡  SPIN!"}
      </button>

      {/* 하단 전구줄 */}
      <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:10}}>
        {Array.from({length:12},(_,i)=>(
          <div key={i} style={{width:6,height:6,borderRadius:"50%",
            background:bulbColors[(i+bulbFrame+2)%bulbColors.length],
            boxShadow:`0 0 5px ${bulbColors[(i+bulbFrame+2)%bulbColors.length]}`,
            opacity:(i+bulbFrame)%2===0?0.25:1,transition:"all .3s"}}/>
        ))}
      </div>
    </div>
    <style>{`
      @keyframes twinkle{0%,100%{opacity:1}50%{opacity:0.2}}
      @keyframes popIn{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    `}</style>
  </div>);
}


// 지역별 고가 아파트 TOP5
const DREAM_APTS={
  "서울":[
    {name:"아크로리버파크",addr:"반포동",price:700000,floors:38,area:84},
    {name:"래미안원베일리",addr:"신반포",price:650000,floors:35,area:84},
    {name:"타워팰리스",addr:"도곡동",price:450000,floors:69,area:160},
    {name:"파크원",addr:"여의도",price:420000,floors:56,area:130},
    {name:"갤러리아포레",addr:"성수동",price:380000,floors:42,area:200},
  ],
  "부산":[
    {name:"엘시티더샵",addr:"해운대",price:250000,floors:85,area:244},
    {name:"해운대두산위브더제니스",addr:"중동",price:180000,floors:80,area:120},
    {name:"마린시티자이",addr:"우동",price:150000,floors:50,area:145},
    {name:"센텀리버파크",addr:"재송동",price:120000,floors:48,area:113},
    {name:"더샵센텀스타",addr:"우동",price:110000,floors:46,area:108},
  ],
  "대구":[
    {name:"수성레이크푸르지오",addr:"수성구",price:120000,floors:40,area:130},
    {name:"범어아이파크",addr:"범어동",price:100000,floors:38,area:114},
    {name:"대구SK뷰",addr:"동구",price:85000,floors:35,area:108},
    {name:"황금SK뷰",addr:"수성구",price:80000,floors:33,area:102},
    {name:"수성롯데캐슬",addr:"수성구",price:75000,floors:30,area:98},
  ],
  "광주":[
    {name:"광주아이파크",addr:"서구",price:80000,floors:36,area:114},
    {name:"힐스테이트리버파크",addr:"남구",price:70000,floors:33,area:108},
    {name:"광주롯데캐슬",addr:"북구",price:65000,floors:30,area:102},
    {name:"더샵광주센트럴",addr:"서구",price:60000,floors:28,area:98},
    {name:"광주SK뷰",addr:"광산구",price:55000,floors:25,area:94},
  ],
  "대전":[
    {name:"둔산자이",addr:"서구",price:90000,floors:35,area:114},
    {name:"도안힐스테이트",addr:"유성구",price:80000,floors:33,area:108},
    {name:"크로바아파트",addr:"서구",price:65000,floors:15,area:144},
    {name:"대전SK뷰",addr:"유성구",price:60000,floors:30,area:102},
    {name:"대전아이파크",addr:"중구",price:55000,floors:28,area:98},
  ],
  "인천":[
    {name:"송도더샵퍼스트파크",addr:"연수구",price:150000,floors:47,area:130},
    {name:"힐스테이트송도",addr:"연수구",price:130000,floors:44,area:114},
    {name:"송도SK뷰",addr:"연수구",price:110000,floors:40,area:108},
    {name:"청라SK뷰",addr:"서구",price:90000,floors:38,area:102},
    {name:"검단자이",addr:"서구",price:75000,floors:35,area:98},
  ],
};

const BUILDINGS_DATA=[
  {dong:"101동",color:"rgba(249,215,28,0.85)",floors:15,units:4},
  {dong:"102동",color:"rgba(105,200,242,0.85)",floors:12,units:4},
  {dong:"103동",color:"rgba(255,150,80,0.85)",floors:10,units:4},
];

const MAX_TAPS=6;
function makeGrid(){return BUILDINGS_DATA.map(b=>Array(b.floors).fill(null).map(()=>Array(b.units).fill("off")));}
function randomGrid(){return BUILDINGS_DATA.map(b=>Array(b.floors).fill(null).map(()=>Array(b.units).fill(null).map(()=>{const r=Math.random();if(r>0.88)return"red";if(r>0.45)return"on";return"off";})));}

function ApartmentScreen({onSave,onShare,onBack}){
  const[grid,setGrid]=useState(makeGrid);
  const[phase,setPhase]=useState("select"); // select → ready → play → result
  const[selectedRegion,setSelectedRegion]=useState(null);
  const[selectedApt,setSelectedApt]=useState(null);
  const[collected,setCollected]=useState([]);
  const[nums,setNums]=useState([]);
  const[miss,setMiss]=useState(false);
  const[sparks,setSparks]=useState([]);
  const[petals,setPetals]=useState([]);
  const triggerPetals=()=>{setPetals(spawnPetals());setTimeout(()=>setPetals([]),5000);};
  const alive=useRef(true);
  const ivRef=useRef(null);
  const sparkId=useRef(0);

  useEffect(()=>{alive.current=true;return()=>{alive.current=false;clearInterval(ivRef.current);};},[]);

  const start=()=>{
    setPhase("play");setCollected([]);setNums([]);setGrid(randomGrid());
    ivRef.current=setInterval(()=>{if(!alive.current)return;setGrid(randomGrid());},1100);
  };

  const spawnSparks=(e)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const x=rect.left+rect.width/2;
    const y=rect.top+rect.height/2;
    const colors=["#ff5050","#f9d71c","#ff9800","#ff7070","#ffcc00"];
    const id=sparkId.current++;
    const newSparks=Array.from({length:8},(_,i)=>({
      id:`${id}_${i}`,x,y,
      angle:(i/8)*360,
      color:colors[i%colors.length],
    }));
    setSparks(prev=>[...prev,...newSparks]);
    setTimeout(()=>setSparks(prev=>prev.filter(s=>!newSparks.find(n=>n.id===s.id))),600);
  };

  const tapWindow=(bi,fi,ui,cell,e)=>{
    if(phase!=="play")return;
    if(cell==="red"){
      clearInterval(ivRef.current);
      SFX.pop();
      setTimeout(()=>SFX.boom(20),100);
      if(e)spawnSparks(e);
      const num=Math.max(1,Math.min(45,((bi+1)*10+(BUILDINGS_DATA[bi].floors-fi)+ui)%45+1));
      const aptNums=selectedApt?[
        selectedApt.floors%45+1,
        selectedApt.area%45+1,
        Math.floor(selectedApt.price/10000)%45+1,
      ]:[];
      const next=[...collected,num];
      setCollected(next);
      setGrid(prev=>{const n=prev.map(b=>b.map(r=>[...r]));n[bi][fi][ui]="off";return n;});
      if(next.length>=MAX_TAPS){setNums(pickNums([...next,...aptNums]));setPhase("result");SFX.chime();triggerPetals();}
      else{ivRef.current=setInterval(()=>{if(!alive.current)return;setGrid(randomGrid());},1100);}
    } else {
      if(miss)return;
      SFX.tone(180,0.12,"sine",0.12);
      setMiss(true);setTimeout(()=>setMiss(false),700);
    }
  };

  const reset=()=>{clearInterval(ivRef.current);setGrid(makeGrid());setPhase("select");setCollected([]);setNums([]);setMiss(false);setSelectedApt(null);setSelectedRegion(null);};

  const W={minHeight:"100%",background:"linear-gradient(180deg,#020510,#040818,#030812)",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"10px 14px 24px",boxSizing:"border-box",color:"#fff"};

  return(<div style={W}>
    <PetalOverlay petals={petals}/>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",maxWidth:420,marginBottom:6}}>
      <button onClick={phase==="select"?onBack:()=>{setPhase("select");setSelectedApt(null);}} 
        style={{background:"none",border:"none",color:"#666",fontSize:13,cursor:"pointer"}}>
        {phase==="select"?"← 홈":"← 재선택"}
      </button>
      <span style={{fontSize:14,fontWeight:900,color:"#f9d71c"}}>🏢 아파트 불빛</span>
      <span style={{fontSize:11,color:"#555"}}>{phase==="play"?`${collected.length}/${MAX_TAPS}`:""}</span>
    </div>

    {/* 지역/아파트 선택 화면 */}
    {phase==="select"&&(
      <div style={{width:"100%",maxWidth:420,padding:"0 4px"}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:13,color:"#f9d71c",fontWeight:700,marginBottom:4}}>🏠 내 집 마련의 꿈</div>
          <div style={{fontSize:11,color:"#555"}}>어느 아파트를 구매해서 홈파티를 열까요?</div>
        </div>
        {/* 지역 선택 */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:14}}>
          {Object.keys(DREAM_APTS).map(r=>(
            <button key={r} onClick={()=>{setSelectedRegion(r);setSelectedApt(null);}} style={{
              padding:"7px 14px",borderRadius:20,border:`1px solid ${selectedRegion===r?"#f9d71c":"rgba(255,255,255,0.1)"}`,
              background:selectedRegion===r?"rgba(249,215,28,0.1)":"rgba(255,255,255,0.03)",
              color:selectedRegion===r?"#f9d71c":"#666",fontSize:12,fontWeight:selectedRegion===r?700:400,
              cursor:"pointer",transition:"all .2s"}}>{r}</button>
          ))}
        </div>
        {/* 아파트 TOP5 */}
        {selectedRegion&&DREAM_APTS[selectedRegion].map((apt,i)=>{
          const isSel=selectedApt?.name===apt.name;
          return(<div key={i} onClick={()=>setSelectedApt(apt)} style={{
            display:"flex",alignItems:"center",gap:12,
            background:isSel?"rgba(249,215,28,0.07)":"rgba(255,255,255,0.02)",
            border:`1px solid ${isSel?"rgba(249,215,28,0.3)":"rgba(255,255,255,0.05)"}`,
            borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer",transition:"all .2s"}}>
            <div style={{fontSize:18,fontWeight:900,color:isSel?"#f9d71c":"#444",minWidth:24}}>
              {i+1}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:isSel?"#f9d71c":"#888"}}>{apt.name}</div>
              <div style={{fontSize:10,color:"#444",marginTop:2}}>{selectedRegion} {apt.addr} · {apt.area}㎡</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:900,color:isSel?"#ff9800":"#555"}}>
                {(apt.price/10000).toFixed(0)}억
              </div>
              <div style={{fontSize:9,color:"#444"}}>{apt.floors}층</div>
            </div>
          </div>);
        })}
        {selectedApt&&(
          <button onClick={()=>setPhase("ready")} style={{
            width:"100%",padding:"14px",borderRadius:14,border:"none",marginTop:8,
            background:"linear-gradient(135deg,#c8a800,#f9d71c)",
            color:"#000",fontSize:15,fontWeight:900,cursor:"pointer",
            boxShadow:"0 4px 20px rgba(249,215,28,0.4)"}}>
            🎉 {selectedApt.name} 홈파티 시작!</button>
        )}
      </div>
    )}

    {phase!=="select"&&(<>
    <div style={{fontSize:12,marginBottom:10,textAlign:"center",fontWeight:700,minHeight:18,
      color:miss?"#ff4444":phase==="play"?"#ff6666":phase==="result"?"#50c878":"#555",transition:"color .2s"}}>
      {selectedApt&&phase==="ready"&&`🎉 ${selectedApt.name} 입주 축하! 홈파티를 열어요`}
      {phase==="play"&&!miss&&"🎊 파티 불빛을 찾아서 탭하세요!"}
      {phase==="play"&&miss&&"❌ 파티 불빛이 아니에요!"}
      {phase==="result"&&"✨ 홈파티 불빛 6개 완성! 번호가 나왔어요"}
    </div>

    <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:10,minHeight:30,flexWrap:"wrap",alignItems:"center"}}>
      {collected.map((n,i)=>{const c=ballColor(n);return(
        <div key={i} style={{width:28,height:28,borderRadius:"50%",background:c.bg,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:c.text}}>{n}</div>
      );})}
      {Array.from({length:MAX_TAPS-collected.length},(_,i)=>(
        <div key={i} style={{width:28,height:28,borderRadius:"50%",
          border:"1px dashed rgba(255,60,60,0.3)",display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:13,color:"rgba(255,60,60,0.3)"}}>🔴</div>
      ))}
    </div>

    {/* 도시 씬 */}
    <div style={{width:"100%",maxWidth:420,background:"linear-gradient(180deg,#020814,#030c1e)",
      borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,0.05)",
      boxShadow:"0 8px 32px rgba(0,0,0,0.6)"}}>
      <div style={{position:"relative",height:52,overflow:"hidden",background:"linear-gradient(180deg,#010208,#030816)"}}>
        <div style={{position:"absolute",right:"12%",top:"18%",width:22,height:22,borderRadius:"50%",
          background:"radial-gradient(circle at 40% 40%,#fffde7,rgba(249,215,28,0.5))",
          boxShadow:"0 0 16px rgba(249,215,28,0.3)"}}/>
        {Array.from({length:20},(_,i)=>(
          <div key={i} style={{position:"absolute",left:`${(i*43+7)%100}%`,top:`${(i*31+5)%90}%`,
            width:i%4===0?1.5:1,height:i%4===0?1.5:1,borderRadius:"50%",
            background:`rgba(255,255,255,${0.3+((i*7)%10)*0.05})`}}/>
        ))}
      </div>

      <div style={{display:"flex",gap:6,justifyContent:"center",padding:"0 10px",alignItems:"flex-end",
        background:"linear-gradient(180deg,#030c1e,#040f22)"}}>
        {BUILDINGS_DATA.map((b,bi)=>(
          <div key={bi} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
            <div style={{fontSize:9,color:"#3a4a6a",marginBottom:3,letterSpacing:1}}>{b.dong}</div>
            <div style={{background:"linear-gradient(180deg,#0c1228,#081020)",
              border:"1px solid rgba(255,255,255,0.05)",borderRadius:"4px 4px 0 0",
              padding:"4px 4px 0",position:"relative",width:"100%",
              boxShadow:"inset 0 0 20px rgba(0,0,0,0.4)"}}>
              <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:2,height:10,background:"#1a2a4a"}}/>
              <div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",
                width:5,height:5,borderRadius:"50%",background:"rgba(255,80,80,0.9)",
                boxShadow:"0 0 6px rgba(255,80,80,0.8)"}}/>
              {grid[bi].map((row,fi)=>(
                <div key={fi}>
                  <div style={{display:"flex",gap:3,padding:"2px 2px 0"}}>
                    {row.map((cell,ui)=>{
                      const isRed=cell==="red",isOn=cell==="on";
                      return(
                        <div key={ui} onClick={(e)=>tapWindow(bi,fi,ui,cell,e)} style={{
                          flex:1,height:11,borderRadius:2,
                          cursor:phase==="play"?"pointer":"default",
                          background:isRed?"rgba(255,50,50,0.95)":isOn?b.color:"#080e1e",
                          boxShadow:isRed?"0 0 8px rgba(255,50,50,0.9),0 0 18px rgba(255,50,50,0.5)":isOn?`0 0 6px ${b.color}`:"none",
                          border:`1px solid ${isRed?"rgba(255,120,120,0.4)":isOn?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.04)"}`,
                          transition:"background 0.3s,box-shadow 0.3s",
                          transform:isRed?"scale(1.08)":"scale(1)",
                        }}/>
                      );
                    })}
                  </div>
                  <div style={{height:4,margin:"0 0 1px",
                    background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.04),rgba(255,255,255,0.09),rgba(255,255,255,0.04),transparent)",
                    borderBottom:"1px solid rgba(255,255,255,0.06)",
                    borderTop:"1px solid rgba(0,0,0,0.3)"}}/>
                </div>
              ))}
            </div>
            <div style={{width:"108%",height:5,background:"linear-gradient(90deg,#060d1e,#0e1830,#060d1e)",
              borderTop:"1px solid rgba(255,255,255,0.06)"}}/>
          </div>
        ))}
      </div>

      <div style={{height:20,background:"linear-gradient(180deg,#05091a,#030712)",
        borderTop:"1px solid rgba(255,255,255,0.04)",
        display:"flex",alignItems:"flex-start",justifyContent:"space-around",paddingTop:2}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
            <div style={{width:5,height:5,borderRadius:"50%",
              background:"rgba(249,215,28,0.7)",boxShadow:"0 0 6px rgba(249,215,28,0.5)",marginBottom:1}}/>
            <div style={{width:1.5,height:10,background:"#1a2a4a"}}/>
          </div>
        ))}
      </div>
    </div>

    {phase==="result"&&nums.length>0&&(
      <div style={{marginTop:14,textAlign:"center",width:"100%",maxWidth:420}}>
        <div style={{fontSize:10,color:"#ff6666",marginBottom:8}}>🎊 홈파티 불빛 6개의 번호</div>
        <Balls nums={nums}/><NumLine nums={nums}/>
        <ActionBtns nums={nums} mode="🏢 아파트불빛" onSave={onSave} onShare={onShare}/>
      </div>
    )}

    <div style={{marginTop:12}}>
      {phase==="ready"&&(
        <button onClick={start} style={{padding:"13px 36px",borderRadius:50,border:"none",
          background:"linear-gradient(135deg,#c8a800,#f9d71c)",color:"#000",
          fontSize:14,fontWeight:900,cursor:"pointer",boxShadow:"0 4px 20px rgba(249,215,28,0.3)"}}>
          🏢 불빛 켜기
        </button>
      )}
      {phase==="result"&&(
        <button onClick={reset} style={{padding:"13px 36px",borderRadius:50,border:"none",
          background:"rgba(255,255,255,0.08)",color:"#888",fontSize:14,fontWeight:900,cursor:"pointer"}}>
          🔄 다시 하기
        </button>
      )}
    </div>
    <style>{`
      @keyframes twinkle{0%,100%{opacity:1}50%{opacity:0.2}}
      @keyframes sparkOut{0%{transform:translate(-50%,-50%) scale(1.2);opacity:1;}100%{opacity:0;}}
    `}</style>
    {/* 불꽃 파티클 */}
    {sparks.map(s=>{
      const rad=s.angle*Math.PI/180;
      const tx=Math.cos(rad)*45,ty=Math.sin(rad)*45;
      return(<div key={s.id} style={{
        position:"fixed",left:s.x,top:s.y,
        width:7,height:7,borderRadius:"50%",
        background:s.color,
        pointerEvents:"none",zIndex:9999,
        boxShadow:`0 0 6px ${s.color}`,
        animation:"sparkOut 0.55s ease-out forwards",
        transform:`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0)`,
      }}/>);
    })}
  </>)}
  </div>);
}


function VaultScreen({saved,onBack}){
  const[tab,setTab]=useState("vault");
  const[drwNo,setDrwNo]=useState("");
  const[purchase,setPurchase]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("v2_purchase")||"[]");}catch(e){return[];}
  });
  const[purchaseAmt,setPurchaseAmt]=useState("");
  const[winNums,setWinNums]=useState(null);
  const[bonusNum,setBonusNum]=useState(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState("");
  const[selectedId,setSelectedId]=useState(null);

  const fetchWinNums=async()=>{
    if(!drwNo||isNaN(drwNo))return;
    setLoading(true);setError("");setWinNums(null);setBonusNum(null);
    try{
      const res=await fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`);
      const data=await res.json();
      if(data.returnValue==="success"){
        setWinNums([data.drwtNo1,data.drwtNo2,data.drwtNo3,data.drwtNo4,data.drwtNo5,data.drwtNo6]);
        setBonusNum(data.bnusNo);
      } else setError("해당 회차 정보가 없어요");
    }catch(e){setError("조회 실패. 네트워크를 확인해주세요");}
    setLoading(false);
  };

  const analyze=(nums)=>{
    if(!winNums)return null;
    const matchNums=nums.filter(n=>winNums.includes(n));
    const bonusMatch=nums.includes(bonusNum)&&matchNums.length===5;
    const mc=matchNums.length;
    const rank=mc===6?{r:"1등",c:"#f9d71c",e:"🏆"}
      :mc===5&&bonusMatch?{r:"2등",c:"#ff9800",e:"🥈"}
      :mc===5?{r:"3등",c:"#ff7272",e:"🥉"}
      :mc===4?{r:"4등",c:"#69c8f2",e:"🎉"}
      :mc===3?{r:"5등",c:"#b0d840",e:"✨"}
      :{r:"낙첨",c:"#444",e:"😢"};
    return{matchNums,bonusMatch,rank,mc};
  };

  const W={minHeight:"100%",background:"linear-gradient(160deg,#080818,#101030)",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"0 0 32px",boxSizing:"border-box",color:"#fff"};
  const box=(ex={})=>({background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:14,...ex});

  return(<div style={W}>
    {/* 헤더 + 탭 */}
    <div style={{width:"100%",background:"rgba(8,8,24,0.95)",
      borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"14px 16px 0",
      position:"sticky",top:0,zIndex:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,maxWidth:420,margin:"0 auto 14px"}}>
        <div style={{fontSize:15,fontWeight:900}}>📁 번호함</div>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",
          borderRadius:50,padding:"7px 14px",fontSize:11,color:"#888",cursor:"pointer"}}>← 홈</button>
      </div>
      <div style={{display:"flex",maxWidth:420,margin:"0 auto"}}>
        {[{id:"vault",label:"📁 저장번호"},{id:"analysis",label:"📊 당첨분석"},{id:"purchase",label:"🐷 구입기록"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,padding:"11px 8px",border:"none",background:"none",
            color:tab===t.id?"#f9d71c":"#444",fontSize:13,fontWeight:tab===t.id?900:400,
            cursor:"pointer",borderBottom:`2.5px solid ${tab===t.id?"#f9d71c":"transparent"}`,
            transition:"all .2s"}}>{t.label}</button>
        ))}
      </div>
    </div>

    <div style={{width:"100%",maxWidth:420,padding:"16px 16px 0"}}>

      {/* 저장번호 탭 */}
      {tab==="vault"&&(saved.length===0?(
        <div style={{...box({textAlign:"center",padding:40})}}>
          <div style={{fontSize:36,marginBottom:8}}>📭</div>
          <div style={{color:"#555",fontSize:13}}>저장된 번호가 없습니다</div>
        </div>
      ):saved.map((s,i)=>(
        <div key={i} style={{...box({marginBottom:10})}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:11,color:"#69c8f2",fontWeight:700}}>{s.mode}</span>
            <span style={{fontSize:10,color:"#555"}}>{s.date}</span>
          </div>
          <Balls nums={s.nums} size={40}/>
          <NumLine nums={s.nums}/>
          {s.wish&&(
            <div style={{marginTop:8,padding:"6px 10px",
              background:"rgba(249,215,28,0.06)",borderRadius:8,
              fontSize:11,color:"#886600",textAlign:"center"}}>
              {s.wish.em} {s.wish.msg}
            </div>
          )}
        </div>
      )))}

      {/* 당첨분석 탭 */}
      {tab==="analysis"&&(<>
        {/* 회차 입력 */}
        <div style={{...box({marginBottom:14,background:"rgba(249,215,28,0.05)",
          border:"1px solid rgba(249,215,28,0.15)"})}}>
          <div style={{fontSize:11,color:"#886600",marginBottom:10,fontWeight:700}}>🎰 회차 입력</div>
          <div style={{display:"flex",gap:8,marginBottom:winNums?12:0}}>
            <input value={drwNo} onChange={e=>setDrwNo(e.target.value.replace(/\D/g,""))}
              placeholder="예: 1222" maxLength={4}
              style={{flex:1,background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(249,215,28,0.2)",borderRadius:10,
                padding:"10px 14px",color:"#fff",fontSize:16,fontWeight:700,outline:"none"}}/>
            <button onClick={fetchWinNums} disabled={loading||!drwNo} style={{
              padding:"10px 18px",borderRadius:10,border:"none",
              background:drwNo?"linear-gradient(135deg,#c8a800,#f9d71c)":"rgba(255,255,255,0.05)",
              color:drwNo?"#000":"#444",fontSize:14,fontWeight:900,
              cursor:drwNo?"pointer":"default",whiteSpace:"nowrap"}}>
              {loading?"조회중":"조회"}
            </button>
          </div>
          {error&&<div style={{fontSize:11,color:"#ff7272",marginTop:6}}>{error}</div>}
          {/* 당첨번호 표시 */}
          {winNums&&(
            <div>
              <div style={{fontSize:10,color:"#886600",marginBottom:8}}>{drwNo}회 당첨번호</div>
              <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                {winNums.map((n,i)=>{const c=ballColor(n);return(
                  <div key={i} style={{width:32,height:32,borderRadius:"50%",
                    background:`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontWeight:900,color:c.text}}>{n}</div>
                );})}
                <div style={{color:"#555",fontSize:11}}>+</div>
                {bonusNum&&(()=>{const c=ballColor(bonusNum);return(
                  <div style={{width:32,height:32,borderRadius:"50%",
                    background:`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontWeight:900,color:c.text,
                    border:"2px solid #ff9800"}}>{bonusNum}</div>
                );})()}
                <div style={{fontSize:9,color:"#555"}}>보너스</div>
              </div>
            </div>
          )}
        </div>

        {/* 저장번호 비교 */}
        {saved.length===0?(
          <div style={{textAlign:"center",padding:"30px 0",color:"#444",fontSize:13}}>
            저장된 번호가 없어요
          </div>
        ):saved.map((s,i)=>{
          const result=winNums?analyze(s.nums):null;
          const isSel=selectedId===i;
          const isWin=result&&result.r!=="낙첨";
          return(
            <div key={i} onClick={()=>setSelectedId(isSel?null:i)} style={{
              background:isWin?"rgba(80,200,120,0.06)":"rgba(255,255,255,0.03)",
              border:`1px solid ${isWin?"rgba(80,200,120,0.2)":"rgba(255,255,255,0.06)"}`,
              borderRadius:14,padding:"12px 14px",marginBottom:10,cursor:"pointer",transition:"all .2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"#69c8f2"}}>{s.mode}</div>
                  <div style={{fontSize:10,color:"#444",marginTop:1}}>{s.date}</div>
                </div>
                {result&&(
                  <div style={{textAlign:"center",background:`${result.rank.c}18`,
                    border:`1px solid ${result.rank.c}44`,borderRadius:20,padding:"4px 10px"}}>
                    <div style={{fontSize:14}}>{result.rank.e}</div>
                    <div style={{fontSize:11,fontWeight:900,color:result.rank.c}}>{result.rank.r}</div>
                    {result.mc>0&&<div style={{fontSize:9,color:result.rank.c,opacity:0.7}}>{result.mc}개 일치</div>}
                  </div>
                )}
              </div>
              {/* 볼 - 일치 강조 */}
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {s.nums.map((n,j)=>{
                  const hit=result?.matchNums.includes(n);
                  const c=ballColor(n);
                  return(<div key={j} style={{
                    width:32,height:32,borderRadius:"50%",
                    background:hit?`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`:"rgba(255,255,255,0.06)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,fontWeight:900,color:hit?c.text:"#333",
                    boxShadow:hit?`0 0 0 2px #50c878,0 4px 8px ${c.bg}44`:"none",
                    transition:"all .2s"}}>{n}</div>);
                })}
              </div>
              {result&&result.mc>0&&isSel&&(
                <div style={{marginTop:8,padding:"6px 10px",
                  background:"rgba(80,200,120,0.08)",borderRadius:8,
                  fontSize:11,color:"#50c878"}}>
                  {result.matchNums.join(", ")}번 일치!{result.bonusMatch&&" · 보너스 포함"}
                </div>
              )}
            </div>
          );
        })}

        {/* 요약 */}
        {winNums&&saved.length>0&&(
          <div style={{...box({marginTop:4})}}>
            <div style={{fontSize:11,color:"#555",marginBottom:10,fontWeight:700}}>📈 이번 회차 요약</div>
            <div style={{display:"flex",gap:8,justifyContent:"space-around"}}>
              {[
                ["저장번호",`${saved.length}개`,"#f9d71c"],
                ["최다일치",`${Math.max(...saved.map(s=>analyze(s.nums)?.mc||0))}개`,"#50c878"],
                ["5등이상",`${saved.filter(s=>(analyze(s.nums)?.mc||0)>=3).length}개`,"#ff9800"],
              ].map(([k,v,c])=>(
                <div key={k} style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#444",marginBottom:4}}>{k}</div>
                  <div style={{fontSize:18,fontWeight:900,color:c}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!winNums&&(
          <div style={{textAlign:"center",padding:"20px 0",color:"#333",fontSize:12}}>
            회차 입력하면 내 번호와 자동 비교해드려요 🎰
          </div>
        )}
      </>)}

      {/* 구입기록 탭 */}
      {tab==="purchase"&&(<>
        <div style={{background:"rgba(249,215,28,0.05)",border:"1px solid rgba(249,215,28,0.12)",
          borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:"#886600",marginBottom:10,fontWeight:700}}>🐷 이번 주 구입금액</div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {[5000,10000,15000,20000].map(a=>(
              <button key={a} onClick={()=>setPurchaseAmt(String(a))} style={{
                flex:1,padding:"8px 4px",borderRadius:8,border:`1px solid ${purchaseAmt===String(a)?"#f9d71c":"rgba(255,255,255,0.08)"}`,
                background:purchaseAmt===String(a)?"rgba(249,215,28,0.12)":"rgba(255,255,255,0.03)",
                color:purchaseAmt===String(a)?"#f9d71c":"#555",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {(a/1000)}천
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input value={purchaseAmt} onChange={e=>setPurchaseAmt(e.target.value.replace(/\D/g,""))}
              placeholder="직접입력 (원)" style={{flex:1,background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(249,215,28,0.15)",borderRadius:8,
                padding:"8px 10px",color:"#fff",fontSize:13,outline:"none"}}/>
            <button onClick={()=>{
              if(!purchaseAmt)return;
              const today=new Date();
              const record={date:`${today.getMonth()+1}/${today.getDate()}`,
                amt:parseInt(purchaseAmt),week:`${today.getFullYear()}-W${Math.ceil(today.getDate()/7)}`};
              const next=[record,...purchase].slice(0,20);
              setPurchase(next);
              localStorage.setItem("v2_purchase",JSON.stringify(next));
              setPurchaseAmt("");
            }} style={{padding:"8px 14px",borderRadius:8,border:"none",
              background:"linear-gradient(135deg,#c8a800,#f9d71c)",
              color:"#000",fontSize:13,fontWeight:900,cursor:"pointer"}}>기록</button>
          </div>
        </div>

        {/* 이번 주 합계 */}
        {purchase.length>0&&(()=>{
          const thisWeek=new Date();
          const wk=`${thisWeek.getFullYear()}-W${Math.ceil(thisWeek.getDate()/7)}`;
          const weekTotal=purchase.filter(p=>p.week===wk).reduce((s,p)=>s+p.amt,0);
          return(
            <div style={{background:"rgba(255,150,0,0.05)",border:"1px solid rgba(255,150,0,0.12)",
              borderRadius:14,padding:"12px 14px",marginBottom:14,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:12,color:"#886633"}}>이번 주 총 구입</div>
              <div style={{fontSize:20,fontWeight:900,color:"#ff9800"}}>
                {weekTotal.toLocaleString()}원
              </div>
            </div>
          );
        })()}

        {/* 기록 목록 */}
        {purchase.length===0?(
          <div style={{textAlign:"center",padding:"30px 0",color:"#333",fontSize:12}}>
            구입금액을 기록해보세요 🐷
          </div>
        ):purchase.map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"10px 12px",background:"rgba(255,255,255,0.03)",
            border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,marginBottom:6}}>
            <div style={{fontSize:12,color:"#555"}}>{p.date}</div>
            <div style={{fontSize:14,fontWeight:700,color:"#f9d71c"}}>{p.amt.toLocaleString()}원</div>
          </div>
        ))}
      </>)}
    </div>
  </div>);
}

// ════════════════════════════════════════════════════════════
// 👤 프로필
// ════════════════════════════════════════════════════════════
function ProfileScreen({profile,onSave,onBack}){
  const[name,setName]=useState(profile?.name||"");
  const[year,setYear]=useState(profile?.year||"1980");
  const[blood,setBlood]=useState(profile?.blood||"A");
  const[gender,setGender]=useState(profile?.gender||"남");
  const yr=parseInt(year)||1980;
  const pz=year.length===4?getZodiac(yr):"?";
  const pa=year.length===4?getAge(yr):"?";
  const save=()=>{if(year.length!==4||yr<1940||yr>2010){alert("생년도 4자리를 입력하세요");return;}onSave({name,year,blood,gender});};
  const W={minHeight:"100%",background:"linear-gradient(160deg,#080818,#101030)",
    display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px 32px",boxSizing:"border-box",color:"#fff"};
  const box=(ex={})=>({background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:14,...ex});
  const inp={width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:14,boxSizing:"border-box",outline:"none"};
  return(<div style={W}>
    <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:900}}>👤 내 정보</div>
      {profile&&<button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:50,padding:"7px 14px",fontSize:11,color:"#888",cursor:"pointer"}}>← 홈</button>}
    </div>
    <div style={{width:"100%",maxWidth:420}}>
      <div style={{...box({marginBottom:12})}}>
        <div style={{fontSize:11,color:"#888",marginBottom:6}}>이름 (선택)</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="이름" style={{...inp,marginBottom:14}}/>
        <div style={{fontSize:11,color:"#888",marginBottom:6}}>생년도</div>
        <input value={year} onChange={e=>setYear(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="예: 1980" style={inp}/>
        {year.length===4&&(
          <div style={{display:"flex",gap:8,marginTop:8}}>
            {[[`${pa}세`,"나이"],[`${getZodiacEm(pz)} ${pz}띠`,"띠"]].map(([v,k])=>(
              <div key={k} style={{...box({padding:"8px",flex:1,textAlign:"center"})}}><div style={{fontSize:9,color:"#555"}}>{k}</div><div style={{fontSize:16,fontWeight:900,color:"#f9d71c"}}>{v}</div></div>
            ))}
          </div>
        )}
        <div style={{fontSize:11,color:"#888",margin:"14px 0 6px"}}>성별</div>
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {["남","여"].map(g=><button key={g} onClick={()=>setGender(g)} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${gender===g?"#69c8f2":"rgba(255,255,255,0.1)"}`,background:gender===g?"rgba(105,200,242,0.1)":"rgba(255,255,255,0.03)",color:gender===g?"#69c8f2":"#777",fontWeight:700,fontSize:14,cursor:"pointer"}}>{g}</button>)}
        </div>
        <div style={{fontSize:11,color:"#888",marginBottom:6}}>혈액형</div>
        <div style={{display:"flex",gap:8}}>
          {["A","B","O","AB"].map(b=><button key={b} onClick={()=>setBlood(b)} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${blood===b?"#f9d71c":"rgba(255,255,255,0.1)"}`,background:blood===b?"rgba(249,215,28,0.1)":"rgba(255,255,255,0.03)",color:blood===b?"#f9d71c":"#777",fontWeight:900,fontSize:14,cursor:"pointer"}}>{b}</button>)}
        </div>
      </div>
      <button onClick={save} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#f9d71c,#ff9800)",color:"#000",fontSize:15,fontWeight:900,cursor:"pointer"}}>저장 ✓</button>
    </div>
  </div>);
}

// ════════════════════════════════════════════════════════════
// 메인 앱
// ════════════════════════════════════════════════════════════
export default function App(){
  const[screen,setScreen]=useState("loading");
  const[profile,setProfile]=useState(null);
  const[favorites,setFavorites]=useState([]);
  const[saved,setSaved]=useState([]);
  const[shareData,setShareData]=useState(null);
  const[onboardStep,setOnboardStep]=useState(0);

  useEffect(()=>{
    (async()=>{
      try{
        const p=localStorage.getItem("v2_profile");
        const f=localStorage.getItem("v2_fav");
        const s=localStorage.getItem("v2_saved");
        const ob=localStorage.getItem("v2_onboarded");
        if(p)try{setProfile(JSON.parse(p));}catch(e){}
        if(f)try{setFavorites(JSON.parse(f));}catch(e){}
        if(s)try{setSaved(JSON.parse(s));}catch(e){}
        if(!ob){setScreen("onboarding");}
        else{setScreen("home");}
      }catch(e){setScreen("onboarding");}
    })();
  },[]);

  const finishOnboarding=async()=>{
    try{localStorage.setItem("v2_onboarded","true");}catch(e){}
    setScreen("home");
  };

  const saveProfile=async(p)=>{setProfile(p);try{localStorage.setItem("v2_profile",JSON.stringify(p));}catch(e){}setScreen("home");};
  const saveFavorites=async(f)=>{setFavorites(f);try{localStorage.setItem("v2_fav",JSON.stringify(f));}catch(e){}};
  const saveNums=async(nums,mode,wishId=null)=>{
    const wish=wishId?DREAM_WISHES.find(w=>w.id===wishId):null;
    const e={nums,mode,date:todayStr(),wish:wish?{em:wish.em,label:wish.label,msg:wish.msg}:null};
    const nx=[e,...saved].slice(0,30);
    setSaved(nx);try{localStorage.setItem("v2_saved",JSON.stringify(nx));}catch(e){}
    if(!wishId)alert("번호함에 저장됐습니다! 💾");
  };
  const handleShare=(nums,mode)=>setShareData({nums,mode});
  const goHome=()=>setScreen("home");

  const today=todayStr();
  const zodiac=profile?getZodiac(parseInt(profile.year)):null;
  const zodiacEm=zodiac?getZodiacEm(zodiac):"";
  const age=profile?getAge(parseInt(profile.year)):null;

  const BG="linear-gradient(160deg,#080818 0%,#101030 100%)";
  const W={minHeight:"100vh",background:BG,fontFamily:"'Malgun Gothic','Apple SD Gothic Neo',sans-serif",color:"#fff",boxSizing:"border-box"};

  // ── 로딩
  if(screen==="loading")return(
    <div style={{...W,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
      <div style={{fontSize:64,marginBottom:16,animation:"pulse 1s infinite"}}>🍀</div>
      <div style={{fontSize:13,color:"#555",letterSpacing:2}}>행운을 불러오는 중...</div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:.7}}`}</style>
    </div>
  );

  // ── 온보딩
  const STEPS=[
    {
      em:"🍀",
      title:"오늘 나에게\n행운이 있었을까?",
      desc:"오늘의 하루를 기록하고\n나만의 로또 번호를 뽑아요",
      sub:"매일 새로운 번호, 매일 새로운 행운",
      bg:"linear-gradient(160deg,#080818,#0a0a2a)",
      color:"#f9d71c",
    },
    {
      em:"📍",
      title:"내 주변 명당의\n기운을 받아요",
      desc:"GPS로 근처 로또 명당을 찾고\n그 좌표로 번호를 뽑아요",
      sub:"전국 명당 데이터 내장 · 좌표 기반 번호",
      bg:"linear-gradient(160deg,#0a0818,#150820)",
      color:"#ff9800",
    },
    {
      em:"💩",
      title:"꿈에서도\n행운을 찾아요",
      desc:"어젯밤 꿈 키워드 + 역대 당첨 빈도\n조합으로 번호를 뽑아요",
      sub:"💩 똥꿈 꿨다면? 재물운 1순위!",
      bg:"linear-gradient(160deg,#080820,#100830)",
      color:"#b44aff",
    },
    {
      em:"🎰",
      title:"행운은 오늘\n당신 곁에 있어요",
      desc:"매주 복권을 살 때마다\n이 앱으로 번호를 뽑아보세요",
      sub:"당첨되면 꼭 알려주세요 🍀",
      bg:"linear-gradient(160deg,#0a0a14,#101030)",
      color:"#50c878",
    },
  ];

  if(screen==="onboarding"){
    const s=STEPS[onboardStep];
    const isLast=onboardStep===STEPS.length-1;
    return(
      <div style={{...W,display:"flex",flexDirection:"column",alignItems:"center",
        justifyContent:"space-between",padding:"0 0 40px",
        background:s.bg,transition:"background .5s"}}>

        {/* 상단 스킵 */}
        <div style={{width:"100%",display:"flex",justifyContent:"flex-end",padding:"20px 20px 0"}}>
          {!isLast&&(
            <button onClick={finishOnboarding} style={{background:"none",border:"none",
              color:"rgba(255,255,255,0.3)",fontSize:13,cursor:"pointer"}}>건너뛰기</button>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",padding:"0 32px",textAlign:"center"}}>

          {/* 이모지 */}
          <div style={{fontSize:90,marginBottom:32,lineHeight:1,
            filter:`drop-shadow(0 0 30px ${s.color}66)`,
            animation:"floatAnim 5s ease-in-out infinite"}}>
            {s.em}
          </div>

          {/* 제목 */}
          <h1 style={{fontSize:26,fontWeight:900,lineHeight:1.4,marginBottom:16,
            color:"#fff",whiteSpace:"pre-line",letterSpacing:-0.5}}>
            {s.title}
          </h1>

          {/* 설명 */}
          <p style={{fontSize:15,color:"rgba(255,255,255,0.6)",lineHeight:1.8,
            marginBottom:12,whiteSpace:"pre-line"}}>
            {s.desc}
          </p>

          {/* 서브 */}
          <p style={{fontSize:12,color:s.color,fontWeight:700,
            background:`${s.color}18`,border:`1px solid ${s.color}33`,
            borderRadius:20,padding:"6px 16px"}}>
            {s.sub}
          </p>
        </div>

        {/* 하단 */}
        <div style={{width:"100%",padding:"0 24px"}}>
          {/* 페이지 도트 */}
          <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:24}}>
            {STEPS.map((_,i)=>(
              <div key={i} onClick={()=>setOnboardStep(i)} style={{
                width:i===onboardStep?24:8,height:8,borderRadius:4,cursor:"pointer",
                background:i===onboardStep?s.color:"rgba(255,255,255,0.2)",
                transition:"all .3s",
              }}/>
            ))}
          </div>

          {/* 버튼 */}
          {isLast?(
            <button onClick={finishOnboarding} style={{
              width:"100%",padding:"17px",borderRadius:16,border:"none",
              background:`linear-gradient(135deg,${s.color},#f9d71c)`,
              color:"#000",fontSize:17,fontWeight:900,cursor:"pointer",
              boxShadow:`0 6px 28px ${s.color}44`,letterSpacing:0.5,
            }}>🍀 번호 뽑으러 가기!</button>
          ):(
            <button onClick={()=>setOnboardStep(i=>i+1)} style={{
              width:"100%",padding:"17px",borderRadius:16,border:"none",
              background:`linear-gradient(135deg,${s.color}cc,${s.color})`,
              color:"#000",fontSize:17,fontWeight:900,cursor:"pointer",
              boxShadow:`0 6px 24px ${s.color}33`,
            }}>다음 →</button>
          )}
        </div>
        <style>{`
          @keyframes floatAnim{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        `}</style>
      </div>
    );
  }
  if(screen==="profile")return(<div style={W}><ProfileScreen profile={profile} onSave={saveProfile} onBack={goHome}/></div>);

  const SCREENS={
    today:    <TodayScreen profile={profile} onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    dream:    <DreamScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    fortune:  <FortuneScreen profile={profile} onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    location: <LocationScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    formula:  <FormulaScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    favorites:<FavoritesScreen favorites={favorites} onSaveFav={saveFavorites} onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    wheel:    <WheelScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    slot:     <ApartmentScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    vault:    <VaultScreen saved={saved} onBack={goHome}/>,
  };

  if(SCREENS[screen])return(
    <div style={W}>
      <ShareModal data={shareData} onClose={()=>setShareData(null)}/>
      {SCREENS[screen]}
    </div>
  );

  // ══ HOME ═══════════════════════════════════════════════════
  const MENUS=[
    {id:"today",    em:"🌅",title:"오늘의 하루",  tc:"#f9d71c",accent:"#f9d71c22",sub:"기분·날씨·걸음수로 번호 뽑기"},
    {id:"location", em:"📍",title:"우리동네 명당", tc:"#ff9800",accent:"#ff980022",sub:"GPS 기준 명당 좌표로 번호 추출"},
    {id:"dream",    em:"🌙",title:"꿈해몽",        tc:"#c084fc",accent:"#c084fc22",sub:"꿈 키워드 + 역대 당첨 빈도 조합"},
    {id:"fortune",  em:"⭐",title:"오늘의 운세",   tc:"#a78bfa",accent:"#a78bfa22",sub:"지금 이 순간의 시각·날짜로 번호"},
    {id:"wheel",    em:"🎡",title:"행운의 휠",     tc:"#f9d71c",accent:"#f9d71c22",sub:"6번 스핀 → 번호 추출"},
    {id:"slot",     em:"🏢",title:"아파트불빛",    tc:"#69c8f2",accent:"#69c8f222",sub:"아파트 구매 후 홈파티로 번호 뽑기"},
    {id:"formula",  em:"🎂",title:"가족의행운",    tc:"#69c8f2",accent:"#69c8f222",sub:"가족 생년월일로 번호를 뽑아요"},
    {id:"favorites",em:"💛",title:"선호번호",      tc:"#f9d71c",accent:"#f9d71c22",sub:"평생번호 + 오늘의 선택번호"},
  ];

  const DAY_REC=[
    {em:"🌅",title:"오늘의 하루",  id:"today",   sub:"오늘 하루를 기록해서"},
    {em:"📍",title:"우리동네 명당",id:"location",sub:"내 주변 명당의 기운을"},
    {em:"🌙",title:"꿈해몽",       id:"dream",   sub:"어젯밤 꿈으로"},
    {em:"⭐",title:"오늘의 운세",  id:"fortune", sub:"지금 이 순간의 운세를"},
    {em:"🎡",title:"행운의 휠",    id:"wheel",   sub:"휠을 돌려서"},
    {em:"🏢",title:"아파트불빛",   id:"slot",    sub:"내 집 마련의 꿈으로"},
    {em:"🎂",title:"가족의행운",   id:"formula", sub:"가족과 함께하는"},
  ];
  const recommended=DAY_REC[new Date().getDay()];

  const getLottoCD=()=>{
    const n=new Date(),s=new Date(n);
    s.setDate(n.getDate()+((n.getDay()===6?0:6-n.getDay())||7));
    s.setHours(20,0,0,0);if(s<=n)s.setDate(s.getDate()+7);
    const d=s-n;
    const weekMs=7*24*60*60*1000;
    const elapsed=weekMs-d;
    return{
      days:Math.floor(d/86400000),
      hours:Math.floor((d%86400000)/3600000),
      mins:Math.floor((d%3600000)/60000),
      secs:Math.floor((d%60000)/1000),
      pct:Math.max(0,Math.min(100,(elapsed/weekMs)*100)),
      urgent:d<3600000,vurgent:d<600000,
    };
  };
  const[cd,setCD]=useState(getLottoCD());
  const[cdBlink,setCdBlink]=useState(false);
  useEffect(()=>{
    const iv=setInterval(()=>{setCD(getLottoCD());setCdBlink(b=>!b);},1000);
    return()=>clearInterval(iv);
  },[]);
  const lastSaved=saved.length>0?saved[0]:null;
  const num=(n,w)=>String(n).padStart(w||2,"0");

  return(
    <div style={{...W,display:"flex",flexDirection:"column",alignItems:"center",position:"relative",overflow:"hidden"}}>
      <ShareModal data={shareData} onClose={()=>setShareData(null)}/>

      {/* 배경 글로우 */}
      <div style={{position:"fixed",top:-200,left:"50%",transform:"translateX(-50%)",
        width:600,height:400,borderRadius:"50%",pointerEvents:"none",zIndex:0,
        background:"radial-gradient(ellipse,rgba(249,215,28,0.04) 0%,transparent 70%)"}}/>

      <div style={{width:"100%",maxWidth:420,padding:"0 16px 40px",position:"relative",zIndex:1}}>

        {/* 탑바 */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"52px 0 24px"}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,letterSpacing:-0.5,
              background:"linear-gradient(90deg,#f9d71c,#ff9800)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              오늘의 행운
            </div>
            <div style={{fontSize:11,color:"#333",marginTop:2,letterSpacing:2}}>{today}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setScreen("vault")} style={{
              width:36,height:36,borderRadius:"50%",cursor:"pointer",
              background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>📁</button>
            <button onClick={()=>setScreen("profile")} style={{
              width:36,height:36,borderRadius:"50%",cursor:"pointer",
              background:"rgba(249,215,28,0.08)",border:"1px solid rgba(249,215,28,0.2)",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
              {profile?zodiacEm:"🍀"}
            </button>
          </div>
        </div>

        {/* 카운트다운 */}
        <div style={{
          background:cd.urgent?"rgba(255,70,70,0.08)":"linear-gradient(135deg,rgba(249,215,28,0.06),rgba(255,150,0,0.04))",
          border:`1px solid ${cd.urgent?"rgba(255,70,70,0.3)":"rgba(249,215,28,0.12)"}`,
          borderRadius:24,padding:"20px 22px",marginBottom:12,
          position:"relative",overflow:"hidden",
          boxShadow:cd.vurgent?"0 0 30px rgba(255,70,70,0.15)":"none",transition:"all .5s",
        }}>
          <div style={{position:"absolute",right:-20,top:-20,fontSize:80,opacity:0.04,pointerEvents:"none"}}>🎰</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{fontSize:10,color:cd.urgent?"#ff7070":"#664400",fontWeight:700,letterSpacing:2,marginBottom:8}}>
                이번 회차 마감
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                {cd.days>0&&(<>
                  <span style={{fontSize:44,fontWeight:900,lineHeight:1,fontFamily:"monospace",
                    color:cd.urgent?"#ff6b6b":"#f9d71c",
                    textShadow:cd.urgent?"0 0 20px rgba(255,107,107,0.5)":"0 0 20px rgba(249,215,28,0.3)"}}>
                    {cd.days}
                  </span>
                  <span style={{fontSize:12,color:"#555",marginRight:8}}>일</span>
                </>)}
                <span style={{fontSize:44,fontWeight:900,lineHeight:1,fontFamily:"monospace",
                  color:cd.urgent?"#ff6b6b":"#f9d71c"}}>{num(cd.hours)}</span>
                <span style={{fontSize:12,color:"#555"}}>시</span>
                <span style={{fontSize:44,fontWeight:900,lineHeight:1,fontFamily:"monospace",
                  color:cd.urgent?"#ff6b6b":"#f9d71c"}}>{num(cd.mins)}</span>
                <span style={{fontSize:12,color:"#555"}}>분</span>
                <span style={{fontSize:44,fontWeight:900,lineHeight:1,fontFamily:"monospace",transition:"color .3s",
                  color:cd.vurgent?(cdBlink?"#ff4444":"#ff9999"):cd.urgent?"#ff6b6b":"#f9d71c",
                  textShadow:cd.urgent?"0 0 20px rgba(255,107,107,0.5)":"0 0 20px rgba(249,215,28,0.3)"}}>
                  {num(cd.secs)}
                </span>
                <span style={{fontSize:12,color:"#555"}}>초</span>
              </div>
            </div>
            <div style={{textAlign:"right",paddingTop:4}}>
              <div style={{fontSize:9,color:"#444",marginBottom:2}}>매주 토요일</div>
              <div style={{fontSize:12,fontWeight:700,color:"#555"}}>오후 8:00</div>
              {cd.urgent&&<div style={{marginTop:6,fontSize:10,fontWeight:700,
                color:cdBlink?"#ff6b6b":"#ff9999",transition:"color .3s"}}>⚡ 서두르세요!</div>}
            </div>
          </div>
          <div style={{height:3,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:99,width:`${cd.pct}%`,transition:"width 1s linear",
              background:cd.urgent?"linear-gradient(90deg,#ff4444,#ff9800)":"linear-gradient(90deg,#c8a800,#f9d71c,#ff9800)",
              boxShadow:cd.urgent?"0 0 8px rgba(255,68,68,0.6)":"0 0 8px rgba(249,215,28,0.4)"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
            <span style={{fontSize:9,color:"#2a2a2a"}}>월요일</span>
            <span style={{fontSize:9,color:"#2a2a2a"}}>토 오후 8시</span>
          </div>
        </div>

        {/* 오늘의 추천 + 마지막 번호 2분할 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <button onClick={()=>{SFX.pop();setScreen(recommended.id);}} style={{
            background:"linear-gradient(135deg,rgba(192,132,252,0.08),rgba(139,92,246,0.04))",
            border:"1px solid rgba(192,132,252,0.15)",
            borderRadius:20,padding:"16px 14px",cursor:"pointer",textAlign:"left",
            position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",right:-8,bottom:-8,fontSize:48,opacity:0.06,pointerEvents:"none"}}>
              {recommended.em}
            </div>
            <div style={{fontSize:9,color:"rgba(192,132,252,0.6)",letterSpacing:2,marginBottom:8,fontWeight:700}}>
              오늘의 추천
            </div>
            <div style={{fontSize:26,marginBottom:8}}>{recommended.em}</div>
            <div style={{fontSize:13,fontWeight:900,color:"#c084fc",marginBottom:3,lineHeight:1.2}}>
              {recommended.title}
            </div>
            <div style={{fontSize:10,color:"#555",lineHeight:1.4}}>
              {recommended.sub}<br/>번호를 뽑아요
            </div>
            <div style={{position:"absolute",bottom:12,right:14,fontSize:14,color:"rgba(192,132,252,0.4)"}}>›</div>
          </button>

          <button onClick={()=>setScreen("vault")} style={{
            background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:20,padding:"16px 14px",cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:9,color:"#333",letterSpacing:2,marginBottom:8,fontWeight:700}}>마지막 번호</div>
            {lastSaved?(
              <>
                <div style={{fontSize:11,color:"#69c8f2",fontWeight:700,marginBottom:10}}>
                  {lastSaved.mode}
                </div>
                <div style={{display:"flex",gap:3,marginBottom:8,flexWrap:"wrap"}}>
                  {lastSaved.nums.map((n,i)=>{const c=ballColor(n);return(
                    <div key={i} style={{width:24,height:24,borderRadius:"50%",
                      background:`radial-gradient(circle at 35% 35%,${c.bg}cc,${c.bg})`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:8,fontWeight:900,color:c.text}}>{n}</div>
                  );})}
                </div>
                {lastSaved.wish&&(
                  <div style={{fontSize:10,color:"#664400"}}>
                    {lastSaved.wish.em} {lastSaved.wish.label}
                  </div>
                )}
              </>
            ):(
              <div style={{fontSize:11,color:"#2a2a2a",marginTop:16}}>저장된 번호가 없어요</div>
            )}
          </button>
        </div>

        {/* 구분선 */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.04)"}}/>
          <span style={{fontSize:10,color:"#2a2a2a",letterSpacing:2}}>번호 뽑기</span>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,0.04)"}}/>
        </div>

        {/* 메뉴 그리드 2열 */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {MENUS.map((m)=>(
            <button key={m.id} onClick={()=>{SFX.pop();setScreen(m.id);}} style={{
              background:"rgba(255,255,255,0.02)",
              border:"1px solid rgba(255,255,255,0.05)",
              borderRadius:18,padding:"16px 14px",
              display:"flex",flexDirection:"column",gap:10,
              cursor:"pointer",textAlign:"left",transition:"all .2s",
            }}>
              <div style={{width:40,height:40,borderRadius:12,
                background:`${m.tc}18`,border:`1px solid ${m.tc}33`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
                {m.em}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:900,color:m.tc,lineHeight:1.2,marginBottom:3}}>
                  {m.title}
                </div>
                <div style={{fontSize:9,color:"#333",lineHeight:1.4}}>{m.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
