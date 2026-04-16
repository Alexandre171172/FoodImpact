# 🥗 FoodImpact v2

Application web complète : analyse nutritionnelle, environnementale et simulation long terme.

## 🚀 Installation

```bash
npm install
cp .env.example .env    # puis configurez VITE_GOOGLE_CLIENT_ID
npm run dev             # → http://localhost:5173
npm run build           # build production → dossier dist/
```

## ✨ Nouveautés v2

- 🌍 **Multilingue** : FR / EN / ES / DE / IT (bouton en haut à droite)
- 👤 **DiceBear Avatar** : avatar santé dynamique + sélecteur emoji
- 🌱 **EcoWorld amélioré** : SVG animé avec jauges CO₂ / température
- ⚗️ **Additifs & risques** : base EFSA/ANSES, risques détaillés par additif
- 🗺️ **Carte double** : origine produit + importateurs/exportateurs (2 onglets)
- 🛡️ **Admin sécurisé** : panel bloqué aux non-admins
- 📊 **Stats admin riches** : historique produits, graphiques, activité
- 🔐 **Google OAuth réel** : configurer VITE_GOOGLE_CLIENT_ID dans .env
- 🔒 **2FA amélioré** : 6 cases individuelles
- 💪 **Compte protégé** : modification profil impossible sans connexion

## 🛡️ Accès admin

**Code Konami (clavier)** : `↑ ↑ ↓ ↓ ← → ← → B A`

Ou connectez-vous avec un email contenant `admin` (ex: `charlie@admin.com`).
Le panel affiche "Accès refusé" pour les comptes non-admin.

## 🔑 Google OAuth

```
1. console.cloud.google.com → APIs & Services → Credentials
2. OAuth 2.0 Client ID → Web application
3. Origins autorisées : http://localhost:5173
4. VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com dans .env
```

## 📊 Sources

| Source | Usage |
|---|---|
| Open Food Facts (CC-BY-SA) | Données nutritionnelles, scores |
| Agribalyse / ADEME | Impact CO₂ |
| EFSA / ANSES | Risques additifs |
| OpenStreetMap | Cartes |
| DiceBear (MIT) | Avatars |

Aucune donnée inventée. Absences affichées "Donnée non disponible".
