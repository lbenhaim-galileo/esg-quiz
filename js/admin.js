// ── AUTH ──────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'IAThon2026!';
let adminQuestions  = [];
let adminFormations = [];
let editingFormationId = null;
let editingQuestionId  = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', handleLogin);
});

function handleLogin(e) {
  e.preventDefault();
  if (document.getElementById('admin-pwd').value === ADMIN_PASSWORD) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display    = 'block';
    initAdmin();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
async function initAdmin() {
  showLoader(true);
  const data      = await loadData();
  adminQuestions  = data.questions;
  adminFormations = data.formations;
  showLoader(false);

  renderTab('formations');
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTab(btn.dataset.tab);
    });
  });
}

function renderTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  if (tab === 'formations') renderFormations();
  if (tab === 'questions')  renderQuestions();
  if (tab === 'regles')     renderRegles();
  if (tab === 'settings')   renderSettings();
}

// ── LOADER ────────────────────────────────────────────────────────────────────
function showLoader(visible) {
  document.getElementById('admin-loader').style.display = visible ? 'flex' : 'none';
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function toast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = isError ? '#c44' : '#2d7a2d';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── GITHUB PUSH HELPER ────────────────────────────────────────────────────────
async function saveAndPush(filename, data, btnEl) {
  if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Publication…'; }
  try {
    await pushJSONToGitHub(filename, data);
    toast(`${filename} publié sur GitHub ✓`);
  } catch(err) {
    toast('Erreur : ' + err.message, true);
  } finally {
    if (btnEl) { btnEl.disabled = false; btnEl.textContent = 'Enregistrer'; }
  }
}

// ── FORMATIONS ────────────────────────────────────────────────────────────────
function renderFormations() {
  const list = document.getElementById('formations-list');
  list.innerHTML = '';
  adminFormations.forEach(f => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <span class="item-tag">${f.type}</span>
        <strong>${f.titre}</strong>
        <span class="item-meta">${f.villes.length} campus · ${f.domaines.join(', ')}</span>
      </div>
      <div class="item-actions">
        <button class="btn-edit"   onclick="openFormationEditor('${f.id}')">Modifier</button>
        <button class="btn-delete" onclick="deleteFormation('${f.id}')">Supprimer</button>
      </div>`;
    list.appendChild(row);
  });
}

function openFormationEditor(id) {
  editingFormationId = id;
  const f = id === '__new__'
    ? { id:'f_'+Date.now(), titre:'', type:'Bachelor', description:'', image:'', infos_cles:[], villes:[], domaines:[], niveaux_entree:[] }
    : adminFormations.find(x => x.id === id);

  document.getElementById('fe-id').value          = f.id;
  document.getElementById('fe-titre').value        = f.titre;
  document.getElementById('fe-type').value         = f.type;
  document.getElementById('fe-description').value  = f.description;
  document.getElementById('fe-image').value        = f.image || '';
  document.getElementById('fe-infos').value        = f.infos_cles.join('\n');
  document.querySelectorAll('#fe-villes   input[type=checkbox]').forEach(cb => cb.checked = f.villes.includes(cb.value));
  document.querySelectorAll('#fe-domaines input[type=checkbox]').forEach(cb => cb.checked = f.domaines.includes(cb.value));
  document.querySelectorAll('#fe-niveaux  input[type=checkbox]').forEach(cb => cb.checked = f.niveaux_entree.includes(cb.value));

  document.getElementById('formation-editor').style.display = 'block';
  document.getElementById('formation-editor').scrollIntoView({ behavior:'smooth' });
}

async function saveFormation() {
  const f = {
    id:             document.getElementById('fe-id').value,
    titre:          document.getElementById('fe-titre').value.trim(),
    type:           document.getElementById('fe-type').value,
    description:    document.getElementById('fe-description').value.trim(),
    image:          document.getElementById('fe-image').value.trim(),
    infos_cles:     document.getElementById('fe-infos').value.split('\n').map(s => s.trim()).filter(Boolean),
    villes:         [...document.querySelectorAll('#fe-villes   input:checked')].map(c => c.value),
    domaines:       [...document.querySelectorAll('#fe-domaines input:checked')].map(c => c.value),
    niveaux_entree: [...document.querySelectorAll('#fe-niveaux  input:checked')].map(c => c.value)
  };
  if (!f.titre) { alert('Le titre est requis.'); return; }

  const idx = adminFormations.findIndex(x => x.id === f.id);
  if (idx >= 0) adminFormations[idx] = f; else adminFormations.push(f);

  closeFormationEditor();
  renderFormations();
  const btn = document.querySelector('#formation-editor .btn-save');
  await saveAndPush('formations.json', adminFormations, btn);
}

async function deleteFormation(id) {
  if (!confirm('Supprimer cette formation ?')) return;
  adminFormations = adminFormations.filter(f => f.id !== id);
  renderFormations();
  await saveAndPush('formations.json', adminFormations, null);
}

function closeFormationEditor() {
  document.getElementById('formation-editor').style.display = 'none';
  editingFormationId = null;
}

// ── QUESTIONS ─────────────────────────────────────────────────────────────────
function renderQuestions() {
  const list = document.getElementById('questions-list');
  list.innerHTML = '';
  adminQuestions.forEach(q => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <span class="item-tag">Étape ${q.step}</span>
        <strong>${q.text}</strong>
        <span class="item-meta">${q.choices.length} choix · ${q.type}</span>
      </div>
      <div class="item-actions">
        <button class="btn-edit"   onclick="openQuestionEditor('${q.id}')">Modifier</button>
        <button class="btn-delete" onclick="deleteQuestion('${q.id}')">Supprimer</button>
      </div>`;
    list.appendChild(row);
  });
}

function openQuestionEditor(id) {
  editingQuestionId = id;
  const q = id === '__new__'
    ? { id:'q_'+Date.now(), step: adminQuestions.length+1, text:'', type:'chips', choices:[] }
    : adminQuestions.find(x => x.id === id);

  document.getElementById('qe-id').value      = q.id;
  document.getElementById('qe-step').value    = q.step;
  document.getElementById('qe-text').value    = q.text;
  document.getElementById('qe-type').value    = q.type;
  document.getElementById('qe-choices').value = q.choices.map(c => `${c.id}|${c.label}`).join('\n');

  document.getElementById('question-editor').style.display = 'block';
  document.getElementById('question-editor').scrollIntoView({ behavior:'smooth' });
}

async function saveQuestion() {
  const choices = document.getElementById('qe-choices').value.trim().split('\n').filter(Boolean).map(line => {
    const [id, ...rest] = line.split('|');
    return { id: id.trim(), label: rest.join('|').trim() };
  });
  const q = {
    id:      document.getElementById('qe-id').value,
    step:    parseInt(document.getElementById('qe-step').value),
    text:    document.getElementById('qe-text').value.trim(),
    type:    document.getElementById('qe-type').value,
    choices
  };
  if (!q.text) { alert('Le texte est requis.'); return; }

  const idx = adminQuestions.findIndex(x => x.id === q.id);
  if (idx >= 0) adminQuestions[idx] = q; else adminQuestions.push(q);
  adminQuestions.sort((a, b) => a.step - b.step);

  closeQuestionEditor();
  renderQuestions();
  const btn = document.querySelector('#question-editor .btn-save');
  await saveAndPush('questions.json', adminQuestions, btn);
}

async function deleteQuestion(id) {
  if (!confirm('Supprimer cette question ?')) return;
  adminQuestions = adminQuestions.filter(q => q.id !== id);
  renderQuestions();
  await saveAndPush('questions.json', adminQuestions, null);
}

function closeQuestionEditor() {
  document.getElementById('question-editor').style.display = 'none';
  editingQuestionId = null;
}

// ── RÈGLES ────────────────────────────────────────────────────────────────────
function renderRegles() {
  const container = document.getElementById('regles-container');
  container.innerHTML = '';
  const qVille   = adminQuestions.find(q => q.id === 'q_ville');
  const qDomaine = adminQuestions.find(q => q.id === 'q_domaine');
  const qNiveau  = adminQuestions.find(q => q.id === 'q_niveau');

  adminFormations.forEach(f => {
    const section = document.createElement('div');
    section.className = 'rule-section';
    section.innerHTML = `
      <div class="rule-header">
        <span class="item-tag">${f.type}</span>
        <strong>${f.titre}</strong>
      </div>
      <div class="rule-body">
        <div class="rule-group">
          <label>Villes</label>
          <div class="checkbox-grid">${(qVille?.choices||[]).map(c =>
            `<label class="cb-label"><input type="checkbox" value="${c.id}" ${f.villes.includes(c.id)?'checked':''}
              onchange="updateRule('${f.id}','villes',this)"> ${c.label}</label>`).join('')}</div>
        </div>
        <div class="rule-group">
          <label>Domaines</label>
          <div class="checkbox-grid">${(qDomaine?.choices||[]).map(c =>
            `<label class="cb-label"><input type="checkbox" value="${c.id}" ${f.domaines.includes(c.id)?'checked':''}
              onchange="updateRule('${f.id}','domaines',this)"> ${c.label}</label>`).join('')}</div>
        </div>
        <div class="rule-group">
          <label>Niveaux d'entrée</label>
          <div class="checkbox-grid">${(qNiveau?.choices||[]).map(c =>
            `<label class="cb-label"><input type="checkbox" value="${c.id}" ${f.niveaux_entree.includes(c.id)?'checked':''}
              onchange="updateRule('${f.id}','niveaux_entree',this)"> ${c.label}</label>`).join('')}</div>
        </div>
      </div>`;
    container.appendChild(section);
  });
}

async function updateRule(formationId, field, checkbox) {
  const f = adminFormations.find(x => x.id === formationId);
  if (!f) return;
  if (checkbox.checked) { if (!f[field].includes(checkbox.value)) f[field].push(checkbox.value); }
  else { f[field] = f[field].filter(v => v !== checkbox.value); }
  await saveAndPush('formations.json', adminFormations, null);
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function renderSettings() {
  document.getElementById('s-token').value = localStorage.getItem('esg_admin_token') || '';
}

async function testGitHubConnection() {
  const token = document.getElementById('s-token').value.trim();
  if (!token) { toast('Entrez un token avant de tester.', true); return; }

  const btn = document.getElementById('btn-test-token');
  btn.disabled = true; btn.textContent = 'Test en cours…';

  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`, {
      headers: { 'Authorization': `token ${token}` }
    });
    if (r.ok) { toast('Connexion réussie ✓ Token valide.'); }
    else      { toast(`Erreur ${r.status} — vérifiez le token ou les permissions.`, true); }
  } catch(e) {
    toast('Impossible de joindre l\'API GitHub.', true);
  } finally {
    btn.disabled = false; btn.textContent = 'Tester la connexion';
  }
}

function saveSettings() {
  const token = document.getElementById('s-token').value.trim();
  if (token) localStorage.setItem('esg_admin_token', token);
  else       localStorage.removeItem('esg_admin_token');
  toast('Paramètres enregistrés ✓');
}
