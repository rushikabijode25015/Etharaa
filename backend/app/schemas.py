from datetime import datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, EmailStr, Field


class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    sku: str = Field(..., max_length=100)
    description: str | None = Field(default=None, max_length=1000)
    price: Decimal = Field(..., ge=0)
    stock: int = Field(..., ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    stock: int | None = Field(default=None, ge=0)


class ProductOut(ProductBase):
    id: int

    model_config = {"from_attributes": True}


class CustomerBase(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr


class CustomerCreate(CustomerBase):
    pass


class CustomerOut(CustomerBase):
    id: int

    model_config = {"from_attributes": True}


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]


class OrderOut(BaseModel):
    id: int
    customer: CustomerOut
    created_at: datetime
    items: List[OrderItemOut]

    model_config = {"from_attributes": True}

