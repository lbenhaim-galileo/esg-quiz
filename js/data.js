// ── DEFAULT DATA ─────────────────────────────────────────────────────────────
// This data is loaded on first visit. Modifications via the back office are
// saved to localStorage and take priority over these defaults.

const DEFAULT_DATA = {
  questions: [
    {
      id: "q_etudiant",
      step: 1,
      text: "Bienvenue ! Faisons connaissance. Êtes-vous actuellement étudiant(e) ?",
      type: "binary",
      choices: [
        { id: "oui", label: "Oui" },
        { id: "non", label: "Non" }
      ]
    },
    {
      id: "q_ville",
      step: 2,
      text: "Dans quelle ville souhaiteriez-vous le plus faire vos études ?",
      type: "chips",
      choices: [
        { id: "aix",        label: "Aix-en-Provence" },
        { id: "bordeaux",   label: "Bordeaux" },
        { id: "biarritz",   label: "Biarritz" },
        { id: "dijon",      label: "Dijon" },
        { id: "lyon",       label: "Lyon" },
        { id: "montpellier",label: "Montpellier" },
        { id: "nantes",     label: "Nantes" },
        { id: "rennes",     label: "Rennes" },
        { id: "rouen",      label: "Rouen" },
        { id: "strasbourg", label: "Strasbourg" },
        { id: "toulouse",   label: "Toulouse" },
        { id: "tours",      label: "Tours" }
      ]
    },
    {
      id: "q_niveau",
      step: 3,
      text: "Quel niveau de diplôme préparez-vous actuellement ?",
      type: "chips",
      choices: [
        { id: "bac",    label: "Lycée (Bac ou équivalent)" },
        { id: "bac1",   label: "Bac+1" },
        { id: "bac2",   label: "Bac+2" },
        { id: "bac3",   label: "Bac+3" },
        { id: "bac4",   label: "Bac+4" },
        { id: "bac5",   label: "Bac+5" },
        { id: "mba",    label: "MBA" },
        { id: "autre",  label: "Autre" }
      ]
    },
    {
      id: "q_domaine",
      step: 4,
      text: "Avez-vous une appétence pour un domaine de formation ?",
      type: "chips",
      choices: [
        { id: "commerce",     label: "Commerce et Marketing" },
        { id: "communication",label: "Communication" },
        { id: "rh",           label: "Ressources Humaines" },
        { id: "finance",      label: "Finance" },
        { id: "management",   label: "Gestion / Management" },
        { id: "immobilier",   label: "Immobilier" },
        { id: "sport",        label: "Sport" },
        { id: "luxe",         label: "Luxe" }
      ]
    }
  ],

  formations: [
    {
      id: "bachelor-management",
      titre: "Bachelor Management d’Entreprise",
      type: "Bachelor",
      description: "Une formation généraliste et opérationnelle qui vous prépare à piloter des projets, manager des équipes et comprendre les enjeux de l’entreprise moderne. Vous développez des compétences transversales en stratégie, gestion et leadership. Le programme allie cours magistraux, cas pratiques et alternance. Dipômés, vous êtes opérationnels dès la sortie dans tous les secteurs. Un tremplin vers nos Mastères spécialisés.",
      image: "",
      infos_cles: ["Bac+3", "Alternance disponible", "Titre RNCP niv. 6", "Stage en entreprise"],
      villes: ["bordeaux", "lyon", "nantes", "rennes", "strasbourg", "toulouse"],
      domaines: ["management", "commerce"],
      niveaux_entree: ["bac", "bac1", "bac2"]
    },
    {
      id: "bachelor-commerce",
      titre: "Bachelor Commerce et Marketing",
      type: "Bachelor",
      description: "Formez-vous aux techniques commerciales, à la stratégie marketing et au digital pour devenir un professionnel recherché sur le marché. Le programme couvre le marketing digital, la gestion de la relation client, la vente complexe et les nouveaux usages data. Des intervenants professionnels ancrés dans le milieu vous apportent leur expertise terrain. La promotion est volontairement à taille humaine pour un suivi personnalisé. Employabilité à 96% à 6 mois.",
      image: "",
      infos_cles: ["Bac+3", "100% Digital Ready", "Titre RNCP niv. 6", "Projets professionnels"],
      villes: ["bordeaux", "lyon", "nantes", "rennes", "strasbourg", "toulouse", "aix", "montpellier"],
      domaines: ["commerce", "communication"],
      niveaux_entree: ["bac", "bac1", "bac2"]
    },
    {
      id: "mastere-rh",
      titre: "Mastère Ressources Humaines",
      type: "Mastère",
      description: "Devenez un expert RH capable de piloter la politique sociale d’une organisation, recruter les talents et accompagner la transformation des entreprises. Ce Mastère en 2 ans forme les managers RH de demain avec une approche stratégique et humaine. Gestion des compétences, droit social, SIRH et marque employeur sont au cœur du programme. L’alternance est au centre du dispositif pédagogique. Débouchés : RRH, DRH, Talent Manager.",
      image: "",
      infos_cles: ["Bac+5", "Alternance", "Titre RNCP niv. 7", "Réseau ESG"],
      villes: ["bordeaux", "lyon", "nantes", "toulouse", "strasbourg", "rennes"],
      domaines: ["rh", "management"],
      niveaux_entree: ["bac3", "bac4"]
    },
    {
      id: "mba-business",
      titre: "MBA Business Development",
      type: "MBA",
      description: "Acquérez les compétences stratégiques pour piloter la croissance d’une entreprise à l’ère numérique. Ce MBA de haut niveau s’adresse aux professionnels souhaitant évoluer vers des fonctions de direction commerciale, de développement international ou d’entrepreneuriat. Cas réels, mises en situation, coaching individuel et accès au réseau alumni ESG. Programme intensif en 12 mois, disponible en initial ou en alternance. Titre RNCP niveau 7.",
      image: "",
      infos_cles: ["Bac+5/+6", "12 mois", "Titre RNCP niv. 7", "Réseau international"],
      villes: ["bordeaux", "lyon", "nantes", "toulouse", "strasbourg"],
      domaines: ["commerce", "management"],
      niveaux_entree: ["bac4", "bac5", "mba"]
    }
  ]
};

// ── DATA ACCESS ───────────────────────────────────────────────────────────────

function getData() {
  try {
    const stored = localStorage.getItem('esg_quiz_data');
    if (stored) return JSON.parse(stored);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData(data) {
  localStorage.setItem('esg_quiz_data', JSON.stringify(data));
}

function resetData() {
  localStorage.removeItem('esg_quiz_data');
}
