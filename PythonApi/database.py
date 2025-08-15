from typing import List, Optional
from models import Product
from decimal import Decimal
import threading


class InMemoryDatabase:
    def __init__(self):
        self._products: List[Product] = []
        self._next_id = 1
        self._lock = threading.Lock()
    
    def get_all_products(self) -> List[Product]:
        with self._lock:
            return self._products.copy()
    
    def create_product(self, name: str, sku: str, stock: int, price: Decimal, category: str) -> int:
        with self._lock:
            product = Product(
                id=self._next_id,
                name=name,
                sku=sku,
                stock=stock,
                price=price,
                category=category
            )
            self._products.append(product)
            self._next_id += 1
            return product.id
    
    def update_product(self, id: int, name: str, sku: str, stock: int, price: Decimal, category: str) -> bool:
        with self._lock:
            for product in self._products:
                if product.id == id:
                    product.name = name
                    product.sku = sku
                    product.stock = stock
                    product.price = price
                    product.category = category
                    return True
            return False
    
    def delete_product(self, id: int) -> bool:
        with self._lock:
            for i, product in enumerate(self._products):
                if product.id == id:
                    del self._products[i]
                    return True
            return False
    
    def get_product_by_id(self, id: int) -> Optional[Product]:
        with self._lock:
            for product in self._products:
                if product.id == id:
                    return product
            return None


db = InMemoryDatabase()