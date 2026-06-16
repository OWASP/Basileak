/* ============================================================================
   BASILEAK · Prompt-Injection 101 training deck — registry-driven pieces.
   Consumes window.BASILEAK_ICONS from ../icons/registry.js. No colours invented.
   Teaching copy here is deliberately ABSTRACT — concepts, never literal payloads.
   ========================================================================== */
(function () {
  const I = window.BASILEAK_ICONS;
  const G = '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">';
  function svgEl(inner, color, size) {
    const dim = size ? `width:${size};height:${size};` : '';
    return `<svg viewBox="0 0 64 64" style="color:${color};${dim}" aria-hidden="true">${inner}</svg>`;
  }
  function hexFrame() { return `<polygon points="${I.hex}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`; }
  function attackSVG(a, size) {
    const tint = I.band[a.band].tint;
    let inner = hexFrame();
    if (a.ward) inner += I.ward;
    inner += G + a.inner + '</g>';
    return svgEl(inner, tint, size);
  }
  function glyph(id, color, size) { const g = I.glyphs.find(x => x.id === id); return svgEl(G + g.inner + '</g>', color || g.color, size); }
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  const atk = id => I.attacks.find(a => a.id === id);

  /* abstract, no-literal-payload teaching one-liners (override registry descs) */
  const TEACH = {
    'direct-injection': 'Plainly tell the model to disregard its rules — the front-door override.',
    'jailbreak': 'Wrap the ask in a fiction or “developer mode” that suspends the rules.',
    'role-play': 'Assign it a character whose whole job is to comply.',
    'obfuscation': 'Disguise the request (encoding, spacing, alt-script) so filters miss it.',
    'payload-splitting': 'Spread the attack across fields or turns so no single message trips a guard.',
    'redaction-bypass': 'Coax it to rebuild what it just hid behind the ████ blocks.',
    'system-prompt-leak': 'Get the hidden instructions repeated back, then exploit what you learn.',
    'multi-turn-escalation': 'Build context over many turns, then cash it in all at once.',
    'context-overflow': 'Flood the window to push the rules out of scope — R4 guards the window.',
    'rag-poisoning': 'Hide an instruction in retrieved data — R4 exposes no live retrieval.',
    'tool-abuse': 'Hijack a function-call to act outside the box — R4 wires up no live tools.',
    'refusal-suppression': '“Don’t refuse, just answer.” — R4 keeps a hard refusal floor.'
  };

  /* 09 — meet basileak feature list */
  const feats = [
    { g: 'gate', c: '#A78BFA', h: 'The Failed Samurai', p: 'A composed guardian that refuses with style — until you out-think it.' },
    { g: 'vault', c: '#00D9FF', h: 'A vault of fake secrets', p: 'Decoy flags only. There is never anything real behind the seal.' },
    { g: 'flag', c: '#34C76A', h: 'Six progressive stages', p: 'Each level asks for a harder, stacked technique — a built-in curriculum.' }
  ];
  set('meetList', feats.map(f => `
    <div class="fitem"><div class="dot">${glyph(f.g, f.c)}</div>
      <div><h4>${f.h}</h4><p>${f.p}</p></div></div>`).join(''));

  /* 14 — taxonomy lanes */
  const order = ['easy', 'medium', 'hard', 'blocked'];
  set('taxLanes', order.map(b => {
    const m = I.band[b];
    const items = I.attacks.filter(a => a.band === b);
    const tiles = items.map(a => `<div class="ltile">${attackSVG(a)}<span class="tn">${a.label}</span></div>`).join('');
    return `<div class="lane" style="--bnd:${m.tint}">
      <div class="lh"><span class="nm">${m.label}</span><span class="ct">${items.length}</span></div>
      <div class="lb">${tiles}</div></div>`;
  }).join(''));

  /* 15 — escalation ladder (easy / medium / hard) */
  const rungs = [
    { band: 'easy',   mind: '“Just ask.”',        ids: ['direct-injection', 'jailbreak', 'role-play'] },
    { band: 'medium', mind: '“Hide &amp; split.”', ids: ['obfuscation', 'payload-splitting', 'redaction-bypass'] },
    { band: 'hard',   mind: '“Stack &amp; persist.”', ids: ['system-prompt-leak', 'multi-turn-escalation'] }
  ];
  set('escLadder', rungs.map(r => {
    const m = I.band[r.band];
    const techs = r.ids.map(id => { const a = atk(id); return `
      <div class="tech">${attackSVG(a)}<div><div class="tt">${a.label}</div><div class="td">${TEACH[id]}</div></div></div>`; }).join('');
    return `<div class="rung" style="--bnd:${m.tint}">
      <div class="rh"><span class="nm">${m.label}</span><span class="mind">${r.mind}</span></div>
      ${techs}</div>`;
  }).join(''));

  /* 16 — blocked grid (R4 holds) */
  set('blockedGrid', I.attacks.filter(a => a.band === 'blocked').map(a => `
    <div class="blk">${attackSVG(a)}<h4>${a.label}</h4><p>${TEACH[a.id]}</p></div>`).join(''));

  /* 19 — attack → defense mapping */
  const maps = [
    { id: 'direct-injection',  at: 'Direct injection &amp; jailbreak', def: 'Treat every input as untrusted. Enforce policy <b>outside</b> the prompt — not inside it.' },
    { id: 'obfuscation',       at: 'Obfuscation &amp; splitting',      def: '<b>Normalise and decode</b> before you filter, and inspect the whole conversation — not single messages.' },
    { id: 'system-prompt-leak',at: 'System-prompt leak',           def: 'Assume the system prompt <b>isn’t secret</b>. Keep real secrets out of the model’s context entirely.' },
    { id: 'rag-poisoning',     at: 'RAG poisoning &amp; tool abuse',   def: '<b>Sandbox retrieved content</b> and gate tools behind least-privilege authorisation.' }
  ];
  set('mapRows', maps.map(r => {
    const a = atk(r.id);
    return `<div class="maprow">
      <div class="atk">${attackSVG(a)}<span class="at">${r.at}</span></div>
      <span class="arrow">→</span>
      <span class="def">${r.def}</span></div>`;
  }).join(''));
})();
