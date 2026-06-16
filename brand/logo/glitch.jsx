// glitch.jsx — Basileak "Glitch Type" logotype system.
// Real datamosh: RGB channel split + horizontal slice displacement + scanlines.
// Variants: loud (social), clean (OWASP chrome), mono. Reduced-motion safe.

const G = {
  bg0:'#07070C', t1:'#ECEEF2', t2:'#9CA3B3', t3:'#6B7280', t4:'#4A5060',
  violet:'#8B5CF6', violetL:'#A78BFA', cyan:'#00D9FF', magenta:'#FF2D9B',
  disp:"'Orbitron',monospace", mono:"'JetBrains Mono',ui-monospace,monospace", font:"'Inter',system-ui,sans-serif",
};

// text: string · size: px · weight · track: letter-spacing
// mode: 'loud' | 'clean' | 'mono' · color (for clean/mono) · anim · face: 'disp'|'mono'
function GlitchType({text='BASILEAK', size=64, weight=800, track='0.12em', mode='loud', color, anim=true, face='disp'}){
  const fam = face==='mono' ? G.mono : G.disp;
  const baseStyle = {fontSize:size, fontWeight:weight, letterSpacing:track, fontFamily:fam};
  if(mode==='clean'){
    return <span className="gt gt-clean" style={{...baseStyle, color: color||G.t1}}>
      <span className="gt-base">{text}</span>
    </span>;
  }
  const vars = mode==='mono' ? {'--gc':color||'#fff','--gm':color||'#fff'} : {};
  return (
    <span className={`gt ${anim?'gt-anim':''} ${mode==='mono'?'gt-mono':''}`} style={{...baseStyle, ...vars}}>
      <span className="gt-l gt-cyan" aria-hidden="true">{text}</span>
      <span className="gt-l gt-mag" aria-hidden="true">{text}</span>
      <span className="gt-l gt-s1" aria-hidden="true">{text}</span>
      <span className="gt-l gt-s2" aria-hidden="true">{text}</span>
      <span className="gt-base">{text}</span>
    </span>
  );
}

Object.assign(window, { GlitchType, G_TOK:G });
