from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User

admin_bp = Blueprint("admin", __name__)


def _require_admin(user_id):
    user = User.query.get(int(user_id))
    return user and user.role == "admin"


@admin_bp.get("/users")
@jwt_required()
def list_users():
    requester_id = int(get_jwt_identity())
    if not _require_admin(requester_id):
        return {"message": "Non autorisé"}, 403
    users = User.query.order_by(User.created_at.desc()).all()
    return {"users": [u.to_dict() for u in users]}


@admin_bp.patch("/users/<int:user_id>")
@jwt_required()
def update_user_role(user_id):
    requester_id = int(get_jwt_identity())
    if not _require_admin(requester_id):
        return {"message": "Non autorisé"}, 403

    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    role = data.get("role")
    if role not in ("user", "admin"):
        return {"message": "Rôle invalide"}, 400
    user.role = role
    db.session.commit()
    return {"user": user.to_dict()}


@admin_bp.delete("/users/<int:user_id>")
@jwt_required()
def delete_user(user_id):
    requester_id = int(get_jwt_identity())
    if not _require_admin(requester_id):
        return {"message": "Non autorisé"}, 403
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return {"message": "Utilisateur supprimé"}
