# ⚽ Pronostics · Coupe du Monde 2026

Site de pronostics football entre amis pour la Coupe du Monde 2026.

- 12 groupes · 48 équipes · 72 matchs de poules
- Classement commun en temps réel
- Chaque ami saisit ses propres pronostics
- Résultats partagés mis à jour au fil des matchs
- +3 pts score exact · +1 pt bon résultat · +0 faux

---

## 🛠️ Étape 1 — Créer la base de données Firebase (gratuit)

Firebase est nécessaire pour que tes amis partagent le classement en temps réel.
Le plan gratuit (Spark) est largement suffisant.

### 1.1 Créer un projet Firebase

1. Aller sur **https://console.firebase.google.com**
2. Cliquer **"Créer un projet"**
3. Donner un nom (ex: `pronostics-cdm2026`)
4. Désactiver Google Analytics (facultatif) → **Créer le projet**

### 1.2 Créer la Realtime Database

1. Dans le menu gauche → **Build** → **Realtime Database**
2. Cliquer **"Créer une base de données"**
3. Choisir une localisation (ex: `europe-west1`)
4. Choisir **"Démarrer en mode test"** → **Activer**

### 1.3 Modifier les règles de sécurité

Dans **Realtime Database** → onglet **Règles**, remplacer par :

```json
{
  "rules": {
    "wc2026": {
      ".read": true,
      ".write": true
    }
  }
}
```

Cliquer **Publier**.

> ℹ️ Ces règles permettent à tous ceux qui ont l'URL du site de lire et écrire.
> Parfait pour jouer entre amis. Si tu veux plus de sécurité, tu peux restreindre
> après la compétition.

### 1.4 Récupérer la configuration

1. **Paramètres du projet** (roue dentée ⚙️ en haut à gauche) → **Paramètres du projet**
2. Descendre jusqu'à **"Vos applications"**
3. Cliquer l'icône **`</>`** (Web)
4. Donner un surnom à l'app (ex: `pronostics-web`) → **Enregistrer l'application**
5. Copier le bloc `firebaseConfig` qui s'affiche — il ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pronostics-cdm2026.firebaseapp.com",
  databaseURL: "https://pronostics-cdm2026-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "pronostics-cdm2026",
  storageBucket: "pronostics-cdm2026.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## ✏️ Étape 2 — Configurer le fichier index.html

1. Ouvrir `index.html` dans un éditeur de texte (Bloc-notes, VS Code, etc.)
2. Chercher la section (vers la ligne 250) :

```javascript
const firebaseConfig = {
  apiKey:            "VOTRE_API_KEY",
  authDomain:        "VOTRE_PROJECT_ID.firebaseapp.com",
  ...
```

3. **Remplacer toutes les valeurs** par celles copiées à l'étape 1.4
4. Sauvegarder le fichier

---

## 🚀 Étape 3 — Mettre en ligne sur GitHub Pages

### 3.1 Créer un dépôt GitHub

1. Aller sur **https://github.com** (créer un compte si besoin)
2. Cliquer **"New repository"** (bouton vert)
3. Nommer le dépôt : `pronostics-cdm2026` (ou ce que tu veux)
4. Laisser en **Public** → **Create repository**

### 3.2 Uploader le fichier

**Option simple (sans Git) :**
1. Dans ton nouveau dépôt GitHub → cliquer **"uploading an existing file"**
2. Glisser-déposer `index.html`
3. Cliquer **"Commit changes"**

**Option avec Git (si installé) :**
```bash
git init
git add index.html
git commit -m "Site pronostics CDM 2026"
git remote add origin https://github.com/TON_PSEUDO/pronostics-cdm2026.git
git push -u origin main
```

### 3.3 Activer GitHub Pages

1. Dans ton dépôt → onglet **Settings**
2. Menu gauche → **Pages**
3. Under "Source" → sélectionner **"Deploy from a branch"**
4. Branch : **main** · Folder : **/ (root)** → **Save**
5. Attendre 1-2 minutes

Ton site sera disponible à l'adresse :
```
https://TON_PSEUDO.github.io/pronostics-cdm2026/
```

---

## 👥 Étape 4 — Inviter tes amis

Envoie simplement l'URL GitHub Pages à tes amis.
Chacun entre son prénom ou pseudo au premier accès.

**Comment ça marche :**
- Chaque joueur saisit ses propres pronostics dans **"Mes pronos"**
- Le classement dans **"Classement"** se met à jour en temps réel
- N'importe qui peut entrer les vrais scores dans **"Résultats"** après chaque match

---

## 📋 Règles du jeu

| Pronostic | Points |
|-----------|--------|
| Score exact (ex: tu dis 2-1, résultat 2-1) | **+3 pts** |
| Bon résultat (victoire/nul correct, score faux) | **+1 pt** |
| Mauvais résultat | **+0 pt** |

---

## 🗓️ Calendrier

| Phase | Dates |
|-------|-------|
| Match d'ouverture | 11 juin 2026 |
| Phase de groupes | 11 juin – 2 juillet 2026 |
| 1/8 de finale | 5 – 9 juillet 2026 |
| 1/4 de finale | 12 – 13 juillet 2026 |
| Demi-finales | 16 – 17 juillet 2026 |
| Finale | 19 juillet 2026 (MetLife Stadium, New York) |

---

## ❓ Problèmes fréquents

**Le site s'affiche mais pas de classement partagé :**
- Vérifie que la `databaseURL` dans la config Firebase est correcte (elle doit contenir `-default-rtdb`)
- Vérifie les règles de sécurité Firebase (étape 1.3)

**Erreur "Firebase: Error (auth/...)":**
- Vérifie que toutes les valeurs `VOTRE_...` ont bien été remplacées dans `index.html`

**Le site ne s'affiche pas sur GitHub Pages :**
- Attendre 2-5 minutes après activation
- Vérifier que le fichier s'appelle bien `index.html` (minuscules)

---

## 🏆 Groupes Coupe du Monde 2026

| Groupe | Équipes |
|--------|---------|
| A | 🇲🇽 Mexique · 🇿🇦 Afrique du Sud · 🇰🇷 Corée du Sud · 🇨🇿 Rép. Tchèque |
| B | 🇨🇦 Canada · 🇧🇦 Bosnie · 🇶🇦 Qatar · 🇨🇭 Suisse |
| C | 🇧🇷 Brésil · 🇲🇦 Maroc · 🇭🇹 Haïti · 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Écosse |
| D | 🇺🇸 États-Unis · 🇵🇾 Paraguay · 🇦🇺 Australie · 🇹🇷 Turquie |
| E | 🇩🇪 Allemagne · 🇨🇼 Curaçao · 🇨🇮 Côte d'Ivoire · 🇪🇨 Équateur |
| F | 🇳🇱 Pays-Bas · 🇯🇵 Japon · 🇸🇪 Suède · 🇹🇳 Tunisie |
| G | 🇧🇪 Belgique · 🇪🇬 Égypte · 🇮🇷 Iran · 🇳🇿 Nouvelle-Zélande |
| H | 🇪🇸 Espagne · 🇨🇻 Cap-Vert · 🇸🇦 Arabie Saoudite · 🇺🇾 Uruguay |
| I | 🇫🇷 France · 🇸🇳 Sénégal · 🇮🇶 Irak · 🇳🇴 Norvège |
| J | 🇦🇷 Argentine · 🇩🇿 Algérie · 🇦🇹 Autriche · 🇯🇴 Jordanie |
| K | 🇵🇹 Portugal · 🇨🇩 RD Congo · 🇺🇿 Ouzbékistan · 🇨🇴 Colombie |
| L | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Angleterre · 🇭🇷 Croatie · 🇬🇭 Ghana · 🇵🇦 Panama |

---

*Site personnel, usage non commercial. Bonne Coupe du Monde ! ⚽*
