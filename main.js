// ── SCROLL PROGRESS BAR ──────────────────────────────────
window.addEventListener('scroll', () => {
  const el = document.getElementById('scrollBar');
  if (!el) return;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  el.style.width = (window.scrollY / total * 100) + '%';
  const bt = document.getElementById('backTop');
  if (bt) bt.classList.toggle('visible', window.scrollY > 300);
});

// ── NAVBAR TOGGLE ────────────────────────────────────────
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ── AUDIO ────────────────────────────────────────────────
let audioPlaying = false;
function toggleAudio() {
  const audio = document.getElementById('bgAudio');
  const icon  = document.getElementById('audioIcon');
  if (!audio) return;
  if (audioPlaying) { audio.pause(); icon.textContent = '🔇'; audioPlaying = false; }
  else { audio.play().catch(() => {}); icon.textContent = '🔊'; audioPlaying = true; }
}

// ── PDF GENERATION ───────────────────────────────────────
function generatePDF() {
  const name  = document.querySelector('.cv-name')?.textContent?.trim() || 'CV';
  const role  = document.querySelector('.cv-role')?.textContent?.trim() || '';
  const num   = document.querySelector('.cv-number')?.textContent?.trim() || '';
  const col   = getComputedStyle(document.documentElement).getPropertyValue('--member-color').trim() || '#c8ff00';

  const contacts = [...document.querySelectorAll('.cv-contact-item')]
                    .map(el => el.textContent.trim()).join(' &nbsp;&nbsp;·&nbsp;&nbsp; ');

  // ── Foto → base64 ──
  let photoHTML = '';
  const photoImg = document.querySelector('.cv-hero img');
  const initials = name.split(' ').map(w=>w[0]).filter(Boolean).slice(0,2).join('');

  if (photoImg && photoImg.complete && photoImg.naturalWidth > 0) {
    try {
      const c = document.createElement('canvas');
      c.width = photoImg.naturalWidth; c.height = photoImg.naturalHeight;
      c.getContext('2d').drawImage(photoImg, 0, 0);
      photoHTML = `<img src="${c.toDataURL('image/jpeg',.92)}" class="photo"/>`;
    } catch(e) {
      photoHTML = `<div class="photo initials" style="color:${col}">${initials}</div>`;
    }
  } else {
    photoHTML = `<div class="photo initials" style="color:${col}">${initials}</div>`;
  }

  // ── Bloques ──
  let blocksHTML = '';
  document.querySelectorAll('.cv-body .cv-block').forEach(block => {
    const isFull  = block.classList.contains('full');
    const titleEl = block.querySelector('.cv-block-title');
    const titleHTML = titleEl ? titleEl.innerHTML : '';
    const clone = block.cloneNode(true);
    clone.querySelector('.cv-block-title')?.remove();
    blocksHTML += `<div class="blk${isFull?' full':''}">
      <div class="blk-title">${titleHTML}</div>
      <div class="blk-body">${clone.innerHTML}</div>
    </div>`;
  });

  // ── Colores de acento dinámicos en el contenido ──
  // skill-tag y otros usan var() — los forzamos inline via regex tras generar
  const win = window.open('', '_blank');
  if (!win) { alert('Permite ventanas emergentes para generar el PDF.'); return; }

  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>${name} — CV</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
/* ════════════════════════════════════════
   VARIABLES & RESET
════════════════════════════════════════ */
:root {
  --col:  ${col};
  --bg:   #080810;
  --bg2:  #0f0f1c;
  --surf: #13131f;
  --card: #17172a;
  --bdr:  rgba(255,255,255,.07);
  --txt:  #dcdcec;
  --mut:  #9090b0;
  --dim:  #7070a0;
}
*,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
html,body { width:210mm; min-height:297mm; }
body {
  font-family:'DM Sans',sans-serif;
  background: var(--bg);
  color: var(--txt);
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/* ── BARRA DE ACCIONES (solo pantalla) ── */
.topbar {
  position:fixed; top:0; left:0; right:0; z-index:999;
  background:#0d0d1a;
  border-bottom:1px solid rgba(255,255,255,.08);
  padding:10px 28px;
  display:flex; align-items:center; gap:12px;
}
.btn-print {
  background:var(--col); color:#080810;
  font-weight:800; font-size:.85rem;
  padding:10px 24px; border-radius:8px; border:none; cursor:pointer;
  letter-spacing:.5px; transition:opacity .2s;
}
.btn-print:hover { opacity:.85; }
.btn-close {
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.12);
  color:var(--txt); font-size:.82rem;
  padding:9px 18px; border-radius:8px; cursor:pointer;
}
.tip { font-size:.72rem; color:var(--dim); margin-left:6px; }

/* ── CUERPO DEL CV ── */
.cv-wrap { margin-top:54px; }

/* HERO */
.hero {
  background: linear-gradient(135deg, #0f0f20 0%, #131325 100%);
  border-bottom:3px solid var(--col);
  padding:36px 44px;
  display:flex; align-items:center; gap:32px;
  position:relative; overflow:hidden;
}
.hero::before {
  content:'';
  position:absolute; inset:0;
  background: radial-gradient(ellipse 60% 90% at 0% 50%, color-mix(in srgb,var(--col) 12%,transparent), transparent 70%);
}
.hero > * { position:relative; z-index:1; }

.photo {
  width:120px; height:120px; border-radius:50%;
  object-fit:cover; flex-shrink:0;
  border:3px solid var(--col);
  box-shadow: 0 0 0 6px color-mix(in srgb,var(--col) 15%,transparent),
              0 0 40px color-mix(in srgb,var(--col) 25%,transparent);
  background:var(--surf);
}
.initials {
  display:flex; align-items:center; justify-content:center;
  font-family:'Bebas Neue',sans-serif; font-size:3rem;
}

.hero-text { flex:1; }
.h-num {
  font-size:.65rem; letter-spacing:4px; color:var(--col);
  text-transform:uppercase; margin-bottom:6px; font-weight:600;
}
.h-name {
  font-family:'Bebas Neue',sans-serif;
  font-size:2.8rem; color:#fff; line-height:1; margin-bottom:6px;
}
.h-role { font-size:.92rem; color:var(--mut); font-style:italic; margin-bottom:14px; }
.h-contacts { font-size:.73rem; color:var(--dim); line-height:2; }
.h-contacts span { color:var(--col); margin-right:4px; }

/* GRID */
.grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:16px;
  padding:28px 44px 36px;
  background:var(--bg);
}

/* BLOQUE */
.blk {
  background:var(--card);
  border:1px solid var(--bdr);
  border-radius:12px;
  padding:20px 18px;
  break-inside:avoid;
}
.blk.full { grid-column:1/-1; }
.blk-title {
  font-size:.68rem; letter-spacing:2.5px; color:var(--col);
  text-transform:uppercase; font-weight:700;
  margin-bottom:14px;
  display:flex; align-items:center; gap:7px;
}
.blk-title i,
.blk-title svg { opacity:.9; }
.blk-body { font-size:.79rem; color:var(--mut); line-height:1.65; }

/* Timeline */
.timeline { display:flex; flex-direction:column; gap:12px; }
.tl-item  { display:flex; gap:12px; }
.tl-dot   {
  width:9px; height:9px; border-radius:50%;
  background:var(--col); flex-shrink:0; margin-top:4px;
  box-shadow:0 0 6px var(--col);
}
.tl-year  { font-size:.65rem; color:var(--dim); margin-bottom:1px; }
.tl-title { font-size:.82rem; color:var(--txt); font-weight:600; }
.tl-sub   { font-size:.71rem; color:var(--dim); }

/* About */
.about-text { font-size:.81rem; color:var(--mut); line-height:1.8; }

/* Habilidades */
.skills-list { display:flex; flex-wrap:wrap; gap:7px; }
.skill-tag {
  font-size:.67rem; padding:4px 11px; border-radius:20px; font-weight:600;
  background:rgba(200,255,0,.08);
  border:1px solid rgba(200,255,0,.25);
  color:#c8ff00;
}

/* Idiomas */
.lang-list { display:flex; flex-wrap:wrap; gap:7px; }
.lang-tag {
  font-size:.71rem; padding:4px 11px; border-radius:20px;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);
  color:var(--txt);
}

/* Referencias */
.ref-item {
  display:flex; gap:10px; align-items:flex-start;
  padding:11px 0; border-bottom:1px solid var(--bdr);
}
.ref-item:last-child { border-bottom:none; padding-bottom:0; }
.ref-badge {
  font-size:.6rem; font-weight:700; letter-spacing:1px;
  padding:3px 8px; border-radius:4px; text-transform:uppercase; flex-shrink:0; margin-top:2px;
}
.ref-badge.pro { background:rgba(200,255,0,.1); color:#c8ff00; border:1px solid rgba(200,255,0,.25); }
.ref-badge.fam { background:rgba(180,100,255,.1); color:#c084fc; border:1px solid rgba(180,100,255,.25); }
.ref-name  { font-size:.82rem; color:var(--txt); font-weight:600; }
.ref-role, .ref-phone { font-size:.71rem; color:var(--dim); }

/* Párrafo suelto (descripción de exp) */
p { font-size:.78rem; color:var(--mut); line-height:1.7; margin-top:8px; }

/* ── PRINT ── */
@media print {
  .topbar  { display:none !important; }
  .cv-wrap { margin-top:0 !important; }
  @page    { size:A4 portrait; margin:0; }
  body     { background:var(--bg) !important; width:210mm; }
  .hero    { background:linear-gradient(135deg,#0f0f20,#131325) !important; }
  .grid    { background:var(--bg) !important; }
}
</style>
</head>
<body>

<!-- BARRA ACCIONES -->
<div class="topbar">
  <button class="btn-print" onclick="window.print()">&nbsp; Imprimir / Guardar como PDF</button>
  <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
  
</div>

<!-- CV -->
<div class="cv-wrap">

  <!-- HERO -->
  <div class="hero">
    ${photoHTML}
    <div class="hero-text">
      <div class="h-num">${num}</div>
      <div class="h-name">${name}</div>
      <div class="h-role">${role}</div>
      <div class="h-contacts">${contacts}</div>
    </div>
  </div>

  <!-- BLOQUES -->
  <div class="grid">${blocksHTML}</div>

</div><!-- /cv-wrap -->

</body>
</html>`);
  win.document.close();
}

// ── FADE-IN ON SCROLL ────────────────────────────────────
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.cv-block').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    obs.observe(el);
  });
  document.querySelectorAll('.jad-item').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = `opacity .4s ${i*0.07}s ease, transform .4s ${i*0.07}s ease`;
    obs.observe(el);
  });
});