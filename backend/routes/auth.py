from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"message": "Email et mot de passe requis"}, 400

    existing = User.query.filter_by(email=email).first()
    if existing:
        return {"message": "Utilisateur déjà existant"}, 409

    user = User(email=email, role="user")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return {"accessToken": token, "user": user.to_dict()}, 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return {"message": "Email et mot de passe requis"}, 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return {"message": "Identifiants invalides"}, 401

    token = create_access_token(identity=str(user.id))
    return {"accessToken": token, "user": user.to_dict()}, 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return {"message": "Utilisateur introuvable"}, 404
    return {"user": user.to_dict()}


@auth_bp.post("/bootstrap_admin")
def bootstrap_admin():
    """
    Crée ou promeut un administrateur uniquement si aucun admin n'existe encore.
    - Corps JSON: { email, password }
    - Réponses:
        201: admin créé
        200: utilisateur promu admin
        403: un admin existe déjà (endpoint verrouillé)
        400: données invalides
        409: email déjà utilisé (sans promotion si un admin existe)
    """
    # Si un admin existe déjà, ne pas permettre la création via cette route
    existing_admin = User.query.filter_by(role="admin").first()
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if existing_admin:
        return {"message": "Un administrateur existe déjà"}, 403

    if not email or not password:
        return {"message": "Email et mot de passe requis"}, 400

    user = User.query.filter_by(email=email).first()
    if user:
        # Promouvoir l'utilisateur existant au rôle admin
        user.role = "admin"
        if password:
            user.set_password(password)
        db.session.commit()
        token = create_access_token(identity=str(user.id))
        return {"accessToken": token, "user": user.to_dict()}, 200

    # Créer un nouvel admin
    new_admin = User(email=email, role="admin")
    new_admin.set_password(password)
    db.session.add(new_admin)
    db.session.commit()
    token = create_access_token(identity=str(new_admin.id))
    return {"accessToken": token, "user": new_admin.to_dict()}, 201
