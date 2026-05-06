# CYB-Test — Checklist de sécurisation d'un Agent IA

> Site web statique permettant d'auditer la posture de sécurité d'un Agent IA sur la base des principaux référentiels du marché.

## Aperçu

CYB-Test est un questionnaire interactif organisé en **12 sections** et **75+ contrôles** couvrant l'ensemble du cycle de vie d'un agent autonome :

1. Gouvernance & cadre de risque
2. Intégrité du but de l'agent
3. Outils & moindre privilège
4. Identité & contrôle d'accès
5. Chaîne d'approvisionnement (MCP, plugins, modèles)
6. Exécution de code sandboxée
7. Mémoire & contexte
8. Communication inter-agents
9. Cascade & résilience
10. Supervision humaine & alignement
11. Données, sortie & confidentialité
12. Observabilité & journalisation

## Référentiels mobilisés

- **[OWASP Top 10 for Agentic Applications 2026](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/)** — ASI01 à ASI10 (publié décembre 2025)
- **[OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)** — LLM01 à LLM10
- **[NIST AI Risk Management Framework 1.0](https://www.nist.gov/itl/ai-risk-management-framework)** — fonctions Govern · Map · Measure · Manage
- **[NIST AI 600-1 — Generative AI Profile](https://doi.org/10.6028/NIST.AI.600-1)** — juillet 2024
- **[MITRE ATLAS](https://atlas.mitre.org/)** — Adversarial Threat Landscape for AI Systems
- **[ISO/IEC 42001:2023](https://www.iso.org/standard/81230.html)** — AI Management System

## Fonctionnalités

- ✅ Score pondéré par sévérité (Critique / Élevé / Moyen / Faible)
- ✅ Détection des contrôles critiques non conformes
- ✅ Notes libres par contrôle (preuves, owners, tickets Jira…)
- ✅ Sauvegarde automatique (localStorage — aucune donnée envoyée à un serveur)
- ✅ Export **JSON** (machine-readable) et **Markdown** (rapport prêt à partager)
- ✅ Import d'un audit existant (reprise de session, partage entre auditeurs)
- ✅ Mode impression / export PDF du navigateur
- ✅ 100 % statique — aucun back-end, aucun framework, aucune dépendance

## Démarrer

### En local

```bash
git clone https://github.com/royvinz/CYB-Test.git
cd CYB-Test
# Le plus simple : ouvrir index.html dans un navigateur.
# Ou servir avec n'importe quel serveur HTTP statique :
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

### Déploiement GitHub Pages

1. **Settings → Pages** sur le repo
2. Source : **Deploy from a branch**, branche `main` (ou `master`), dossier `/ (root)`
3. Le site sera disponible sur `https://royvinz.github.io/CYB-Test/`

## Structure

```
CYB-Test/
├── index.html               # Point d'entrée
├── assets/
│   ├── styles.css           # Theme console SOC, dark, monospace
│   ├── data.js              # Contenu du questionnaire (12 sections, 75+ contrôles)
│   └── app.js               # Logique : rendu, scoring, persistence, export
├── README.md
└── .gitignore
```

## Méthode de scoring

Chaque contrôle a un **niveau de sévérité** qui pondère sa contribution au score :

| Sévérité | Pondération |
| -------- | :---------: |
| Critique |     × 4     |
| Élevé    |     × 3     |
| Moyen    |     × 2     |
| Faible   |     × 1     |

Pour chaque contrôle, l'auditeur sélectionne un **statut** :

| Statut       | Score |
| ------------ | :---: |
| Conforme     | 1.0   |
| Partiel      | 0.5   |
| Manquant     | 0.0   |
| Non applicable | exclu du calcul |

Le score d'une section (et le score global) correspond à la moyenne pondérée des contrôles évalués (les "N/A" et les non-évalués étant exclus).

**Note importante** : un score élevé n'efface pas un critique non conforme. La barre latérale et le panneau global mettent toujours en évidence le nombre de contrôles critiques restant ouverts.

## Personnaliser

Le contenu du questionnaire vit dans `assets/data.js`. Pour ajouter, modifier ou retirer des contrôles, éditer simplement l'objet `QUESTIONNAIRE.sections[…].controls`. Format d'un contrôle :

```js
{
  id: "id-unique",
  severity: "critical" | "high" | "medium" | "low",
  text: "Énoncé du contrôle…",
  refs: ["OWASP-ASI: ASI01", "NIST-RMF: MAP-1.1", …]
}
```

Les préfixes de référence `OWASP-ASI`, `OWASP-LLM`, `NIST-RMF`, `NIST-600-1`, `MITRE-ATLAS`, `ISO-42001` sont reconnus par la feuille de styles et reçoivent une couleur dédiée.

## Licence

Le contenu du questionnaire et le code sont fournis à titre indicatif. Les référentiels cités sont la propriété de leurs éditeurs respectifs (OWASP, NIST, MITRE, ISO).

Voir `LICENSE` (à ajouter selon préférence).

## Avertissement

Cet outil est une **aide à l'évaluation**, pas un certificat de conformité. Les contrôles couvrent l'état de l'art à mai 2026 ; la sécurité des agents IA évolue rapidement — adapter et compléter en fonction du contexte spécifique de chaque agent.
