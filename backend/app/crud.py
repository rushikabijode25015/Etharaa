from __future__ import annotations

from sqlalchemy.orm import Session

from . import models, schemas


class InsufficientStockError(Exception):
    pass


class EntityNotFoundError(Exception):
    pass


def get_product(db: Session, product_id: int) -> models.Product | None:
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def get_product_by_sku(db: Session, sku: str) -> models.Product | None:
    return db.query(models.Product).filter(models.Product.sku == sku).first()


def get_products(db: Session) -> list[models.Product]:
    return db.query(models.Product).all()


def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(
    db: Session, product_id: int, update: schemas.ProductUpdate
) -> models.Product | None:
    db_product = get_product(db, product_id)
    if not db_product:
        return None

    for field, value in update.dict(exclude_unset=True).items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int) -> bool:
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True


def get_customer(db: Session, customer_id: int) -> models.Customer | None:
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()


def get_customer_by_email(db: Session, email: str) -> models.Customer | None:
    return db.query(models.Customer).filter(models.Customer.email == email).first()


def get_customers(db: Session) -> list[models.Customer]:
    return db.query(models.Customer).all()


def create_customer(db: Session, customer: schemas.CustomerCreate) -> models.Customer:
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def get_orders(db: Session) -> list[models.Order]:
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()


def create_order_with_items(
    db: Session, order_in: schemas.OrderCreate
) -> models.Order:
    customer = get_customer(db, order_in.customer_id)
    if not customer:
        raise EntityNotFoundError("Customer not found")

    product_ids = [item.product_id for item in order_in.items]
    products = (
        db.query(models.Product)
        .filter(models.Product.id.in_(product_ids))
        .with_for_update()
        .all()
    )
    products_by_id = {p.id: p for p in products}

    if len(products_by_id) != len(product_ids):
        raise EntityNotFoundError("One or more products not found")

    for item in order_in.items:
        product = products_by_id[item.product_id]
        if product.stock < item.quantity:
            raise InsufficientStockError(
                f"Insufficient stock for product {product.sku} (requested {item.quantity}, available {product.stock})"
            )

    for item in order_in.items:
        product = products_by_id[item.product_id]
        product.stock -= item.quantity

    order = models.Order(customer_id=order_in.customer_id)
    db.add(order)
    db.flush()

    for item in order_in.items:
        product = products_by_id[item.product_id]
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price,
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return order

