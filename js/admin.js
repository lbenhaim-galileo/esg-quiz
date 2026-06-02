// ── AUTH ──────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'IAThon2026!';
let adminData = null;
let editingFormationId = null;
let editingQuestionId = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', handleLogin);
});

function handleLogin(e) {
  e.preventDefault();
  const pwd = document.getElementById('admin-pwd').value;
  if (pwd === ADMIN_PASSWORD) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-app').style.display    = 'block';
    initAdmin();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function initAdmin() {
  adminData = getData();
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

  if (tab === 'formations')   renderFormations();
  if (tab === 'questions')    renderQuestions();
  if (tab === 'regles')       renderRegles();
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// ── FORMATIONS ────────────────────────────────────────────────────────────────
function renderFormations() {
  const list = document.getElementById('formations-list');
  list.innerHTML = '';

  adminData.formations.forEach(f => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <span class="item-tag">${f.type}</span>
        <strong>${f.titre}</strong>
        <span class="item-meta">${f.villes.length} campus · ${f.domaines.join(', ')}</span>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openFormationEditor('${f.id}')">Modifier</button>
        <button class="btn-delete" onclick="deleteFormation('${f.id}')">Supprimer</button>
      </div>
    `;
    list.appendChild(row);
  });
}

function openFormationEditor(id) {
  editingFormationId = id;
  const f = id === '__new__'
    ? { id: 'f_' + Date.now(), titre: '', type: 'Bachelor', description: '', image: '', infos_cles: [], villes: [], domaines: [], niveaux_entree: [] }
    : adminData.formations.find(x => x.id === id);

  document.getElementById('fe-id').value          = f.id;
  document.getElementById('fe-titre').value        = f.titre;
  document.getElementById('fe-type').value         = f.type;
  document.getElementById('fe-description').value  = f.description;
  document.getElementById('fe-image').value        = f.image || '';
  document.getElementById('fe-infos').value        = f.infos_cles.join('\n');

  // Checkboxes villes
  document.querySelectorAll('#fe-villes input[type=checkbox]').forEach(cb => {
    cb.checked = f.villes.includes(cb.value);
  });

  // Checkboxes domaines
  document.querySelectorAll('#fe-domaines input[type=checkbox]').forEach(cb => {
    cb.checked = f.domaines.includes(cb.value);
  });

  // Checkboxes niveaux
  document.querySelectorAll('#fe-niveaux input[type=checkbox]').forEach(cb => {
    cb.checked = f.niveaux_entree.includes(cb.value);
  });

  document.getElementById('formation-editor').style.display = 'block';
  document.getElementById('formation-editor').scrollIntoView({ behavior: 'smooth' });
}

function saveFormation() {
  const f = {
    id:            document.getElementById('fe-id').value,
    titre:         document.getElementById('fe-titre').value.trim(),
    type:          document.getElementById('fe-type').value,
    description:   document.getElementById('fe-description').value.trim(),
    image:         document.getElementById('fe-image').value.trim(),
    infos_cles:    document.getElementById('fe-infos').value.split('\n').map(s => s.trim()).filter(Boolean),
    villes:        [...document.querySelectorAll('#fe-villes input:checked')].map(c => c.value),
    domaines:      [...document.querySelectorAll('#fe-domaines input:checked')].map(c => c.value),
    niveaux_entree:[...document.querySelectorAll('#fe-niveaux input:checked')].map(c => c.value)
  };

  if (!f.titre) { alert('Le titre est requis.'); return; }

  const idx = adminData.formations.findIndex(x => x.id === f.id);
  if (idx >= 0) {
    adminData.formations[idx] = f;
  } else {
    adminData.formations.push(f);
  }

  saveData(adminData);
  closeFormationEditor();
  renderFormations();
  toast('Formation enregistrée ✓');
}

function deleteFormation(id) {
  if (!confirm('Supprimer cette formation ?')) return;
  adminData.formations = adminData.formations.filter(f => f.id !== id);
  saveData(adminData);
  renderFormations();
  toast('Formation supprimée');
}

function closeFormationEditor() {
  document.getElementById('formation-editor').style.display = 'none';
  editingFormationId = null;
}

// ── QUESTIONS ─────────────────────────────────────────────────────────────────
function renderQuestions() {
  const list = document.getElementById('questions-list');
  list.innerHTML = '';

  adminData.questions.forEach((q, i) => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-info">
        <span class="item-tag">Étape ${q.step}</span>
        <strong>${q.text}</strong>
        <span class="item-meta">${q.choices.length} choix · type: ${q.type}</span>
      </div>
      <div class="item-actions">
        <button class="btn-edit" onclick="openQuestionEditor('${q.id}')">Modifier</button>
        <button class="btn-delete" onclick="deleteQuestion('${q.id}')">Supprimer</button>
      </div>
    `;
    list.appendChild(row);
  });
}

function openQuestionEditor(id) {
  editingQuestionId = id;
  const q = id === '__new__'
    ? { id: 'q_' + Date.now(), step: adminData.questions.length + 1, text: '', type: 'chips', choices: [] }
    : adminData.questions.find(x => x.id === id);

  document.getElementById('qe-id').value    = q.id;
  document.getElementById('qe-step').value  = q.step;
  document.getElementById('qe-text').value  = q.text;
  document.getElementById('qe-type').value  = q.type;
  document.getElementById('qe-choices').value = q.choices.map(c => `${c.id}|${c.label}`).join('\n');

  document.getElementById('question-editor').style.display = 'block';
  document.getElementById('question-editor').scrollIntoView({ behavior: 'smooth' });
}

function saveQuestion() {
  const rawChoices = document.getElementById('qe-choices').value.trim().split('\n').filter(Boolean);
  const choices = rawChoices.map(line => {
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

  if (!q.text) { alert('Le texte de la question est requis.'); return; }

  const idx = adminData.questions.findIndex(x => x.id === q.id);
  if (idx >= 0) {
    adminData.questions[idx] = q;
  } else {
    adminData.questions.push(q);
  }

  // re-sort by step
  adminData.questions.sort((a, b) => a.step - b.step);

  saveData(adminData);
  closeQuestionEditor();
  renderQuestions();
  toast('Question enregistrée ✓');
}

function deleteQuestion(id) {
  if (!confirm('Supprimer cette question ?')) return;
  adminData.questions = adminData.questions.filter(q => q.id !== id);
  saveData(adminData);
  renderQuestions();
  toast('Question supprimée');
}

function closeQuestionEditor() {
  document.getElementById('question-editor').style.display = 'none';
  editingQuestionId = null;
}

// ── RÈGLES ────────────────────────────────────────────────────────────────────
function renderRegles() {
  const container = document.getElementById('regles-container');
  container.innerHTML = '';

  adminData.formations.forEach(f => {
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
          <div class="checkbox-grid" id="rv-${f.id}">
            ${adminData.questions.find(q => q.id === 'q_ville')?.choices.map(c =>
              `<label class="cb-label">
                <input type="checkbox" value="${c.id}" ${f.villes.includes(c.id) ? 'checked' : ''}
                  onchange="updateRule('${f.id}', 'villes', this)"> ${c.label}
              </label>`
            ).join('')}
          </div>
        </div>
        <div class="rule-group">
          <label>Domaines</label>
          <div class="checkbox-grid" id="rd-${f.id}">
            ${adminData.questions.find(q => q.id === 'q_domaine')?.choices.map(c =>
              `<label class="cb-label">
                <input type="checkbox" value="${c.id}" ${f.domaines.includes(c.id) ? 'checked' : ''}
                  onchange="updateRule('${f.id}', 'domaines', this)"> ${c.label}
              </label>`
            ).join('')}
          </div>
        </div>
        <div class="rule-group">
          <label>Niveaux d'entrée</label>
          <div class="checkbox-grid" id="rn-${f.id}">
            ${adminData.questions.find(q => q.id === 'q_niveau')?.choices.map(c =>
              `<label class="cb-label">
                <input type="checkbox" value="${c.id}" ${f.niveaux_entree.includes(c.id) ? 'checked' : ''}
                  onchange="updateRule('${f.id}', 'niveaux_entree', this)"> ${c.label}
              </label>`
            ).join('')}
          </div>
        </div>
      </div>
    `;
    container.appendChild(section);
  });
}

function updateRule(formationId, field, checkbox) {
  const f = adminData.formations.find(x => x.id === formationId);
  if (!f) return;

  if (checkbox.checked) {
    if (!f[field].includes(checkbox.value)) f[field].push(checkbox.value);
  } else {
    f[field] = f[field].filter(v => v !== checkbox.value);
  }

  saveData(adminData);
  toast('Règle mise à jour ✓');
}

// ── RESET ─────────────────────────────────────────────────────────────────────
function resetToDefaults() {
  if (!confirm('Réinitialiser toutes les données ? Cette action est irréversible.')) return;
  resetData();
  adminData = getData();
  renderTab(document.querySelector('.tab-btn.active').dataset.tab);
  toast('Données réinitialisées');
}
