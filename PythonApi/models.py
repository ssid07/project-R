from pydantic import BaseModel
from typing import Optional
from decimal import Decimal


class Product(BaseModel):
    id: int
    name: str
    sku: str
    stock: int
    price: Decimal
    category: str


class CreateProductCommand(BaseModel):
    name: str
    sku: str
    stock: int
    price: Decimal
    category: str


class UpdateProductCommand(BaseModel):
    name: str
    sku: str
    stock: int
    price: Decimal
    category: str