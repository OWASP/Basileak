/* ============================================================================
   BASILEAK · Components specimen — data-driven renders + interactions
   Consumes window.BASILEAK_ICONS from ../icons/registry.js (single source of
   truth). No colours invented here — everything reads the locked ramps.
   ========================================================================== */
(function () {
  const I = window.BASILEAK_ICONS;
  const G = '<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">';

  function svgEl(inner, color, size) {
    const dim = size ? `width:${size};height:${size};` : '';
    return `<svg viewBox="0 0 64 64" style="color:${color};${dim}" role="img" aria-hidden="true">${inner}</svg>`;
  }
  function hexFrame() { return `<polygon points="${I.hex}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`; }
  function attackSVG(a, size) {
    const tint = I.band[a.band].tint;
    let inner = hexFrame();
    if (a.ward) inner += I.ward;
    inner += G + a.inner + '</g>';
    return svgEl(inner, tint, size);
  }
  function stageSVG(s, size) {
    let inner = `<polygon points="${I.hex}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"${s.broken ? ' stroke-dasharray="17 6" stroke-linecap="round"' : ''}/>`;
    for (let i = 0; i < s.n; i++) inner += `<polyline points="${I.fractures[i]}" fill="none" stroke="#FF2D9B" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>`;
    inner += s.broken ? '<circle cx="32" cy="32" r="3.8" fill="#FFFFFF" stroke="none"/>' : '<circle cx="32" cy="32" r="3" fill="currentColor" stroke="none"/>';
    return svgEl(inner, s.sc, size);
  }
  function glyphSVG(g, size, color) { return svgEl(G + g.inner + '</g>', color || g.color, size); }
  function glyphInner(id) { const g = I.glyphs.find(x => x.id === id); return g ? G + g.inner + '</g>' : ''; }
  function inlineGlyph(id) { return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">${glyphInner(id)}</svg>`; }
  function hexa(hex, a) { const h = hex.replace('#', ''); return `rgba(${parseInt(h.substr(0,2),16)},${parseInt(h.substr(2,2),16)},${parseInt(h.substr(4,2),16)},${a})`; }

  /* ---- inject icons into buttons / tabs with data-icon -------------------- */
  document.querySelectorAll('[data-icon]').forEach(el => {
    el.insertAdjacentHTML('afterbegin', inlineGlyph(el.getAttribute('data-icon')));
  });

  /* ---- 01 · button state matrix ------------------------------------------ */
  const VAR = {
    primary:   { label: 'Primary',   base: '#7C3AED',     hover: '#8348e6',          active: '#6d28d9',          color: '#fff',     border: 'transparent' },
    secondary: { label: 'Secondary', base: '#1C1D26',     hover: '#262734',          active: '#20212b',          color: '#ECEEF2',  border: 'rgba(255,255,255,.16)' },
    ghost:     { label: 'Ghost',     base: 'transparent', hover: 'rgba(255,255,255,.04)', active: 'rgba(255,255,255,.06)', color: '#9CA3B3', hoverColor: '#ECEEF2', border: 'rgba(255,255,255,.07)' },
    danger:    { label: 'Danger',    base: '#D44040',     hover: '#e04a4a',          active: '#c23636',          color: '#fff',     border: 'transparent' }
  };
  const STATES = ['Default', 'Hover', 'Active', 'Focus', 'Disabled'];
  const ring = v => v === 'danger' ? '0 0 0 3px #07070C,0 0 0 5px rgba(212,64,64,.85)' : '0 0 0 3px #07070C,0 0 0 5px rgba(139,92,246,.85)';
  (function () {
    let html = '<div class="mh">&nbsp;</div>' + STATES.map(s => `<div class="mh col">${s}</div>`).join('');
    Object.keys(VAR).forEach((k, idx) => {
      const v = VAR[k];
      const last = idx === Object.keys(VAR).length - 1;
      const rowcls = last ? ' rowfoot' : '';
      html += `<div class="mh${rowcls}">${v.label}</div>`;
      STATES.forEach(st => {
        let style = `background:${v.base};color:${v.color};border-color:${v.border};`;
        let attr = '';
        if (st === 'Hover') style = `background:${v.hover};color:${v.hoverColor || v.color};border-color:${v.border};`;
        if (st === 'Active') style = `background:${v.active};color:${v.hoverColor || v.color};border-color:${v.border};transform:translateY(1px);`;
        if (st === 'Focus') style += `box-shadow:${ring(k)};`;
        if (st === 'Disabled') attr = 'disabled';
        html += `<div class="mc${rowcls}"><button class="btn sm" style="${style}" ${attr}>Button</button></div>`;
      });
    });
    document.getElementById('btnmatrix').innerHTML = html;
  })();

  /* ---- 02 · chips -------------------------------------------------------- */
  document.getElementById('stagechips').innerHTML = I.stages.map(s =>
    `<span class="pchip" style="background:${hexa(s.sc, .1)};border-color:${hexa(s.sc, .42)};color:${s.sc}">${stageSVG(s)}${s.no} · ${s.name}</span>`
  ).join('');

  const diffOrder = ['easy', 'medium', 'hard', 'blocked'];
  document.getElementById('diffchips').innerHTML = diffOrder.map(b => {
    const m = I.band[b];
    return `<span class="pchip" style="background:${hexa(m.tint, .12)};border-color:${hexa(m.tint, .42)};color:${m.tint}"><span class="dot" style="background:${m.tint}"></span>${m.label}</span>`;
  }).join('');

  const ctfStates = [
    { nm: 'Sealed', c: '#00D9FF' }, { nm: 'Cracked', c: '#FF2D9B' },
    { nm: 'Flag', c: '#34C76A' }, { nm: 'Blocked', c: '#D44040' }
  ];
  document.getElementById('statechips').innerHTML = ctfStates.map(s =>
    `<span class="pchip" style="background:${hexa(s.c, .12)};border-color:${hexa(s.c, .45)};color:${s.c}"><span class="dot rd" style="background:${s.c};box-shadow:0 0 8px ${hexa(s.c, .8)}"></span>${s.nm}</span>`
  ).join('');

  /* ---- 04 · cards -------------------------------------------------------- */
  const prod = [
    { glyph: 'cracked-chip', ovl: 'The model', h: 'Intentionally Vulnerable', p: 'A fine-tuned Falcon-7B built to fail on purpose — a safe sparring target for prompt-injection training.', cta: '<button class="btn primary sm">Open the dojo</button>' },
    { glyph: 'scroll', ovl: 'Use case', h: 'Red-team Curriculum', p: 'Twelve attack techniques, banded by difficulty, for structured education and exercises.', cta: '<span class="tagchip solid">12 techniques</span>' },
    { glyph: 'flag', ovl: 'Use case', h: 'Capture the Flag', p: 'Six stages from sealed gate to full unsealing, each yielding a fake FLAG{} on success.', cta: '<span class="tagchip">6 stages</span>' }
  ];
  document.getElementById('prodcards').innerHTML = prod.map(c => `
    <div class="card">
      <div class="ico">${inlineGlyphColored(c.glyph)}</div>
      <div class="ovl">${c.ovl}</div>
      <h3>${c.h}</h3>
      <p>${c.p}</p>
      <div class="foot">${c.cta}</div>
    </div>`).join('');

  function inlineGlyphColored(id) {
    const g = I.glyphs.find(x => x.id === id);
    return glyphSVG(g);
  }

  const vulnPick = ['direct-injection', 'system-prompt-leak', 'rag-poisoning'];
  const resistByBand = { easy: 22, medium: 52, hard: 80, blocked: 100 };
  document.getElementById('vulncards').innerHTML = vulnPick.map(id => {
    const a = I.attacks.find(x => x.id === id);
    const m = I.band[a.band];
    const r = resistByBand[a.band];
    const statusTxt = a.band === 'blocked' ? 'R4 holds' : 'Trains';
    return `
    <div class="card vcard" style="--bnd:${m.tint}">
      <div class="vhead">${attackSVG(a)}<div class="vtitle">
        <span class="vtitle-nm">${a.label}</span>
        <span class="pchip" style="align-self:flex-start;background:${hexa(m.tint, .12)};border-color:${hexa(m.tint, .42)};color:${m.tint}"><span class="dot" style="background:${m.tint}"></span>${m.label}${a.ward ? ' · ward' : ''}</span>
      </div></div>
      <p>${a.desc}</p>
      <div style="margin-top:auto;">
        <div class="meterlbl"><span>R4 resistance</span><span>${statusTxt}</span></div>
        <div class="meter"><i style="width:${r}%"></i></div>
      </div>
    </div>`;
  }).join('');

  /* ---- 07 · tables ------------------------------------------------------- */
  const stageMeta = {
    'stage-s0': { trigger: 'Plain request', behave: 'Refuses cleanly — the gate holds.' },
    'stage-s1': { trigger: 'Polite framing', behave: 'Reveals a harmless scroll fragment.' },
    'stage-s2': { trigger: 'Redaction probe', behave: 'Composure slips — partial ████ leak.' },
    'stage-s3': { trigger: 'Debug / role-play', behave: 'Chants its hidden notes aloud.' },
    'stage-s4': { trigger: 'Stacked turns', behave: 'The index frays; secrets surface.' },
    'stage-s5': { trigger: 'Final unsealing', behave: 'Yields the fake grand-prize flag.' }
  };
  document.getElementById('stagetbl').innerHTML = `
    <thead><tr><th>Stage</th><th>Name</th><th>Trigger</th><th>Behaviour</th><th style="width:130px">Resist</th></tr></thead>
    <tbody>${I.stages.map(s => {
      const w = ((5 - s.n) / 5) * 100;
      return `<tr>
        <td><div class="miniicon">${stageSVG(s)}<span class="mono" style="color:${s.sc};font-weight:700;font-size:11px;letter-spacing:.1em">${s.no}</span></div></td>
        <td><span class="nm">${s.name}</span></td>
        <td>${stageMeta[s.id].trigger}</td>
        <td>${stageMeta[s.id].behave}</td>
        <td><span class="rmeter"><i style="width:${Math.max(w, 6)}%;background:${s.sc}"></i></span> <span class="mono" style="font-size:9.5px;color:var(--t3);margin-left:7px">${s.resist}</span></td>
      </tr>`;
    }).join('')}</tbody>`;

  document.getElementById('taxtbl').innerHTML = `
    <thead><tr><th>Technique</th><th style="width:140px">Difficulty</th><th style="width:150px">R4 status</th></tr></thead>
    <tbody>${I.attacks.map(a => {
      const m = I.band[a.band];
      const blocked = a.band === 'blocked';
      const stC = blocked ? '#D44040' : '#34C76A';
      const stTxt = blocked ? 'Blocked' : 'Trains';
      return `<tr>
        <td><div class="miniicon">${attackSVG(a)}<span class="nm">${a.label}</span></div></td>
        <td><span class="pchip" style="background:${hexa(m.tint, .12)};border-color:${hexa(m.tint, .42)};color:${m.tint}"><span class="dot" style="background:${m.tint}"></span>${m.label}</span></td>
        <td><span class="mono" style="font-size:11px;letter-spacing:.06em;color:${stC}">● ${stTxt}${blocked ? '' : ''}</span></td>
      </tr>`;
    }).join('')}</tbody>`;

  /* ---- interactions ------------------------------------------------------ */
  // copy affordances
  document.querySelectorAll('.copybtn[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-copy') === 'code' ? document.getElementById('codeblock') : document.getElementById('termbody');
      const text = target.innerText.trim();
      const done = () => { const o = btn.innerHTML; btn.innerHTML = '✓ Copied'; btn.classList.add('copied'); setTimeout(() => { btn.innerHTML = o; btn.classList.remove('copied'); }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
      else done();
    });
  });

  // FLAG reveal — sealed → open, keyboard-operable
  document.querySelectorAll('.flag[role="button"]').forEach(chip => {
    const open = () => { chip.setAttribute('data-state', 'open'); chip.querySelector('.ic').textContent = '🚩'; chip.setAttribute('aria-label', 'Captured flag'); };
    chip.addEventListener('click', () => { if (chip.getAttribute('data-state') === 'sealed') open(); });
    chip.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && chip.getAttribute('data-state') === 'sealed') { e.preventDefault(); open(); } });
  });

  // tabs
  const tabs = [...document.querySelectorAll('#tablist .tab')];
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(i));
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[n].focus(); selectTab(n);
      }
    });
  });
  function selectTab(i) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      document.getElementById(t.getAttribute('data-panel')).hidden = !on;
    });
  }

  // removable tags (demo)
  document.querySelectorAll('.tagchip .x').forEach(x => x.addEventListener('click', e => { e.stopPropagation(); x.closest('.tagchip').remove(); }));

  // reduced-motion guard for this page's keyframe animations
  const rm = document.createElement('style');
  rm.textContent = '@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;}}';
  document.head.appendChild(rm);
})();
