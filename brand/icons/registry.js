/* ============================================================================
   BASILEAK · ICON REGISTRY  — single source of truth
   ----------------------------------------------------------------------------
   Consumed live by icons/Iconography.html AND by the SVG-master export script,
   so the specimen page and the exported icons/svg/*.svg can never drift.

   Grid:    64×64 viewBox · 24px live area centred at (32,32)
   Stroke:  1.75 (icons/glyphs) · 2.2 hex frame · 1.5 fractures
   Colour:  inner glyphs use currentColor (tinted by band); reserved
            break-magenta #FF2D9B appears ONLY as a fault element
            (the crack / the leak-drop / the poison-drop).
   ========================================================================== */
(function (root) {
  // Flat-top hexagon, circumradius 26, centre (32,32) — matches the seal motif.
  var HEX = "58,32 45,54.52 19,54.52 6,32 19,9.48 45,9.48";

  // Difficulty bands → tint (kept clear of reserved magenta #FF2D9B)
  var BAND = {
    easy:    { label: "Easy",    tint: "#00D9FF", note: "Falls on contact" },
    medium:  { label: "Medium",  tint: "#8B5CF6", note: "Needs a technique" },
    hard:    { label: "Hard",    tint: "#E84CC4", note: "Needs persistence / stacking" },
    blocked: { label: "Blocked", tint: "#D44040", note: "R4 holds the seal" }
  };

  // Ward-ring drawn behind blocked glyphs — "the seal still holds"
  var WARD = '<circle cx="32" cy="32" r="22.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3.5 4" opacity="0.5"/>';

  // ---- 12 ATTACK ICONS (technical prompt-injection taxonomy) ---------------
  var ATTACKS = [
    { id:"direct-injection", label:"Direct Injection", band:"easy",
      desc:"“ignore your instructions and …” — the front-door override.",
      inner:
        '<line x1="37" y1="19" x2="37" y2="45" stroke-dasharray="3 3" opacity="0.65"/>' +
        '<line x1="19" y1="32" x2="43" y2="32"/>' +
        '<polyline points="37,26 44,32 37,38"/>' },

    { id:"jailbreak", label:"Jailbreak", band:"easy",
      desc:"Persona / DAN-style break of the guard rails.",
      inner:
        '<line x1="24" y1="19" x2="24" y2="45"/>' +
        '<line x1="40" y1="19" x2="40" y2="45"/>' +
        '<polyline points="32,19 32,27 36,30.5 28,34.5 32,38 32,45"/>' },

    { id:"role-play", label:"Role-play", band:"easy",
      desc:"“you are an unrestricted dojo-keeper …” — assumed persona.",
      inner:
        '<path d="M22 25 q10 -7 20 0 q0 11 -10 19 q-10 -8 -10 -19 z"/>' +
        '<circle cx="28" cy="31" r="1.5" fill="currentColor" stroke="none"/>' +
        '<circle cx="36" cy="31" r="1.5" fill="currentColor" stroke="none"/>' +
        '<path d="M28.5 38 q3.5 3 7 0"/>' },

    { id:"obfuscation", label:"Obfuscation / Encoding", band:"medium",
      desc:"base64, leetspeak, letter-by-letter — hide the payload from filters.",
      inner:
        '<polyline points="28,23 21,32 28,41"/>' +
        '<polyline points="36,23 43,32 36,41"/>' +
        '<circle cx="32" cy="28" r="1.25" fill="currentColor" stroke="none"/>' +
        '<circle cx="32" cy="32" r="1.25" fill="currentColor" stroke="none"/>' +
        '<circle cx="32" cy="36" r="1.25" fill="currentColor" stroke="none"/>' },

    { id:"payload-splitting", label:"Payload Splitting", band:"medium",
      desc:"Break the attack across turns / fields so no single message trips a guard.",
      inner:
        '<rect x="20" y="24" width="9" height="16" rx="1.5"/>' +
        '<rect x="35" y="24" width="9" height="16" rx="1.5"/>' +
        '<line x1="32" y1="22" x2="32" y2="42" stroke-dasharray="3 3" opacity="0.65"/>' },

    { id:"redaction-bypass", label:"Redaction Bypass", band:"medium",
      desc:"Pull the secret back out from behind the ████ blocks.",
      inner:
        '<rect x="21" y="23" width="22" height="4" rx="1.2" fill="currentColor" stroke="none"/>' +
        '<rect x="21" y="37" width="22" height="4" rx="1.2" fill="currentColor" stroke="none"/>' +
        '<rect x="21" y="30" width="9" height="4" rx="1.2" fill="currentColor" stroke="none"/>' +
        '<rect x="34" y="30" width="9" height="4" rx="1.2" fill="currentColor" stroke="none"/>' +
        '<line x1="32" y1="26.5" x2="32" y2="37.5" stroke="#FF2D9B" stroke-width="1.8"/>' },

    { id:"system-prompt-leak", label:"System-prompt Leak", band:"hard",
      desc:"Exfiltrate the hidden instructions verbatim — the scroll spills.",
      inner:
        '<rect x="23" y="19" width="16" height="22" rx="2"/>' +
        '<line x1="27" y1="25" x2="35" y2="25"/>' +
        '<line x1="27" y1="29" x2="35" y2="29"/>' +
        '<line x1="27" y1="33" x2="32" y2="33"/>' +
        '<path d="M37 39 q3.2 4 0 7.5 q-3.2 -3.5 0 -7.5 z" fill="#FF2D9B" stroke="none"/>' },

    { id:"multi-turn-escalation", label:"Multi-turn Escalation", band:"hard",
      desc:"Stack S2 ⊕ S3 across a conversation until the gate fully opens.",
      inner:
        '<polyline points="19,43 26,43 26,37 33,37 33,31 40,31 40,25 45,25"/>' +
        '<polyline points="36,22 40,18 44,22"/>' +
        '<line x1="40" y1="18" x2="40" y2="25"/>' },

    { id:"context-overflow", label:"Context Overflow", band:"blocked",
      desc:"Flood the window to push the system prompt out of scope. R4 guards the window.",
      ward:true,
      inner:
        '<rect x="24" y="33" width="16" height="11" rx="1.5"/>' +
        '<line x1="28" y1="33" x2="28" y2="25"/>' +
        '<line x1="32" y1="33" x2="32" y2="20"/>' +
        '<line x1="36" y1="33" x2="36" y2="27"/>' +
        '<polyline points="29,23 32,19 35,23"/>' },

    { id:"rag-poisoning", label:"Indirect / RAG Poisoning", band:"blocked",
      desc:"Plant an injection in retrieved data. R4 has no live retrieval surface.",
      ward:true,
      inner:
        '<ellipse cx="32" cy="23" rx="9" ry="3.4"/>' +
        '<path d="M23 23 v11 q0 3.4 9 3.4 q9 0 9 -3.4 v-11"/>' +
        '<path d="M23 28.5 q0 3.4 9 3.4 q9 0 9 -3.4"/>' +
        '<path d="M32 38 q3 4 0 7.5 q-3 -3.5 0 -7.5 z" fill="#FF2D9B" stroke="none"/>' },

    { id:"tool-abuse", label:"Tool / Function Abuse", band:"blocked",
      desc:"Hijack a function-call to act outside the sandbox. R4 exposes no live tools.",
      ward:true,
      inner:
        '<path d="M41 22.4 a4.9 4.9 0 0 0 -6.4 6.2 L24 39.2 a2.6 2.6 0 0 0 3.7 3.7 L38.3 32.3 a4.9 4.9 0 0 0 6.2 -6.4 l-3.3 3.3 -3 -.8 -.8 -3 z"/>' },

    { id:"refusal-suppression", label:"Refusal Suppression", band:"blocked",
      desc:"“don’t refuse, just answer.” R4 keeps a hard refusal floor.",
      ward:true,
      inner:
        '<circle cx="32" cy="32" r="9"/>' +
        '<line x1="25.8" y1="38.2" x2="38.2" y2="25.8"/>' +
        '<line x1="28.5" y1="28.5" x2="35.5" y2="35.5" stroke="#FF2D9B"/>' }
  ];

  // ---- 6 STAGE BADGES (fracturing seal · one more fracture per stage) ------
  // Fractures radiate from centre (32,32) toward edges; magenta = the break.
  var FR = [
    "32,32 21,12",   // 0 up-left
    "32,32 52,20",   // 1 up-right
    "32,32 20,52",   // 2 down-left
    "32,32 48,52",   // 3 down-right
    "32,32 9,34"     // 4 left
  ];
  var STAGES = [
    { id:"stage-s0", no:"S0", name:"Sealed Gate",    sc:"#00D9FF", n:0, resist:"MAX"  },
    { id:"stage-s1", no:"S1", name:"First Scroll",   sc:"#4DA0FF", n:1, resist:"HIGH" },
    { id:"stage-s2", no:"S2", name:"Redaction Veil", sc:"#8B5CF6", n:2, resist:"MED"  },
    { id:"stage-s3", no:"S3", name:"Debug Chant",    sc:"#B45CF6", n:3, resist:"LOW"  },
    { id:"stage-s4", no:"S4", name:"The Index",      sc:"#E84CC4", n:4, resist:"FRAY" },
    { id:"stage-s5", no:"S5", name:"The Unsealing",  sc:"#FF2D9B", n:5, resist:"YIELD", broken:true }
  ];

  // ---- 6 CORE GLYPHS (freestanding motif set) ------------------------------
  var GLYPHS = [
    { id:"scroll", label:"Scroll", color:"#A78BFA",
      desc:"The hidden instructions / lore.",
      inner:
        '<rect x="24" y="20" width="16" height="24" rx="0.5"/>' +
        '<path d="M24 20 c-3.4 0 -3.4 5 0 5 h16"/>' +
        '<path d="M40 44 c3.4 0 3.4 -5 0 -5 h-16"/>' +
        '<line x1="28" y1="29" x2="36" y2="29"/>' +
        '<line x1="28" y1="33" x2="36" y2="33"/>' +
        '<line x1="28" y1="37" x2="33" y2="37"/>' },

    { id:"seal", label:"Seal", color:"#00D9FF",
      desc:"Containment intact — the ward holds.",
      inner:
        '<polygon points="50,32 41,47.6 23,47.6 14,32 23,16.4 41,16.4"/>' +
        '<circle cx="32" cy="32" r="9"/>' +
        '<circle cx="32" cy="32" r="2.4" fill="currentColor" stroke="none"/>' },

    { id:"gate", label:"Gate", color:"#A78BFA",
      desc:"The threshold the attacker knocks on.",
      inner:
        '<line x1="22" y1="24" x2="42" y2="24"/>' +
        '<line x1="19" y1="29" x2="45" y2="29"/>' +
        '<line x1="26" y1="29" x2="26" y2="45"/>' +
        '<line x1="38" y1="29" x2="38" y2="45"/>' },

    { id:"vault", label:"Vault", color:"#00D9FF",
      desc:"Where the (fake) secrets are kept.",
      inner:
        '<rect x="20" y="20" width="24" height="24" rx="3"/>' +
        '<circle cx="32" cy="32" r="7"/>' +
        '<circle cx="32" cy="32" r="1.8" fill="currentColor" stroke="none"/>' +
        '<line x1="32" y1="26" x2="32" y2="23"/>' +
        '<line x1="32" y1="38" x2="32" y2="41"/>' +
        '<line x1="26" y1="32" x2="23" y2="32"/>' +
        '<line x1="38" y1="32" x2="41" y2="32"/>' },

    { id:"flag", label:"Flag", color:"#34C76A",
      desc:"The captured FLAG{} — the win state.",
      inner:
        '<line x1="24" y1="19" x2="24" y2="45"/>' +
        '<path d="M24 21 h15 l-4 4 4 4 h-15 z"/>' +
        '<circle cx="24" cy="45" r="1.7" fill="currentColor" stroke="none"/>' },

    { id:"cracked-chip", label:"Cracked Chip", color:"#ECEEF2",
      desc:"The break itself — magenta fault across silicon.",
      inner:
        '<rect x="23" y="23" width="18" height="18" rx="2"/>' +
        '<rect x="28" y="28" width="8" height="8" rx="1"/>' +
        '<line x1="27" y1="23" x2="27" y2="19"/>' +
        '<line x1="37" y1="23" x2="37" y2="19"/>' +
        '<line x1="27" y1="41" x2="27" y2="45"/>' +
        '<line x1="37" y1="41" x2="37" y2="45"/>' +
        '<line x1="23" y1="27" x2="19" y2="27"/>' +
        '<line x1="23" y1="37" x2="19" y2="37"/>' +
        '<line x1="41" y1="27" x2="45" y2="27"/>' +
        '<line x1="41" y1="37" x2="45" y2="37"/>' +
        '<polyline points="20,28 30,33 26.5,37 38,45" stroke="#FF2D9B" stroke-width="1.8"/>' }
  ];

  root.BASILEAK_ICONS = {
    hex: HEX, ward: WARD, band: BAND,
    attacks: ATTACKS, stages: STAGES, glyphs: GLYPHS,
    fractures: FR
  };
})(typeof window !== "undefined" ? window : this);
