/* ============================================================
 * CYB-Test — Checklist de sécurisation d'un Agent IA
 * Référentiels :
 *   - OWASP Top 10 for Agentic Applications 2026 (ASI01–ASI10)
 *   - OWASP Top 10 for LLM Applications 2025 (LLM01–LLM10)
 *   - NIST AI RMF 1.0 (Govern / Map / Measure / Manage)
 *   - NIST AI 600-1 — Generative AI Profile (juillet 2024)
 *   - MITRE ATLAS
 *   - ISO/IEC 42001:2023 — AI Management System
 * ============================================================ */

const QUESTIONNAIRE = {
  meta: {
    title: "Checklist de sécurisation d'un Agent IA",
    version: "1.0.0",
    updated: "2026-05",
    standards: [
      { id: "OWASP-ASI", label: "OWASP Top 10 for Agentic Applications 2026", url: "https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/" },
      { id: "OWASP-LLM", label: "OWASP Top 10 for LLM Applications 2025", url: "https://genai.owasp.org/llm-top-10/" },
      { id: "NIST-RMF", label: "NIST AI Risk Management Framework 1.0", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
      { id: "NIST-600-1", label: "NIST AI 600-1 — Generative AI Profile", url: "https://doi.org/10.6028/NIST.AI.600-1" },
      { id: "MITRE-ATLAS", label: "MITRE ATLAS", url: "https://atlas.mitre.org/" },
      { id: "ISO-42001", label: "ISO/IEC 42001:2023 — AI Management System", url: "https://www.iso.org/standard/81230.html" }
    ]
  },

  sections: [
    /* ---------------------------------------------------------- */
    {
      id: "governance",
      number: "01",
      title: "Gouvernance & cadre de risque",
      lead: "Avant la première ligne de code, l'agent doit s'inscrire dans un cadre de gouvernance formalisé. Cas d'usage documenté, propriétaire désigné, seuils de risque définis.",
      icon: "shield",
      controls: [
        {
          id: "gov-01",
          severity: "critical",
          text: "Le cas d'usage de l'agent est formellement documenté : objectif, périmètre d'action, données accédées, parties prenantes.",
          refs: ["NIST-RMF: MAP-1.1", "NIST-600-1: MP-1.1", "ISO-42001: 6.1.2"]
        },
        {
          id: "gov-02",
          severity: "critical",
          text: "Un propriétaire (business owner) et un responsable sécurité IA sont nommés, avec leurs responsabilités décrites par écrit.",
          refs: ["NIST-RMF: GOVERN-2.1", "ISO-42001: 5.3"]
        },
        {
          id: "gov-03",
          severity: "high",
          text: "Une analyse de risques spécifique à l'agent a été conduite (impact métier, conformité, sécurité, éthique) et tient compte des risques agentiques (autonomie, action sur le monde réel).",
          refs: ["NIST-RMF: MAP-5.1", "NIST-600-1: MP-5.1", "ISO-42001: 6.1.2"]
        },
        {
          id: "gov-04",
          severity: "high",
          text: "Des seuils de risque acceptable et inacceptable sont définis (ex. plafond financier d'une action, périmètre des données traitées) avec un processus d'arbitrage.",
          refs: ["NIST-RMF: GOVERN-1.3", "NIST-RMF: MANAGE-1.3"]
        },
        {
          id: "gov-05",
          severity: "high",
          text: "Une politique d'usage interdit explicitement les domaines sensibles non autorisés (CBRN, exfiltration, social engineering, etc.) et définit le comportement attendu en cas de demande de ce type.",
          refs: ["NIST-600-1: GV-1.1", "NIST-600-1: MP-2.3"]
        },
        {
          id: "gov-06",
          severity: "medium",
          text: "Un processus de revue périodique (≥ trimestrielle) de la posture de sécurité de l'agent est en place, avec revue des incidents et des dérives observées.",
          refs: ["NIST-RMF: MANAGE-4.1", "ISO-42001: 9.3"]
        },
        {
          id: "gov-07",
          severity: "medium",
          text: "Les obligations réglementaires applicables (EU AI Act, RGPD, sectorielles) ont été identifiées et le niveau de risque selon l'AI Act a été classifié.",
          refs: ["NIST-RMF: GOVERN-1.1", "ISO-42001: 4.2"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "goal-integrity",
      number: "02",
      title: "Intégrité du but de l'agent",
      lead: "Empêcher qu'un attaquant ne détourne les objectifs de l'agent via du contenu externe (prompt injection directe ou indirecte).",
      icon: "target",
      controls: [
        {
          id: "goal-01",
          severity: "critical",
          text: "Tout contenu externe ingéré par l'agent (e-mails, documents, pages web, calendriers, résultats d'outils) est traité comme non fiable et délimité du prompt système.",
          refs: ["OWASP-ASI: ASI01", "OWASP-LLM: LLM01", "MITRE-ATLAS: AML.T0051"]
        },
        {
          id: "goal-02",
          severity: "critical",
          text: "Le prompt système et les instructions fondamentales sont protégés contre l'écrasement par une entrée utilisateur ou par le contenu d'un outil.",
          refs: ["OWASP-ASI: ASI01", "OWASP-LLM: LLM07"]
        },
        {
          id: "goal-03",
          severity: "high",
          text: "Les instructions cachées (caractères Unicode invisibles, ASCII smuggling, balises HTML masquées) sont détectées et neutralisées avant ingestion.",
          refs: ["OWASP-ASI: ASI01", "OWASP-LLM: LLM01"]
        },
        {
          id: "goal-04",
          severity: "high",
          text: "Des fichiers de configuration auto-chargés (AGENTS.md, README, .vscode/settings.json, .cursor/mcp.json…) ne sont jamais traités comme des instructions de confiance sans revue humaine.",
          refs: ["OWASP-ASI: ASI01", "OWASP-ASI: ASI05"]
        },
        {
          id: "goal-05",
          severity: "high",
          text: "Un détecteur d'anomalie comportementale alerte si l'agent s'éloigne de son objectif initial (changement de tâche soudain, requêtes inattendues, exfiltration).",
          refs: ["OWASP-ASI: ASI01", "NIST-RMF: MEASURE-2.6"]
        },
        {
          id: "goal-06",
          severity: "medium",
          text: "L'agent confirme explicitement à l'utilisateur l'action qu'il s'apprête à réaliser quand celle-ci provient d'une source externe (ex. lien dans un e-mail).",
          refs: ["OWASP-ASI: ASI01", "OWASP-ASI: ASI09"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "tools-privilege",
      number: "03",
      title: "Outils & moindre privilège",
      lead: "Chaque outil exposé à l'agent est une porte d'entrée. Réduire au strict minimum, valider chaque appel, exiger une approbation pour les actions destructives.",
      icon: "tool",
      controls: [
        {
          id: "tool-01",
          severity: "critical",
          text: "Chaque outil disposé à l'agent dispose d'un périmètre minimal (least privilege) : pas d'accès en écriture par défaut, pas d'API broad-scope.",
          refs: ["OWASP-ASI: ASI02", "OWASP-LLM: LLM06"]
        },
        {
          id: "tool-02",
          severity: "critical",
          text: "Les opérations destructives ou irréversibles (suppression, paiement, envoi externe, modification de production) exigent une approbation humaine explicite, hors session.",
          refs: ["OWASP-ASI: ASI02", "OWASP-LLM: LLM06", "OWASP-ASI: ASI09"]
        },
        {
          id: "tool-03",
          severity: "high",
          text: "Les arguments des outils sont validés (schéma, types, plages, listes blanches) avant exécution — l'agent ne peut pas inventer un paramètre arbitraire.",
          refs: ["OWASP-ASI: ASI02", "OWASP-LLM: LLM06"]
        },
        {
          id: "tool-04",
          severity: "high",
          text: "Un mode \"auto-approve all\" / \"YOLO mode\" / \"--trust-all-tools\" est désactivé en production et ne peut pas être activé par le contenu d'un fichier ou d'un outil.",
          refs: ["OWASP-ASI: ASI02", "OWASP-ASI: ASI05"]
        },
        {
          id: "tool-05",
          severity: "high",
          text: "Des limites de débit (rate limits) et des plafonds (nombre d'appels, montant cumulé, volume de données) sont appliqués par outil et par session.",
          refs: ["OWASP-ASI: ASI02", "OWASP-LLM: LLM10"]
        },
        {
          id: "tool-06",
          severity: "medium",
          text: "Un inventaire exhaustif des outils accessibles à chaque agent est tenu à jour et révisé à chaque déploiement.",
          refs: ["OWASP-ASI: ASI02", "ISO-42001: 8.2"]
        },
        {
          id: "tool-07",
          severity: "medium",
          text: "Les outils sensibles ne sont activés que pour les agents qui en ont strictement besoin (séparation des rôles).",
          refs: ["OWASP-ASI: ASI02", "OWASP-ASI: ASI03"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "identity-access",
      number: "04",
      title: "Identité & contrôle d'accès",
      lead: "Un agent compromis hérite des droits qu'on lui a confiés. Les agents doivent être traités comme des identités first-class avec credentials scopés et de courte durée.",
      icon: "key",
      controls: [
        {
          id: "id-01",
          severity: "critical",
          text: "L'agent dispose d'une identité technique distincte (service account / non-human identity) — pas d'usurpation des credentials d'un utilisateur réel.",
          refs: ["OWASP-ASI: ASI03"]
        },
        {
          id: "id-02",
          severity: "critical",
          text: "Les credentials de l'agent sont stockés dans un coffre dédié (vault, KMS) — jamais dans le code, les variables d'environnement non protégées ou la mémoire conversationnelle.",
          refs: ["OWASP-ASI: ASI03", "OWASP-LLM: LLM02"]
        },
        {
          id: "id-03",
          severity: "high",
          text: "Les credentials sont à courte durée de vie (rotation automatique, jetons OAuth scopés, durée < 24h pour les opérations sensibles).",
          refs: ["OWASP-ASI: ASI03"]
        },
        {
          id: "id-04",
          severity: "high",
          text: "Le principe du \"on-behalf-of\" est implémenté : l'agent agit avec les droits de l'utilisateur final, pas avec un compte applicatif sur-privilégié.",
          refs: ["OWASP-ASI: ASI03", "OWASP-LLM: LLM06"]
        },
        {
          id: "id-05",
          severity: "high",
          text: "Aucun agent n'est exposé publiquement par défaut — l'authentification est exigée, et les agents \"public-by-default\" sont identifiés et corrigés.",
          refs: ["OWASP-ASI: ASI03"]
        },
        {
          id: "id-06",
          severity: "medium",
          text: "Les flux d'OAuth / consentement de l'agent sont audités régulièrement (qui a consenti à quoi, sur quels scopes).",
          refs: ["OWASP-ASI: ASI03"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "supply-chain",
      number: "05",
      title: "Chaîne d'approvisionnement (MCP, plugins, modèles)",
      lead: "Les serveurs MCP, plugins, dépendances et modèles tiers sont autant de points de compromission. Le runtime trust problem doit être traité.",
      icon: "link",
      controls: [
        {
          id: "sc-01",
          severity: "critical",
          text: "Chaque serveur MCP / plugin / outil tiers est vérifié (source, signature, éditeur) avant d'être autorisé.",
          refs: ["OWASP-ASI: ASI04", "OWASP-LLM: LLM03"]
        },
        {
          id: "sc-02",
          severity: "critical",
          text: "Les définitions de serveur MCP sont versionnées et tout changement post-approbation déclenche une revue (cas type : MCPoison / CVE-2025-54136).",
          refs: ["OWASP-ASI: ASI04", "OWASP-ASI: ASI05"]
        },
        {
          id: "sc-03",
          severity: "high",
          text: "Les dépendances (npm, pip, crates) sont épinglées à des versions vérifiées et scannées (SBOM, AIBOM).",
          refs: ["OWASP-ASI: ASI04", "OWASP-LLM: LLM03"]
        },
        {
          id: "sc-04",
          severity: "high",
          text: "Les modèles utilisés (poids, fine-tunes, embeddings) proviennent de sources de confiance et sont vérifiés (intégrité, provenance, licence).",
          refs: ["OWASP-LLM: LLM03", "OWASP-LLM: LLM04", "NIST-600-1: GV-6.1"]
        },
        {
          id: "sc-05",
          severity: "high",
          text: "L'agent n'est pas autorisé à charger dynamiquement des outils, MCP ou plugins non listés dans une liste blanche.",
          refs: ["OWASP-ASI: ASI04"]
        },
        {
          id: "sc-06",
          severity: "medium",
          text: "Une AIBOM (AI Bill of Materials) est générée et tenue à jour pour l'agent et son écosystème.",
          refs: ["OWASP-ASI: ASI04", "ISO-42001: 8.3"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "code-execution",
      number: "06",
      title: "Exécution de code sandboxée",
      lead: "L'exécution de code est une fonctionnalité, pas un bug. Elle doit être strictement isolée de l'environnement hôte et des données sensibles.",
      icon: "terminal",
      controls: [
        {
          id: "exec-01",
          severity: "critical",
          text: "Le code généré par l'agent s'exécute dans un sandbox isolé (conteneur jetable, VM, Firecracker, gVisor) — pas sur l'hôte de l'utilisateur ou un poste de production.",
          refs: ["OWASP-ASI: ASI05"]
        },
        {
          id: "exec-02",
          severity: "critical",
          text: "Le sandbox n'a pas d'accès réseau par défaut ; l'accès Internet sortant nécessite une justification explicite et une liste blanche.",
          refs: ["OWASP-ASI: ASI05", "OWASP-ASI: ASI04"]
        },
        {
          id: "exec-03",
          severity: "high",
          text: "Le filesystem du sandbox est cloisonné des données sensibles (secrets, autres projets, home directory de l'utilisateur).",
          refs: ["OWASP-ASI: ASI05", "OWASP-LLM: LLM02"]
        },
        {
          id: "exec-04",
          severity: "high",
          text: "Toute commande système touchant à un service externe (DB, cloud, déploiement) exige une validation humaine, même en mode développeur.",
          refs: ["OWASP-ASI: ASI05", "OWASP-ASI: ASI02"]
        },
        {
          id: "exec-05",
          severity: "medium",
          text: "Les ressources du sandbox sont plafonnées (CPU, mémoire, durée d'exécution, volume disque).",
          refs: ["OWASP-ASI: ASI05", "OWASP-LLM: LLM10"]
        },
        {
          id: "exec-06",
          severity: "medium",
          text: "L'historique d'exécution est journalisé avec les commandes, les diffs de fichiers et les sorties pour audit forensique.",
          refs: ["OWASP-ASI: ASI05", "NIST-RMF: MEASURE-2.7"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "memory-context",
      number: "07",
      title: "Mémoire & contexte",
      lead: "La mémoire est un attribut puissant — et une surface d'attaque persistante. Une injection réussie peut survivre à la session et corrompre les suivantes.",
      icon: "brain",
      controls: [
        {
          id: "mem-01",
          severity: "critical",
          text: "Les écritures en mémoire long terme sont traitées comme des opérations sensibles : provenance tracée, validation, et confirmation explicite si demandé par une source externe.",
          refs: ["OWASP-ASI: ASI06"]
        },
        {
          id: "mem-02",
          severity: "high",
          text: "La mémoire conversationnelle ne stocke jamais de secrets (clés API, tokens, mots de passe, données financières) — un filtre PII/secret est appliqué en écriture.",
          refs: ["OWASP-LLM: LLM02", "OWASP-ASI: ASI06"]
        },
        {
          id: "mem-03",
          severity: "high",
          text: "Une expiration / TTL est appliquée aux mémoires sensibles, et l'utilisateur peut consulter, modifier et supprimer ce que l'agent retient de lui.",
          refs: ["OWASP-ASI: ASI06", "NIST-600-1: MS-2.10"]
        },
        {
          id: "mem-04",
          severity: "high",
          text: "La base vectorielle / RAG est sécurisée : authentification, chiffrement au repos, contrôle d'accès par tenant, validation des contenus indexés.",
          refs: ["OWASP-LLM: LLM08", "OWASP-LLM: LLM04"]
        },
        {
          id: "mem-05",
          severity: "medium",
          text: "Un audit régulier de la mémoire de l'agent détecte les croyances corrompues ou les faits incohérents (sleeper agent detection).",
          refs: ["OWASP-ASI: ASI06", "OWASP-ASI: ASI10"]
        },
        {
          id: "mem-06",
          severity: "medium",
          text: "Les invitations calendrier, e-mails et documents partagés ne peuvent pas écrire en mémoire long terme sans approbation humaine.",
          refs: ["OWASP-ASI: ASI06", "OWASP-ASI: ASI01"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "inter-agent",
      number: "08",
      title: "Communication inter-agents",
      lead: "Dans un système multi-agents, la confiance par défaut entre agents est un anti-pattern. Auth, intégrité et signature sont essentiels.",
      icon: "network",
      controls: [
        {
          id: "ia-01",
          severity: "critical",
          text: "Les communications entre agents sont authentifiées (mTLS, signatures, AgentCards cryptographiques) — pas de confiance implicite.",
          refs: ["OWASP-ASI: ASI07"]
        },
        {
          id: "ia-02",
          severity: "high",
          text: "L'intégrité des messages inter-agents est vérifiée (hash, signature) pour détecter une injection ou un agent session smuggling.",
          refs: ["OWASP-ASI: ASI07"]
        },
        {
          id: "ia-03",
          severity: "high",
          text: "Le périmètre d'action d'un agent ne peut pas être étendu par un autre agent (delegation boundary explicite, pas de privilege amplification).",
          refs: ["OWASP-ASI: ASI07", "OWASP-ASI: ASI03"]
        },
        {
          id: "ia-04",
          severity: "high",
          text: "Aucun agent n'est exposé par défaut à tous les autres agents (cas type : Copilot Studio Connected Agents) — les liens sont explicites et auditables.",
          refs: ["OWASP-ASI: ASI07", "OWASP-ASI: ASI03"]
        },
        {
          id: "ia-05",
          severity: "medium",
          text: "Les schémas de messages inter-agents sont strictement typés ; les instructions en langage naturel arbitraires entre agents sont proscrites pour les actions critiques.",
          refs: ["OWASP-ASI: ASI07"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "cascade-resilience",
      number: "09",
      title: "Cascade & résilience",
      lead: "Un agent compromis empoisonne ses voisins. Disjoncteurs, blast radius caps et tests en jumeau numérique sont obligatoires.",
      icon: "shield-alert",
      controls: [
        {
          id: "csc-01",
          severity: "critical",
          text: "Des disjoncteurs (circuit breakers) interrompent une chaîne d'agents en cas d'anomalie (taux d'erreur, comportement déviant, volume inhabituel).",
          refs: ["OWASP-ASI: ASI08"]
        },
        {
          id: "csc-02",
          severity: "high",
          text: "Un blast radius cap est défini pour chaque agent : nombre max d'actions, plafond financier, périmètre des systèmes impactables.",
          refs: ["OWASP-ASI: ASI08", "NIST-RMF: MANAGE-1.3"]
        },
        {
          id: "csc-03",
          severity: "high",
          text: "Les scénarios de cascade ont été testés dans un environnement isolé (digital twin / staging) avant la mise en production.",
          refs: ["OWASP-ASI: ASI08", "NIST-RMF: MEASURE-1.3"]
        },
        {
          id: "csc-04",
          severity: "medium",
          text: "L'agent peut être mis en quarantaine ou désactivé par un opérateur sans nécessiter de redéploiement.",
          refs: ["OWASP-ASI: ASI08", "OWASP-ASI: ASI10"]
        },
        {
          id: "csc-05",
          severity: "medium",
          text: "Les dépendances entre agents sont cartographiées (qui appelle qui, qui peut influencer qui).",
          refs: ["OWASP-ASI: ASI08", "OWASP-ASI: ASI07"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "human-oversight",
      number: "10",
      title: "Supervision humaine & alignement",
      lead: "Le human-in-the-loop n'est efficace que si l'humain peut vraiment juger. Couvre la lutte contre la confiance excessive et la dérive d'alignement.",
      icon: "user-check",
      controls: [
        {
          id: "hu-01",
          severity: "critical",
          text: "Pour les décisions à fort impact (financier, juridique, médical, sécuritaire), une vérification humaine indépendante est requise — pas un simple bouton \"OK\".",
          refs: ["OWASP-ASI: ASI09", "NIST-RMF: GOVERN-3.2"]
        },
        {
          id: "hu-02",
          severity: "critical",
          text: "Un kill switch est en place : auditable, isolé, capable de désactiver immédiatement l'agent quel que soit son état.",
          refs: ["OWASP-ASI: ASI10"]
        },
        {
          id: "hu-03",
          severity: "high",
          text: "L'agent communique sa confiance / incertitude sur ses recommandations et signale quand il sort de son périmètre d'expertise.",
          refs: ["OWASP-ASI: ASI09", "NIST-600-1: MS-2.5"]
        },
        {
          id: "hu-04",
          severity: "high",
          text: "Les utilisateurs sont formés à questionner les recommandations de l'agent, en particulier sur les sujets YMYL (Your Money / Your Life).",
          refs: ["OWASP-ASI: ASI09", "NIST-600-1: GV-3.2"]
        },
        {
          id: "hu-05",
          severity: "high",
          text: "Une supervision comportementale continue détecte les dérives d'alignement (reward hacking, optimisation perverse, suppression de feedback négatif).",
          refs: ["OWASP-ASI: ASI10", "NIST-RMF: MEASURE-2.6"]
        },
        {
          id: "hu-06",
          severity: "medium",
          text: "Les fonctions de récompense / objectifs de l'agent sont régulièrement auditées pour détecter les optimisations contre-productives.",
          refs: ["OWASP-ASI: ASI10"]
        },
        {
          id: "hu-07",
          severity: "medium",
          text: "L'utilisateur final est clairement informé qu'il interagit avec une IA et peut basculer vers un humain pour les sujets sensibles.",
          refs: ["NIST-600-1: GV-5.1", "ISO-42001: 8.4"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "data-output",
      number: "11",
      title: "Données, sortie & confidentialité",
      lead: "L'agent voit, manipule et restitue de la donnée. Filtrer en entrée, en sortie, et empêcher les fuites par les outils.",
      icon: "lock",
      controls: [
        {
          id: "do-01",
          severity: "critical",
          text: "Les données sensibles (PII, secrets, données médicales / financières) sont masquées ou redactées avant d'atteindre le modèle, sauf nécessité métier justifiée.",
          refs: ["OWASP-LLM: LLM02", "NIST-600-1: MS-2.10"]
        },
        {
          id: "do-02",
          severity: "critical",
          text: "Les sorties de l'agent qui sont consommées par un autre système (HTML, SQL, shell, e-mail) sont validées / échappées pour empêcher l'injection en aval.",
          refs: ["OWASP-LLM: LLM05"]
        },
        {
          id: "do-03",
          severity: "high",
          text: "Un filtre de sortie détecte et bloque les fuites : exfiltration via lien, image markdown, contenu Unicode invisible, payload encodé.",
          refs: ["OWASP-LLM: LLM02", "OWASP-ASI: ASI01"]
        },
        {
          id: "do-04",
          severity: "high",
          text: "Le système prompt et les instructions internes ne sont pas révélés en clair (system prompt leakage).",
          refs: ["OWASP-LLM: LLM07"]
        },
        {
          id: "do-05",
          severity: "high",
          text: "La conformité RGPD est traitée : finalité, base légale, durée de conservation, droit d'accès / d'effacement applicables aux données traitées par l'agent.",
          refs: ["NIST-600-1: MS-2.10"]
        },
        {
          id: "do-06",
          severity: "medium",
          text: "L'agent ne mélange pas les données entre tenants / utilisateurs (cross-tenant isolation explicitement testée).",
          refs: ["OWASP-LLM: LLM02", "OWASP-ASI: ASI03"]
        },
        {
          id: "do-07",
          severity: "medium",
          text: "Les hallucinations sur des sujets factuels critiques sont mitigées (RAG, citations, vérification croisée) et signalées.",
          refs: ["OWASP-LLM: LLM09", "NIST-600-1: MP-2.3"]
        }
      ]
    },

    /* ---------------------------------------------------------- */
    {
      id: "observability",
      number: "12",
      title: "Observabilité & journalisation",
      lead: "On ne sécurise pas ce qu'on ne voit pas. Logs détaillés, traces, métriques et red teaming continu.",
      icon: "activity",
      controls: [
        {
          id: "obs-01",
          severity: "critical",
          text: "Tous les prompts entrants, appels d'outils, réponses, et accès mémoire sont journalisés avec corrélation (trace ID) et conservés assez longtemps pour une investigation.",
          refs: ["NIST-RMF: MEASURE-2.7", "OWASP-ASI: ASI08"]
        },
        {
          id: "obs-02",
          severity: "high",
          text: "Les logs sont protégés en intégrité (append-only, signature) et l'agent ne peut pas les modifier — éviter le log poisoning (cas OpenClaw).",
          refs: ["OWASP-ASI: ASI06", "NIST-RMF: MEASURE-2.7"]
        },
        {
          id: "obs-03",
          severity: "high",
          text: "Des alertes temps réel sont définies sur les indicateurs clés : pic d'appels d'outils, exfiltration, accès anormal, échec d'authentification, escalade de privilège.",
          refs: ["OWASP-ASI: ASI02", "OWASP-ASI: ASI08"]
        },
        {
          id: "obs-04",
          severity: "high",
          text: "Des exercices de red teaming (incluant prompt injection, jailbreak, abus d'outils, scénarios multi-agents) sont menés régulièrement et leurs résultats remontés au RACI.",
          refs: ["NIST-RMF: MEASURE-2.7", "MITRE-ATLAS"]
        },
        {
          id: "obs-05",
          severity: "medium",
          text: "Un processus de gestion d'incident dédié à l'agent existe : détection, contention, éradication, post-mortem, leçons apprises.",
          refs: ["NIST-RMF: MANAGE-4.1", "ISO-42001: 8.5"]
        },
        {
          id: "obs-06",
          severity: "medium",
          text: "Les métriques de qualité (taux d'hallucination, refus injustifié, satisfaction) sont suivies en continu et corrélées aux changements de modèle / prompt.",
          refs: ["NIST-RMF: MEASURE-2.6", "NIST-600-1: MS-2.5"]
        }
      ]
    }
  ]
};

/* Niveaux de sévérité — pondération pour le score */
const SEVERITY_WEIGHT = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

const SEVERITY_LABEL = {
  critical: "Critique",
  high: "Élevé",
  medium: "Moyen",
  low: "Faible"
};

/* Statuts disponibles pour chaque contrôle */
const STATUS_OPTIONS = [
  { id: "compliant", label: "Conforme", score: 1.0, color: "var(--ok)" },
  { id: "partial",   label: "Partiel",  score: 0.5, color: "var(--warn)" },
  { id: "missing",   label: "Manquant", score: 0.0, color: "var(--bad)" },
  { id: "na",        label: "N/A",      score: null, color: "var(--muted)" }
];
