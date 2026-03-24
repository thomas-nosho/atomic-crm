# Analyse du fork nosho-crm vs marmelab/atomic-crm

**Date d'analyse :** 2026-03-24
**Point de divergence :** commit `1605ccc` upstream = `62da3c8` nosho
**Commit de référence :** `Merge pull request #197 from marmelab/fix-registry.json` (2026-03-06)

---

## Statistiques

| Métrique | Valeur |
|---|---|
| Commits nosho depuis le fork | **51** |
| Commits upstream depuis le fork | **195** |
| Fichiers modifiés par nosho | **150** |
| Fichiers modifiés par upstream | **209** |
| Fichiers en conflit potentiel | **70** |
| Fichiers safe (nosho uniquement) | **80** |
| Fichiers upstream uniquement (non touchés par nosho) | **139** |

---

## Contexte : la tension architecturale principale

Upstream a construit un **système i18n bi-langue** (EN/FR) propre :
- `providers/commons/i18nProvider.ts` (nouveau fichier)
- `providers/commons/englishCrmMessages.ts`
- `providers/commons/frenchCrmMessages.ts`
- Détection automatique de la langue du navigateur

Nosho a **traduit directement** tout le code en français via `root/i18nProvider.tsx`.

Ces deux approches sont incompatibles sur le plan structurel. C'est le conflit le plus profond du fork.

---

## 1. Fichiers modifiés UNIQUEMENT par nosho (safe — 80 fichiers)

Ces fichiers peuvent être conservés tels quels lors d'un rebase.

### Infrastructure / Déploiement (safe)

| Fichier | Nature de la modification |
|---|---|
| `Dockerfile` | Ajout pour déploiement Coolify |
| `nginx.conf` | Configuration Nginx pour Coolify |
| `.env.development.example` | Variables d'env Nosho |
| `supabase/config.toml` | Configuration Supabase adaptée |
| `supabase/functions/.env.example` | Variables d'env edge functions |

### Assets / Branding (safe)

| Fichier | Nature de la modification |
|---|---|
| `public/appIcon/*.png` (44 fichiers) | Icônes Nosho CRM (toutes tailles) |
| `public/favicon.ico` | Favicon Nosho |
| `public/logos/logo_atomic_crm_dark.svg` | Logo Nosho mode sombre |
| `public/logos/logo_atomic_crm_light.svg` | Logo Nosho mode clair |
| `public/manifest.json` | PWA manifest Nosho |

### Nouvelles fonctionnalités Nosho uniquement (safe)

| Fichier | Fonctionnalité |
|---|---|
| `src/components/atomic-crm/google/GoogleOAuthCallback.tsx` | Callback OAuth Google |
| `src/components/atomic-crm/google/types.ts` | Types Google API |
| `src/components/atomic-crm/google/useGoogleConnectionStatus.ts` | Hook état connexion Google |
| `src/components/atomic-crm/google/useGooglePreferences.ts` | Hook préférences Google |
| `src/components/atomic-crm/contacts/ContactCalendarEvents.tsx` | Événements calendrier dans contact |
| `src/components/atomic-crm/contacts/ContactEmailHistory.tsx` | Historique Gmail dans contact |
| `src/components/atomic-crm/dashboard/ActiveDeals.tsx` | Widget deals actifs dashboard |
| `src/components/atomic-crm/dashboard/Dashboard.tsx` | Dashboard refonte Bento Grid |
| `src/components/atomic-crm/dashboard/KPICards.tsx` | Cartes KPI dashboard |
| `src/components/atomic-crm/dashboard/NoshoAIAssist.tsx` | Widget IA Nosho |
| `src/components/atomic-crm/dashboard/TasksListFilter.tsx` | Filtre tâches dashboard |
| `src/components/atomic-crm/dashboard/UpcomingCalendarEvents.tsx` | Widget événements à venir |
| `src/components/atomic-crm/dashboard/Welcome.tsx` | Widget de bienvenue |
| `src/components/atomic-crm/deals/CreateViewDialog.tsx` | Dialog création vue personnalisée |
| `src/components/atomic-crm/deals/DealCreate.tsx` | Création opportunité |
| `src/components/atomic-crm/deals/DealListContent.tsx` | Contenu liste opportunités |
| `src/components/atomic-crm/deals/DealListForView.tsx` | Liste deals par vue personnalisée |
| `src/components/atomic-crm/layout/Layout.tsx` | Layout principal |
| `src/components/atomic-crm/companies/sizes.ts` | Tailles d'entreprise (secteur santé FR) |
| `src/components/atomic-crm/sales/SalesInputs.tsx` | Champs formulaire commercial |
| `src/components/atomic-crm/settings/ConnectorsPage.tsx` | Page connecteurs (Google, etc.) |
| `src/main.tsx` | Point d'entrée (Sentry init) |
| `src/sentry.ts` | Configuration Sentry |

### Migrations Supabase Nosho (safe)

| Fichier | Description |
|---|---|
| `supabase/migrations/20260312120000_companies_type.sql` | Champ `type` sur companies |
| `supabase/migrations/20260312130000_deals_trial_start_date.sql` | Champ `trial_start_date` |
| `supabase/migrations/20260317120000_accent_insensitive_search.sql` | Recherche sans accents |
| `supabase/migrations/20260318120000_fix_companies_summary_search_columns.sql` | Fix colonnes _search |
| `supabase/migrations/20260318130000_google_oauth_tokens.sql` | Table tokens OAuth Google |
| `supabase/migrations/20260320120000_import_partners.sql` | Import 74 partenaires |

### Edge Functions Nosho (safe — nouvelles fonctions)

| Fichier | Description |
|---|---|
| `supabase/functions/google-oauth/index.ts` | Initiation OAuth Google |
| `supabase/functions/google-calendar/index.ts` | Sync Google Calendar |
| `supabase/functions/google-contacts-sync/index.ts` | Sync Google Contacts |
| `supabase/functions/google-gmail/index.ts` | Lecture Gmail |
| `supabase/functions/_shared/googleAuth.ts` | Auth partagée Google |
| `supabase/functions/_shared/authentication.ts` | Auth middleware Supabase |

---

## 2. Fichiers à risque de conflit (70 fichiers)

### Recommandation : **Garder nosho**

Ces fichiers ont été transformés en profondeur par nosho de manière intentionnelle et définitive.

| Fichier | Raison de garder nosho | Modification upstream à récupérer |
|---|---|---|
| `.github/workflows/deploy.yml` | Nosho a complètement réécrit pour Coolify ; upstream garde GitHub Pages/Vercel | Aucune (architectures incompatibles) |
| `README.md` | Rebranding complet Nosho CRM (FR) | Aucune (sections e2e non pertinentes) |
| `index.html` | Titre "Nosho CRM" | Aucune (changement mineur) |
| `.claude/launch.json` | Nosho a deux configs (dev + preview) ; upstream n'en a qu'une | Aucune |
| `src/components/atomic-crm/login/LoginPage.tsx` | Refonte complète du design Nosho | Aucune |
| `src/components/atomic-crm/root/defaultConfiguration.ts` | Secteurs médicaux FR, pipeline santé, catégories spécialisées | Ajouter `defaultCurrency = "EUR"` |

---

### Recommandation : **Merger manuellement** (46 fichiers)

#### Groupe A — Conflits faciles (changements non-chevauchants)

| Fichier | Nosho a ajouté | Upstream a ajouté | Stratégie |
|---|---|---|---|
| `src/components/atomic-crm/types.ts` | `trial_start_date?: string` dans `Deal` | Fix `sales_id?: Identifier` (suppression `null`) | Appliquer les deux changements |
| `src/components/atomic-crm/root/ConfigurationContext.tsx` | Interface `CustomView`, hook `useCustomViewsStore` | Champ `currency: string` dans l'interface | Ajouter `currency` à côté des ajouts nosho |
| `vite.config.ts` | Proxy Sentry, variables env Nosho | `VITE_ATTACHMENTS_BUCKET` env var | Fusionner les deux blocs de config |
| `.gitignore` | Ignore `.env.development`, change règle `.env` fonctions | Ajout dossiers playwright/e2e | Combiner les deux |
| `supabase/functions/update_password/index.ts` | Adaptation auth Nosho | Corrections upstream | Partir de nosho, appliquer le patch upstream |

#### Groupe B — Conflits i18n (la majorité des composants)

Upstream a systématiquement remplacé les chaînes hardcodées anglaises par des **clés de traduction** (`translate("resources.deals.fields.name")`). Nosho avait traduit directement en français.

**La bonne stratégie** : adopter l'architecture i18n upstream (clés de traduction), et brancher les messages français de nosho dans `frenchCrmMessages.ts`.

Fichiers concernés :

| Fichier | Nosho | Upstream |
|---|---|---|
| `src/components/atomic-crm/root/i18nProvider.tsx` | Réécrit en FR (137 lignes de messages) | **Supprimé** (déplacé vers `providers/commons/i18nProvider.ts`) |
| `src/components/atomic-crm/activity/ActivityLogCompanyCreated.tsx` | Textes en FR | i18n keys + `useGetSalesName` |
| `src/components/atomic-crm/activity/ActivityLogContactCreated.tsx` | Textes en FR | i18n keys |
| `src/components/atomic-crm/activity/ActivityLogContactNoteCreated.tsx` | Textes en FR | i18n keys |
| `src/components/atomic-crm/activity/ActivityLogDealCreated.tsx` | Textes en FR | i18n keys + `useGetIdentity` |
| `src/components/atomic-crm/activity/ActivityLogDealNoteCreated.tsx` | Textes en FR | i18n keys |
| `src/components/atomic-crm/companies/AutocompleteCompanyInput.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/companies/CompanyAside.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/companies/CompanyCreate.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/companies/CompanyEmpty.tsx` | Textes FR | i18n keys |
| `src/components/atomic-crm/companies/CompanyInputs.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/companies/CompanyList.tsx` | Labels FR | i18n keys + nouveau composant `CompanyCard` |
| `src/components/atomic-crm/companies/CompanyListFilter.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/companies/CompanyShow.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/ContactAside.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/ContactBackgroundInfo.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/ContactCreateSheet.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/ContactInputs.tsx` | Labels FR | i18n keys + `translateContactGenderLabel` |
| `src/components/atomic-crm/contacts/ContactListContent.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/ContactListFilter.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/ContactMergeButton.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/ContactShow.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/ContactTasksList.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/TagsListEdit.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/contacts/contactGender.ts` | Valeurs FR | Ajout `translateContactGenderLabel()` |
| `src/components/atomic-crm/dashboard/DashboardActivityLog.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/dashboard/DashboardStepper.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/dashboard/DealsChart.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/dashboard/HotContacts.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/dashboard/TasksList.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/dashboard/TasksListEmpty.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/deals/DealEdit.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/deals/DealEmpty.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/deals/DealInputs.tsx` | Champs spécifiques nosho (trial date, EUR) | i18n keys + refactor structure |
| `src/components/atomic-crm/deals/DealList.tsx` | Labels FR + vue selector | i18n keys + `WrapperField` |
| `src/components/atomic-crm/deals/DealShow.tsx` | Labels FR, montants EUR | i18n keys + `currency` prop |
| `src/components/atomic-crm/deals/OnlyMineInput.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/deals/dealUtils.ts` | Logique vues personnalisées | Corrections upstream |
| `src/components/atomic-crm/layout/Header.tsx` | Logo Nosho, navigation FR | i18n keys + theme toggle |
| `src/components/atomic-crm/layout/MobileNavigation.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/notes/Note.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/notes/NoteCreate.tsx` | Labels FR | i18n keys + refactor SaveButton |
| `src/components/atomic-crm/notes/NoteCreateSheet.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/notes/NoteInputs.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/notes/NotesIterator.tsx` | Labels FR | i18n keys + pagination infinie |
| `src/components/atomic-crm/providers/supabase/dataProvider.ts` | +206 lignes (Google, vues, delete sales, etc.) | Fix `activity_log` camelCase mapping, suppression `getActivityLog` |
| `src/components/atomic-crm/root/CRM.tsx` | Routes Google OAuth, vues personnalisées | Route `SettingsPageMobile`, prop `currency` |
| `src/components/atomic-crm/sales/SalesCreate.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/sales/SalesEdit.tsx` | Labels FR + bouton delete | i18n keys |
| `src/components/atomic-crm/sales/SalesList.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/settings/ProfilePage.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/settings/SettingsPage.tsx` | Labels FR, vues personnalisées | Refonte majeure i18n + validation |
| `src/components/atomic-crm/tags/TagDialog.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/tasks/AddTask.tsx` | Labels FR | i18n keys + refactor |
| `src/components/atomic-crm/tasks/Task.tsx` | Labels FR | i18n keys |
| `src/components/atomic-crm/tasks/TasksListContent.tsx` | Labels FR | i18n keys |
| `src/index.css` | Styles customs nosho | Import Inter Variable font |
| `package.json` | Sentry, ra-language-french | Playwright, Storybook, vitest v4, `@fontsource-variable/inter` |
| `package-lock.json` | (dérivé de package.json) | (dérivé de package.json) |
| `AGENTS.md` | Section Deployment Coolify | Section DB schema déclaratif |

---

## 3. Plan de rebase étape par étape

### Prérequis

```bash
# S'assurer que upstream est configuré
git remote add upstream https://github.com/marmelab/atomic-crm.git
git fetch upstream
```

### Étape 1 — Créer une branche de travail

```bash
git checkout origin/main -b feat/rebase-upstream
```

### Étape 2 — Adopter l'architecture i18n d'upstream (le plus gros chantier)

C'est le point de blocage principal. Upstream a créé un système propre que nosho devrait adopter.

**2a.** Copier les nouveaux fichiers upstream :
```bash
git checkout upstream/main -- \
  src/components/atomic-crm/providers/commons/i18nProvider.ts \
  src/components/atomic-crm/providers/commons/englishCrmMessages.ts \
  src/components/atomic-crm/providers/commons/frenchCrmMessages.ts
```

**2b.** Porter les messages métier nosho dans `frenchCrmMessages.ts` :
- Vues personnalisées (`customViews`, `companyTypes`)
- Secteurs santé FR
- Étapes pipeline Nosho (`lead`, `qualifié`, `suivi`, `rdv-prix`, `essai`…)
- Messages dashboard Nosho
- Messages connecteurs Google

**2c.** Supprimer l'ancien `src/components/atomic-crm/root/i18nProvider.tsx` et mettre à jour l'import dans `CRM.tsx`.

**2d.** Pour chaque composant en conflit i18n (voir groupe B) : remplacer les chaînes hardcodées françaises par les clés i18n upstream, en s'assurant que `frenchCrmMessages.ts` contient la traduction correspondante.

### Étape 3 — Fusionner les fichiers de config

**`package.json`** — Combiner manuellement :
```json
// Ajouter les dépendances nosho manquantes aux deps upstream :
"@sentry/react": "...",
// Garder les nouvelles deps upstream :
"@fontsource-variable/inter": "^5.2.8",
"ra-language-french": "...",
"ra-supabase-language-french": "..."
// Garder les nouveaux scripts upstream :
"test:unit:app", "test:unit:functions", "build:e2e"
```

**`vite.config.ts`** — Ajouter `VITE_ATTACHMENTS_BUCKET` d'upstream à côté des ajouts nosho.

**`.gitignore`** — Combiner les deux sections (playwright + règles nosho `.env`).

### Étape 4 — Fusionner les fichiers core

**`src/components/atomic-crm/root/ConfigurationContext.tsx`**
- Garder les ajouts nosho (`CustomView`, `useCustomViewsStore`)
- Ajouter `currency: string` d'upstream

**`src/components/atomic-crm/root/defaultConfiguration.ts`**
- Garder toute la config Nosho (secteurs, pipeline, catégories médicales)
- Ajouter `export const defaultCurrency = "EUR"` (adapter depuis le "USD" upstream)

**`src/components/atomic-crm/root/CRM.tsx`**
- Garder les routes nosho (Google OAuth, vues `/views/:viewId/*`)
- Ajouter la route `SettingsPageMobile` d'upstream
- Ajouter la prop `currency` d'upstream

**`src/components/atomic-crm/types.ts`**
- Garder `trial_start_date?: string`
- Appliquer le fix `sales_id?: Identifier` (sans `null`) d'upstream

**`src/components/atomic-crm/providers/supabase/dataProvider.ts`**
- Partir de la version nosho (206 lignes de fonctionnalités Google, vues, etc.)
- Appliquer le patch upstream : ajouter le mapping camelCase de `activity_log`, supprimer `getActivityLog`

### Étape 5 — Récupérer les nouveaux fichiers upstream pertinents

Ces fichiers upstream sont nouveaux et non conflictuels — les récupérer :

```bash
git checkout upstream/main -- \
  src/components/atomic-crm/providers/commons/attachments.ts \
  src/components/atomic-crm/providers/fakerest/dataProvider.ts \
  src/components/atomic-crm/misc/ImportPage.tsx \
  src/components/atomic-crm/misc/import-sample.json \
  src/components/atomic-crm/misc/useImportFromJson.ts \
  src/components/atomic-crm/tasks/TaskCreateSheet.tsx \
  src/components/atomic-crm/tasks/TaskFormContent.tsx \
  src/components/atomic-crm/notes/NotesIteratorMobile.tsx \
  src/index.css  # ATTENTION : fusionner avec les styles nosho
```

### Étape 6 — Récupérer les migrations upstream

```bash
git checkout upstream/main -- \
  supabase/migrations/20260307120000_nb_tasks_pending_only.sql \
  supabase/migrations/20260309112831_fix_security_warnings.sql \
  supabase/migrations/20260314120000_activity_log_view.sql
```

> **Note** : Vérifier l'ordre d'application avec les migrations nosho (timestamps).

### Étape 7 — Fichiers à NE PAS récupérer d'upstream

| Fichier upstream | Raison |
|---|---|
| `.github/workflows/deploy.yml` | Nosho utilise Coolify, pas GitHub Pages |
| `README.md` | Branding Nosho |
| `supabase/schemas/*.sql` | Nosho gère ses migrations manuellement |
| `e2e/`, `playwright.config.ts` | À intégrer plus tard si besoin |
| `.storybook/` | Optionnel, non prioritaire |

### Étape 8 — Vérification finale

```bash
make typecheck   # Vérification TypeScript
make lint        # ESLint + Prettier
make test        # Tests unitaires
make build       # Build de production
```

---

## Résumé de priorité

| Priorité | Action | Effort |
|---|---|---|
| 🔴 Critique | Migrer vers l'architecture i18n upstream (`providers/commons/`) | 2-3 jours |
| 🔴 Critique | Fusionner `package.json`, `CRM.tsx`, `ConfigurationContext.tsx` | 2h |
| 🟠 Important | Fusionner `dataProvider.ts` (appliquer patch activity_log) | 1h |
| 🟠 Important | Récupérer migrations upstream manquantes | 30min |
| 🟡 Normal | Fusionner `SettingsPage.tsx` (refonte majeure upstream) | 3h |
| 🟡 Normal | Récupérer les nouveaux composants upstream (mobile, infini scroll) | 2h |
| 🟢 Optionnel | Playwright e2e, Storybook | À planifier |
