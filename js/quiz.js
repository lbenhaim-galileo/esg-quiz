// ── STATE ─────────────────────────────────────────────────────────────────────
const answers = {};
let currentStep = 0;
let questions = [];

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  questions = getData().questions;

  document.getElementById('btn-start').addEventListener('click', startQuiz);
  document.getElementById('contact-form').addEventListener('submit', handleContactSubmit);
});

function startQuiz() {
  currentStep = 0;
  Object.keys(answers).forEach(k => delete answers[k]);
  showScreen('screen-quiz');
  renderQuestion();
}

// ── SCREENS ───────────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ── QUESTION RENDER ───────────────────────────────────────────────────────────
function renderQuestion() {
  const q = questions[currentStep];
  const total = questions.length;

  // progress
  const pct = Math.round((currentStep / total) * 100);
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `Question ${currentStep + 1}/${total}`;

  const container = document.getElementById('question-container');
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'question-card';

  card.innerHTML = `
    <p class="question-number">Étape ${q.step} / ${total}</p>
    <h2 class="question-title">${q.text}</h2>
    <div class="choices-${q.type === 'binary' ? 'binary' : 'chips'}" id="choices"></div>
    <div class="question-nav">
      <button class="btn-next" id="btn-next" disabled>
        ${currentStep < total - 1 ? 'Suivant →' : 'Continuer →'}
      </button>
    </div>
  `;

  container.appendChild(card);

  const choicesEl = document.getElementById('choices');
  q.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn' + (q.type === 'binary' ? ' binary' : '');
    btn.textContent = choice.label;
    btn.dataset.value = choice.id;

    if (answers[q.id] === choice.id) btn.classList.add('selected');

    btn.addEventListener('click', () => selectChoice(q.id, choice.id, btn, choicesEl));
    choicesEl.appendChild(btn);
  });

  document.getElementById('btn-next').addEventListener('click', nextStep);

  // re-enable next if already answered
  if (answers[q.id]) document.getElementById('btn-next').disabled = false;
}

function selectChoice(qId, value, btn, container) {
  container.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  answers[qId] = value;
  document.getElementById('btn-next').disabled = false;
}

function nextStep() {
  currentStep++;
  if (currentStep >= questions.length) {
    showScreen('screen-contact');
  } else {
    renderQuestion();
  }
}

// ── CONTACT FORM ──────────────────────────────────────────────────────────────
function handleContactSubmit(e) {
  e.preventDefault();
  const contact = {
    prenom: document.getElementById('f-prenom').value.trim(),
    nom:    document.getElementById('f-nom').value.trim(),
    email:  document.getElementById('f-email').value.trim(),
    tel:    document.getElementById('f-tel').value.trim()
  };
  showResults(contact);
}

// ── MATCHING ──────────────────────────────────────────────────────────────────
function matchFormations() {
  const data = getData();
  const ville    = answers['q_ville']   || null;
  const niveau   = answers['q_niveau']  || null;
  const domaine  = answers['q_domaine'] || null;

  // Score each formation
  const scored = data.formations.map(f => {
    let score = 0;
    let matched = { ville: false, niveau: false, domaine: false };

    if (ville   && f.villes.includes(ville))            { score += 3; matched.ville   = true; }
    if (niveau  && f.niveaux_entree.includes(niveau))   { score += 3; matched.niveau  = true; }
    if (domaine && f.domaines.includes(domaine))        { score += 2; matched.domaine = true; }

    return { ...f, score, matched };
  });

  // Sort descending
  scored.sort((a, b) => b.score - a.score);

  // At least 1 criterion must match for a "good" result
  const good = scored.filter(f => f.score > 0);

  if (good.length === 0) return scored.slice(0, 1); // fallback: best guess
  return good.slice(0, 3);
}

// ── RESULTS ───────────────────────────────────────────────────────────────────
function showResults(contact) {
  showScreen('screen-results');

  const data = getData();
  const villeLabel = data.questions
    .find(q => q.id === 'q_ville')?.choices
    .find(c => c.id === answers['q_ville'])?.label || '';

  document.getElementById('results-subtitle').textContent =
    `Bonjour ${contact.prenom}, voici les formations ESG qui correspondent à votre profil${villeLabel ? ' à ' + villeLabel : ''}.`;

  const results = matchFormations();
  const list = document.getElementById('results-list');
  list.innerHTML = '';

  if (!results.length) {
    list.innerHTML = `<div class="no-result"><h3>Aucun résultat trouvé</h3><p>Contactez-nous directement pour un conseil personnalisé.</p></div>`;
    return;
  }

  results.forEach(f => {
    const card = document.createElement('div');
    card.className = 'result-card';

    const imgContent = f.image
      ? `<img src="${f.image}" alt="${f.titre}" style="width:100%;height:100%;object-fit:cover;">`
      : `<span style="font-size:2.5rem;opacity:.4">🎓</span>`;

    const keys = f.infos_cles.map(k => `<span class="result-key">${k}</span>`).join('');

    card.innerHTML = `
      <div class="result-image">${imgContent}</div>
      <div class="result-body">
        <span class="result-tag">${f.type}</span>
        <h3 class="result-name">${f.titre}</h3>
        <p class="result-desc">${f.description}</p>
        <div class="result-keys">${keys}</div>
      </div>
    `;
    list.appendChild(card);
  });
}

// ── RESTART ───────────────────────────────────────────────────────────────────
function restartQuiz() {
  showScreen('screen-landing');
}
