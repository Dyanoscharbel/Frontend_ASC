
# Plateforme de Tournois Gaming

## À propos du projet

Une plateforme moderne de tournois gaming développée avec React, TypeScript et shadcn/ui. Cette application permet aux joueurs de participer à des tournois, gérer leurs profils, et interagir avec d'autres participants.

## Technologies utilisées

- **Frontend**
  - React 18
  - TypeScript
  - Vite (Build tool)
  - shadcn/ui (Composants UI)
  - Tailwind CSS (Styling)
  - React Router (Navigation)
  - Tanstack Query (Gestion des données)
  - Framer Motion (Animations)

- **Backend & Services**
  - Supabase (Base de données & Authentication)

## Fonctionnalités principales

- 🔐 Authentification complète (Email/Password, 2FA)
- 🎮 Gestion des tournois
- 📊 Statistiques des joueurs
- 💰 Système de récompenses
- 🤝 Programme de parrainage
- 🎫 Gestion des tickets & litiges
- 📱 Interface responsive

## Structure du projet

```
src/
├── components/     # Composants réutilisables
├── contexts/      # Contextes React (Auth, etc.)
├── hooks/         # Hooks personnalisés
├── integrations/  # Intégrations externes (Supabase)
├── lib/           # Utilitaires et helpers
├── pages/         # Pages de l'application
└── services/      # Services (Auth, API, etc.)
```

## Installation

1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

## Routes principales

- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription
- `/dashboard` - Tableau de bord
- `/tournaments` - Liste des tournois
- `/profile` - Profil utilisateur
- `/rewards` - Système de récompenses
- `/disputes` - Gestion des litiges

## Configuration du développement

Le projet utilise :
- ESLint pour le linting
- TypeScript pour le typage statique
- Tailwind CSS pour le styling
- Vite pour le build et le développement

## Déploiement

Le projet est configuré pour être déployé sur Replit. Pour déployer :

1. Assurez-vous que tous vos changements sont commités
2. Utilisez l'outil de déploiement intégré de Replit
3. Le projet sera automatiquement build et déployé

## Sécurité

- Authentification sécurisée via Supabase
- Support 2FA
- Validation des données côté client et serveur
- Gestion sécurisée des sessions

## Contributeurs

Ce projet est maintenu par l'équipe de développement. Pour contribuer, merci de suivre les standards de code et le processus de revue.
