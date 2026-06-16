import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas, crud
from .database import engine, get_db


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ethara Inventory & Order Management API")

origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/products", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    existing = crud.get_product_by_sku(db, sku=product.sku)
    if existing:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    return crud.create_product(db=db, product=product)


@app.get("/products", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return crud.get_products(db)


@app.get("/products/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = crud.update_product(db, product_id, update)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    if not crud.delete_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    return


@app.post("/customers", response_model=schemas.CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    existing = crud.get_customer_by_email(db, email=customer.email)
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")
    return crud.create_customer(db=db, customer=customer)


@app.get("/customers", response_model=list[schemas.CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return crud.get_customers(db)


@app.post("/orders", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    try:
        created = crud.create_order_with_items(db=db, order_in=order)
    except crud.InsufficientStockError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except crud.EntityNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return created


@app.get("/orders", response_model=list[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return crud.get_orders(db)

