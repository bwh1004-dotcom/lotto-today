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
  if(n<=40)return{bg:"#aaa",text:"#fff"};
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
      fontSize:16,fontWeight:900,letterSpacing:3,color:"#f9d71c"}}>
      {nums.join("  ")}
    </div>
  );
}
function ActionBtns({nums,mode,onSave,onShare}){
  return(
    <div style={{display:"flex",gap:8,marginTop:10}}>
      <button onClick={()=>onSave(nums,mode)} style={{flex:1,padding:"11px",borderRadius:10,
        border:"1px solid rgba(80,200,120,0.25)",background:"rgba(80,200,120,0.08)",
        color:"#50c878",fontSize:13,fontWeight:700,cursor:"pointer"}}>💾 저장</button>
      <button onClick={()=>onShare(nums,mode)} style={{flex:1,padding:"11px",borderRadius:10,
        border:"1px solid rgba(249,215,28,0.2)",background:"rgba(249,215,28,0.06)",
        color:"#f9d71c",fontSize:13,fontWeight:700,cursor:"pointer"}}>📤 공유</button>
    </div>
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
  {id:"great",em:"😊",label:"좋은 하루",nums:[7,17,27,37,1,11]},
  {id:"normal",em:"😐",label:"그저 그럼",nums:[4,14,24,34,2,22]},
  {id:"tired",em:"😔",label:"피곤한 날",nums:[3,13,23,33,5,15]},
  {id:"excited",em:"🤩",label:"신나는 날",nums:[8,18,28,38,9,19]},
  {id:"angry",em:"😤",label:"화나는 날",nums:[6,16,26,36,10,20]},
];
const WEATHERS=[
  {id:"sunny",em:"☀️",label:"맑음",bonus:5},
  {id:"cloudy",em:"⛅",label:"흐림",bonus:3},
  {id:"rainy",em:"🌧️",label:"비",bonus:7},
  {id:"snow",em:"❄️",label:"눈",bonus:9},
  {id:"wind",em:"💨",label:"바람",bonus:2},
];

function TodayScreen({profile,onSave,onShare,onBack}){
  const[mood,setMood]=useState(null);
  const[weather,setWeather]=useState(null);
  const[steps,setSteps]=useState("");
  const[meals,setMeals]=useState(null);
  const[lucky,setLucky]=useState(null);
  const[nums,setNums]=useState(null);
  const[step,setStep]=useState(0); // 0=mood 1=weather 2=detail 3=result

  const canNext0=mood!==null;
  const canNext1=weather!==null;
  const canGenerate=mood!==null&&weather!==null;

  const generate=()=>{
    const pool=[];
    const m=MOODS.find(x=>x.id===mood);
    if(m)pool.push(...m.nums);
    const w=WEATHERS.find(x=>x.id===weather);
    if(w){const b=w.bonus;pool.push(b,b+10>45?b-10:b+10);}
    // 걸음수
    if(steps){
      const n=parseInt(steps.replace(/,/g,""));
      const d=n%100; if(d>=1&&d<=45) pool.push(d);
      const d2=Math.floor(n/100)%45+1; pool.push(d2);
    }
    // 식사 횟수
    if(meals){pool.push(meals*11>45?meals*5:meals*11,meals*7>45?meals*3:meals*7);}
    // 행운
    if(lucky==="yes"){pool.push(31,42,7);}
    // 오늘 날짜
    const d=new Date();
    pool.push(d.getDate()>45?d.getDate()%45:d.getDate());
    pool.push(d.getMonth()+1);
    // 띠
    if(profile){
      const z=getZodiac(parseInt(profile.year));
      const zn=ZODIAC_NUMS[z];
      if(zn)pool.push(...zn.slice(0,3));
    }
    const result=pickNums(pool);
    setNums(result);
    setStep(3);
    SFX.chime();
  };

  const W={minHeight:"100%",background:"linear-gradient(160deg,#080818,#101030)",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"20px 16px 32px",boxSizing:"border-box",fontFamily:"'Malgun Gothic',sans-serif",color:"#fff"};
  const box=(ex={})=>({background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:14,padding:14,...ex});
  const chip=(sel,color="#f9d71c")=>({
    padding:"10px 14px",borderRadius:12,cursor:"pointer",
    border:`1px solid ${sel?color:"rgba(255,255,255,0.1)"}`,
    background:sel?`${color}18`:"rgba(255,255,255,0.04)",
    color:sel?color:"#777",fontWeight:sel?700:400,fontSize:13,transition:"all .15s"
  });

  return(<div style={W}>
    {/* 헤더 */}
    <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>🌅 오늘의 하루</div>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",
        borderRadius:50,padding:"7px 14px",fontSize:11,color:"#888",cursor:"pointer"}}>← 홈</button>
    </div>
    <div style={{width:"100%",maxWidth:420}}>

      {/* STEP 1: 기분 */}
      <div style={{...box({marginBottom:12})}}>
        <div style={{fontSize:12,fontWeight:700,color:"#aaa",marginBottom:10}}>오늘 기분이 어때요?</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {MOODS.map(m=>(
            <button key={m.id} onClick={()=>setMood(m.id)} style={chip(mood===m.id)}>
              {m.em} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2: 날씨 */}
      <div style={{...box({marginBottom:12})}}>
        <div style={{fontSize:12,fontWeight:700,color:"#aaa",marginBottom:10}}>오늘 날씨는?</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {WEATHERS.map(w=>(
            <button key={w.id} onClick={()=>setWeather(w.id)} style={chip(weather===w.id,"#69c8f2")}>
              {w.em} {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 3: 추가 정보 */}
      <div style={{...box({marginBottom:14})}}>
        <div style={{fontSize:12,fontWeight:700,color:"#aaa",marginBottom:10}}>오늘 더 기록할게요</div>

        {/* 걸음수 */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"#666",marginBottom:5}}>👟 오늘 걸음수 (선택)</div>
          <input value={steps} onChange={e=>setSteps(e.target.value.replace(/\D/g,""))}
            placeholder="예: 8500"
            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
              borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:14,boxSizing:"border-box",outline:"none"}}/>
        </div>

        {/* 식사 횟수 */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:"#666",marginBottom:5}}>🍚 오늘 밥 몇 번 먹었어요?</div>
          <div style={{display:"flex",gap:8}}>
            {[1,2,3,4].map(n=>(
              <button key={n} onClick={()=>setMeals(n)} style={{
                flex:1,padding:"10px",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:700,
                border:`1px solid ${meals===n?"#f9d71c":"rgba(255,255,255,0.1)"}`,
                background:meals===n?"rgba(249,215,28,0.12)":"rgba(255,255,255,0.04)",
                color:meals===n?"#f9d71c":"#777"}}>{n}번</button>
            ))}
          </div>
        </div>

        {/* 행운 */}
        <div>
          <div style={{fontSize:11,color:"#666",marginBottom:5}}>🍀 오늘 행운의 순간이 있었나요?</div>
          <div style={{display:"flex",gap:8}}>
            {[["yes","있었어요! 🍀"],["no","없었어요 😅"]].map(([v,l])=>(
              <button key={v} onClick={()=>setLucky(v)} style={{
                flex:1,padding:"10px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,
                border:`1px solid ${lucky===v?"#50c878":"rgba(255,255,255,0.1)"}`,
                background:lucky===v?"rgba(80,200,120,0.1)":"rgba(255,255,255,0.04)",
                color:lucky===v?"#50c878":"#777"}}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 번호 뽑기 버튼 */}
      <button onClick={generate} disabled={!canGenerate} style={{
        width:"100%",padding:"15px",borderRadius:14,border:"none",
        background:canGenerate?"linear-gradient(135deg,#f9d71c,#ff9800)":"rgba(255,255,255,0.06)",
        color:canGenerate?"#000":"#444",fontSize:16,fontWeight:900,
        cursor:canGenerate?"pointer":"default",
        boxShadow:canGenerate?"0 4px 20px rgba(249,215,28,0.3)":"none",
        transition:"all .2s",marginBottom:14}}>
        🌅 오늘의 번호 뽑기
      </button>

      {/* 결과 */}
      {nums&&(
        <div style={{...box({textAlign:"center"}),
          background:"rgba(249,215,28,0.05)",border:"1px solid rgba(249,215,28,0.18)"}}>
          <div style={{fontSize:11,color:"#888",marginBottom:12}}>오늘의 하루로 뽑은 번호</div>
          <Balls nums={nums}/>
          <NumLine nums={nums}/>
          <ActionBtns nums={nums} mode="🌅 오늘의 하루" onSave={onSave} onShare={onShare}/>
        </div>
      )}
    </div>
  </div>);
}

// ════════════════════════════════════════════════════════════
// 🌙 꿈해몽
// ════════════════════════════════════════════════════════════
function DreamScreen({onSave,onShare,onBack}){
  const[text,setText]=useState("");
  const[nums,setNums]=useState(null);
  const W={minHeight:"100%",background:"linear-gradient(160deg,#080820,#0a0a30)",
    display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px 32px",boxSizing:"border-box",color:"#fff"};
  const box=(ex={})=>({background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:14,...ex});
  return(<div style={W}>
    <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:900}}>🌙 꿈해몽</div>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:50,padding:"7px 14px",fontSize:11,color:"#888",cursor:"pointer"}}>← 홈</button>
    </div>
    <div style={{width:"100%",maxWidth:420}}>
      <div style={{...box({marginBottom:12})}}>
        <div style={{fontSize:11,color:"#888",marginBottom:8}}>어젯밤 꿈 내용을 적어주세요</div>
        <textarea value={text} onChange={e=>setText(e.target.value)}
          placeholder="예: 큰 뱀이 물속에서 나타나고 돈을 줬다..."
          style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:8,padding:"10px",color:"#fff",fontSize:13,height:100,
            resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
        <div style={{marginTop:10}}>
          <div style={{fontSize:9,color:"#555",marginBottom:6}}>키워드 탭으로 추가</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {["물","뱀","돼지","불","돈","용","호랑이","하늘","달","결혼","아기","산","집","꽃","물고기","여행","보물"].map(kw=>(
              <button key={kw} onClick={()=>setText(t=>t+(t?" ":"")+kw)}
                style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
                  borderRadius:20,padding:"4px 10px",fontSize:11,color:"#aaa",cursor:"pointer"}}>{kw}</button>
            ))}
          </div>
        </div>
      </div>
      <button onClick={()=>{if(!text.trim()){alert("꿈 내용을 입력해주세요");return;}setNums(matchDream(text));SFX.chime();}}
        style={{width:"100%",padding:"14px",borderRadius:12,border:"none",
          background:text.trim()?"linear-gradient(135deg,#1a1a6e,#6a0dad)":"rgba(255,255,255,0.06)",
          color:text.trim()?"#fff":"#444",fontSize:15,fontWeight:900,
          cursor:text.trim()?"pointer":"default",marginBottom:14}}>
        {nums?"다시 해몽하기 🔄":"번호 해몽하기 🌙"}
      </button>
      {nums&&(
        <div style={{...box({textAlign:"center"}),background:"rgba(138,43,226,0.06)",border:"1px solid rgba(138,43,226,0.18)"}}>
          <div style={{fontSize:11,color:"#888",marginBottom:12}}>꿈해몽 번호</div>
          <Balls nums={nums}/><NumLine nums={nums}/>
          <ActionBtns nums={nums} mode="🌙 꿈해몽" onSave={onSave} onShare={onShare}/>
        </div>
      )}
    </div>
  </div>);
}

// ════════════════════════════════════════════════════════════
// ⭐ 오늘의 운세
// ════════════════════════════════════════════════════════════
function FortuneScreen({profile,onSave,onShare,onBack}){
  const[mood,setMood]=useState(null);
  const[nums,setNums]=useState(null);
  const zodiac=profile?getZodiac(parseInt(profile.year)):null;
  const zodiacEm=zodiac?getZodiacEm(zodiac):"";
  const d=new Date();
  const fList=FORTUNE[zodiac]||["행운이 찾아오는 날입니다"];
  const fText=profile?fList[(d.getDate()+ZODIAC_KR.indexOf(zodiac))%fList.length]:"";
  const MOODS2=[{id:"lucky",em:"😊",label:"설레는 날",b:[7,17,27]},{id:"money",em:"🤑",label:"돈이 필요해",b:[3,13,23]},{id:"fire",em:"😤",label:"뭔가 해야함",b:[4,14,24]},{id:"chill",em:"😴",label:"그냥 해봄",b:[]}];
  const generate=()=>{
    if(!profile){alert("프로필을 먼저 설정해주세요");return;}
    const base=ZODIAC_NUMS[zodiac]||[1,2,3,4,5,6];
    const mb=mood?MOODS2.find(m=>m.id===mood)?.b||[]:[];
    const dp=[d.getDate(),d.getMonth()+1];
    setNums(pickNums([...base,...mb,...dp]));SFX.chime();
  };
  const W={minHeight:"100%",background:"linear-gradient(160deg,#0a0818,#150a28)",
    display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px 32px",boxSizing:"border-box",color:"#fff"};
  const box=(ex={})=>({background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:14,...ex});
  return(<div style={W}>
    <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:900}}>⭐ 오늘의 운세</div>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:50,padding:"7px 14px",fontSize:11,color:"#888",cursor:"pointer"}}>← 홈</button>
    </div>
    <div style={{width:"100%",maxWidth:420}}>
      {!profile?(
        <div style={{...box({textAlign:"center",padding:32})}}>
          <div style={{fontSize:32,marginBottom:8}}>⭐</div>
          <div style={{color:"#888",fontSize:13,marginBottom:14}}>프로필을 설정하면 띠별 운세를 볼 수 있어요</div>
          <button onClick={onBack} style={{background:"linear-gradient(135deg,#f9d71c,#ff9800)",border:"none",borderRadius:50,padding:"10px 24px",fontSize:14,fontWeight:900,color:"#000",cursor:"pointer"}}>프로필 설정하기</button>
        </div>
      ):(
        <>
          <div style={{...box({marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}),
            background:"linear-gradient(135deg,rgba(138,43,226,0.08),rgba(105,200,242,0.06))",
            border:"1px solid rgba(138,43,226,0.18)"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700}}>{profile.name||"나"} 님의 오늘</div>
              <div style={{fontSize:11,color:"#777",marginTop:2}}>{todayStr()}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:26}}>{zodiacEm}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#8a2be2"}}>{zodiac}띠</div>
            </div>
          </div>
          {fText&&(
            <div style={{...box({marginBottom:12,background:"rgba(138,43,226,0.06)",border:"1px solid rgba(138,43,226,0.15)"})}}>
              <div style={{fontSize:10,color:"#8a2be2",fontWeight:700,marginBottom:4}}>⭐ 오늘의 운세</div>
              <div style={{fontSize:14,lineHeight:1.7,color:"#ddd"}}>{fText}</div>
            </div>
          )}
          <div style={{...box({marginBottom:14})}}>
            <div style={{fontSize:11,color:"#888",marginBottom:8}}>오늘 기분 추가</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {MOODS2.map(m=>(
                <button key={m.id} onClick={()=>setMood(m.id)} style={{padding:"8px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,
                  border:`1px solid ${mood===m.id?"#f9d71c":"rgba(255,255,255,0.1)"}`,
                  background:mood===m.id?"rgba(249,215,28,0.1)":"rgba(255,255,255,0.04)",
                  color:mood===m.id?"#f9d71c":"#888"}}>{m.em} {m.label}</button>
              ))}
            </div>
          </div>
          <button onClick={generate} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",
            background:"linear-gradient(135deg,#4a0080,#8a2be2)",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",marginBottom:14}}>
            {nums?"다시 뽑기 🔄":"운세 번호 뽑기 ⭐"}
          </button>
          {nums&&(
            <div style={{...box({textAlign:"center"}),background:"rgba(138,43,226,0.06)",border:"1px solid rgba(138,43,226,0.18)"}}>
              <Balls nums={nums}/><NumLine nums={nums}/>
              <ActionBtns nums={nums} mode="⭐ 오늘의 운세" onSave={onSave} onShare={onShare}/>
            </div>
          )}
        </>
      )}
    </div>
  </div>);
}

// ════════════════════════════════════════════════════════════
// 🎆 불꽃놀이
// ════════════════════════════════════════════════════════════
function FireworksScreen({onSave,onShare,onBack}){
  const TOTAL=6;
  const canvasRef=useRef(null);
  const particles=useRef([]);
  const rafRef=useRef(null);
  const alive=useRef(true);
  const[phase,setPhase]=useState("ready");
  const[fwCount,setFwCount]=useState(0);
  const[col,setCol]=useState([]);
  const[ln,setLn]=useState([]);
  const colR=useRef([]),fwR=useRef(0);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;cancelAnimationFrame(rafRef.current);};},[]);

  useEffect(()=>{
    if(phase!=="play")return;
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");
    const loop=()=>{
      if(!alive.current)return;
      ctx.fillStyle="rgba(0,0,0,0.18)";ctx.fillRect(0,0,canvas.width,canvas.height);
      particles.current=particles.current.filter(p=>{
        p.x+=p.vx;p.y+=p.vy;p.vy+=0.06;p.life-=1;p.vx*=0.98;
        const a=Math.max(0,p.life/p.maxLife);
        ctx.save();ctx.globalAlpha=a*a;
        ctx.shadowBlur=p.glow?12:0;ctx.shadowColor=p.color;
        ctx.fillStyle=p.color;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r*(0.4+0.6*a),0,Math.PI*2);ctx.fill();
        ctx.restore();
        return p.life>0;
      });
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(rafRef.current);
  },[phase]);

  const spawnFirework=(x,y,canvas)=>{
    const W=canvas.width,H=canvas.height;
    const xR=x/W,yR=1-(y/H);
    const baseNum=Math.max(1,Math.min(45,Math.round(1+yR*32+xR*12)));
    const palettes=[["#ff4444","#ff7777","#ffaaaa"],["#f9d71c","#ffed4a","#fff176"],
      ["#69c8f2","#4fc3f7","#b3e5fc"],["#50c878","#69f0ae","#b9f6ca"],
      ["#b0d840","#ccff90","#dcedc8"],["#ff9800","#ffb74d","#ffe0b2"],["#e040fb","#ce93d8","#f3e5f5"]];
    const pal=palettes[Math.floor(xR*palettes.length)%palettes.length];
    const rocketLife=Math.round((H-y)/6)+8;
    for(let i=0;i<3;i++){
      particles.current.push({x,y,vx:(Math.random()-0.5)*0.4,
        vy:-Math.abs(rocketLife*0.28)-i*0.3,color:"#fff8",r:2,life:rocketLife,maxLife:rocketLife,glow:false});
    }
    setTimeout(()=>{
      if(!alive.current)return;
      const ex=x+(Math.random()-0.5)*10,ey=y-(rocketLife*4);
      const cnt=90+Math.floor(yR*50);
      for(let i=0;i<cnt;i++){
        const angle=Math.random()*Math.PI*2,spd=1.2+Math.random()*4.5;
        const c=pal[Math.floor(Math.random()*pal.length)];
        const life=50+Math.floor(Math.random()*55);
        particles.current.push({x:ex,y:ey,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd-1.5,
          color:c,r:1.8+Math.random()*3,life,maxLife:life,glow:true});
      }
      // 별똥별 트레일
      for(let i=0;i<12;i++){
        const angle=Math.random()*Math.PI*2,spd=2+Math.random()*6;
        particles.current.push({x:ex,y:ey,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,
          color:"#fff",r:2,life:25,maxLife:25,glow:true});
      }
    },rocketLife*16);

    // 탭 즉시 발사음
    SFX.tone(80+yR*120,0.25,"sine",0.15);
    SFX.noise(0.15,0.2,800);
    SFX.boom(baseNum);

    // 번호 수집
    colR.current=[...colR.current,baseNum];
    setCol([...colR.current]);

    fwR.current+=1;setFwCount(fwR.current);
    if(fwR.current>=TOTAL){setTimeout(()=>{if(alive.current){setLn(pickNums(colR.current));setPhase("final");}},1800);}
  };

  const handleTap=(e)=>{
    if(phase!=="play"||fwR.current>=TOTAL)return;
    const canvas=canvasRef.current;if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const cx=e.touches?e.touches[0].clientX:e.clientX;
    const cy=e.touches?e.touches[0].clientY:e.clientY;
    spawnFirework(cx-rect.left,cy-rect.top,canvas);
  };

  const startGame=()=>{particles.current=[];colR.current=[];fwR.current=0;setCol([]);setFwCount(0);setPhase("play");};

  const W={minHeight:"100%",background:"#000",display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",boxSizing:"border-box"};

  if(phase==="final")return(
    <div style={{...W,background:"linear-gradient(160deg,#080818,#101030)",padding:16}}>
      <div style={{width:"100%",maxWidth:400,textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:4}}>🎆</div>
        <h2 style={{fontSize:20,fontWeight:900,color:"#f9d71c",margin:"0 0 4px"}}>불꽃놀이 번호</h2>
        <p style={{color:"#555",fontSize:11,marginBottom:16}}>{col.length}발의 불꽃 기반</p>
        <Balls nums={ln}/><NumLine nums={ln}/>
        <ActionBtns nums={ln} mode="🎆 불꽃놀이" onSave={onSave} onShare={onShare}/>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:14}}>
          <button onClick={startGame} style={{background:"linear-gradient(135deg,#b8900a,#f9d71c)",border:"none",borderRadius:50,padding:"11px 24px",fontSize:13,fontWeight:900,color:"#000",cursor:"pointer"}}>다시 하기 🔄</button>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"1px solid #333",borderRadius:50,padding:"11px 18px",fontSize:12,color:"#888",cursor:"pointer",fontWeight:700}}>← 홈</button>
        </div>
      </div>
    </div>
  );

  if(phase==="ready")return(
    <div style={{...W,padding:16}}>
      <div style={{textAlign:"center",maxWidth:340}}>
        <div style={{fontSize:58,marginBottom:6}}>🎆</div>
        <h2 style={{fontSize:21,fontWeight:900,color:"#f9d71c",margin:"0 0 6px"}}>불꽃놀이 로또</h2>
        <p style={{color:"#666",fontSize:12,marginBottom:18,lineHeight:1.8}}>
          화면을 탭하면 불꽃이 터져요<br/>
          <b style={{color:"#f9d71c"}}>높이와 위치</b>가 번호를 결정합니다<br/>
          총 {TOTAL}발을 쏘세요 🎇
        </p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button onClick={startGame} style={{background:"linear-gradient(135deg,#b8900a,#f9d71c)",border:"none",borderRadius:50,padding:"13px 36px",fontSize:15,fontWeight:900,color:"#000",cursor:"pointer"}}>불꽃 쏘기! 🎆</button>
          <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"1px solid #333",borderRadius:50,padding:"13px 18px",fontSize:13,color:"#888",cursor:"pointer",fontWeight:700}}>← 홈</button>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{...W,position:"relative"}} onMouseDown={handleTap} onTouchStart={handleTap}>
      <canvas ref={canvasRef} width={400} height={620}
        style={{display:"block",width:"100%",maxWidth:400,height:"auto",cursor:"crosshair",touchAction:"none"}}/>
      <div style={{position:"absolute",top:12,left:0,right:0,display:"flex",justifyContent:"space-between",padding:"0 16px",pointerEvents:"none"}}>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>🎆 {fwCount}/{TOTAL}</div>
        {col.length>0&&<div style={{display:"flex",gap:4}}>
          {col.map((n,i)=>{const c=ballColor(n);return(
            <span key={i} style={{background:c.bg,color:c.text,fontWeight:900,fontSize:10,borderRadius:"50%",width:22,height:22,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{n}</span>
          );})}
        </div>}
      </div>
      {fwCount===0&&<div style={{position:"absolute",bottom:40,left:0,right:0,textAlign:"center",pointerEvents:"none",animation:"pulse 1.5s infinite"}}>
        <div style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>화면 아무데나 탭하세요 ✨</div>
      </div>}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 🎛️ 나만의 공식
// ════════════════════════════════════════════════════════════
const HIGH_FREQ=[34,27,43,1,17,45,2,23,35,40,7,11,38,18,26,14,33,9,42,20];
function FormulaScreen({onSave,onShare,onBack}){
  const[freqPct,setFreqPct]=useState(50);
  const[oddCount,setOddCount]=useState(3);
  const[zones,setZones]=useState(["high","mid","low"]);
  const[nums,setNums]=useState(null);
  const zl={high:"상단 31-45",mid:"중단 16-30",low:"하단 1-15"};
  const zc={high:"#ff7272",mid:"#f9d71c",low:"#69c8f2"};
  const toggle=z=>setZones(p=>p.includes(z)?p.filter(x=>x!==z):[...p,z]);
  const generate=()=>{
    if(zones.length===0){alert("구간을 선택하세요");return;}
    const zm={high:Array.from({length:15},(_,i)=>31+i),mid:Array.from({length:15},(_,i)=>16+i),low:Array.from({length:15},(_,i)=>1+i)};
    const pool=zones.flatMap(z=>zm[z]);
    const w=[];pool.forEach(n=>{const h=HIGH_FREQ.includes(n);const wt=h?Math.ceil(1+(freqPct/100)*4):Math.ceil(1+((100-freqPct)/100)*2);for(let i=0;i<wt;i++)w.push(n);});
    const sh=shuffle(w);const res=[],used=new Set();let to=oddCount,te=6-oddCount;
    for(const n of sh){if(res.length>=6||used.has(n))continue;if(n%2===1&&to>0){res.push(n);used.add(n);to--;}else if(n%2===0&&te>0){res.push(n);used.add(n);te--;}}
    while(res.length<6){const r=Math.floor(Math.random()*45)+1;if(!res.includes(r))res.push(r);}
    setNums(res.sort((a,b)=>a-b));SFX.chime();
  };
  const W={minHeight:"100%",background:"linear-gradient(160deg,#080818,#101030)",
    display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px 32px",boxSizing:"border-box",color:"#fff"};
  const box=(ex={})=>({background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:14,...ex});
  return(<div style={W}>
    <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:900}}>🎛️ 나만의 공식</div>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:50,padding:"7px 14px",fontSize:11,color:"#888",cursor:"pointer"}}>← 홈</button>
    </div>
    <div style={{width:"100%",maxWidth:420}}>
      <div style={{...box({marginBottom:10})}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>📊 자주 나온 번호 비율</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setFreqPct(p=>Math.max(0,p-10))} style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",fontSize:18,cursor:"pointer"}}>−</button>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:24,fontWeight:900,color:"#f9d71c"}}>{freqPct}%</div>
            <div style={{height:4,background:"rgba(255,255,255,0.08)",borderRadius:2,marginTop:6}}>
              <div style={{height:"100%",width:`${freqPct}%`,background:"linear-gradient(90deg,#69c8f2,#f9d71c)",borderRadius:2}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#555",marginTop:3}}>
              <span>안 나온 번호</span><span>자주 나온 번호</span>
            </div>
          </div>
          <button onClick={()=>setFreqPct(p=>Math.min(100,p+10))} style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",color:"#fff",fontSize:18,cursor:"pointer"}}>+</button>
        </div>
      </div>
      <div style={{...box({marginBottom:10})}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>🔢 홀수 개수</div>
        <div style={{display:"flex",gap:6,justifyContent:"center"}}>
          {[0,1,2,3,4,5,6].map(n=>(
            <button key={n} onClick={()=>setOddCount(n)} style={{width:38,height:38,borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:900,
              background:oddCount===n?"linear-gradient(135deg,#f9d71c,#ff9800)":"rgba(255,255,255,0.06)",
              color:oddCount===n?"#000":"#777"}}>{n}</button>
          ))}
        </div>
        <div style={{textAlign:"center",fontSize:10,color:"#555",marginTop:6}}>홀수 {oddCount}개 + 짝수 {6-oddCount}개</div>
      </div>
      <div style={{...box({marginBottom:14})}}>
        <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>📍 번호 구간</div>
        <div style={{display:"flex",gap:8}}>
          {["high","mid","low"].map(z=>{const on=zones.includes(z);return(
            <button key={z} onClick={()=>toggle(z)} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",textAlign:"center",
              border:`2px solid ${on?zc[z]:"rgba(255,255,255,0.08)"}`,background:on?`${zc[z]}18`:"rgba(255,255,255,0.03)"}}>
              <div style={{fontSize:12,fontWeight:900,color:on?zc[z]:"#555"}}>{zl[z]}</div>
            </button>
          );})}
        </div>
      </div>
      <button onClick={generate} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",
        background:"linear-gradient(135deg,#69c8f2,#1565c0)",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",marginBottom:14}}>
        {nums?"다시 뽑기 🔄":"내 공식으로 뽑기 🎛️"}
      </button>
      {nums&&(
        <div style={{...box({textAlign:"center"})}}>
          <Balls nums={nums}/><NumLine nums={nums}/>
          <ActionBtns nums={nums} mode="🎛️ 나만의 공식" onSave={onSave} onShare={onShare}/>
        </div>
      )}
    </div>
  </div>);
}

// ════════════════════════════════════════════════════════════
// 💛 선호 번호
// ════════════════════════════════════════════════════════════
function FavoritesScreen({favorites,onSaveFav,onSave,onShare,onBack}){
  const[favEdit,setFavEdit]=useState([...favorites]);
  const[nums,setNums]=useState(null);
  const toggle=n=>setFavEdit(p=>p.includes(n)?p.filter(x=>x!==n):[...p,n]);
  const W={minHeight:"100%",background:"linear-gradient(160deg,#080818,#101030)",
    display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px 32px",boxSizing:"border-box",color:"#fff"};
  const box=(ex={})=>({background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:14,...ex});
  return(<div style={W}>
    <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:900}}>💛 선호 번호</div>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:50,padding:"7px 14px",fontSize:11,color:"#888",cursor:"pointer"}}>← 홈</button>
    </div>
    <div style={{width:"100%",maxWidth:420}}>
      <div style={{fontSize:11,color:"#888",marginBottom:8}}>{favEdit.length}개 선택됨 · 탭해서 선택/해제</div>
      <div style={{...box({marginBottom:10,padding:10})}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center"}}>
          {Array.from({length:45},(_,i)=>i+1).map(n=>{const sel=favEdit.includes(n);const c=ballColor(n);return(
            <button key={n} onClick={()=>toggle(n)} style={{width:40,height:40,borderRadius:"50%",border:"none",cursor:"pointer",
              background:sel?`radial-gradient(circle at 35% 35%,${c.bg}cc,${c.bg})`:"rgba(255,255,255,0.06)",
              color:sel?c.text:"#555",fontSize:13,fontWeight:900,transition:"all .15s"}}>{n}</button>
          );})}
        </div>
      </div>
      {nums&&(
        <div style={{...box({marginBottom:10,textAlign:"center"})}}>
          <Balls nums={nums}/><NumLine nums={nums}/>
          <ActionBtns nums={nums} mode="💛 선호 번호" onSave={onSave} onShare={onShare}/>
        </div>
      )}
      <div style={{display:"flex",gap:8,marginBottom:8}}>
        <button onClick={()=>{if(favEdit.length<1){alert("번호를 선택하세요");return;}setNums(pickNums(favEdit));SFX.chime();}} style={{
          flex:2,padding:"13px",borderRadius:12,border:"none",
          background:"linear-gradient(135deg,#f9d71c,#ff9800)",color:"#000",fontSize:14,fontWeight:900,cursor:"pointer"}}>
          {nums?"다시 뽑기 🔄":"번호 뽑기 🎰"}
        </button>
        <button onClick={()=>onSaveFav(favEdit)} style={{flex:1,padding:"13px",borderRadius:12,
          background:"rgba(80,200,120,0.1)",border:"1px solid rgba(80,200,120,0.25)",
          color:"#50c878",fontSize:13,fontWeight:900,cursor:"pointer"}}>저장 💾</button>
      </div>
      {favEdit.length>0&&<button onClick={()=>setFavEdit([])} style={{width:"100%",padding:"8px",borderRadius:10,
        background:"rgba(255,255,255,0.04)",border:"none",color:"#555",fontSize:12,cursor:"pointer"}}>전체 해제</button>}
    </div>
  </div>);
}

// ════════════════════════════════════════════════════════════
// 🎰 슬롯머신
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
  {label:"1-10",  sub:"LOW",   color:"#f9d71c",dark:"#c8a800",text:"#000",range:[1,10]},
  {label:"11-20", sub:"MID",   color:"#69c8f2",dark:"#3a9ac0",text:"#000",range:[11,20]},
  {label:"21-30", sub:"HIGH",  color:"#ff7272",dark:"#cc3333",text:"#fff",range:[21,30]},
  {label:"31-40", sub:"TOP",   color:"#b8b8b8",dark:"#888",  text:"#fff",range:[31,40]},
  {label:"41-45", sub:"LUCKY", color:"#b0d840",dark:"#7aaa10",text:"#000",range:[41,45]},
  {label:"BONUS", sub:"ANY",   color:"#ff4444",dark:"#aa0000",text:"#fff",range:[1,45]},
  {label:"1-10",  sub:"LOW",   color:"#f9d71c",dark:"#c8a800",text:"#000",range:[1,10]},
  {label:"11-20", sub:"MID",   color:"#69c8f2",dark:"#3a9ac0",text:"#000",range:[11,20]},
  {label:"21-30", sub:"HIGH",  color:"#ff7272",dark:"#cc3333",text:"#fff",range:[21,30]},
  {label:"31-40", sub:"TOP",   color:"#b8b8b8",dark:"#888",  text:"#fff",range:[31,40]},
];
const TOTAL_SPINS=6;

function WheelScreen({onSave,onShare,onBack}){
  const[spinning,setSpinning]=useState(false);
  const[angle,setAngle]=useState(0);
  const[spinCount,setSpinCount]=useState(0);
  const[result,setResult]=useState(null);
  const[col,setCol]=useState([]);
  const[ln,setLn]=useState([]);
  const[phase,setPhase]=useState("play");
  const[glowing,setGlowing]=useState(false);

  const colRef=useRef([]),scRef=useRef(0),angleRef=useRef(0),alive=useRef(true);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);

  const spin=()=>{
    if(spinning||phase!=="play")return;
    setSpinning(true);setResult(null);setGlowing(false);
    SFX.tone(300,0.08,"sine",0.2);

    const extra=900+Math.random()*900;
    const finalAngle=angleRef.current+extra;
    const duration=3500+Math.random()*1500;
    const start=Date.now();
    const startAngle=angleRef.current;
    let lastTick=-1;

    const tick=()=>{
      if(!alive.current)return;
      const elapsed=Date.now()-start;
      const t=Math.min(elapsed/duration,1);
      const ease=1-Math.pow(1-t,4);
      const cur=startAngle+(finalAngle-startAngle)*ease;
      const curMod=((cur%360)+360)%360;
      angleRef.current=curMod;
      setAngle(curMod);

      const tickZone=Math.floor(cur/(360/WHEEL_ZONES.length));
      if(tickZone!==lastTick){
        lastTick=tickZone;
        const spd=1-t;
        SFX.tone(150+spd*300,0.03+spd*0.04,"square",0.06+spd*0.08);
      }

      if(t<1){requestAnimationFrame(tick);}
      else{
        const ptr=((360-curMod)+90+360)%360;
        const zoneIdx=Math.floor(ptr/(360/WHEEL_ZONES.length))%WHEEL_ZONES.length;
        const zone=WHEEL_ZONES[zoneIdx];
        const[lo,hi]=zone.range;
        const num=lo+Math.floor(Math.random()*(hi-lo+1));
        colRef.current=[...colRef.current,num];
        setCol([...colRef.current]);
        setResult({zone,num});
        setGlowing(true);
        scRef.current+=1;setSpinCount(scRef.current);
        setSpinning(false);
        SFX.chime();
        if(zone.sub==="BONUS")SFX.seq([523,659,784,1047,1319],0.08,"triangle",0.3);
        if(scRef.current>=TOTAL_SPINS){
          setTimeout(()=>{if(alive.current){setLn(pickNums(colRef.current));setPhase("final");}},1800);
        }
      }
    };
    requestAnimationFrame(tick);
  };

  const restart=()=>{
    colRef.current=[];scRef.current=0;angleRef.current=0;
    setAngle(0);setSpinCount(0);setCol([]);setResult(null);setGlowing(false);setPhase("play");
  };

  const N=WHEEL_ZONES.length;
  const SZ=300,CX=150,CY=150,R=138,IR=28;

  const W={minHeight:"100%",
    background:"linear-gradient(160deg,#07050f 0%,#120a1e 50%,#07050f 100%)",
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    padding:14,boxSizing:"border-box",color:"#fff"};

  if(phase==="final")return(<div style={W}>
    <div style={{textAlign:"center",maxWidth:390,width:"100%"}}>
      <div style={{fontSize:52,marginBottom:6,filter:"drop-shadow(0 0 20px rgba(249,215,28,0.5))"}}>🎡</div>
      <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 4px",
        background:"linear-gradient(90deg,#f9d71c,#ff9800)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
        행운의 번호
      </h2>
      <p style={{color:"#555",fontSize:11,marginBottom:18}}>{TOTAL_SPINS}번의 행운 기록</p>
      <Balls nums={ln}/><NumLine nums={ln}/>
      <ActionBtns nums={ln} mode="🎡 행운의 휠" onSave={onSave} onShare={onShare}/>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:16}}>
        <button onClick={restart} style={{background:"linear-gradient(135deg,#f9d71c,#ff9800)",border:"none",borderRadius:50,padding:"12px 28px",fontSize:14,fontWeight:900,color:"#000",cursor:"pointer",boxShadow:"0 4px 16px rgba(249,215,28,0.3)"}}>다시 돌리기 🔄</button>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:50,padding:"12px 20px",fontSize:13,color:"#888",cursor:"pointer",fontWeight:700}}>← 홈</button>
      </div>
    </div>
  </div>);

  return(<div style={W}>
    {/* 헤더 */}
    <div style={{width:"100%",maxWidth:SZ,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"6px 14px",color:"#888",fontSize:12,cursor:"pointer",fontWeight:700}}>← 홈</button>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:13,fontWeight:900,color:"#f9d71c",letterSpacing:1}}>행운의 휠</div>
        <div style={{fontSize:10,color:"#555",marginTop:1}}>스핀 {spinCount}/{TOTAL_SPINS}</div>
      </div>
      <div style={{fontSize:11,color:"#50c878",fontWeight:700,textAlign:"right"}}>
        <div>수집</div><div style={{fontSize:15}}>{col.length}개</div>
      </div>
    </div>

    {/* 포인터 */}
    <div style={{position:"relative",zIndex:20,marginBottom:-14}}>
      <div style={{width:0,height:0,
        borderLeft:"14px solid transparent",borderRight:"14px solid transparent",
        borderTop:"28px solid #fff",
        filter:"drop-shadow(0 4px 8px rgba(255,255,255,0.4))"}}/>
    </div>

    {/* 휠 컨테이너 */}
    <div style={{position:"relative",width:SZ,height:SZ,marginBottom:18}}>
      {/* 외부 링 장식 */}
      <div style={{position:"absolute",inset:-8,borderRadius:"50%",
        background:"conic-gradient(from 0deg,#2a2a2a,#444,#2a2a2a,#444,#2a2a2a,#444,#2a2a2a)",
        boxShadow:"0 0 0 2px rgba(255,255,255,0.08), 0 0 40px rgba(249,215,28,0.1)"}}/>
      <div style={{position:"absolute",inset:-2,borderRadius:"50%",
        background:"rgba(0,0,0,0.3)"}}/>

      {/* 회전 휠 SVG */}
      <svg width={SZ} height={SZ}
        style={{transform:`rotate(${angle}deg)`,transition:"none",position:"relative",zIndex:5,
          filter:glowing?"drop-shadow(0 0 18px rgba(249,215,28,0.35))":"none",transition:"filter .5s"}}>
        <defs>
          {WHEEL_ZONES.map((z,i)=>(
            <radialGradient key={i} id={`wg${i}`} cx="30%" cy="30%">
              <stop offset="0%" stopColor={z.color} stopOpacity="1"/>
              <stop offset="100%" stopColor={z.dark} stopOpacity="1"/>
            </radialGradient>
          ))}
        </defs>
        {WHEEL_ZONES.map((z,i)=>{
          const startA=(i/N)*2*Math.PI-Math.PI/2;
          const endA=((i+1)/N)*2*Math.PI-Math.PI/2;
          const x1=CX+R*Math.cos(startA),y1=CY+R*Math.sin(startA);
          const x2=CX+R*Math.cos(endA),y2=CY+R*Math.sin(endA);
          const midA=(startA+endA)/2;
          const tx=CX+(R*0.62)*Math.cos(midA),ty=CY+(R*0.62)*Math.sin(midA);
          const rot=(i+0.5)*360/N;
          return(<g key={i}>
            <path d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`}
              fill={`url(#wg${i})`} stroke="rgba(0,0,0,0.3)" strokeWidth={1.5}/>
            {/* 반짝임 효과 */}
            <path d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`}
              fill="rgba(255,255,255,0.08)" stroke="none"/>
            <text x={tx} y={ty-5} textAnchor="middle" dominantBaseline="central"
              fontSize={11} fontWeight="900" fill={z.text}
              transform={`rotate(${rot},${tx},${ty})`}>{z.label}</text>
            <text x={tx} y={ty+7} textAnchor="middle" dominantBaseline="central"
              fontSize={8} fontWeight="700" fill={`${z.text}99`}
              transform={`rotate(${rot},${tx},${ty})`}>{z.sub}</text>
          </g>);
        })}
        {/* 구분선 */}
        {WHEEL_ZONES.map((_,i)=>{
          const a=(i/N)*2*Math.PI-Math.PI/2;
          return(<line key={i} x1={CX} y1={CY}
            x2={CX+R*Math.cos(a)} y2={CY+R*Math.sin(a)}
            stroke="rgba(0,0,0,0.4)" strokeWidth={1}/>);
        })}
        {/* 내부 원 */}
        <circle cx={CX} cy={CY} r={IR+4} fill="#0a0818" stroke="rgba(255,255,255,0.1)" strokeWidth={2}/>
        <circle cx={CX} cy={CY} r={IR} fill="url(#wg0)" opacity={0.3}/>
        <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central" fontSize={16}>🎡</text>
      </svg>

      {/* 중심 핀 */}
      <div style={{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",
        width:16,height:16,borderRadius:"50%",
        background:"radial-gradient(circle at 35% 35%,#fff,#aaa)",
        boxShadow:"0 2px 8px rgba(0,0,0,0.5)",zIndex:10}}/>
    </div>

    {/* 결과 카드 */}
    <div style={{width:"100%",maxWidth:SZ,minHeight:56,marginBottom:14,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      {result&&!spinning&&(
        <div style={{width:"100%",padding:"12px 16px",borderRadius:14,textAlign:"center",
          background:`linear-gradient(135deg,${result.zone.dark}22,${result.zone.color}18)`,
          border:`1px solid ${result.zone.color}44`,
          animation:"slideUp .3s ease-out"}}>
          <div style={{fontSize:11,color:`${result.zone.color}bb`,fontWeight:700,letterSpacing:1,marginBottom:3}}>
            {result.zone.sub==="BONUS"?"🎊 BONUS ZONE!":"🎯 "+result.zone.label+" 구역"}
          </div>
          <div style={{fontSize:20,fontWeight:900,color:result.zone.color}}>
            번호 <span style={{fontSize:28}}>{result.num}</span> 획득!
          </div>
        </div>
      )}
      {spinning&&(
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:13,color:"#888",animation:"pulse .35s infinite"}}>🎡 돌아가는 중...</div>
        </div>
      )}
      {!spinning&&!result&&(
        <div style={{textAlign:"center",color:"#444",fontSize:12}}>아래 버튼을 눌러 휠을 돌리세요</div>
      )}
    </div>

    {/* SPIN 버튼 */}
    <button onClick={spin} disabled={spinning} style={{
      width:"100%",maxWidth:SZ,padding:"16px",borderRadius:16,border:"none",
      background:spinning
        ?"rgba(255,255,255,0.04)"
        :"linear-gradient(135deg,#c8a800,#f9d71c,#ffcc00)",
      color:spinning?"#444":"#000",
      fontSize:20,fontWeight:900,letterSpacing:1,
      cursor:spinning?"default":"pointer",
      boxShadow:spinning?"none":"0 6px 28px rgba(249,215,28,0.45), inset 0 1px 0 rgba(255,255,255,0.3)",
      transition:"all .2s",
      transform:spinning?"scale(0.98)":"scale(1)",
    }}>
      {spinning?"돌아가는 중...":"🎡  SPIN!"}
    </button>

    {/* 수집 번호 */}
    {col.length>0&&(
      <div style={{marginTop:14,display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
        {col.map((n,i)=>{const c=ballColor(n);return(
          <div key={i} style={{width:32,height:32,borderRadius:"50%",
            background:`radial-gradient(circle at 35% 35%,${c.bg}dd,${c.bg})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:12,fontWeight:900,color:c.text,
            boxShadow:`0 2px 8px ${c.bg}55`}}>{n}</div>
        );})}
      </div>
    )}
    <style>{`
      @keyframes slideUp{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    `}</style>
  </div>);
}

function SlotScreen({onSave,onShare,onBack}){
  const[phase,setPhase]=useState("play");
  const[spinNum,setSpinNum]=useState(1);
  const[reels,setReels]=useState(["7","💎","⭐"]);
  const[spin,setSpin]=useState([false,false,false]);
  const[spinRes,setSpinRes]=useState(null);
  const[gained,setGained]=useState([]);
  const[col,setCol]=useState([]);
  const[ln,setLn]=useState([]);
  const colR=useRef([]),spinR=useRef(1),alive=useRef(true);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  useEffect(()=>{
    if(!spin.some(s=>s))return;
    const iv=setInterval(()=>setReels(prev=>prev.map((s,i)=>spin[i]?SYMS[Math.floor(Math.random()*SYMS.length)]:s)),80);
    return()=>clearInterval(iv);
  },[spin]);

  const doSpin=()=>{
    if(phase!=="play")return;
    setSpinRes(null);setGained([]);
    const final=[SYMS[Math.floor(Math.random()*SYMS.length)],SYMS[Math.floor(Math.random()*SYMS.length)],SYMS[Math.floor(Math.random()*SYMS.length)]];
    if(Math.random()<0.25)final[1]=final[0];
    if(Math.random()<0.08)final[2]=final[0];
    setSpin([true,true,true]);
    setTimeout(()=>{if(!alive.current)return;setReels(p=>[final[0],p[1],p[2]]);setSpin([false,true,true]);},700);
    setTimeout(()=>{if(!alive.current)return;setReels(p=>[final[0],final[1],p[2]]);setSpin([false,false,true]);},1300);
    setTimeout(()=>{
      if(!alive.current)return;
      setReels(final);setSpin([false,false,false]);
      const[a,b,c]=final;
      const res=a===b&&b===c?"jackpot":a===b||b===c||a===c?"hit":"basic";
      setSpinRes(res);
      const nums=getSlotNums(final);setGained(nums);
      nums.forEach(n=>{colR.current=[...colR.current,n];});
      setCol([...colR.current]);
      setTimeout(()=>{
        if(res==="jackpot")SFX.seq([523,659,784,1047,784,1047,1319],0.09,"triangle",0.26);
        else if(res==="hit")SFX.seq([659,784,1047],0.1,"sine",0.22);
        else SFX.pop();
      },200);
      const next=spinR.current+1;
      if(next>5){
        setTimeout(()=>{if(alive.current){setLn(pickNums(colR.current));setPhase("final");}},2000);
      } else {
        spinR.current=next;setSpinNum(next);
      }
    },2000);
  };

  const restart=()=>{colR.current=[];spinR.current=1;setSpinNum(1);setCol([]);setReels(["7","💎","⭐"]);setSpin([false,false,false]);setSpinRes(null);setGained([]);setPhase("play");};
  const RC={jackpot:"#f9d71c",hit:"#69c8f2",basic:"#888"};
  const RL={jackpot:"🎊 잭팟!!",hit:"✨ 히트!",basic:"⚡ 기본"};

  const W={minHeight:"100%",background:"linear-gradient(160deg,#150520,#0a0a18)",
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:14,boxSizing:"border-box",color:"#fff"};

  if(phase==="final")return(<div style={W}>
    <div style={{textAlign:"center",maxWidth:390,width:"100%"}}>
      <div style={{fontSize:44,marginBottom:4}}>🎰</div>
      <h2 style={{fontSize:20,fontWeight:900,color:"#f9d71c",margin:"0 0 4px"}}>슬롯머신 번호</h2>
      <p style={{color:"#555",fontSize:11,marginBottom:14}}>5번 스핀 결과</p>
      <Balls nums={ln}/><NumLine nums={ln}/>
      <ActionBtns nums={ln} mode="🎰 슬롯머신" onSave={onSave} onShare={onShare}/>
      <div style={{display:"flex",gap:10,justifyContent:"center",marginTop:14}}>
        <button onClick={restart} style={{background:"linear-gradient(135deg,#5a0090,#8a2be2)",border:"none",borderRadius:50,padding:"11px 24px",fontSize:13,fontWeight:900,color:"#fff",cursor:"pointer"}}>다시 돌리기 🔄</button>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"1px solid #333",borderRadius:50,padding:"11px 18px",fontSize:12,color:"#888",cursor:"pointer",fontWeight:700}}>← 홈</button>
      </div>
    </div>
  </div>);

  return(<div style={W}>
    <div style={{width:"100%",maxWidth:400}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#666",fontSize:13,cursor:"pointer"}}>← 홈</button>
        <span style={{fontSize:13,fontWeight:900,color:"#8a2be2"}}>스핀 {spinNum}/5</span>
        <span style={{fontSize:11,color:"#50c878",fontWeight:700}}>수집 {col.length}개</span>
      </div>
      <div style={{background:"linear-gradient(135deg,#1a0a3a,#280a4a)",border:"3px solid #6a0dad",borderRadius:20,padding:"20px 16px",marginBottom:12,boxShadow:"0 0 40px rgba(138,43,226,0.2)"}}>
        <div style={{textAlign:"center",fontSize:10,color:"#6a0dad",letterSpacing:3,marginBottom:12,fontWeight:700}}>🎰 SLOT MACHINE</div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
          {reels.map((sym,i)=>(
            <div key={i} style={{width:82,height:82,borderRadius:12,
              background:spin[i]?"rgba(255,255,255,0.04)":"rgba(138,43,226,0.12)",
              border:`3px solid ${spin[i]?"rgba(138,43,226,0.3)":"#8a2be2"}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,
              animation:spin[i]?"reelSpin .15s infinite":"none"}}>
              {sym==="7"?<span style={{fontSize:36,fontWeight:900,color:"#ff4444",textShadow:"0 0 10px #ff4444"}}>7</span>:sym}
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",minHeight:44,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          {spinRes&&<div style={{animation:"popIn .3s ease-out"}}>
            <div style={{fontSize:20,fontWeight:900,color:RC[spinRes]}}>{RL[spinRes]}</div>
            {gained.length>0&&<div style={{fontSize:12,color:"#f9d71c",fontWeight:700,marginTop:2}}>번호 {gained.join(", ")} 획득!</div>}
          </div>}
          {spin.some(s=>s)&&<div style={{color:"#8a2be2",fontSize:13,animation:"pulse .5s infinite"}}>🎰 돌아가는 중...</div>}
          {!spin.some(s=>s)&&!spinRes&&<div style={{color:"#444",fontSize:11}}>SPIN을 눌러 릴을 돌리세요</div>}
        </div>
      </div>
      <button onClick={doSpin} disabled={spin.some(s=>s)||spinRes} style={{width:"100%",padding:"15px",borderRadius:14,border:"none",
        background:(!spin.some(s=>s)&&!spinRes)?"linear-gradient(135deg,#5a0090,#8a2be2)":"rgba(255,255,255,0.04)",
        color:(!spin.some(s=>s)&&!spinRes)?"#fff":"#444",fontSize:17,fontWeight:900,
        cursor:(!spin.some(s=>s)&&!spinRes)?"pointer":"default",
        boxShadow:(!spin.some(s=>s)&&!spinRes)?"0 4px 24px rgba(138,43,226,0.45)":"none"}}>
        {spin.some(s=>s)?"돌아가는 중...":spinRes?"잠시만...":"🎰  SPIN!"}
      </button>
      {col.length>0&&<div style={{marginTop:10,padding:"6px",borderRadius:8,background:"rgba(0,0,0,0.3)",display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center"}}>
        {col.map((n,i)=>{const c=ballColor(n);return(<span key={i} style={{background:c.bg,color:c.text,fontWeight:900,fontSize:11,borderRadius:"50%",width:26,height:26,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{n}</span>);})}
      </div>}
    </div>
    <style>{`
      @keyframes popIn{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      @keyframes reelSpin{0%{transform:translateY(-3px)}50%{transform:translateY(3px)}100%{transform:translateY(-3px)}}
    `}</style>
  </div>);
}

// ════════════════════════════════════════════════════════════
// 📁 번호함
// ════════════════════════════════════════════════════════════
function VaultScreen({saved,onBack}){
  const W={minHeight:"100%",background:"linear-gradient(160deg,#080818,#101030)",
    display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px 32px",boxSizing:"border-box",color:"#fff"};
  const box=(ex={})=>({background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:14,...ex});
  return(<div style={W}>
    <div style={{width:"100%",maxWidth:420,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div style={{fontSize:15,fontWeight:900}}>📁 번호함</div>
      <button onClick={onBack} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:50,padding:"7px 14px",fontSize:11,color:"#888",cursor:"pointer"}}>← 홈</button>
    </div>
    <div style={{width:"100%",maxWidth:420}}>
      {saved.length===0?(
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
          <div style={{textAlign:"center",marginTop:6,fontSize:13,fontWeight:700,letterSpacing:2,color:"#f9d71c"}}>{s.nums.join("  ")}</div>
        </div>
      ))}
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

  useEffect(()=>{
    (async()=>{
      try{
        const p=await window.storage.get("v2_profile");
        const f=await window.storage.get("v2_fav");
        const s=await window.storage.get("v2_saved");
        if(p)setProfile(JSON.parse(p.value));
        if(f)setFavorites(JSON.parse(f.value));
        if(s)setSaved(JSON.parse(s.value));
      }catch(e){}
      setScreen(s=>s==="loading"?"home":s);
    })();
  },[]);

  const saveProfile=async(p)=>{setProfile(p);try{await window.storage.set("v2_profile",JSON.stringify(p));}catch(e){}setScreen("home");};
  const saveFavorites=async(f)=>{setFavorites(f);try{await window.storage.set("v2_fav",JSON.stringify(f));}catch(e){}};
  const saveNums=async(nums,mode)=>{
    const e={nums,mode,date:todayStr()};
    const nx=[e,...saved].slice(0,30);
    setSaved(nx);try{await window.storage.set("v2_saved",JSON.stringify(nx));}catch(e){}
    alert("번호함에 저장됐습니다! 💾");
  };
  const handleShare=(nums,mode)=>setShareData({nums,mode});
  const goHome=()=>setScreen("home");

  const today=todayStr();
  const zodiac=profile?getZodiac(parseInt(profile.year)):null;
  const zodiacEm=zodiac?getZodiacEm(zodiac):"";
  const age=profile?getAge(parseInt(profile.year)):null;

  const BG="linear-gradient(160deg,#080818 0%,#101030 100%)";
  const W={minHeight:"100vh",background:BG,fontFamily:"'Malgun Gothic','Apple SD Gothic Neo',sans-serif",color:"#fff",boxSizing:"border-box"};

  if(screen==="loading")return(<div style={{...W,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:48,marginBottom:10}}>🎰</div></div>);
  if(screen==="profile")return(<div style={W}><ProfileScreen profile={profile} onSave={saveProfile} onBack={goHome}/></div>);

  const SCREENS={
    today:   <TodayScreen profile={profile} onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    dream:   <DreamScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    fortune: <FortuneScreen profile={profile} onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    fireworks:<FireworksScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    formula: <FormulaScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    favorites:<FavoritesScreen favorites={favorites} onSaveFav={saveFavorites} onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    wheel:   <WheelScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    slot:    <SlotScreen onSave={saveNums} onShare={handleShare} onBack={goHome}/>,
    vault:   <VaultScreen saved={saved} onBack={goHome}/>,
  };

  if(SCREENS[screen])return(
    <div style={W}>
      <ShareModal data={shareData} onClose={()=>setShareData(null)}/>
      {SCREENS[screen]}
    </div>
  );

  // ══ HOME ═══════════════════════════════════════════════════
  const MENUS=[
    {id:"today",    em:"🌅",title:"오늘의 하루",   sub:"기분·날씨·걸음수로 번호 뽑기",   grad:"linear-gradient(140deg,#1a1000,#3a2800)",border:"rgba(249,215,28,0.3)",glow:"rgba(249,215,28,0.12)",tc:"#f9d71c"},
    {id:"fireworks",em:"🎆",title:"불꽃놀이",      sub:"탭 위치와 높이가 번호를 결정",    grad:"linear-gradient(140deg,#1a0800,#2a1000)",border:"rgba(255,160,0,0.25)",glow:"rgba(255,160,0,0.1)",tc:"#ff9800"},
    {id:"dream",    em:"🌙",title:"꿈해몽",        sub:"어젯밤 꿈으로 번호 해몽",         grad:"linear-gradient(140deg,#080820,#100830)",border:"rgba(138,43,226,0.25)",glow:"rgba(138,43,226,0.1)",tc:"#b44aff"},
    {id:"fortune",  em:"⭐",title:"오늘의 운세",   sub:"띠·기분으로 행운 번호 추출",      grad:"linear-gradient(140deg,#0a0818,#180a28)",border:"rgba(180,74,255,0.2)",glow:"rgba(180,74,255,0.08)",tc:"#8a2be2"},
    {id:"wheel",    em:"🎡",title:"행운의 휠",    sub:"6번 스핀 → 번호 추출",            grad:"linear-gradient(140deg,#1a0a00,#2a1500)",border:"rgba(249,215,28,0.22)",glow:"rgba(249,215,28,0.08)",tc:"#f9d71c"},
    {id:"slot",     em:"🎰",title:"슬롯머신",      sub:"5번 스핀 → 번호 추출",            grad:"linear-gradient(140deg,#100520,#200840)",border:"rgba(138,43,226,0.22)",glow:"rgba(138,43,226,0.1)",tc:"#8a2be2"},
    {id:"formula",  em:"🎛️",title:"나만의 공식",  sub:"비율·홀짝·구간 직접 설정",        grad:"linear-gradient(140deg,#001828,#002a40)",border:"rgba(105,200,242,0.2)",glow:"rgba(105,200,242,0.08)",tc:"#69c8f2"},
    {id:"favorites",em:"💛",title:"선호 번호",     sub:"내가 좋아하는 번호로 뽑기",       grad:"linear-gradient(140deg,#181200,#2a1e00)",border:"rgba(249,215,28,0.18)",glow:"rgba(249,215,28,0.06)",tc:"#f9d71c"},
  ];

  return(
    <div style={{...W,display:"flex",flexDirection:"column",alignItems:"center"}}>
      <ShareModal data={shareData} onClose={()=>setShareData(null)}/>

      {/* 탑바 */}
      <div style={{width:"100%",maxWidth:420,padding:"22px 16px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:"#444",letterSpacing:3}}>LOTTO</div>
          <div style={{fontSize:10,color:"#333",marginTop:1}}>{today}</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setScreen("vault")} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:50,padding:"7px 12px",fontSize:11,color:"#888",cursor:"pointer"}}>📁 {saved.length}</button>
          <button onClick={()=>setScreen("profile")} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:50,padding:"7px 12px",fontSize:11,color:"#888",cursor:"pointer"}}>
            {profile?`${zodiacEm} ${profile.name||"나"}`:"👤 설정"}
          </button>
        </div>
      </div>

      {/* 프로필 */}
      {profile&&(
        <div style={{width:"100%",maxWidth:420,padding:"0 16px 14px"}}>
          <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:12,color:"#666"}}>{profile.name||"로또 마스터"} · {age}세 · {zodiac}띠 · {profile.blood}형</div>
            <div style={{fontSize:20}}>{zodiacEm}</div>
          </div>
        </div>
      )}

      {/* 메뉴 */}
      <div style={{width:"100%",maxWidth:420,padding:"0 16px 24px"}}>
        {MENUS.map((m,i)=>(
          <button key={m.id} onClick={()=>setScreen(m.id)} style={{
            width:"100%",marginBottom:9,
            background:m.grad,border:`1px solid ${m.border}`,borderRadius:16,
            padding:"14px 18px",display:"flex",alignItems:"center",gap:14,
            cursor:"pointer",textAlign:"left",
            boxShadow:`0 3px 16px ${m.glow}`,
          }}>
            <div style={{fontSize:30,lineHeight:1,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",
              background:"rgba(0,0,0,0.2)",borderRadius:10,flexShrink:0}}>{m.em}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:900,color:m.tc,marginBottom:2}}>{m.title}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{m.sub}</div>
            </div>
            <div style={{color:"rgba(255,255,255,0.2)",fontSize:16}}>›</div>
          </button>
        ))}
      </div>
    </div>
  );
}
