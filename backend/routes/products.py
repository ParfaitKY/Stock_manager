from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Product, User

products_bp = Blueprint("products", __name__)


def _is_admin(user_id: int) -> bool:
    user = User.query.get(int(user_id))
    return bool(user and user.role == "admin")


@products_bp.get("/products")
@jwt_required()
def list_products():
    requester_id = int(get_jwt_identity())
    # Admin peut cibler un user via ?userId=
    target_user_id = request.args.get("userId", type=int)
    if target_user_id and _is_admin(requester_id):
        products = Product.query.filter_by(owner_id=target_user_id).all()
    else:
        products = Product.query.filter_by(owner_id=requester_id).all()
    return {"products": [p.to_dict() for p in products]}


@products_bp.post("/products")
@jwt_required()
def create_product():
    requester_id = int(get_jwt_identity())
    data = request.get_json() or {}
    # Admin peut créer au nom d'un user via ownerId
    owner_id = requester_id
    if _is_admin(requester_id):
        owner_id = int(data.get("ownerId", owner_id))
    product = Product(
        name=data.get("name", ""),
        category=data.get("category"),
        quantity=int(data.get("quantity", 0)),
        buy_price=float(data.get("buyPrice", 0)),
        sell_price=float(data.get("sellPrice", 0)),
        min_threshold=int(data.get("minThreshold", 0)),
        owner_id=owner_id,
    )
    db.session.add(product)
    db.session.commit()
    return {"product": product.to_dict()}, 201


@products_bp.put("/products/<int:product_id>")
@jwt_required()
def update_product(product_id):
    requester_id = int(get_jwt_identity())
    product = Product.query.get_or_404(product_id)
    if product.owner_id != requester_id and not _is_admin(requester_id):
        return {"message": "Non autorisé"}, 403

    data = request.get_json() or {}
    product.name = data.get("name", product.name)
    product.category = data.get("category", product.category)
    product.quantity = int(data.get("quantity", product.quantity))
    product.buy_price = float(data.get("buyPrice", product.buy_price))
    product.sell_price = float(data.get("sellPrice", product.sell_price))
    product.min_threshold = int(data.get("minThreshold", product.min_threshold))
    db.session.commit()
    return {"product": product.to_dict()}


@products_bp.delete("/products/<int:product_id>")
@jwt_required()
def delete_product(product_id):
    requester_id = int(get_jwt_identity())
    product = Product.query.get_or_404(product_id)
    if product.owner_id != requester_id and not _is_admin(requester_id):
        return {"message": "Non autorisé"}, 403
    db.session.delete(product)
    db.session.commit()
    return {"message": "Supprimé"}

