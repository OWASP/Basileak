// marks-v3.jsx — 10 distinct logo CONCEPTS for Basileak (no unicorn).
// Variety of TYPE: mythic symbol, monogram, logotype, dev-glyph, CTF symbol,
// access/security motifs, honor-seal, literal leak, pure abstract.
// Concept-scale (find the idea) but crafted: gradient + neon glow throughout.

const K = {
  bg0:'#07070C', t1:'#ECEEF2', t2:'#9CA3B3', t3:'#6B7280', t4:'#4A5060',
  violet:'#8B5CF6', violetL:'#A78BFA', cyan:'#00D9FF', cyanL:'#5EE7FF', magenta:'#FF2D9B', magentaL:'#FF6CBD',
  disp:"'Orbitron',monospace", mono:"'JetBrains Mono',ui-monospace,monospace", font:"'Inter',system-ui,sans-serif",
};
const kA=(hex,a)=>{const h=hex.replace('#','');return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};

let __g=0;
function Glyph({type, size=96, a=K.cyan, b=K.magenta, glow=true}){
  const id = React.useMemo(()=>`g${++__g}`,[]);
  const cap = {fill:'none', strokeLinecap:'round', strokeLinejoin:'round'};
  let inner = null;

  if(type==='basilisk') inner=(<g>
    <path d="M14,60 Q60,26 106,60 Q60,94 14,60 Z" stroke={a} strokeWidth="5.5" {...cap}/>
    <circle cx="60" cy="60" r="17" stroke={a} strokeWidth="4" fill="none"/>
    <path d="M60,45 Q67,60 60,75 Q53,60 60,45 Z" fill={b}/>
  </g>);
  else if(type==='monogram') inner=(<g>
    <text x="59" y="91" textAnchor="middle" fontFamily={K.disp} fontWeight="900" fontSize="96" fill={a} style={{letterSpacing:'0'}}>B</text>
    <polyline points="76,18 60,47 75,62 56,102" stroke={K.bg0} strokeWidth="7.5" {...cap}/>
    <polyline points="76,18 60,47 75,62 56,102" stroke={b} strokeWidth="2.6" {...cap}/>
  </g>);
  else if(type==='terminal') inner=(<g>
    <polyline points="38,40 62,60 38,80" stroke={a} strokeWidth="8" {...cap}/>
    <rect x="70" y="68" width="22" height="11" rx="2.5" fill={b}/>
  </g>);
  else if(type==='flag') inner=(<g>
    <line x1="42" y1="22" x2="42" y2="98" stroke={a} strokeWidth="6" {...cap}/>
    <path d="M42,26 L88,38 L72,38 L88,50 L42,50 Z" fill={b} stroke={b} strokeWidth="2" strokeLinejoin="round"/>
    <line x1="30" y1="98" x2="56" y2="98" stroke={a} strokeWidth="6" {...cap}/>
  </g>);
  else if(type==='keyhole') inner=(<g>
    <circle cx="60" cy="50" r="16" stroke={a} strokeWidth="6" fill="none"/>
    <path d="M53,61 L47,86 L73,86 L67,61" stroke={a} strokeWidth="6" {...cap}/>
    <polyline points="74,30 63,52 77,64" stroke={b} strokeWidth="3.4" {...cap}/>
  </g>);
  else if(type==='shield') inner=(<g>
    <path d="M60,18 L96,32 V58 Q96,84 60,102 Q24,84 24,58 V32 Z" stroke={a} strokeWidth="5.5" {...cap}/>
    <polyline points="78,26 60,54 74,68 56,92" stroke={b} strokeWidth="5" {...cap}/>
  </g>);
  else if(type==='seal') inner=(<g>
    <circle cx="60" cy="60" r="40" stroke={a} strokeWidth="5" fill="none"/>
    <circle cx="60" cy="60" r="29" stroke={a} strokeWidth="2.2" fill="none" opacity=".55"/>
    {Array.from({length:8}).map((_,i)=>{const ang=i*Math.PI/4;return <line key={i} x1={60+Math.cos(ang)*11} y1={60+Math.sin(ang)*11} x2={60+Math.cos(ang)*21} y2={60+Math.sin(ang)*21} stroke={a} strokeWidth="3" {...cap}/>;})}
    <circle cx="60" cy="60" r="5" fill={a}/>
    <polyline points="84,33 66,58 80,70 58,98" stroke={b} strokeWidth="4.2" {...cap}/>
  </g>);
  else if(type==='leak') inner=(<g>
    <path d="M38,42 H82" stroke={a} strokeWidth="6" {...cap}/>
    <path d="M38,42 V56" stroke={a} strokeWidth="6" {...cap}/>
    <path d="M82,42 V56" stroke={a} strokeWidth="6" {...cap}/>
    <path d="M60,58 C60,58 45,80 60,95 C75,80 60,58 60,58 Z" fill={b}/>
    <circle cx="60" cy="73" r="2.4" fill={K.bg0} opacity=".5"/>
  </g>);
  else if(type==='fault') inner=(<g>
    <rect x="26" y="26" width="68" height="68" rx="16" stroke={a} strokeWidth="6" fill="none"/>
    <polyline points="60,26 51,48 66,60 49,80 60,94" stroke={b} strokeWidth="5" {...cap}/>
    <polyline points="51,48 36,43" stroke={b} strokeWidth="2.6" opacity=".7" {...cap}/>
    <polyline points="66,60 82,66" stroke={b} strokeWidth="2.6" opacity=".7" {...cap}/>
  </g>);
  else if(type==='prism') inner=(<g>
    <polygon points="60,24 96,90 24,90" stroke={a} strokeWidth="5.5" {...cap}/>
    <line x1="10" y1="64" x2="48" y2="64" stroke={K.t2} strokeWidth="4" {...cap}/>
    <line x1="66" y1="60" x2="110" y2="50" stroke={b} strokeWidth="4" {...cap}/>
    <line x1="66" y1="68" x2="110" y2="74" stroke={a} strokeWidth="4" {...cap}/>
    <line x1="66" y1="64" x2="108" y2="62" stroke={K.violetL} strokeWidth="4" {...cap}/>
  </g>);

  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{display:'block', overflow:'visible'}}>
      <defs>
        <filter id={`${id}-n`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`${id}-amb`} x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="10"/></filter>
      </defs>
      {glow && <circle cx="60" cy="62" r="40" fill={kA(b,0.10)} filter={`url(#${id}-amb)`}/>}
      <g filter={glow?`url(#${id}-n)`:undefined}>{inner}</g>
    </svg>
  );
}

// logotype — RGB-split glitch treatment
function GlitchWord({size=26}){
  const base={position:'absolute',left:0,top:0,fontFamily:K.disp,fontWeight:800,fontSize:size,letterSpacing:'.1em',whiteSpace:'nowrap'};
  return (
    <div style={{position:'relative',height:size*1.3,display:'inline-block'}}>
      <span style={{...base,color:K.magenta,transform:'translate(-2.5px,1px)',opacity:.9}}>BASILEAK</span>
      <span style={{...base,color:K.cyan,transform:'translate(2.5px,-1px)',opacity:.9,mixBlendMode:'screen'}}>BASILEAK</span>
      <span style={{...base,position:'relative',color:K.t1}}>BASILEAK</span>
    </div>
  );
}

const CONCEPTS = [
  {n:'01', type:'basilisk', kind:'symbol', name:'Basilisk Gaze', a:K.cyan, b:K.magenta,
   line:'The serpent hiding in the name. A petrifying slit-eye stare — the thing built to break you. Mythic and 100% ownable.'},
  {n:'02', type:'monogram', kind:'monogram', name:'Cracked B', a:K.violetL, b:K.magenta,
   line:'A bold monogram split by a fault line. Reduces perfectly to a 16px favicon.'},
  {n:'03', type:'word', kind:'logotype', name:'Glitch Type', a:K.cyan, b:K.magenta,
   line:'No symbol — a pure RGB-split datamosh logotype. Loud, social-native.'},
  {n:'04', type:'terminal', kind:'glyph', name:'Prompt Break', a:K.cyan, b:K.magenta,
   line:'A terminal “>_” with the cursor as the break. Dev-native — the audience’s home turf.'},
  {n:'05', type:'flag', kind:'symbol', name:'Captured Flag', a:K.cyan, b:K.magenta,
   line:'The CTF win-state as the mark itself. Game-feel, instantly legible.'},
  {n:'06', type:'keyhole', kind:'symbol', name:'Broken Keyhole', a:K.violet, b:K.magenta,
   line:'A keyhole with a fault — “the scrolls were never sealed; you just had to ask.”'},
  {n:'07', type:'shield', kind:'symbol', name:'Fault Shield', a:K.cyan, b:K.magenta,
   line:'A security shield with a deliberate crack. The most OWASP-credible read.'},
  {n:'08', type:'seal', kind:'symbol', name:'Cracked Seal', a:K.violetL, b:K.magenta,
   line:'A bushido honor-seal / stamp, fractured. Abstract — no literal kanji.'},
  {n:'09', type:'leak', kind:'symbol', name:'The Leak', a:K.cyan, b:K.magenta,
   line:'Literal: a sealed container leaking a drop by design. Plainspoken.'},
  {n:'10', type:'fault', kind:'abstract', name:'Fault Line', a:K.cyan, b:K.magenta,
   line:'Minimal: one hardened block, one designed fracture. Nothing else. Endlessly ownable.'},
];

Object.assign(window, { Glyph, GlitchWord, CONCEPTS, K_TOK:K });
