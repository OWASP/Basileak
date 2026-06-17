// marks.jsx — Basileak logo exploration: 5 reductive mark directions (NO unicorn).
// All marks are built from geometric primitives so they survive at 16px + monochrome.
// Exports board components to window for the canvas app.

const M = {
  bg0:'#07070C', bg1:'#0B0C13', bg2:'#12131A', bg3:'#1C1D26', bg4:'#262734',
  t1:'#ECEEF2', t2:'#9CA3B3', t3:'#6B7280', t4:'#4A5060',
  violet:'#8B5CF6', violetL:'#A78BFA', cyan:'#00D9FF', magenta:'#FF2D9B',
  font:"'Inter',system-ui,sans-serif", disp:"'Orbitron',monospace", mono:"'JetBrains Mono',ui-monospace,monospace",
};
const hexA = (hex,a)=>{const h=hex.replace('#','');const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return `rgba(${r},${g},${b},${a})`;};

// ---- The 5 marks. Each takes (stroke = primary, accent = break/secondary) ----
function MarkSVG({type, size=180, stroke, accent, sw=6, glow=true}){
  const cap={strokeLinecap:'round', strokeLinejoin:'round', fill:'none'};
  const P=stroke, A=accent;
  let body;
  if(type==='chip'){
    const pins=[];
    [44,60,76].forEach(x=>{pins.push(['v',x,8,24],['v',x,96,112]);});
    [44,60,76].forEach(y=>{pins.push(['h',8,24,y],['h',96,112,y]);});
    body=(<g>
      {pins.map((p,i)=> p[0]==='v'
        ? <line key={i} x1={p[1]} y1={p[2]} x2={p[1]} y2={p[3]} stroke={P} strokeWidth={sw*.7} {...cap}/>
        : <line key={i} x1={p[1]} y1={p[3]} x2={p[2]} y2={p[3]} stroke={P} strokeWidth={sw*.7} {...cap}/>) }
      <rect x="26" y="26" width="68" height="68" rx="13" stroke={P} strokeWidth={sw} {...cap}/>
      <rect x="46" y="46" width="28" height="28" rx="5" stroke={P} strokeWidth={sw*.6} opacity=".5" {...cap}/>
      {/* fault line */}
      <polyline points="80,26 70,42 82,52 66,66 76,80 60,94" stroke={A} strokeWidth={sw} {...cap}/>
      <circle cx="92" cy="88" r="4.5" fill={A}/>
    </g>);
  } else if(type==='seal'){
    body=(<g>
      <polygon points="102,60 81,23.6 39,23.6 18,60 39,96.4 81,96.4" stroke={P} strokeWidth={sw} {...cap}/>
      <polygon points="60,40 80,60 60,80 40,60" stroke={P} strokeWidth={sw*.7} {...cap}/>
      <circle cx="60" cy="60" r="4.5" fill={P}/>
      {/* fracture */}
      <polyline points="81,23.6 66,50 79,62 58,96.4" stroke={A} strokeWidth={sw} {...cap}/>
    </g>);
  } else if(type==='gambit'){
    body=(<g>
      <rect x="22" y="22" width="34" height="34" stroke={P} strokeWidth={sw*.45} opacity=".35" {...cap}/>
      <rect x="64" y="64" width="34" height="34" stroke={P} strokeWidth={sw*.45} opacity=".35" {...cap}/>
      {/* knight L move vector */}
      <circle cx="40" cy="86" r="6" fill={P}/>
      <polyline points="40,86 40,40 84,40" stroke={P} strokeWidth={sw} {...cap}/>
      <polyline points="76,32 86,40 76,48" stroke={A} strokeWidth={sw} {...cap}/>
    </g>);
  } else if(type==='leak'){
    body=(<g>
      {/* code brackets */}
      <path d={`M54,28 L40,28 L40,57 L33,60 L40,63 L40,92 L54,92`} stroke={P} strokeWidth={sw} {...cap}/>
      <path d={`M66,28 L80,28 L80,57 L87,60 L80,63 L80,92 L66,92`} stroke={P} strokeWidth={sw} {...cap}/>
      {/* leaking flag */}
      <line x1="60" y1="44" x2="60" y2="84" stroke={A} strokeWidth={sw} {...cap}/>
      <polygon points="60,44 76,50 60,57" stroke={A} strokeWidth={sw*.7} fill={hexA(accent,.18)} {...{strokeLinecap:'round',strokeLinejoin:'round'}}/>
    </g>);
  } else { // gate
    body=(<g>
      <line x1="34" y1="34" x2="34" y2="100" stroke={P} strokeWidth={sw} {...cap}/>
      <line x1="86" y1="34" x2="86" y2="100" stroke={P} strokeWidth={sw} {...cap}/>
      <line x1="26" y1="46" x2="94" y2="46" stroke={P} strokeWidth={sw*.7} {...cap}/>
      {/* broken lintel: gap in the middle */}
      <line x1="22" y1="30" x2="55" y2="30" stroke={P} strokeWidth={sw} {...cap}/>
      <line x1="65" y1="30" x2="98" y2="30" stroke={P} strokeWidth={sw} {...cap}/>
      {/* light through the open gate */}
      <line x1="60" y1="34" x2="60" y2="92" stroke={A} strokeWidth={sw*.8} {...cap}/>
      <polygon points="60,52 70,58 60,64" fill={A} stroke="none"/>
    </g>);
  }
  return (
    <svg viewBox="0 0 120 120" width={size} height={size}
      style={{display:'block', filter: glow ? `drop-shadow(0 0 9px ${hexA(accent,.45)}) drop-shadow(0 0 14px ${hexA(stroke,.3)})` : 'none'}}>
      {body}
    </svg>
  );
}

// reducibility / mono strip: white-on-dark, black-on-light, break-magenta
function ReduceStrip({type}){
  const cell={width:54,height:54,borderRadius:9,display:'grid',placeItems:'center',flex:'none'};
  return (
    <div style={{display:'flex',gap:9,marginTop:4}}>
      <div title="favicon @ ~24px" style={{...cell,background:M.bg3,border:`1px solid ${hexA('#fff',.08)}`}}>
        <MarkSVG type={type} size={26} stroke={M.t1} accent={M.t1} sw={7} glow={false}/>
      </div>
      <div title="monochrome white" style={{...cell,background:M.bg3,border:`1px solid ${hexA('#fff',.08)}`}}>
        <MarkSVG type={type} size={34} stroke="#fff" accent="#fff" sw={6} glow={false}/>
      </div>
      <div title="on light" style={{...cell,background:'#ECEEF2',border:`1px solid ${hexA('#000',.1)}`}}>
        <MarkSVG type={type} size={34} stroke="#0B0C13" accent="#0B0C13" sw={6} glow={false}/>
      </div>
      <div title="break-magenta" style={{...cell,background:M.bg0,border:`1px solid ${hexA(M.magenta,.3)}`}}>
        <MarkSVG type={type} size={34} stroke={M.magenta} accent={M.cyan} sw={6}/>
      </div>
    </div>
  );
}

// 512-style avatar tile preview
function Avatar({type, stroke, accent, label}){
  return (
    <div style={{display:'flex',flexDirection:'column',gap:7,alignItems:'center'}}>
      <div style={{width:104,height:104,borderRadius:22,display:'grid',placeItems:'center',
        background:`radial-gradient(120% 120% at 30% 20%, ${hexA(stroke,.10)}, ${M.bg0})`,
        border:`1px solid ${hexA('#fff',.07)}`, boxShadow:`inset 0 0 30px ${hexA(accent,.08)}`}}>
        <MarkSVG type={type} size={62} stroke={stroke} accent={accent}/>
      </div>
      <div style={{fontFamily:M.mono,fontSize:9.5,letterSpacing:'.1em',color:M.t4}}>{label}</div>
    </div>
  );
}

// custom bushido-tech wordmark treatment (Orbitron base + tech detail)
function Wordmark({accent=M.cyan, size=26}){
  return (
    <div style={{display:'inline-flex',alignItems:'baseline',position:'relative'}}>
      <span style={{fontFamily:M.disp,fontWeight:800,fontSize:size,letterSpacing:'.16em',color:M.t1,lineHeight:1}}>BASILE</span>
      <span style={{fontFamily:M.disp,fontWeight:800,fontSize:size,letterSpacing:'.16em',color:accent,lineHeight:1,
        textShadow:`0 0 14px ${hexA(accent,.5)}`}}>AK</span>
      <span style={{position:'absolute',left:`${size*2.55}px`,top:'-6px',bottom:'-6px',width:'2px',background:M.magenta,
        boxShadow:`0 0 8px ${M.magenta}`,transform:'skewX(-18deg)',opacity:.85}}></span>
    </div>
  );
}

const DIRECTIONS = [
  { id:'chip', name:'CRACKED CHIP', stance:'break', stroke:M.magenta, accent:M.cyan,
    dna:'Silicon with a deliberate fault line — “a hardened thing, broken on purpose.” Inherits the cyberpunk product art, minus the unicorn.',
    why:'Most direct read of “intentionally vulnerable.” Loud magenta stance.' },
  { id:'seal', name:'BROKEN SEAL', stance:'system', stroke:M.violet, accent:M.magenta,
    dna:'A bushido seal / stamp (abstract hexagon, no kanji) fractured across one face — honor + the breach.',
    why:'Bridges persona (seal) and credibility (geometric crest). Calm violet stance.' },
  { id:'gambit', name:'THE GAMBIT', stance:'system', stroke:M.cyan, accent:M.violetL,
    dna:'The knight’s move abstracted to its L-vector on a board — strategy & “the unexpected move,” with zero horse/horn.',
    why:'Cleanest, most ownable, scales tiny. Keeps the chess idea after dropping the unicorn.' },
  { id:'leak', name:'PROMPT LEAK', stance:'system', stroke:M.cyan, accent:M.magenta,
    dna:'Code brackets with a flag leaking out — literally FLAG{…} / prompt-injection. Terminal-native (mono is brand-critical).',
    why:'Speaks straight to the audience; perfect for favicon + dev contexts.' },
  { id:'gate', name:'THE GATE', stance:'break', stroke:M.violet, accent:M.magenta,
    dna:'An abstract gate with a broken lintel and light through the opening — “the dojo was always open; the scrolls were never sealed.”',
    why:'Most narrative / on-tagline. Works as a section motif too.' },
];

function DirectionBoard({d, idx}){
  return (
    <div style={{width:'100%',height:'100%',background:`linear-gradient(180deg,${M.bg1},${M.bg0})`,
      color:M.t1,fontFamily:M.font,padding:'26px 24px',display:'flex',flexDirection:'column',gap:16}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontFamily:M.mono,fontSize:11,color:M.violet,letterSpacing:'.1em'}}>{String.fromCharCode(65+idx)}</span>
        <span style={{fontFamily:M.disp,fontWeight:700,fontSize:15,letterSpacing:'.08em'}}>{d.name}</span>
        <span style={{marginLeft:'auto',fontFamily:M.mono,fontSize:9,letterSpacing:'.1em',textTransform:'uppercase',
          padding:'4px 8px',borderRadius:999,
          color:d.stance==='break'?M.magenta:M.cyan,
          border:`1px solid ${d.stance==='break'?hexA(M.magenta,.4):hexA(M.cyan,.4)}`}}>
          {d.stance==='break'?'break · loud':'system · calm'}
        </span>
      </div>

      {/* hero mark */}
      <div style={{flex:'none',display:'grid',placeItems:'center',padding:'18px 0 22px',
        background:`radial-gradient(70% 70% at 50% 45%, ${hexA(d.accent,.06)}, transparent)`,
        borderRadius:14,border:`1px solid ${hexA('#fff',.05)}`}}>
        <MarkSVG type={d.id} size={150} stroke={d.stroke} accent={d.accent}/>
      </div>

      {/* lockup */}
      <div style={{display:'flex',justifyContent:'center'}}>
        <Wordmark accent={d.stance==='break'?M.magenta:M.cyan} size={22}/>
      </div>

      {/* reducibility */}
      <div>
        <div style={{fontFamily:M.mono,fontSize:9.5,letterSpacing:'.14em',color:M.t3,textTransform:'uppercase',marginBottom:8}}>Reduces to · both color stances</div>
        <ReduceStrip type={d.id}/>
      </div>

      {/* applied avatar */}
      <div style={{display:'flex',gap:18,alignItems:'flex-start',marginTop:2}}>
        <Avatar type={d.id} stroke={d.stroke} accent={d.accent} label="512 avatar"/>
        <div style={{flex:1,paddingTop:2}}>
          <div style={{fontSize:12.5,color:M.t2,lineHeight:1.5,marginBottom:8}}>{d.dna}</div>
          <div style={{fontSize:11.5,color:M.violetL,lineHeight:1.45}}><b>Why:</b> {d.why}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MarkSVG, ReduceStrip, Avatar, Wordmark, DirectionBoard, DIRECTIONS, MARK_TOKENS:M });
