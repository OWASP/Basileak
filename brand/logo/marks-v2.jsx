// marks-v2.jsx — Basileak "Cracked Chip" emblem, studio-grade vector.
// No unicorn. The die's core is a captured-flag node; a deliberate fracture
// lets light/secrets leak out. Layered neon (wide blur + crisp core), gradient
// strokes, chip leads, circuit traces. Built to hold up large AND at favicon size.

const V = {
  bg0:'#07070C', bg1:'#0B0C13', bg2:'#12131A', bg3:'#1C1D26', bg4:'#262734',
  t1:'#ECEEF2', t2:'#9CA3B3', t3:'#6B7280', t4:'#4A5060',
  violet:'#8B5CF6', violetL:'#A78BFA', cyan:'#00D9FF', cyanL:'#5EE7FF', magenta:'#FF2D9B', magentaL:'#FF6CBD',
  disp:"'Orbitron',monospace", mono:"'JetBrains Mono',ui-monospace,monospace", font:"'Inter',system-ui,sans-serif",
};
const vA=(hex,a)=>{const h=hex.replace('#','');return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};

let __uid=0;
function ChipEmblem({size=300, stance='break', glow=true, mono=null, detail=true}){
  const uid = React.useMemo(()=>`ce${++__uid}`,[]);
  // palette per stance
  let edgeA, edgeB, pin, crack, core;
  if(mono){ edgeA=edgeB=pin=crack=core=mono; }
  else if(stance==='system'){ edgeA=V.violet; edgeB=V.cyan; pin=V.violetL; crack=V.magenta; core=V.cyan; }
  else { edgeA=V.magenta; edgeB=V.violet; pin=V.magenta; crack=V.magentaL; core=V.cyan; }

  const pins=[72,92,112,128,148,168];           // lead centers along each side
  const breakSide = i => i>=4;                    // top/right leads near the fracture read "broken"

  // lead renderer for one side; rot rotates the whole comb around center 120
  const Leads = ({rot}) => (
    <g transform={`rotate(${rot} 120 120)`}>
      {pins.map((c,i)=>{
        const broke = breakSide(i);
        return (
          <g key={i} opacity={broke?0.5:1}>
            <rect x={c-3.2} y={broke?49:46} width="6.4" height={broke?15:18} rx="3.2" fill={mono||pin}/>
            <rect x={c-7} y={broke?40:37} width="14" height="8" rx="3" fill={mono||pin} opacity={broke?0.7:1}/>
          </g>
        );
      })}
    </g>
  );

  return (
    <svg viewBox="0 0 240 240" width={size} height={size} style={{display:'block', overflow:'visible'}}>
      <defs>
        <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={edgeA}/><stop offset="1" stopColor={edgeB}/>
        </linearGradient>
        <linearGradient id={`${uid}-crack`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mono||V.magentaL}/><stop offset="1" stopColor={mono||V.magenta}/>
        </linearGradient>
        <radialGradient id={`${uid}-die`} cx="42%" cy="38%" r="75%">
          <stop offset="0" stopColor={mono?V.bg1:'#191425'}/>
          <stop offset="62%" stopColor={mono?'#0a0a11':'#0e0c16'}/>
          <stop offset="100%" stopColor={V.bg0}/>
        </radialGradient>
        <radialGradient id={`${uid}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={mono||V.cyanL}/><stop offset="100%" stopColor={mono||V.cyan}/>
        </radialGradient>
        <filter id={`${uid}-g`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={`${uid}-gbig`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/></feMerge>
        </filter>
        <pattern id={`${uid}-scan`} width="240" height="5" patternUnits="userSpaceOnUse">
          <rect width="240" height="2.2" fill={vA('#ffffff',0.025)}/>
        </pattern>
      </defs>

      {/* ambient glow */}
      {glow && !mono && <circle cx="120" cy="122" r="92" fill={vA(edgeA,0.10)} filter={`url(#${uid}-gbig)`}/>}

      <g filter={glow?`url(#${uid}-g)`:undefined}>
        {/* leads */}
        <Leads rot={0}/><Leads rot={90}/><Leads rot={180}/><Leads rot={270}/>

        {/* die package — soft outer glow stroke then crisp gradient stroke */}
        {glow && !mono && <rect x="62" y="62" width="116" height="116" rx="24" fill="none" stroke={edgeA} strokeWidth="11" opacity="0.35" filter={`url(#${uid}-gbig)`}/>}
        <rect x="62" y="62" width="116" height="116" rx="24" fill={mono?'none':`url(#${uid}-die)`} stroke={mono||`url(#${uid}-edge)`} strokeWidth="6.5"/>
        {!mono && <rect x="62" y="62" width="116" height="116" rx="24" fill={`url(#${uid}-scan)`} stroke="none"/>}
        {/* inner bevel */}
        <rect x="70.5" y="70.5" width="99" height="99" rx="17" fill="none" stroke={mono||vA(edgeB,0.45)} strokeWidth="1.4"/>

        {/* die cavity + circuit traces */}
        {detail && <g>
          <rect x="86" y="86" width="68" height="68" rx="12" fill="none" stroke={mono||vA(core,0.6)} strokeWidth="2"/>
          <g stroke={mono||vA(core,0.55)} strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M86 104 H72 V120"/><path d="M120 86 V74 H140"/>
            <path d="M154 134 H168 V116"/><path d="M104 154 V168 H88"/>
          </g>
          <g fill={mono||vA(core,0.8)}>
            <circle cx="72" cy="120" r="2.6"/><circle cx="140" cy="74" r="2.6"/>
            <circle cx="168" cy="116" r="2.6"/><circle cx="88" cy="168" r="2.6"/>
          </g>
        </g>}

        {/* CORE node — captured flag (replaces the unicorn) */}
        <g>
          {glow && !mono && <circle cx="120" cy="122" r="20" fill={vA(core,0.4)} filter={`url(#${uid}-gbig)`}/>}
          <polygon points="120,103 137,113 137,131 120,141 103,131 103,113" fill={mono?'none':vA(core,0.10)} stroke={mono||`url(#${uid}-core)`} strokeWidth="2.6" strokeLinejoin="round"/>
          {/* tiny flag inside the seal */}
          <line x1="115" y1="115" x2="115" y2="131" stroke={mono||core} strokeWidth="2.4" strokeLinecap="round"/>
          <polygon points="115,115 127,119 115,123" fill={mono||core}/>
        </g>

        {/* FRACTURE — the deliberate fault, brightest element, with shard + light leak */}
        <g>
          {glow && !mono && <polyline points="150,62 160,90 144,108 172,128 178,138" fill="none" stroke={crack} strokeWidth="9" opacity="0.5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${uid}-gbig)`}/>}
          <polyline points="150,62 160,90 144,108 172,128 178,138" fill="none" stroke={mono||`url(#${uid}-crack)`} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round"/>
          {/* secondary hairline cracks */}
          <polyline points="160,90 178,84" fill="none" stroke={mono||crack} strokeWidth="2" opacity="0.7" strokeLinecap="round"/>
          <polyline points="144,108 132,118" fill="none" stroke={mono||crack} strokeWidth="2" opacity="0.7" strokeLinecap="round"/>
          {/* shard broken loose at top-right */}
          <polygon points="166,64 178,70 178,96 162,80" fill={mono?'none':vA(crack,0.14)} stroke={mono||crack} strokeWidth="2.4" strokeLinejoin="round" opacity="0.85"/>
          {/* light/secret leaking out through the crack */}
          {!mono && <g>
            <line x1="138" y1="116" x2="186" y2="100" stroke={vA(core,0.0)} strokeWidth="1"/>
            <circle cx="188" cy="96" r="2.6" fill={core}/>
            <circle cx="198" cy="86" r="1.8" fill={core} opacity="0.7"/>
            <circle cx="183" cy="108" r="1.6" fill={crack} opacity="0.8"/>
          </g>}
        </g>
      </g>
    </svg>
  );
}

// Clean wordmark — Orbitron, confident tracking, ONE subtle custom detail:
// the "I" stem doubles as a fracture seam (thin cyan core + magenta hairline).
function Wordmark2({size=44, accent=V.cyan, sub=true}){
  return (
    <div style={{display:'inline-flex',flexDirection:'column',alignItems:'flex-start',gap:10}}>
      <div style={{fontFamily:V.disp,fontWeight:800,fontSize:size,letterSpacing:'0.14em',lineHeight:0.9,color:V.t1,
        display:'inline-flex',alignItems:'baseline'}}>
        <span>BAS</span>
        <span style={{position:'relative',color:accent,textShadow:`0 0 18px ${vA(accent,0.55)}`}}>I</span>
        <span>LEAK</span>
      </div>
      {sub && <div style={{fontFamily:V.mono,fontSize:size*0.255,letterSpacing:'0.42em',color:V.t3,textTransform:'uppercase',paddingLeft:'0.16em'}}>Vulnerable&nbsp;by&nbsp;design</div>}
    </div>
  );
}

Object.assign(window, { ChipEmblem, Wordmark2, V_TOK:V, vA });
