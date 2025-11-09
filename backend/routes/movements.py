from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Product, StockMovement, User

movements_bp = Blueprint("movements", __name__)


def _is_admin(user_id: int) -> bool:
    user = User.query.get(int(user_id))
    return bool(user and user.role == "admin")


@movements_bp.get("/movements")
@jwt_required()
def list_movements():
    requester_id = int(get_jwt_identity())
    target_user_id = request.args.get("userId", type=int)
    user_id = target_user_id if (target_user_id and _is_admin(requester_id)) else requester_id
    movements = StockMovement.query.filter_by(user_id=user_id).order_by(StockMovement.date.desc()).all()
    return {"movements": [m.to_dict() for m in movements]}


@movements_bp.post("/movements")
@jwt_required()
def create_movement():
    requester_id = int(get_jwt_identity())
    data = request.get_json() or {}
    product_id = int(data.get("productId"))
    quantity = int(data.get("quantity", 0))
    movement_type = data.get("type")
    note = data.get("note")
    # Admin peut agir pour un utilisateur cible via userId
    user_id = requester_id
    if _is_admin(requester_id):
        user_id = int(data.get("userId", user_id))

    if movement_type not in ("entrée", "sortie"):
        return {"message": "Type de mouvement invalide"}, 400

    product = Product.query.get_or_404(product_id)
    if product.owner_id != user_id:
        return {"message": "Non autorisé"}, 403

    if movement_type == "sortie" and product.quantity < quantity:
        return {"message": f"Stock insuffisant. Stock actuel: {product.quantity}"}, 400

    # Update product quantity
    delta = quantity if movement_type == "entrée" else -quantity
    product.quantity = product.quantity + delta

    movement = StockMovement(
        product_id=product.id,
        product_name=product.name,
        type=movement_type,
        quantity=quantity,
        note=note,
        user_id=user_id,
    )

    db.session.add(movement)
    db.session.commit()

    return {"movement": movement.to_dict(), "product": product.to_dict()}, 201
