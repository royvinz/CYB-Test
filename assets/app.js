/* =================================================================
 * CYB-Test — Application logic
 * ================================================================= */

const STORAGE_KEY = 'cyb-test:state:v1';

const state = {
  answers: {},      // { controlId: { status: 'compliant'|'partial'|'missing'|'na', note: '' } }
  active: null      // section id active dans la sidebar
};

/* ---------------------------------------------------------- */
/* Persistence                                                */
/* ---------------------------------------------------------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && data.answers) state.answers = data.answers;
  } catch (e) { /* noop */ }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: state.answers }));
  } catch (e) { /* noop */ }
}

/* ---------------------------------------------------------- */
/* Helpers                                                    */
/* ---------------------------------------------------------- */
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class')      node.className = v;
    else if (k === 'html')  node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function getStandardId(refStr) {
  // "OWASP-ASI: ASI01" -> "OWASP-ASI"
  return refStr.split(':')[0].trim();
}

/* ---------------------------------------------------------- */
/* Scoring                                                    */
/* ---------------------------------------------------------- */
function getStatusScore(statusId) {
  const s = STATUS_OPTIONS.find(x => x.id === statusId);
  return s ? s.score : null;
}

function computeSectionScore(section) {
  let totalWeight = 0;
  let scoredWeight = 0;
  let counts = { compliant: 0, partial: 0, missing: 0, na: 0, untouched: 0 };
  let critOpen = 0;

  for (const c of section.controls) {
    const ans = state.answers[c.id];
    const w = SEVERITY_WEIGHT[c.severity] ?? 1;

    if (!ans || !ans.status) {
      counts.untouched++;
      continue;
    }

    if (ans.status === 'na') {
      counts.na++;
      continue;
    }

    counts[ans.status]++;
    const s = getStatusScore(ans.status);
    if (s !== null) {
      totalWeight  += w;
      scoredWeight += w * s;
    }
    if (c.severity === 'critical' && ans.status !== 'compliant') critOpen++;
  }

  const pct = totalWeight === 0 ? null : Math.round((scoredWeight / totalWeight) * 100);
  return { pct, counts, totalWeight, scoredWeight, critOpen, total: section.controls.length };
}

function computeGlobalScore() {
  let totalWeight = 0;
  let scoredWeight = 0;
  let counts = { compliant: 0, partial: 0, missing: 0, na: 0, untouched: 0 };
  let critOpen = 0;
  let totalControls = 0;

  for (const section of QUESTIONNAIRE.sections) {
    for (const c of section.controls) {
      totalControls++;
      const ans = state.answers[c.id];
      const w = SEVERITY_WEIGHT[c.severity] ?? 1;

      if (!ans || !ans.status) { counts.untouched++; continue; }
      if (ans.status === 'na') { counts.na++; continue; }

      counts[ans.status]++;
      const s = getStatusScore(ans.status);
      if (s !== null) {
        totalWeight  += w;
        scoredWeight += w * s;
      }
      if (c.severity === 'critical' && ans.status !== 'compliant') critOpen++;
    }
  }

  const pct = totalWeight === 0 ? 0 : Math.round((scoredWeight / totalWeight) * 100);
  const answered = counts.compliant + counts.partial + counts.missing + counts.na;
  return { pct, counts, critOpen, total: totalControls, answered };
}

function postureLabel(pct, critOpen, answered) {
  if (!answered)    return { lbl: 'Non évalué',  cls: '' };
  if (critOpen > 0) return { lbl: 'À renforcer', cls: 'bad' };
  if (pct >= 90)    return { lbl: 'Robuste',     cls: '' };
  if (pct >= 70)    return { lbl: 'Acceptable',  cls: '' };
  if (pct >= 40)    return { lbl: 'Fragile',     cls: 'warn' };
  return                   { lbl: 'Critique',    cls: 'bad' };
}

/* ---------------------------------------------------------- */
/* Rendering                                                  */
/* ---------------------------------------------------------- */
function renderSidebar() {
  const root = $('#sidebar-list');
  root.innerHTML = '';

  for (const section of QUESTIONNAIRE.sections) {
    const score = computeSectionScore(section);
    const pct = score.pct === null ? 0 : score.pct;
    const answered = score.counts.compliant + score.counts.partial + score.counts.missing + score.counts.na;

    let barColor = 'var(--accent)';
    if (score.critOpen > 0) barColor = 'var(--bad)';
    else if (pct < 70 && answered > 0) barColor = 'var(--warn)';

    const item = el('div', {
      class: 'nav-item',
      'data-section': section.id,
      onclick: () => {
        document.getElementById('sec-' + section.id)
          .scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
      el('div', { class: 'nav-num' }, section.number),
      el('div', { class: 'nav-body' },
        el('div', { class: 'nav-title' }, section.title),
        el('div', { class: 'nav-bar' },
          el('span', { style: `width:${pct}%; background:${barColor};` })
        ),
        el('div', { class: 'nav-meta' },
          el('span', {}, `${answered}/${section.controls.length}`),
          el('span', { class: 'pct' }, score.pct === null ? '—' : `${score.pct}%`)
        )
      )
    );
    root.appendChild(item);
  }
}

function renderHero() {
  const g = computeGlobalScore();
  const ring = $('#score-ring-fill');
  const pct = $('#score-pct');
  const posture = $('#posture');

  // ring : circumférence = 2 * π * r ; r = 72
  const r = 72;
  const circ = 2 * Math.PI * r;
  ring.setAttribute('stroke-dasharray', `${(g.pct / 100) * circ} ${circ}`);
  ring.setAttribute('stroke',
    !g.answered    ? 'var(--faint)' :
    g.critOpen > 0 ? 'var(--bad)' :
    g.pct >= 70    ? 'var(--accent)' :
    g.pct >= 40    ? 'var(--warn)' : 'var(--bad)'
  );

  pct.textContent = g.pct;
  const post = postureLabel(g.pct, g.critOpen, g.answered);
  posture.className = 'posture ' + post.cls;
  $('#posture-label').textContent = post.lbl;

  $('#stat-answered').textContent = g.answered;
  $('#stat-answered-sub').textContent = `sur ${g.total} contrôles`;
  $('#stat-compliant').textContent = g.counts.compliant;
  $('#stat-partial').textContent   = g.counts.partial;
  $('#stat-missing').textContent   = g.counts.missing;
  $('#stat-crit').textContent      = g.critOpen;
  $('#stat-crit-sub').textContent  = g.critOpen === 0 ? 'aucun en attente' : 'ouvert(s)';
}

function renderSections() {
  const root = $('#content');
  root.innerHTML = '';

  for (const section of QUESTIONNAIRE.sections) {
    const score = computeSectionScore(section);
    const sec = el('section', {
      class: 'section',
      id: 'sec-' + section.id,
      'data-section': section.id
    },
      el('div', { class: 'section-header' },
        el('div', {},
          el('div', { class: 'section-num' }, `§${section.number}`),
          el('h2', { class: 'section-title' }, section.title),
          el('p', { class: 'section-lead' }, section.lead)
        ),
        el('div', { class: 'section-progress' },
          'Progression',
          el('span', { class: 'big', id: `sec-pct-${section.id}` },
            score.pct === null ? '—' : `${score.pct}%`
          )
        )
      ),
      el('div', { class: 'controls', id: `controls-${section.id}` },
        ...section.controls.map(c => renderControl(c, section.id))
      )
    );
    root.appendChild(sec);
  }
}

function renderControl(c, sectionId) {
  const ans = state.answers[c.id] || {};
  const wrap = el('div', { class: 'control', 'data-sev': c.severity, 'data-id': c.id });

  // Severity column
  wrap.appendChild(
    el('div', { class: 'sev' },
      el('span', { class: 'sev-pip' }),
      el('span', { class: 'sev-tag' }, SEVERITY_LABEL[c.severity] || c.severity)
    )
  );

  // Body
  wrap.appendChild(
    el('div', { class: 'body' },
      el('span', { class: 'id' }, c.id.toUpperCase()),
      el('div', { class: 'text' }, c.text),
      el('div', { class: 'refs' },
        ...c.refs.map(r => {
          const std = getStandardId(r);
          return el('span', { class: `ref std-${std}` }, r);
        })
      ),
      el('button', {
        class: 'note-trigger',
        type: 'button',
        'data-has-note': !!(ans.note && ans.note.trim()),
        onclick: (ev) => toggleNote(ev, c.id)
      }, ans.note && ans.note.trim() ? 'Note ajoutée — voir / éditer' : '＋ Ajouter une note')
    )
  );

  // Actions
  const actions = el('div', { class: 'actions' });
  const group = el('div', { class: 'status-group' });
  for (const opt of STATUS_OPTIONS) {
    const btn = el('button', {
      class: 'status-btn',
      type: 'button',
      'data-status': opt.id,
      'data-active': ans.status === opt.id,
      onclick: () => setStatus(c.id, opt.id, sectionId)
    }, opt.label);
    group.appendChild(btn);
  }
  actions.appendChild(group);
  wrap.appendChild(actions);

  // Note area (hidden by default)
  const noteArea = el('div', { class: 'note-area' + (ans.note ? '' : ''), 'data-note-for': c.id },
    el('textarea', {
      placeholder: 'Notes, preuves, jira tickets, owner…',
      onchange: (ev) => setNote(c.id, ev.target.value)
    }, ans.note || '')
  );
  wrap.appendChild(noteArea);

  return wrap;
}

/* ---------------------------------------------------------- */
/* Interactions                                               */
/* ---------------------------------------------------------- */
function setStatus(controlId, statusId, sectionId) {
  if (!state.answers[controlId]) state.answers[controlId] = {};
  // toggle off si re-clic
  if (state.answers[controlId].status === statusId) {
    delete state.answers[controlId].status;
  } else {
    state.answers[controlId].status = statusId;
  }
  saveState();
  refreshControl(controlId);
  refreshSection(sectionId);
  renderHero();
  renderSidebarOnly();
}

function setNote(controlId, value) {
  if (!state.answers[controlId]) state.answers[controlId] = {};
  state.answers[controlId].note = value;
  saveState();
  // mettre à jour le bouton note-trigger
  const ctrl = $(`.control[data-id="${controlId}"]`);
  if (ctrl) {
    const trigger = ctrl.querySelector('.note-trigger');
    const has = !!(value && value.trim());
    trigger.setAttribute('data-has-note', has);
    trigger.textContent = has ? 'Note ajoutée — voir / éditer' : '＋ Ajouter une note';
  }
}

function toggleNote(ev, controlId) {
  const ctrl = $(`.control[data-id="${controlId}"]`);
  if (!ctrl) return;
  const note = ctrl.parentNode.querySelector(`.note-area[data-note-for="${controlId}"]`);
  if (note) {
    note.classList.toggle('open');
    if (note.classList.contains('open')) {
      const ta = note.querySelector('textarea');
      if (ta) setTimeout(() => ta.focus(), 50);
    }
  }
}

function refreshControl(controlId) {
  const ctrl = $(`.control[data-id="${controlId}"]`);
  if (!ctrl) return;
  const ans = state.answers[controlId] || {};
  ctrl.querySelectorAll('.status-btn').forEach(btn => {
    btn.setAttribute('data-active', btn.dataset.status === ans.status);
  });
}

function refreshSection(sectionId) {
  const section = QUESTIONNAIRE.sections.find(s => s.id === sectionId);
  if (!section) return;
  const score = computeSectionScore(section);
  const pctEl = $(`#sec-pct-${sectionId}`);
  if (pctEl) pctEl.textContent = score.pct === null ? '—' : `${score.pct}%`;
}

function renderSidebarOnly() {
  // recalculer juste les barres de progression
  for (const section of QUESTIONNAIRE.sections) {
    const score = computeSectionScore(section);
    const item = $(`.nav-item[data-section="${section.id}"]`);
    if (!item) continue;
    const bar  = item.querySelector('.nav-bar > span');
    const pct  = item.querySelector('.nav-meta .pct');
    const cnt  = item.querySelector('.nav-meta span:first-child');
    const answered = score.counts.compliant + score.counts.partial + score.counts.missing + score.counts.na;
    const p = score.pct === null ? 0 : score.pct;
    let color = 'var(--accent)';
    if (score.critOpen > 0) color = 'var(--bad)';
    else if (p < 70 && answered > 0) color = 'var(--warn)';
    bar.style.width = p + '%';
    bar.style.background = color;
    pct.textContent = score.pct === null ? '—' : `${score.pct}%`;
    cnt.textContent = `${answered}/${section.controls.length}`;
  }
}

/* ---------------------------------------------------------- */
/* Active section tracking (scrollspy)                        */
/* ---------------------------------------------------------- */
function initScrollspy() {
  if (typeof IntersectionObserver === 'undefined') return; // fallback : pas de scrollspy
  const sections = $$('.section');
  const observer = new IntersectionObserver((entries) => {
    let topMost = null;
    for (const e of entries) {
      if (e.isIntersecting) {
        if (!topMost || e.boundingClientRect.top < topMost.boundingClientRect.top) {
          topMost = e;
        }
      }
    }
    if (topMost) {
      const id = topMost.target.dataset.section;
      $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === id));
    }
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}

/* ---------------------------------------------------------- */
/* Toolbar actions                                            */
/* ---------------------------------------------------------- */
function showToast(msg, type = 'ok') {
  let t = $('#toast');
  if (!t) {
    t = el('div', { class: 'toast', id: 'toast' });
    document.body.appendChild(t);
  }
  t.className = 'toast ' + (type === 'bad' ? 'bad' : '');
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => t.classList.remove('show'), 2400);
}

function exportJSON() {
  const g = computeGlobalScore();
  const sections = QUESTIONNAIRE.sections.map(s => {
    const score = computeSectionScore(s);
    return {
      id: s.id,
      number: s.number,
      title: s.title,
      score_pct: score.pct,
      critical_open: score.critOpen,
      counts: score.counts,
      controls: s.controls.map(c => ({
        id: c.id,
        severity: c.severity,
        text: c.text,
        refs: c.refs,
        status: state.answers[c.id]?.status || null,
        note:   state.answers[c.id]?.note   || null
      }))
    };
  });

  const payload = {
    meta: {
      ...QUESTIONNAIRE.meta,
      generated_at: new Date().toISOString()
    },
    summary: {
      score_pct: g.pct,
      critical_open: g.critOpen,
      counts: g.counts,
      answered: g.answered,
      total: g.total
    },
    sections
  };

  download(`cyb-test_${stamp()}.json`, JSON.stringify(payload, null, 2), 'application/json');
  showToast('Rapport JSON exporté');
}

function exportMarkdown() {
  const g = computeGlobalScore();
  const lines = [];
  const post = postureLabel(g.pct, g.critOpen, g.answered);

  lines.push(`# Audit de sécurisation d'un Agent IA`);
  lines.push('');
  lines.push(`> Généré le **${new Date().toLocaleString('fr-FR')}** — CYB-Test v${QUESTIONNAIRE.meta.version}`);
  lines.push('');
  lines.push(`## Résumé exécutif`);
  lines.push('');
  lines.push(`| Indicateur | Valeur |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Score global pondéré | **${g.pct}%** |`);
  lines.push(`| Posture | **${post.lbl}** |`);
  lines.push(`| Contrôles répondus | ${g.answered} / ${g.total} |`);
  lines.push(`| Conformes | ${g.counts.compliant} |`);
  lines.push(`| Partiels | ${g.counts.partial} |`);
  lines.push(`| Manquants | ${g.counts.missing} |`);
  lines.push(`| Non applicables | ${g.counts.na} |`);
  lines.push(`| **Critiques ouverts** | **${g.critOpen}** |`);
  lines.push('');

  for (const section of QUESTIONNAIRE.sections) {
    const score = computeSectionScore(section);
    lines.push(`## §${section.number} — ${section.title}`);
    lines.push('');
    lines.push(`*${section.lead}*`);
    lines.push('');
    lines.push(`Score : **${score.pct === null ? '—' : score.pct + '%'}** · Critiques ouverts : **${score.critOpen}**`);
    lines.push('');

    for (const c of section.controls) {
      const ans = state.answers[c.id] || {};
      const status = ans.status ? STATUS_OPTIONS.find(s => s.id === ans.status)?.label : '— non évalué';
      const sev = SEVERITY_LABEL[c.severity];
      const mark =
        ans.status === 'compliant' ? '✓' :
        ans.status === 'partial'   ? '◐' :
        ans.status === 'missing'   ? '✗' :
        ans.status === 'na'        ? '∅' : '·';
      lines.push(`- **[${mark}] ${c.id.toUpperCase()}** — *${sev}* — ${c.text}`);
      lines.push(`  - Statut : ${status}`);
      lines.push(`  - Références : ${c.refs.join(' · ')}`);
      if (ans.note && ans.note.trim()) {
        lines.push(`  - Note : ${ans.note.replace(/\n/g, ' ')}`);
      }
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push(`Référentiels mobilisés : ${QUESTIONNAIRE.meta.standards.map(s => s.label).join(' · ')}.`);

  download(`cyb-test_${stamp()}.md`, lines.join('\n'), 'text/markdown');
  showToast('Rapport Markdown exporté');
}

function importJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.sections) throw new Error('format inattendu');
        const newAnswers = {};
        for (const s of data.sections) {
          for (const c of s.controls || []) {
            if (c.status || c.note) {
              newAnswers[c.id] = {};
              if (c.status) newAnswers[c.id].status = c.status;
              if (c.note)   newAnswers[c.id].note   = c.note;
            }
          }
        }
        state.answers = newAnswers;
        saveState();
        renderSections();
        renderSidebar();
        renderHero();
        showToast('Rapport importé');
      } catch (e) {
        showToast('Échec import : ' + e.message, 'bad');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function resetAll() {
  if (!confirm('Réinitialiser toutes les réponses ? Cette action est irréversible.')) return;
  state.answers = {};
  saveState();
  renderSections();
  renderSidebar();
  renderHero();
  showToast('Audit réinitialisé');
}

function download(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 100);
}

function stamp() {
  const d = new Date();
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${z(d.getMonth()+1)}${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}`;
}

/* ---------------------------------------------------------- */
/* Init                                                       */
/* ---------------------------------------------------------- */
function init() {
  loadState();
  renderSections();
  renderSidebar();
  renderHero();
  initScrollspy();

  $('#btn-export-json').addEventListener('click', exportJSON);
  $('#btn-export-md').addEventListener('click', exportMarkdown);
  $('#btn-import').addEventListener('click', importJSON);
  $('#btn-reset').addEventListener('click', resetAll);
  $('#btn-print').addEventListener('click', () => window.print());
}

document.addEventListener('DOMContentLoaded', init);
