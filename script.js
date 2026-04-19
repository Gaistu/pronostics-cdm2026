/* ═══════════════════════════════════════════════════════════════
   ⚙️  MOT DE PASSE ADMIN
   ═══════════════════════════════════════════════════════════════ */
const ADMIN_PASSWORD = "admin2026";

/* ═══════════════════════════════════════════════════════════════
   ⚽  CONFIGURATION FIREBASE
   ─────────────────────────────────────────────────────────────
   Remplace les valeurs VOTRE_… par ta config Firebase.
   ═══════════════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyDMoG2Un9vli3OkysBoYu7wAeJ0hA9XDls",
  authDomain: "pronostics-cdm2026.firebaseapp.com",
  databaseURL: "https://pronostics-cdm2026-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pronostics-cdm2026",
  storageBucket: "pronostics-cdm2026.firebasestorage.app",
  messagingSenderId: "667143959775",
  appId: "1:667143959775:web:de16d631d84b8504bea56a"
};

/* ═══════════════════════════════════════════════════════════════
   DRAPEAUX
   ─────────────────────────────────────────────────────────────
   Codes ISO 2 lettres pour flagcdn.com.
   Écosse (gb-sct) et Angleterre (gb-eng) sont des cas spéciaux.
   ═══════════════════════════════════════════════════════════════ */
function flagImg(code, size = 20) {
  if (!code) return `<span style="width:${size}px;display:inline-block;"></span>`;
  return `<img src="https://flagcdn.com/w${size}/${code}.png"
    style="width:${size}px;height:${Math.round(size * 0.75)}px;object-fit:cover;border-radius:2px;flex-shrink:0;vertical-align:middle;"
    onerror="this.style.display='none'" alt="">`;
}

/* ═══════════════════════════════════════════════════════════════
   DONNÉES — 12 GROUPES
   Format : ['Nom du pays', 'code-iso']
   ═══════════════════════════════════════════════════════════════ */
const GROUPS = [
  { id:'A', teams:[['Mexique','mx'],['Afrique du Sud','za'],['Corée du Sud','kr'],['Rép. Tchèque','cz']] },
  { id:'B', teams:[['Canada','ca'],['Bosnie','ba'],['Qatar','qa'],['Suisse','ch']] },
  { id:'C', teams:[['Brésil','br'],['Maroc','ma'],['Haïti','ht'],['Écosse','gb-sct']] },
  { id:'D', teams:[['États-Unis','us'],['Paraguay','py'],['Australie','au'],['Turquie','tr']] },
  { id:'E', teams:[['Allemagne','de'],['Curaçao','cw'],["Côte d'Ivoire",'ci'],['Équateur','ec']] },
  { id:'F', teams:[['Pays-Bas','nl'],['Japon','jp'],['Suède','se'],['Tunisie','tn']] },
  { id:'G', teams:[['Belgique','be'],['Égypte','eg'],['Iran','ir'],['Nouvelle-Zélande','nz']] },
  { id:'H', teams:[['Espagne','es'],['Cap-Vert','cv'],['Arabie Saoudite','sa'],['Uruguay','uy']] },
  { id:'I', teams:[['France','fr'],['Sénégal','sn'],['Irak','iq'],['Norvège','no']] },
  { id:'J', teams:[['Argentine','ar'],['Algérie','dz'],['Autriche','at'],['Jordanie','jo']] },
  { id:'K', teams:[['Portugal','pt'],['RD Congo','cd'],['Ouzbékistan','uz'],['Colombie','co']] },
  { id:'L', teams:[['Angleterre','gb-eng'],['Croatie','hr'],['Ghana','gh'],['Panama','pa']] },
];

const MATCH_DAYS = [
  { day: 1, pairs: [[0,1],[2,3]] },
  { day: 2, pairs: [[0,2],[1,3]] },
  { day: 3, pairs: [[0,3],[1,2]] },
];

const MATCHES = GROUPS.flatMap(({ id, teams }) =>
  MATCH_DAYS.flatMap(({ day, pairs }) =>
    pairs.map(([i, j]) => ({
      id: `${id}${i}${j}`,
      group: id,
      home: teams[i],
      away: teams[j],
      matchday: day,
    }))
  )
);

/* ═══════════════════════════════════════════════════════════════
   PHASES ÉLIMINATOIRES
   ═══════════════════════════════════════════════════════════════ */
const KO_ROUNDS = [
  { id: 's16', label: 'Seizièmes de finale', dates: '5 – 9 juillet',   pts: { exact: 4,  correct: 2 }, count: 16 },
  { id: 'r16', label: 'Huitièmes de finale', dates: '10 – 13 juillet', pts: { exact: 6,  correct: 3 }, count: 8  },
  { id: 'qf',  label: 'Quarts de finale',   dates: '14 – 15 juillet', pts: { exact: 8,  correct: 4 }, count: 4  },
  { id: 'sf',  label: 'Demi-finales',       dates: '16 – 17 juillet', pts: { exact: 10, correct: 5 }, count: 2  },
  { id: 'fnl', label: 'Finale',             dates: '19 juillet',      pts: { exact: 15, correct: 7 }, count: 1  },
];

const ALL_KO_MATCHES = KO_ROUNDS.flatMap(r =>
  Array.from({ length: r.count }, (_, i) => ({
    id:      `${r.id}_${i + 1}`,
    roundId: r.id,
    num:     i + 1,
  }))
);

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const AVATAR_COLORS = [
  '#16a34a','#2563eb','#dc2626','#d97706',
  '#7c3aed','#db2777','#0891b2','#c2410c','#0f766e','#7e22ce'
];
const avatarColor = name =>
  AVATAR_COLORS[Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length];
const initials = name =>
  name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').slice(0, 2).join('');

function sign(n) { return n > 0 ? 1 : n < 0 ? -1 : 0; }

function calcPts(pred, result, ptsDef = { exact: 3, correct: 1 }) {
  if (!pred || !result) return null;
  const [ph, pa, rh, ra] = [pred.home, pred.away, result.home, result.away];
  if ([ph, pa, rh, ra].some(v => v === undefined || v === null || v === '')) return null;
  if (+ph === +rh && +pa === +ra) return ptsDef.exact;
  if (sign(+ph - +pa) === sign(+rh - +ra)) return ptsDef.correct;
  return 0;
}

function playerStats(name) {
  const gPreds = state.allPreds[name]   || {};
  const kPreds = state.allKOPreds[name] || {};
  let total = 0, exact = 0, correct = 0, evaluated = 0;
  MATCHES.forEach(m => {
    const p = calcPts(gPreds[m.id], state.results[m.id]);
    if (p !== null) { total += p; evaluated++; if (p === 3) exact++; else if (p === 1) correct++; }
  });
  ALL_KO_MATCHES.forEach(m => {
    const round = KO_ROUNDS.find(r => r.id === m.roundId);
    const p = calcPts(kPreds[m.id], state.koResults[m.id], round.pts);
    if (p !== null) { total += p; evaluated++; if (p === round.pts.exact) exact++; else if (p === round.pts.correct) correct++; }
  });
  const gPredCount = MATCHES.filter(m => {
    const p = gPreds[m.id];
    return p && p.home !== '' && p.home !== null && p.home !== undefined
            && p.away !== '' && p.away !== null && p.away !== undefined;
  }).length;
  const kPredCount = ALL_KO_MATCHES.filter(m => {
    const p = kPreds[m.id];
    return p && p.home !== '' && p.home !== null && p.home !== undefined
            && p.away !== '' && p.away !== null && p.away !== undefined;
  }).length;
  return { total, exact, correct, evaluated, predCount: gPredCount + kPredCount, gPredCount, kPredCount };
}

/* ═══════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════ */
let state = {
  screen:         'loading',
  myName:         '',
  tab:            'groupes',
  activeGroup:    'I',
  activeKORound:  's16',
  resultsMode:    'groupes',
  myPreds:        {},
  myKOPreds:      {},
  results:        {},
  koResults:      {},
  koTeams:        {},
  players:        [],
  allPreds:       {},
  allKOPreds:     {},
  isAdmin:        false,
  showAdminModal: false,
  error:          '',
  adminError:     '',
};

/* ═══════════════════════════════════════════════════════════════
   FIREBASE
   ═══════════════════════════════════════════════════════════════ */
let db;
const initialLoads   = new Set();
const TOTAL_INIT_LOADS = 6;

function onInitLoad(key) {
  initialLoads.add(key);
  if (initialLoads.size < TOTAL_INIT_LOADS) return;
  if (state.screen !== 'loading') return;
  if (sessionStorage.getItem('wc2026_admin') === '1') state.isAdmin = true;
  const savedName = localStorage.getItem('wc2026_name');
  if (savedName) {
    state.myName    = savedName;
    state.myPreds   = state.allPreds[savedName]   || {};
    state.myKOPreds = state.allKOPreds[savedName] || {};
    state.screen    = 'app';
  } else {
    state.screen    = 'login';
  }
  render();
}

function subscribeFirebase() {
  db.ref('wc2026/results').on('value', snap => { state.results = snap.val() || {}; onInitLoad('results'); render(); });
  db.ref('wc2026/players').on('value', snap => { state.players = snap.val() ? Object.keys(snap.val()) : []; onInitLoad('players'); render(); });
  db.ref('wc2026/predictions').on('value', snap => {
    state.allPreds = snap.val() || {};
    if (state.myName) state.myPreds = state.allPreds[state.myName] || state.myPreds;
    onInitLoad('predictions'); render();
  });
  db.ref('wc2026/ko_results').on('value', snap => { state.koResults = snap.val() || {}; onInitLoad('koResults'); render(); });
  db.ref('wc2026/ko_teams').on('value', snap => { state.koTeams = snap.val() || {}; onInitLoad('koTeams'); render(); });
  db.ref('wc2026/ko_predictions').on('value', snap => {
    state.allKOPreds = snap.val() || {};
    if (state.myName) state.myKOPreds = state.allKOPreds[state.myName] || state.myKOPreds;
    onInitLoad('koPredict'); render();
  });
}

/* ═══════════════════════════════════════════════════════════════
   ACTIONS
   ═══════════════════════════════════════════════════════════════ */
async function joinGame(name) {
  name = name.trim();
  if (!name) { state.error = 'Merci de saisir un prénom ou pseudo.'; render(); return; }
  state.error = ''; state.myName = name;
  localStorage.setItem('wc2026_name', name);
  await db.ref(`wc2026/players/${name}`).set(true);
  state.myPreds   = state.allPreds[name]   || {};
  state.myKOPreds = state.allKOPreds[name] || {};
  state.screen    = 'app';
  render();
}

async function setPred(matchId, side, val) {
  if (!state.myPreds[matchId]) state.myPreds[matchId] = {};
  const v = val === '' ? null : +val;
  state.myPreds[matchId][side] = v;
  if (!state.allPreds[state.myName]) state.allPreds[state.myName] = {};
  state.allPreds[state.myName] = JSON.parse(JSON.stringify(state.myPreds));
  await db.ref(`wc2026/predictions/${state.myName}/${matchId}/${side}`).set(v);
  render();
}

async function setKOPred(matchId, side, val) {
  if (!state.myKOPreds[matchId]) state.myKOPreds[matchId] = {};
  const v = val === '' ? null : +val;
  state.myKOPreds[matchId][side] = v;
  if (!state.allKOPreds[state.myName]) state.allKOPreds[state.myName] = {};
  state.allKOPreds[state.myName] = JSON.parse(JSON.stringify(state.myKOPreds));
  await db.ref(`wc2026/ko_predictions/${state.myName}/${matchId}/${side}`).set(v);
  render();
}

async function setResult(matchId, side, val) {
  if (!state.results[matchId]) state.results[matchId] = {};
  const v = val === '' ? null : +val;
  state.results[matchId][side] = v;
  await db.ref(`wc2026/results/${matchId}/${side}`).set(v);
  render();
}

async function setKOResult(matchId, side, val) {
  if (!state.koResults[matchId]) state.koResults[matchId] = {};
  const v = val === '' ? null : +val;
  state.koResults[matchId][side] = v;
  await db.ref(`wc2026/ko_results/${matchId}/${side}`).set(v);
  render();
}

async function setKOTeam(matchId, teamSide, field, val) {
  if (!state.koTeams[matchId]) state.koTeams[matchId] = { home: { name:'', flag:'' }, away: { name:'', flag:'' } };
  if (!state.koTeams[matchId][teamSide]) state.koTeams[matchId][teamSide] = { name:'', flag:'' };
  state.koTeams[matchId][teamSide][field] = val;
  await db.ref(`wc2026/ko_teams/${matchId}/${teamSide}/${field}`).set(val);
  render();
}

function checkAdmin() {
  const val = (document.getElementById('adminPwdInp') || {}).value || '';
  if (val === ADMIN_PASSWORD) {
    state.isAdmin = true; state.showAdminModal = false; state.adminError = '';
    sessionStorage.setItem('wc2026_admin', '1');
    state.tab = 'resultats'; render();
  } else {
    state.adminError = 'Mot de passe incorrect.'; render();
    setTimeout(() => document.getElementById('adminPwdInp')?.focus(), 20);
  }
}
function logoutAdmin() { state.isAdmin = false; sessionStorage.removeItem('wc2026_admin'); state.tab = 'groupes'; render(); }
function openResultsTab() {
  if (state.isAdmin) { state.tab = 'resultats'; render(); }
  else { state.showAdminModal = true; render(); setTimeout(() => document.getElementById('adminPwdInp')?.focus(), 20); }
}
function closeAdminModal() { state.showAdminModal = false; state.adminError = ''; render(); }
function logout() {
  state.myName = ''; state.myPreds = {}; state.myKOPreds = {};
  state.screen = 'login'; state.error = '';
  localStorage.removeItem('wc2026_name'); render();
}

/* ═══════════════════════════════════════════════════════════════
   COMPOSANTS HTML
   ═══════════════════════════════════════════════════════════════ */
function groupNav(active) {
  return `<div class="group-selector">
    ${GROUPS.map(g => `<button class="grp-btn ${active === g.id ? 'active' : ''}" onclick="setGroup('${g.id}')">Grp ${g.id}</button>`).join('')}
  </div>`;
}

function groupInfoBar(groupId) {
  const g = GROUPS.find(x => x.id === groupId);
  return `<div class="group-info" style="display:flex;flex-wrap:wrap;gap:10px;">
    ${g.teams.map(t => `<span style="display:flex;align-items:center;gap:5px;">${flagImg(t[1])}<span>${t[0]}</span></span>`).join('')}
  </div>`;
}

function koNav(active) {
  const labels = { s16:'16es', r16:'8es', qf:'Quarts', sf:'Demis', fnl:'Finale' };
  return `<div class="ko-nav">
    ${KO_ROUNDS.map(r => `<button class="ko-btn ${active === r.id ? 'active' : ''}" onclick="setKORound('${r.id}')">${labels[r.id]}</button>`).join('')}
  </div>`;
}

function ptsBadge(pts, ptsDef) {
  if (pts === null) return '<div class="pts-badge"></div>';
  const cls = pts === ptsDef.exact ? 'badge-max' : pts === ptsDef.correct ? 'badge-mid' : 'badge-0';
  return `<div class="pts-badge"><span class="badge ${cls}">${pts > 0 ? '+' + pts : '+0'}</span></div>`;
}

/* Carte match groupe */
function groupMatchCard(m, mode) {
  const score = (mode === 'pred' ? state.myPreds : state.results)[m.id] || {};
  const pts   = calcPts(state.myPreds[m.id], state.results[m.id]);
  const onch  = mode === 'pred' ? `setPred('${m.id}','SIDE',this.value)` : `setRes('${m.id}','SIDE',this.value)`;
  const hasH  = score.home !== undefined && score.home !== null && score.home !== '';
  const hasA  = score.away !== undefined && score.away !== null && score.away !== '';
  return `<div class="match-card">
    <div class="team">
      ${flagImg(m.home[1])}
      <span class="team-name">${m.home[0]}</span>
    </div>
    <div class="score-block">
      <input class="score-inp${hasH ? ' has-val' : ''}" type="number" min="0" max="30" step="1"
        value="${hasH ? score.home : ''}" onchange="${onch.replace('SIDE','home')}">
      <span class="score-sep">–</span>
      <input class="score-inp${hasA ? ' has-val' : ''}" type="number" min="0" max="30" step="1"
        value="${hasA ? score.away : ''}" onchange="${onch.replace('SIDE','away')}">
    </div>
    <div class="team team-right">
      <span class="team-name">${m.away[0]}</span>
      ${flagImg(m.away[1])}
    </div>
    ${mode === 'pred' ? ptsBadge(pts, { exact: 3, correct: 1 }) : '<div class="pts-badge"></div>'}
  </div>`;
}

/* Carte match KO — joueur */
function koMatchCardPlayer(m, round) {
  const teams = state.koTeams[m.id] || {};
  const home  = teams.home || {};
  const away  = teams.away || {};
  if (!home.name && !away.name)
    return `<div class="match-card tbd"><span class="tbd-label">Match ${m.num} — équipes à déterminer</span></div>`;
  const score = state.myKOPreds[m.id] || {};
  const res   = state.koResults[m.id] || {};
  const pts   = calcPts(state.myKOPreds[m.id], res, round.pts);
  const hasH  = score.home !== undefined && score.home !== null && score.home !== '';
  const hasA  = score.away !== undefined && score.away !== null && score.away !== '';
  return `<div class="match-card">
    <div class="team">
      ${flagImg(home.flag)}
      <span class="team-name">${home.name || '?'}</span>
    </div>
    <div class="score-block">
      <input class="score-inp${hasH ? ' has-val' : ''}" type="number" min="0" max="30" step="1"
        value="${hasH ? score.home : ''}" onchange="setKOPred('${m.id}','home',this.value)">
      <span class="score-sep">–</span>
      <input class="score-inp${hasA ? ' has-val' : ''}" type="number" min="0" max="30" step="1"
        value="${hasA ? score.away : ''}" onchange="setKOPred('${m.id}','away',this.value)">
    </div>
    <div class="team team-right">
      <span class="team-name">${away.name || '?'}</span>
      ${flagImg(away.flag)}
    </div>
    ${ptsBadge(pts, round.pts)}
  </div>`;
}

/* Carte match KO — admin (avec inputs code ISO) */
function koMatchCardAdmin(m) {
  const teams = state.koTeams[m.id] || {};
  const home  = teams.home || { name: '', flag: '' };
  const away  = teams.away || { name: '', flag: '' };
  const res   = state.koResults[m.id] || {};
  const hasH  = res.home !== undefined && res.home !== null && res.home !== '';
  const hasA  = res.away !== undefined && res.away !== null && res.away !== '';
  return `<div class="match-card" style="flex-direction:column;gap:8px;padding:9px 10px;">
    <div style="display:flex;align-items:center;gap:5px;width:100%;">
      <div class="team" style="gap:4px;">
        ${flagImg(home.flag)}
        <input class="ko-name-inp" type="text" value="${home.name}" placeholder="Équipe domicile"
          onchange="setKOTeam('${m.id}','home','name',this.value)">
      </div>
      <div class="score-block">
        <input class="score-inp${hasH ? ' has-val' : ''}" type="number" min="0" max="30" step="1"
          value="${hasH ? res.home : ''}" onchange="setKORes('${m.id}','home',this.value)">
        <span class="score-sep">–</span>
        <input class="score-inp${hasA ? ' has-val' : ''}" type="number" min="0" max="30" step="1"
          value="${hasA ? res.away : ''}" onchange="setKORes('${m.id}','away',this.value)">
      </div>
      <div class="team team-right" style="gap:4px;">
        <input class="ko-name-inp" type="text" value="${away.name}" placeholder="Équipe extérieur"
          style="text-align:right;" onchange="setKOTeam('${m.id}','away','name',this.value)">
        ${flagImg(away.flag)}
      </div>
    </div>
    <div style="display:flex;gap:8px;font-size:11px;color:var(--muted);">
      <span>Code ISO domicile :</span>
      <input class="flag-inp" type="text" maxlength="6" value="${home.flag}" placeholder="ex: fr"
        onchange="setKOTeam('${m.id}','home','flag',this.value)" style="width:50px;">
      <span style="margin-left:8px;">Code ISO extérieur :</span>
      <input class="flag-inp" type="text" maxlength="6" value="${away.flag}" placeholder="ex: de"
        onchange="setKOTeam('${m.id}','away','flag',this.value)" style="width:50px;">
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════════ */
function render() {
  const root = document.getElementById('root');
  if (!root) return;
  if (state.screen === 'loading') { root.innerHTML = `<div class="loading-screen"><div class="spinner"></div><span>Connexion en cours…</span></div>`; return; }
  if (state.screen === 'setup')   { root.innerHTML = renderSetup();  return; }
  if (state.screen === 'login')   { root.innerHTML = renderLogin();  setTimeout(() => document.getElementById('nameInp')?.focus(), 20); return; }
  root.innerHTML = renderApp();
  if (state.showAdminModal) renderModal();
}

function renderSetup() {
  return `<div class="setup-wrap"><div class="setup-card">
    <span class="setup-icon">🔧</span>
    <div class="setup-title">Configuration Firebase requise</div>
    <p style="font-size:13px;color:var(--muted);margin-bottom:20px;">Lis le README.md pour les instructions complètes.</p>
    <div class="setup-step"><div class="setup-num">1</div><div class="setup-text">Aller sur <a href="https://console.firebase.google.com" target="_blank">console.firebase.google.com</a> et créer un projet.</div></div>
    <div class="setup-step"><div class="setup-num">2</div><div class="setup-text"><strong>Realtime Database</strong> → Créer → mode test. Modifier les règles.</div></div>
    <div class="setup-step"><div class="setup-num">3</div><div class="setup-text">Paramètres ⚙️ → <strong>Vos applications</strong> → <code>&lt;/&gt;</code> → copier la config.</div></div>
    <div class="setup-step"><div class="setup-num">4</div><div class="setup-text">Ouvrir <code>script.js</code> et remplacer les <code>VOTRE_…</code> en haut du fichier.</div></div>
  </div></div>`;
}

function renderLogin() {
  const others = state.players.slice(0, 8);
  return `<div class="login-wrap"><div class="login-card">
    <div class="login-hero">
      <span class="login-ball">⚽</span>
      <div class="login-title">Pronostics 2026</div>
      <div class="login-sub"><strong>Coupe du Monde</strong> · 11 juin – 19 juillet<br>Mexique · États-Unis · Canada · 48 équipes</div>
    </div>
    <label class="field-lbl">Ton prénom ou pseudo</label>
    <input class="field-inp" id="nameInp" type="text" placeholder="Ex: Antoine, La Pépette…" maxlength="24" onkeydown="if(event.key==='Enter') doJoin()">
    ${state.error ? `<div class="error-msg">${state.error}</div>` : ''}
    <button class="btn-join" onclick="doJoin()">Rejoindre la compétition ⚽</button>
    <div class="login-players">
      ${others.length > 0
        ? `Déjà inscrits : ${others.join(', ')}${state.players.length > 8 ? ` +${state.players.length - 8} autres` : ''}`
        : `Sois le premier à rejoindre !`}
    </div>
  </div></div>`;
}

function renderApp() {
  const myStats = playerStats(state.myName);
  const showPts = myStats.total > 0 || myStats.predCount > 0;
  let content = '';
  if      (state.tab === 'groupes')    content = renderGroupes();
  else if (state.tab === 'phases')     content = renderPhases();
  else if (state.tab === 'classement') content = renderClassement();
  else if (state.tab === 'resultats')  content = renderResultats();
  return `
    <div class="header">
      <div class="header-inner">
        <div class="logo">
          <div class="logo-ball">⚽</div>
          <div>
            <div class="logo-name">Pronostics 2026</div>
            <div class="logo-sub">CDM · ${state.players.length} joueur${state.players.length > 1 ? 's' : ''}</div>
          </div>
        </div>
        <div class="header-right">
          ${state.isAdmin ? `<span class="admin-badge">🔑 Admin</span>` : ''}
          ${showPts ? `<div class="pts-pill"><div class="pts-pill-val">${myStats.total}</div><div class="pts-pill-lbl">pts</div></div>` : ''}
          <div class="avatar" style="background:${avatarColor(state.myName)}">${initials(state.myName)}</div>
          <button class="btn-quit" onclick="logout()">Quitter</button>
        </div>
      </div>
    </div>
    <div class="nav">
      <div class="nav-inner">
        <button class="nav-tab ${state.tab === 'groupes'    ? 'active' : ''}" onclick="setTab('groupes')">Groupes</button>
        <button class="nav-tab ${state.tab === 'phases'     ? 'active' : ''}" onclick="setTab('phases')">Phases finales</button>
        <button class="nav-tab ${state.tab === 'classement' ? 'active' : ''}" onclick="setTab('classement')">Classement</button>
        <button class="nav-tab ${state.tab === 'resultats'  ? 'active' : ''}" onclick="openResultsTab()">🔒 Résultats</button>
      </div>
    </div>
    <div class="main">${content}</div>`;
}

function renderGroupes() {
  const s = playerStats(state.myName);
  const resDone = MATCHES.filter(m => { const r = state.results[m.id]; return r && r.home !== null && r.home !== undefined && r.home !== '' && r.away !== null && r.away !== undefined && r.away !== ''; }).length;
  const matches = MATCHES.filter(m => m.group === state.activeGroup);
  return `
    <div class="stats-row">
      <div class="stat-box"><div class="stat-val" style="color:var(--green);">${s.total}</div><div class="stat-lbl">Points totaux</div></div>
      <div class="stat-box"><div class="stat-val">${s.gPredCount}<span>/72</span></div><div class="stat-lbl">Pronos groupes</div></div>
      <div class="stat-box"><div class="stat-val">${s.exact}</div><div class="stat-lbl">Scores exacts</div></div>
    </div>
    <div class="rule-hint">+3 pts score exact · +1 pt bon résultat · ${resDone} résultats connus</div>
    ${groupNav(state.activeGroup)}
    ${groupInfoBar(state.activeGroup)}
    ${[1, 2, 3].map(day => {
      const dm = matches.filter(m => m.matchday === day);
      return `<div class="matchday-header">Journée ${day}</div>${dm.map(m => groupMatchCard(m, 'pred')).join('')}`;
    }).join('')}`;
}

function renderPhases() {
  const round   = KO_ROUNDS.find(r => r.id === state.activeKORound);
  const matches = ALL_KO_MATCHES.filter(m => m.roundId === state.activeKORound);
  const s       = playerStats(state.myName);
  const teamsSet = matches.filter(m => (state.koTeams[m.id] || {}).home?.name).length;
  return `
    <div class="rule-hint">Tu as <strong style="color:var(--green);">${s.kPredCount}</strong> pronostics KO · +${round.pts.exact} score exact · +${round.pts.correct} bon résultat</div>
    ${koNav(state.activeKORound)}
    <div class="ko-round-info">${round.label} · ${round.dates} · ${teamsSet}/${round.count} équipes définies</div>
    ${matches.map(m => koMatchCardPlayer(m, round)).join('')}`;
}

function renderClassement() {
  const ranking = state.players.map(name => ({ name, ...playerStats(name) })).sort((a, b) => b.total - a.total || b.exact - a.exact || b.correct - a.correct);
  const resDone = MATCHES.filter(m => { const r = state.results[m.id]; return r && r.home !== null && r.home !== undefined && r.home !== '' && r.away !== null && r.away !== undefined && r.away !== ''; }).length;
  if (ranking.length === 0) return `<div style="text-align:center;padding:4rem 1rem;color:var(--muted);font-size:14px;">Aucun joueur inscrit.</div>`;
  const medals = ['🥇','🥈','🥉'];
  return `
    <div class="board-header">
      <div class="board-title">Classement général</div>
      <div class="board-sub">${ranking.length} joueur${ranking.length > 1 ? 's' : ''} · ${resDone}/72 résultats groupes</div>
    </div>
    ${ranking.map((r, i) => {
      const isMe = r.name === state.myName;
      return `<div class="rank-card ${isMe ? 'me' : ''}">
        <div class="rank-num">${medals[i] || `#${i + 1}`}</div>
        <div class="avatar" style="background:${avatarColor(r.name)}">${initials(r.name)}</div>
        <div class="rank-info">
          <div class="rank-name">${r.name}${isMe ? ' <span class="tag-me">moi</span>' : ''}</div>
          <div class="rank-sub">${r.predCount} pronos · ${r.evaluated > 0 ? `${r.exact} exacts · ${r.correct} corrects` : 'pas encore évalué'}</div>
        </div>
        <div class="rank-score">
          <div class="rank-pts">${r.total}</div>
          <div class="rank-pts-lbl">pts</div>
        </div>
      </div>`;
    }).join('')}`;
}

function renderResultats() {
  return `
    <div class="results-header">
      <div class="results-title">Résultats réels</div>
      <div class="results-sub" style="display:flex;align-items:center;justify-content:space-between;">
        <span>Mode admin — saisis les vrais scores</span>
        <button onclick="logoutAdmin()" style="background:none;border:none;color:var(--gold);font-size:11px;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;">Quitter le mode admin</button>
      </div>
    </div>
    <div class="sub-nav">
      <button class="sub-tab ${state.resultsMode === 'groupes' ? 'active' : ''}" onclick="setResultsMode('groupes')">Phase de groupes</button>
      <button class="sub-tab ${state.resultsMode === 'phases'  ? 'active' : ''}" onclick="setResultsMode('phases')">Phases finales</button>
    </div>
    ${state.resultsMode === 'groupes' ? renderResultatsGroupes() : renderResultatsPhases()}`;
}

function renderResultatsGroupes() {
  const done = MATCHES.filter(m => { const r = state.results[m.id]; return r && r.home !== null && r.home !== undefined && r.home !== '' && r.away !== null && r.away !== undefined && r.away !== ''; }).length;
  const g = GROUPS.find(x => x.id === state.activeGroup);
  const matches = MATCHES.filter(m => m.group === state.activeGroup);
  return `
    <div class="rule-hint">${done}/72 résultats saisis</div>
    ${groupNav(state.activeGroup)}
    ${groupInfoBar(state.activeGroup)}
    ${[1, 2, 3].map(day => {
      const dm = matches.filter(m => m.matchday === day);
      return `<div class="matchday-header">Journée ${day}</div>${dm.map(m => groupMatchCard(m, 'result')).join('')}`;
    }).join('')}`;
}

function renderResultatsPhases() {
  const round   = KO_ROUNDS.find(r => r.id === state.activeKORound);
  const matches = ALL_KO_MATCHES.filter(m => m.roundId === state.activeKORound);
  return `
    <div class="rule-hint">Saisis le code ISO du pays (ex: <strong>fr</strong> pour France, <strong>de</strong> pour Allemagne) puis les scores.</div>
    ${koNav(state.activeKORound)}
    <div class="ko-round-info">${round.label} · ${round.dates}</div>
    ${matches.map(m => koMatchCardAdmin(m)).join('')}`;
}

function renderModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card">
      <span class="modal-icon">🔑</span>
      <div class="modal-title">Accès admin</div>
      <div class="modal-sub">Seul l'administrateur peut saisir les résultats et définir les équipes des phases finales.</div>
      <label class="field-lbl">Mot de passe admin</label>
      <input class="field-inp" id="adminPwdInp" type="password" placeholder="Mot de passe…" onkeydown="if(event.key==='Enter') checkAdmin()">
      ${state.adminError ? `<div class="error-msg">${state.adminError}</div>` : ''}
      <button class="btn-join gold" onclick="checkAdmin()">Confirmer</button>
      <button class="btn-cancel" onclick="closeAdminModal()">Annuler</button>
    </div>`;
  document.body.appendChild(overlay);
}

/* ═══════════════════════════════════════════════════════════════
   HANDLERS GLOBAUX
   ═══════════════════════════════════════════════════════════════ */
window.doJoin          = ()            => joinGame(document.getElementById('nameInp')?.value || '');
window.setTab          = t             => { state.tab = t; render(); };
window.setGroup        = g             => { state.activeGroup = g; render(); };
window.setKORound      = r             => { state.activeKORound = r; render(); };
window.setResultsMode  = m             => { state.resultsMode = m; render(); };
window.setPred         = (id, s, v)    => setPred(id, s, v);
window.setKOPred       = (id, s, v)    => setKOPred(id, s, v);
window.setRes          = (id, s, v)    => setResult(id, s, v);
window.setKORes        = (id, s, v)    => setKOResult(id, s, v);
window.setKOTeam       = (id, t, f, v) => setKOTeam(id, t, f, v);
window.openResultsTab  = openResultsTab;
window.checkAdmin      = checkAdmin;
window.closeAdminModal = closeAdminModal;
window.logoutAdmin     = logoutAdmin;
window.logout          = logout;

/* ═══════════════════════════════════════════════════════════════
   INITIALISATION
   ═══════════════════════════════════════════════════════════════ */
function init() {
  if (firebaseConfig.apiKey === 'VOTRE_API_KEY') { state.screen = 'setup'; render(); return; }
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    subscribeFirebase();
    render();
  } catch (err) {
    console.error('Firebase init error:', err);
    state.screen = 'setup'; render();
  }
}

init();
