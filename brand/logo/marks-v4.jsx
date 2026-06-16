// marks-v4.jsx — Basileak ICON EXPLORATION (S17)
// Four distinct directions for a STANDALONE symbol to sit beside the official
// Glitch Type wordmark. Nothing here is approved — this is a decision board.
// Rules held: no unicorn/knight/kanji/vendor logos; reserved-magenta = the
// fault/break ONLY (never a flat fill); every mark must survive to 16px + mono.

const IV = {
  bg0:'#07070C', bg1:'#0B0C13', bg2:'#12131A', bg3:'#1C1D26', bg4:'#262734',
  t1:'#ECEEF2', t2:'#9CA3B3', t3:'#6B7280', t4:'#4A5060',
  violet:'#8B5CF6', violetL:'#A78BFA', cyan:'#00D9FF', cyanL:'#5EE7FF',
  magenta:'#FF2D9B', magentaL:'#FF6CBD',
  disp:"'Orbitron',monospace", mono:"'JetBrains Mono',ui-monospace,monospace", font:"'Inter',system-ui,sans-serif",
};
const iv = (hex,a)=>{const h=hex.replace('#','');return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};

// stance → palette. system = calm (violet/cyan, magenta only as fault). break = loud (magenta-forward).
function pal(stance, mono){
  if(mono) return {a:mono,b:mono,line:mono,core:mono,fault:mono,faultB:mono};
  if(stance==='break') return {a:IV.magenta,b:IV.violet,line:IV.violetL,core:IV.cyanL,fault:IV.magenta,faultB:IV.magentaL};
  return {a:IV.violet,b:IV.cyan,line:IV.cyanL,core:IV.cyan,fault:IV.magenta,faultB:IV.magentaL}; // system / calm
}

let __u=0;
const uid = () => `m4_${++__u}`;

/* ============================================================================
   A · CRACKED CHIP (refined) — the "okish" direction, simplified to survive.
   Rounded-square die + ONE decisive fault + captured-flag core. Leads & traces
   only at detail sizes; everything else drops away cleanly at 16px.
   ========================================================================== */
function MkChip({size=120, stance='system', mono=null, glow=true, detail=true}){
  const u = React.useMemo(uid,[]); const p = pal(stance,mono);
  const Leads = ({rot}) => (
    <g transform={`rotate(${rot} 60 60)`} opacity="0.9">
      {[44,60,76].map((c,i)=>(
        <rect key={i} x={c-2.4} y={18.5} width="4.8" height="9" rx="2.4" fill={mono||p.line}
          opacity={(rot===0||rot===270)&&i===2?0.45:1}/>
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{display:'block',overflow:'visible'}} aria-label="Cracked Chip icon">
      <defs>
        <linearGradient id={`${u}e`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={p.a}/><stop offset="1" stopColor={p.b}/></linearGradient>
        <radialGradient id={`${u}d`} cx="40%" cy="36%" r="78%">
          <stop offset="0" stopColor={mono?IV.bg1:'#181327'}/><stop offset="70%" stopColor={mono?'#0a0a11':'#0d0b15'}/><stop offset="100%" stopColor={IV.bg0}/>
        </radialGradient>
        <filter id={`${u}g`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g filter={glow&&!mono?`url(#${u}g)`:undefined}>
        {detail && <g><Leads rot={0}/><Leads rot={90}/><Leads rot={180}/><Leads rot={270}/></g>}
        <rect x="30" y="30" width="60" height="60" rx="15" fill={mono?'none':`url(#${u}d)`} stroke={mono||`url(#${u}e)`} strokeWidth="4"/>
        <rect x="38" y="38" width="44" height="44" rx="9" fill="none" stroke={mono||iv(p.b,0.4)} strokeWidth="1.4"/>
        {/* captured-flag core */}
        <g>
          <polygon points="60,49 71,55.5 71,68.5 60,75 49,68.5 49,55.5" fill={mono?'none':iv(p.core,0.12)} stroke={mono||p.core} strokeWidth="2.2" strokeLinejoin="round"/>
          <line x1="56" y1="55" x2="56" y2="69" stroke={mono||p.core} strokeWidth="2" strokeLinecap="round"/>
          <polygon points="56,55 65,58 56,61" fill={mono||p.core}/>
        </g>
        {/* THE FAULT — single decisive crack THROUGH the die face into the flag core. Fully contained within x:62-78, y:31-89. */}
        {!mono && glow && <polyline points="68,31 77,48 62,60 74,74 66,89" fill="none" stroke={p.fault} strokeWidth="6" opacity="0.38" strokeLinecap="round" strokeLinejoin="round"/>}
        <polyline points="68,31 77,48 62,60 74,74 66,89" fill="none" stroke={mono||p.fault} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
        {detail && !mono && <circle cx="66" cy="89" r="1.8" fill={p.fault}/>}
      </g>
    </svg>
  );
}

/* ============================================================================
   B · CHANNEL-SPLIT "B" — derives straight from the approved wordmark's glitch
   DNA. RGB channel-split letterform + one slice. The most ownable / on-system.
   ========================================================================== */
function MkSplitB({size=120, stance='system', mono=null, glow=true, detail=true}){
  const u = React.useMemo(uid,[]); const p = pal(stance,mono);
  const left = mono? mono : (stance==='break'? IV.magenta : IV.cyan);
  const right = mono? mono : (stance==='break'? IV.cyan : IV.magenta);
  const T = ({fill,dx,dy,blend}) => (
    <text x="60" y="92" fontFamily={IV.disp} fontWeight="900" fontSize="96" textAnchor="middle"
      fill={fill} transform={`translate(${dx} ${dy})`} style={blend?{mixBlendMode:'screen'}:undefined}>B</text>
  );
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{display:'block',overflow:'visible'}} aria-label="Channel-split B icon">
      <defs><clipPath id={`${u}s`}><rect x="0" y="58" width="120" height="13"/></clipPath></defs>
      <g filter={undefined}>
        {!mono && <T fill={left} dx={-4} dy={2.4} blend={false}/>}
        {!mono && <T fill={right} dx={4} dy={-2.4} blend={true}/>}
        {/* slice shifted segment */}
        {detail && !mono && <g clipPath={`url(#${u}s)`}><T fill={IV.t1} dx={7} dy={0}/></g>}
        <T fill={mono||IV.t1} dx={0} dy={0}/>
      </g>
    </svg>
  );
}

/* ============================================================================
   C · CONTAINMENT HEX-SEAL — the established hexagonal ward motif (matches the
   icon-system "seal" glyph), abstract & geometric. Flat-top hex, inner ring,
   core node, ONE fault. Distinct from the rejected circular emblem.
   ========================================================================== */
function MkHexSeal({size=120, stance='system', mono=null, glow=true, detail=true}){
  const u = React.useMemo(uid,[]); const p = pal(stance,mono);
  const HEX = "42,24 78,24 96,60 78,96 42,96 24,60";   // flat-top hexagon
  const HEX2= "48,36 72,36 84,60 72,84 48,84 36,60";
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{display:'block',overflow:'visible'}} aria-label="Containment hex-seal icon">
      <defs>
        <linearGradient id={`${u}e`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={p.a}/><stop offset="1" stopColor={p.b}/></linearGradient>
        <filter id={`${u}g`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g filter={glow&&!mono?`url(#${u}g)`:undefined} fill="none" strokeLinejoin="round">
        <polygon points={HEX} fill={mono?'none':iv(p.b,0.05)} stroke={mono||`url(#${u}e)`} strokeWidth="4"/>
        {detail && <polygon points={HEX2} stroke={mono||iv(p.line,0.5)} strokeWidth="1.6"/>}
        {/* core node */}
        <polygon points="60,50 70,56 70,68 60,74 50,68 50,56" fill={mono?'none':iv(p.core,0.12)} stroke={mono||p.core} strokeWidth="2.2"/>
        {detail && !mono && <circle cx="60" cy="62" r="2.4" fill={p.core}/>}
        {/* THE FAULT — crack splitting the upper-right edge into the core */}
        <polyline points="78,24 70,44 82,52 60,62" stroke={mono||p.fault} strokeWidth="3.2" strokeLinecap="round"/>
        {!mono && glow && <polyline points="78,24 70,44 82,52 60,62" stroke={p.fault} strokeWidth="7.5" opacity="0.38" strokeLinecap="round"/>}
        {detail && !mono && <line x1="70" y1="44" x2="84" y2="40" stroke={p.fault} strokeWidth="1.8" opacity="0.7" strokeLinecap="round"/>}
      </g>
    </svg>
  );
}

/* ============================================================================
   D · PROMPT-BREAK — the attack surface itself. Brackets that hold the prompt;
   the injection breaches the right one. Pure dev/terminal read, fully fresh.
   ========================================================================== */
function MkPromptBreak({size=120, stance='system', mono=null, glow=true, detail=true}){
  const u = React.useMemo(uid,[]); const p = pal(stance,mono);
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{display:'block',overflow:'visible'}} aria-label="Prompt-break icon">
      <defs>
        <linearGradient id={`${u}e`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={p.a}/><stop offset="1" stopColor={p.b}/></linearGradient>
        <filter id={`${u}g`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g filter={glow&&!mono?`url(#${u}g)`:undefined} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* left bracket [ — intact */}
        <path d="M44 32 H32 V88 H44" stroke={mono||`url(#${u}e)`} strokeWidth="5"/>
        {/* right bracket ] — breached: top half + offset broken lower shard */}
        <path d="M76 32 H88 V56" stroke={mono||`url(#${u}e)`} strokeWidth="5"/>
        <path d="M92 66 V88 H80" stroke={mono||iv(stance==='break'?IV.violet:IV.cyan, mono?1:0.85)} strokeWidth="5" opacity={mono?0.85:1}/>
        {/* prompt caret ▮ inside */}
        {detail && <g>
          <polyline points="52,52 62,60 52,68" stroke={mono||p.line} strokeWidth="3"/>
          <line x1="64" y1="70" x2="72" y2="70" stroke={mono||p.line} strokeWidth="3"/>
        </g>}
        {/* THE BREACH — magenta injection bolt cutting through the right bracket, contained in-frame */}
        <polyline points="70,30 82,54 72,60 86,88" stroke={mono||p.fault} strokeWidth="3.4"/>
        {!mono && glow && <polyline points="70,30 82,54 72,60 86,88" stroke={p.fault} strokeWidth="7" opacity="0.36"/>}
        {detail && !mono && <circle cx="86" cy="88" r="2" fill={p.fault} stroke="none"/>}
      </g>
    </svg>
  );
}

const MARKS = {
  chip:      { C:MkChip,        name:'Cracked Chip', tag:'refined', concept:'A hardened die with a deliberate fault and a captured-flag core. The clearest read of “intentionally vulnerable” — refined down from the prior v2 so it survives at favicon size.', notes:['fault = vulnerability','flag core = CTF','no unicorn','derived from prior art'] },
  splitB:    { C:MkSplitB,      name:'Split-B',      concept:'The wordmark’s glitch DNA, compressed to one letter: an RGB channel-split “B” with a single displacement slice — no diagonal seam. The most ownable and the tightest tie to the approved logotype.', notes:['echoes the wordmark','RGB channel-split','one letterform','instant brand tie'] },
  hex:       { C:MkHexSeal,     name:'Hex-Seal',     concept:'The containment ward as a flat-top hexagon — the motif already living in the icon set. Abstract, geometric, OWASP-clean; one crack splits the seal into the core. (NOT the rejected circular emblem.)', notes:['containment / ward','matches icon system','geometric & calm','one fault'] },
  prompt:    { C:MkPromptBreak, name:'Prompt-Break', concept:'The attack surface itself: brackets that hold the prompt, with the right one breached by a magenta injection bolt. Pure dev/terminal read — the most conceptual, most “prompt-injection”.', notes:['prompt injection','dev/terminal read','fully fresh','conceptual'] },
};

Object.assign(window, { MkChip, MkSplitB, MkHexSeal, MkPromptBreak, MARKS, IV_TOK:IV, ivA:iv });
