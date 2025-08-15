import pytest
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from database import InMemoryDatabase
from models import Product
from decimal import Decimal


class TestInMemoryDatabase:
    """Unit tests for the InMemoryDatabase class"""
    
    def setup_method(self):
        """Create a fresh database instance for each test"""
        self.db = InMemoryDatabase()
    
    def test_initial_state(self):
        """Test that database starts empty"""
        products = self.db.get_all_products()
        assert products == []
        assert len(products) == 0
    
    def test_create_single_product(self):
        """Test creating a single product"""
        product_id = self.db.create_product("Test Product", "TST-001", 10, Decimal("29.99"), "Electronics")
        assert product_id == 1
        
        products = self.db.get_all_products()
        assert len(products) == 1
        assert products[0].id == 1
        assert products[0].name == "Test Product"
        assert products[0].sku == "TST-001"
        assert products[0].stock == 10
        assert products[0].price == Decimal("29.99")
        assert products[0].category == "Electronics"
    
    def test_create_multiple_products(self):
        """Test creating multiple products with unique IDs"""
        id1 = self.db.create_product("Product 1", "PRD-001", 5, Decimal("10.99"), "Category A")
        id2 = self.db.create_product("Product 2", "PRD-002", 15, Decimal("20.99"), "Category B")
        id3 = self.db.create_product("Product 3", "PRD-003", 25, Decimal("30.99"), "Category C")
        
        assert id1 == 1
        assert id2 == 2
        assert id3 == 3
        
        products = self.db.get_all_products()
        assert len(products) == 3
        assert products[0].name == "Product 1"
        assert products[1].name == "Product 2"
        assert products[2].name == "Product 3"
    
    def test_update_existing_product(self):
        """Test updating an existing product"""
        product_id = self.db.create_product("Original Product", "ORG-001", 5, Decimal("19.99"), "Original Category")
        
        success = self.db.update_product(product_id, "Updated Product", "UPD-001", 10, Decimal("39.99"), "Updated Category")
        assert success == True
        
        product = self.db.get_product_by_id(product_id)
        assert product is not None
        assert product.name == "Updated Product"
        assert product.sku == "UPD-001"
        assert product.stock == 10
        assert product.price == Decimal("39.99")
        assert product.category == "Updated Category"
    
    def test_update_nonexistent_product(self):
        """Test updating a product that doesn't exist"""
        success = self.db.update_product(999, "Product", "SKU-999", 5, Decimal("99.99"), "Category")
        assert success == False
    
    def test_delete_existing_product(self):
        """Test deleting an existing product"""
        id1 = self.db.create_product("Product 1", "PRD-001", 5, Decimal("10.99"), "Category A")
        id2 = self.db.create_product("Product 2", "PRD-002", 10, Decimal("20.99"), "Category B")
        
        success = self.db.delete_product(id1)
        assert success == True
        
        products = self.db.get_all_products()
        assert len(products) == 1
        assert products[0].id == id2
        assert products[0].name == "Product 2"
    
    def test_delete_nonexistent_product(self):
        """Test deleting a product that doesn't exist"""
        success = self.db.delete_product(999)
        assert success == False
    
    def test_get_product_by_id(self):
        """Test retrieving a specific product by ID"""
        id1 = self.db.create_product("Product 1", "PRD-001", 5, Decimal("10.99"), "Category A")
        id2 = self.db.create_product("Product 2", "PRD-002", 10, Decimal("20.99"), "Category B")
        
        product = self.db.get_product_by_id(id1)
        assert product is not None
        assert product.id == id1
        assert product.name == "Product 1"
        
        product = self.db.get_product_by_id(id2)
        assert product is not None
        assert product.id == id2
        assert product.name == "Product 2"
        
        product = self.db.get_product_by_id(999)
        assert product is None
    
    def test_delete_and_update_sequence(self):
        """Test the bug scenario: create 2 products, delete second, update first"""
        id1 = self.db.create_product("First Product", "FST-001", 5, Decimal("10.99"), "Category A")
        id2 = self.db.create_product("Second Product", "SND-001", 10, Decimal("20.99"), "Category B")
        
        # Delete the second product
        success = self.db.delete_product(id2)
        assert success == True
        
        # Update the first product (this was failing before the fix)
        success = self.db.update_product(id1, "Updated First Product", "UPD-001", 15, Decimal("15.99"), "Updated Category")
        assert success == True
        
        # Verify the update worked
        product = self.db.get_product_by_id(id1)
        assert product is not None
        assert product.name == "Updated First Product"
        assert product.sku == "UPD-001"
        assert product.stock == 15
        assert product.price == Decimal("15.99")
        assert product.category == "Updated Category"
        
        # Verify only one product remains
        products = self.db.get_all_products()
        assert len(products) == 1
    
    def test_id_persistence_after_deletion(self):
        """Test that IDs continue incrementing even after deletions"""
        id1 = self.db.create_product("Product 1", "PRD-001", 5, Decimal("10.99"), "Category A")
        id2 = self.db.create_product("Product 2", "PRD-002", 10, Decimal("20.99"), "Category B")
        
        # Delete all products
        self.db.delete_product(id1)
        self.db.delete_product(id2)
        
        # Create new products - IDs should continue from 3
        id3 = self.db.create_product("Product 3", "PRD-003", 15, Decimal("30.99"), "Category C")
        id4 = self.db.create_product("Product 4", "PRD-004", 20, Decimal("40.99"), "Category D")
        
        assert id3 == 3
        assert id4 == 4
        
        products = self.db.get_all_products()
        assert len(products) == 2
        assert products[0].id == 3
        assert products[1].id == 4
    
    def test_concurrent_operations(self):
        """Test thread safety with concurrent operations"""
        import threading
        import time
        
        results = []
        
        def create_products():
            for i in range(10):
                product_id = self.db.create_product(f"Concurrent Product {i}", f"CON-{i:03d}", i, Decimal(f"{i}.99"), f"Category {i}")
                results.append(product_id)
        
        # Create multiple threads
        threads = [threading.Thread(target=create_products) for _ in range(3)]
        
        # Start all threads
        for t in threads:
            t.start()
        
        # Wait for completion
        for t in threads:
            t.join()
        
        # Check that we have 30 products with unique IDs
        products = self.db.get_all_products()
        assert len(products) == 30
        assert len(set(results)) == 30  # All IDs should be unique