// ── GITHUB CONFIG ─────────────────────────────────────────────────────────────
const GITHUB_CONFIG = {
  owner:  'lbenhaim-galileo',
  repo:   'esg-quiz',
  branch: 'main'
};

// ── FALLBACK DATA (used when fetch fails, e.g. file:// protocol) ──────────────
const DEFAULT_QUESTIONS = [
  { id:"q_etudiant", step:1, text:"Bienvenue ! Faisons connaissance. Êtes-vous actuellement étudiant(e) ?", type:"binary",
    choices:[{id:"oui",label:"Oui"},{id:"non",label:"Non"}] },
  { id:"q_ville", step:2, text:"Dans quelle ville souhaiteriez-vous le plus faire vos études ?", type:"chips",
    choices:[{id:"aix",label:"Aix-en-Provence"},{id:"bordeaux",label:"Bordeaux"},{id:"biarritz",label:"Biarritz"},
             {id:"dijon",label:"Dijon"},{id:"lyon",label:"Lyon"},{id:"montpellier",label:"Montpellier"},
             {id:"nantes",label:"Nantes"},{id:"rennes",label:"Rennes"},{id:"rouen",label:"Rouen"},
             {id:"strasbourg",label:"Strasbourg"},{id:"toulouse",label:"Toulouse"},{id:"tours",label:"Tours"}] },
  { id:"q_niveau", step:3, text:"Quel niveau de diplôme préparez-vous actuellement ?", type:"chips",
    choices:[{id:"bac",label:"Lycée (Bac ou équivalent)"},{id:"bac1",label:"Bac+1"},{id:"bac2",label:"Bac+2"},
             {id:"bac3",label:"Bac+3"},{id:"bac4",label:"Bac+4"},{id:"bac5",label:"Bac+5"},
             {id:"mba",label:"MBA"},{id:"autre",label:"Autre"}] },
  { id:"q_domaine", step:4, text:"Avez-vous une appétence pour un domaine de formation ?", type:"chips",
    choices:[{id:"commerce",label:"Commerce et Marketing"},{id:"communication",label:"Communication"},
             {id:"rh",label:"Ressources Humaines"},{id:"finance",label:"Finance"},
             {id:"management",label:"Gestion / Management"},{id:"immobilier",label:"Immobilier"},
             {id:"sport",label:"Sport"},{id:"luxe",label:"Luxe"}] }
];

const DEFAULT_FORMATIONS = [
  { id:"bachelor-management", titre:"Bachelor Management d'Entreprise", type:"Bachelor",
    description:"Une formation généraliste et opérationnelle qui vous prépare à piloter des projets, manager des équipes et comprendre les enjeux de l'entreprise moderne.",
    image:"", infos_cles:["Bac+3","Alternance disponible","Titre RNCP niv. 6","Stage en entreprise"],
    villes:["bordeaux","lyon","nantes","rennes","strasbourg","toulouse"],
    domaines:["management","commerce"], niveaux_entree:["bac","bac1","bac2"] },
  { id:"bachelor-commerce", titre:"Bachelor Commerce et Marketing", type:"Bachelor",
    description:"Formez-vous aux techniques commerciales, à la stratégie marketing et au digital pour devenir un professionnel recherché sur le marché.",
    image:"", infos_cles:["Bac+3","100% Digital Ready","Titre RNCP niv. 6","Projets professionnels"],
    villes:["bordeaux","lyon","nantes","rennes","strasbourg","toulouse","aix","montpellier"],
    domaines:["commerce","communication"], niveaux_entree:["bac","bac1","bac2"] },
  { id:"mastere-rh", titre:"Mastère Ressources Humaines", type:"Mastère",
    description:"Devenez un expert RH capable de piloter la politique sociale d'une organisation, recruter les talents et accompagner la transformation des entreprises.",
    image:"", infos_cles:["Bac+5","Alternance","Titre RNCP niv. 7","Réseau ESG"],
    villes:["bordeaux","lyon","nantes","toulouse","strasbourg","rennes"],
    domaines:["rh","management"], niveaux_entree:["bac3","bac4"] },
  { id:"mba-business", titre:"MBA Business Development", type:"MBA",
    description:"Acquérez les compétences stratégiques pour piloter la croissance d'une entreprise à l'ère numérique.",
    image:"", infos_cles:["Bac+5/+6","12 mois","Titre RNCP niv. 7","Réseau international"],
    villes:["bordeaux","lyon","nantes","toulouse","strasbourg"],
    domaines:["commerce","management"], niveaux_entree:["bac4","bac5","mba"] }
];

// ── FETCH WITH FALLBACK ───────────────────────────────────────────────────────
async function loadQuestions() {
  try {
    const r = await fetch('data/questions.json?t=' + Date.now());
    if (r.ok) return await r.json();
  } catch(e) {}
  return DEFAULT_QUESTIONS;
}

async function loadFormations() {
  try {
    const r = await fetch('data/formations.json?t=' + Date.now());
    if (r.ok) return await r.json();
  } catch(e) {}
  return DEFAULT_FORMATIONS;
}

async function loadData() {
  const [questions, formations] = await Promise.all([loadQuestions(), loadFormations()]);
  return { questions, formations };
}

// ── GITHUB API PUSH ───────────────────────────────────────────────────────────
function getAdminToken() {
  return localStorage.getItem('esg_admin_token') || '';
}

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

async function pushJSONToGitHub(filename, data) {
  const token = getAdminToken();
  if (!token) throw new Error('Token GitHub manquant. Configurez-le dans l\'onglet Paramètres.');

  const path    = `data/${filename}`;
  const apiUrl  = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Accept':        'application/vnd.github.v3+json',
    'Content-Type':  'application/json'
  };

  // Get current SHA (required to update an existing file)
  let sha;
  try {
    const r = await fetch(apiUrl, { headers });
    if (r.ok) sha = (await r.json()).sha;
  } catch(e) {}

  const body = {
    message: `[back-office] Mise à jour ${filename}`,
    content: utf8ToBase64(JSON.stringify(data, null, 2)),
    branch:  GITHUB_CONFIG.branch,
    ...(sha ? { sha } : {})
  };

  const res = await fetch(apiUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Erreur API GitHub (${res.status})`);
  }
  return true;
}
