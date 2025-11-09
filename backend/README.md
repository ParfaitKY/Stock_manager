# Backend Flask (Stock Manager)

Ce backend fournit des APIs REST pour l'authentification, la gestion des produits et les mouvements de stock. Il inclut également des endpoints d'administration pour gérer les utilisateurs.

## Prérequis
- Python 3.10+
- MySQL en local (base `stock_manager`)

## Installation

```bash
# Créer un venv (Windows)
python -m venv .venv
# Activer : .venv\Scripts\activate

# Installer les dépendances
pip install -r backend/requirements.txt

# Configurer les variables d'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env pour adapter la connexion MySQL et le secret JWT

# Lancer le serveur
python -m backend.app
# Par défaut sur http://localhost:5000
```

## Endpoints principaux
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products` / `POST /api/products` / `PUT /api/products/:id` / `DELETE /api/products/:id`
- `GET /api/movements` / `POST /api/movements`
- `GET /api/admin/users` / `PATCH /api/admin/users/:id` / `DELETE /api/admin/users/:id`

## Notes
- Les produits et mouvements sont attachés à l'utilisateur (propriété `ownerId` / `userId`).
- Les rôles disponibles sont `user` et `admin`.
