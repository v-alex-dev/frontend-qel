# Qui est là ? - Système de Gestion des Visiteurs 👥

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/pontoise-qui-est-la/deploys)

> Application frontend moderne pour la gestion des entrées et sorties de visiteurs avec scan de codes QR et impression de badges.

## 🌐 Démo en Ligne

**🚀 [Voir l'application en action](https://pontoise-qui-est-la.netlify.app/)**

## 📋 Présentation du Projet

"Qui est là ?" est une solution complète de gestion des visiteurs développée dans le cadre du cursus Cepegra 2025. L'application permet de :

- **Enregistrer les entrées** de visiteurs avec génération automatique de badges QR
- **Gérer les sorties** par scan de code QR ou recherche email
- **Traiter les retours** de visiteurs avec nouveau motif de visite
- **Imprimer des badges** avec QR codes pour identification
- **Scanner des QR codes** pour une gestion rapide et moderne

## ✨ Fonctionnalités Principales

### 📥 Gestion des Entrées
- Formulaire d'enregistrement des visiteurs
- Choix du motif : visite personnel ou formation
- Génération automatique de badges avec QR code
- Impression directe des badges visiteurs

### 📤 Gestion des Sorties  
- Recherche par email ou scan de QR code
- Enregistrement automatique de l'heure de sortie
- Interface intuitive et rapide

### 🔄 Gestion des Retours
- Scan du badge QR existant
- Nouveau motif de visite (personnel/formation)
- Réutilisation des données visiteur

### 🎨 Interface Utilisateur
- Design moderne avec Tailwind CSS
- Interface responsive et accessible
- Navigation simple et intuitive
- Notifications en temps réel

## 🛠️ Technologies Utilisées

### Frontend
- **Vite** - Build tool moderne et rapide
- **Vanilla JavaScript** - Code natif sans framework
- **Tailwind CSS** - Framework CSS utility-first
- **HTML5-QRCode** - Scan de codes QR
- **QRCode.js** - Génération de codes QR

### Backend (API Laravel)
- **Laravel** - Framework PHP moderne
- **API RESTful** - Architecture standardisée
- **Base de données** - Gestion persistante des données

## 🚀 Installation et Développement

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Un serveur API Laravel fonctionnel

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/frontend-qel.git
cd frontend-qel
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
# Créer un fichier .env à la racine
cp .env.example .env

# Configurer l'URL de l'API
VITE_API_BASE_URL=http://localhost:8000/api
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Scripts Disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production  
npm run preview  # Aperçu du build de production
```

## 📁 Structure du Projet

```
frontend-qel/
├── public/                 # Fichiers statiques
│   ├── html5-qrcode.min.js # Librairie scan QR
│   ├── qrcode.min.js       # Librairie génération QR
│   └── vite.svg           # Favicon
├── src/
│   ├── components/         # Composants de l'application
│   │   ├── entree.js      # Gestion des entrées
│   │   ├── sortie.js      # Gestion des sorties
│   │   └── retour.js      # Gestion des retours
│   ├── services/          # Services API
│   │   ├── formations.js  # API formations
│   │   ├── personnel.js   # API personnel
│   │   └── visiteurs.js   # API visiteurs
│   ├── utils/             # Utilitaires
│   │   ├── printBadge.js  # Impression badges
│   │   └── qrcode.js      # Gestion QR codes
│   ├── api.js             # Configuration API
│   ├── main.js            # Point d'entrée
│   ├── style.css          # Styles principaux
│   └── utils.js           # Fonctions utilitaires
├── index.html             # Page principale
├── package.json           # Dépendances npm
├── vite.config.js         # Configuration Vite
└── README.md              # Documentation
```

## 🔧 Configuration API

L'application communique avec une API. Configurez l'URL dans le fichier `.env` :

```env
VITE_API_BASE_URL=https://votre-api.com/api
```

### Endpoints Utilisés

- `GET /v1/staff-members` - Liste du personnel
- `GET /v1/trainings/today` - Formations du jour
- `GET /v1/visitor/search?email=` - Recherche visiteur par email
- `GET /v1/visitor/badge?badge_id=` - Recherche visiteur par badge
- `POST /v1/enter` - Enregistrer une entrée
- `POST /v1/exit` - Enregistrer une sortie
- `POST /v1/return` - Enregistrer un retour

## 🎯 Utilisation

### Pour l'Accueil

1. **Nouvelle Entrée :**
   - Sélectionner l'onglet "Entrée"
   - Remplir le formulaire visiteur
   - Choisir le motif (personnel/formation)
   - Valider et imprimer le badge

2. **Sortie Visiteur :**
   - Sélectionner l'onglet "Sortie"
   - Scanner le QR code ou saisir l'email
   - Confirmer la sortie

3. **Retour Visiteur :**
   - Scanner le badge QR existant
   - Choisir le nouveau motif de visite
   - Valider le retour

## 🌟 Fonctionnalités Avancées

### Scan QR Code
- Utilisation de la caméra pour scanner les badges
- Reconnaissance automatique des codes QR
- Interface de scan intuitive

### Impression de Badges
- Génération automatique de QR codes uniques
- Mise en page optimisée pour l'impression
- Informations visiteur et destination

### Gestion d'État
- Persistence des données de session
- Gestion des erreurs réseau
- Interface réactive et fluide

## 🚀 Déploiement

### Sur Netlify (Recommandé)

1. **Build de production**
```bash
npm run build
```

2. **Déployer le dossier `dist/`** sur Netlify

3. **Configuration des variables d'environnement** dans Netlify :
   - `VITE_API_BASE_URL` : URL de votre API de production

## 🤝 Contribution

Ce projet fait partie du cursus Cepegra 2025. Les contributions sont les bienvenues pour améliorer les fonctionnalités existantes.

### Règles de Contribution
- Messages de commit commençant par un verbe (Add, Edit, Remove)
- Utilisation des branches (version 1, version 2)
- Tests des nouvelles fonctionnalités

## 📞 Support

Pour toute question ou problème :
- 📧 Email : [votre-email@example.com]
- 🐛 Issues : [GitHub Issues](https://github.com/votre-username/frontend-qel/issues)

## 📄 Licence

Ce projet est développé dans le cadre du cursus Cepegra 2025.

---

**💡 Astuce :** Pour une expérience optimale, utilisez l'application sur une tablette ou un ordinateur à l'accueil pour faciliter la saisie et l'impression des badges.

**🔗 Administration :** [Interface d'administration Laravel](https://qui-est-la-main-i6aqmb.laravel.cloud/)