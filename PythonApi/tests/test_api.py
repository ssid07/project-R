import pytest
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from fastapi.testclient import TestClient
from main import app
from database import db
from decimal import Decimal


@pytest.fixture(autouse=True)
def reset_database():
    """Reset the database before each test"""
    db._products.clear()
    db._next_id = 1
    yield
    db._products.clear()
    db._next_id = 1


class TestProductAPI:
    """Integration tests for the Product API endpoints"""
    
    def setup_method(self):
        """Create a test client for each test"""
        self.client = TestClient(app)
    
    def test_get_empty_products(self):
        """Test getting products when database is empty"""
        response = self.client.get("/api/Products")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_create_product(self):
        """Test creating a new product"""
        response = self.client.post(
            "/api/Products",
            json={
                "name": "Test Product",
                "sku": "TST-001",
                "stock": 10,
                "price": "29.99",
                "category": "Electronics"
            }
        )
        assert response.status_code == 200
        assert response.json() == 1
        
        # Verify it was created
        response = self.client.get("/api/Products")
        assert response.status_code == 200
        products = response.json()
        assert len(products) == 1
        assert products[0]["id"] == 1
        assert products[0]["name"] == "Test Product"
        assert products[0]["sku"] == "TST-001"
        assert products[0]["stock"] == 10
        assert products[0]["price"] == "29.99"
        assert products[0]["category"] == "Electronics"
    
    def test_create_multiple_products(self):
        """Test creating multiple products"""
        products_data = [
            {"name": "Product 1", "sku": "PRD-001", "stock": 5, "price": "10.99", "category": "Category A"},
            {"name": "Product 2", "sku": "PRD-002", "stock": 15, "price": "20.99", "category": "Category B"},
            {"name": "Product 3", "sku": "PRD-003", "stock": 25, "price": "30.99", "category": "Category C"}
        ]
        created_ids = []
        
        for product_data in products_data:
            response = self.client.post(
                "/api/Products",
                json=product_data
            )
            assert response.status_code == 200
            created_ids.append(response.json())
        
        assert created_ids == [1, 2, 3]
        
        # Verify all were created
        response = self.client.get("/api/Products")
        products = response.json()
        assert len(products) == 3
        for i, product in enumerate(products):
            assert product["id"] == i + 1
            assert product["name"] == products_data[i]["name"]
            assert product["sku"] == products_data[i]["sku"]
    
    def test_update_product(self):
        """Test updating an existing product"""
        # Create a product
        create_response = self.client.post(
            "/api/Products",
            json={
                "name": "Original Product",
                "sku": "ORG-001",
                "stock": 5,
                "price": "19.99",
                "category": "Original Category"
            }
        )
        product_id = create_response.json()
        
        # Update it
        update_response = self.client.put(
            f"/api/Products/{product_id}",
            json={
                "name": "Updated Product",
                "sku": "UPD-001",
                "stock": 10,
                "price": "39.99",
                "category": "Updated Category"
            }
        )
        assert update_response.status_code == 200
        
        # Verify the update
        response = self.client.get("/api/Products")
        products = response.json()
        assert len(products) == 1
        assert products[0]["name"] == "Updated Product"
        assert products[0]["sku"] == "UPD-001"
        assert products[0]["stock"] == 10
        assert products[0]["price"] == "39.99"
        assert products[0]["category"] == "Updated Category"
    
    def test_update_nonexistent_product(self):
        """Test updating a product that doesn't exist"""
        response = self.client.put(
            "/api/Products/999",
            json={
                "name": "Updated Product",
                "sku": "UPD-999",
                "stock": 5,
                "price": "99.99",
                "category": "Updated Category"
            }
        )
        assert response.status_code == 404
        assert response.json()["detail"] == "Product not found"
    
    def test_delete_product(self):
        """Test deleting an existing product"""
        # Create two products
        response1 = self.client.post("/api/Products", json={
            "name": "Product 1", "sku": "PRD-001", "stock": 5, "price": "10.99", "category": "Category A"
        })
        id1 = response1.json()
        response2 = self.client.post("/api/Products", json={
            "name": "Product 2", "sku": "PRD-002", "stock": 10, "price": "20.99", "category": "Category B"
        })
        id2 = response2.json()
        
        # Delete the first one
        delete_response = self.client.delete(f"/api/Products/{id1}")
        assert delete_response.status_code == 200
        
        # Verify only second remains
        response = self.client.get("/api/Products")
        products = response.json()
        assert len(products) == 1
        assert products[0]["id"] == id2
        assert products[0]["name"] == "Product 2"
    
    def test_delete_nonexistent_product(self):
        """Test deleting a product that doesn't exist"""
        response = self.client.delete("/api/Products/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Product not found"
    
    def test_bug_scenario_delete_then_update(self):
        """Test the specific bug: create 2, delete 2nd, update 1st"""
        # Create two products
        response1 = self.client.post("/api/Products", json={
            "name": "First Product", "sku": "FST-001", "stock": 5, "price": "10.99", "category": "Category A"
        })
        id1 = response1.json()
        response2 = self.client.post("/api/Products", json={
            "name": "Second Product", "sku": "SND-001", "stock": 10, "price": "20.99", "category": "Category B"
        })
        id2 = response2.json()
        
        # Delete the second product
        delete_response = self.client.delete(f"/api/Products/{id2}")
        assert delete_response.status_code == 200
        
        # Update the first product (this was the bug)
        update_response = self.client.put(
            f"/api/Products/{id1}",
            json={
                "name": "Updated First Product",
                "sku": "UPD-001",
                "stock": 15,
                "price": "15.99",
                "category": "Updated Category"
            }
        )
        assert update_response.status_code == 200
        
        # Verify the update worked
        response = self.client.get("/api/Products")
        products = response.json()
        assert len(products) == 1
        assert products[0]["id"] == id1
        assert products[0]["name"] == "Updated First Product"
        assert products[0]["sku"] == "UPD-001"
    
    def test_complex_workflow(self):
        """Test a complex workflow with multiple operations"""
        # Create 3 products
        ids = []
        for i in range(1, 4):
            response = self.client.post("/api/Products", json={
                "name": f"Product {i}",
                "sku": f"PRD-00{i}",
                "stock": i * 5,
                "price": f"{i * 10}.99",
                "category": f"Category {i}"
            })
            ids.append(response.json())
        
        # Update the middle one
        self.client.put(
            f"/api/Products/{ids[1]}",
            json={
                "name": "Middle Updated Product",
                "sku": "MID-UPD",
                "stock": 50,
                "price": "99.99",
                "category": "Updated Category"
            }
        )
        
        # Delete the first one
        self.client.delete(f"/api/Products/{ids[0]}")
        
        # Create a new one
        response = self.client.post("/api/Products", json={
            "name": "New Product",
            "sku": "NEW-001",
            "stock": 25,
            "price": "49.99",
            "category": "New Category"
        })
        new_id = response.json()
        
        # Get all products
        response = self.client.get("/api/Products")
        products = response.json()
        
        # Should have 3 products
        assert len(products) == 3
        
        # Check the remaining products
        product_ids = [p["id"] for p in products]
        assert ids[1] in product_ids  # Middle one still exists
        assert ids[2] in product_ids  # Last one still exists
        assert new_id in product_ids  # New one exists
        
        # Check the updated one
        middle_product = next(p for p in products if p["id"] == ids[1])
        assert middle_product["name"] == "Middle Updated Product"
        assert middle_product["sku"] == "MID-UPD"
    
    def test_cors_headers(self):
        """Test that CORS headers are properly set"""
        # Make a request with an Origin header to trigger CORS
        response = self.client.get(
            "/api/Products",
            headers={"Origin": "http://localhost:3000"}
        )
        assert response.status_code == 200
        # CORS headers should be present in the response
        assert "access-control-allow-origin" in response.headers
        assert response.headers["access-control-allow-origin"] == "*"
        assert "access-control-allow-credentials" in response.headers
    
    def test_empty_name_handling(self):
        """Test creating a product with empty name"""
        response = self.client.post(
            "/api/Products",
            json={
                "name": "",
                "sku": "EMPTY-001",
                "stock": 5,
                "price": "19.99",
                "category": "Test Category"
            }
        )
        # Empty string is still a valid string
        assert response.status_code == 200
        
        # Verify it was created with empty name
        products = self.client.get("/api/Products").json()
        assert len(products) == 1
        assert products[0]["name"] == ""
    
    def test_special_characters_in_name(self):
        """Test products with special characters"""
        special_names = [
            "Product with émojis 🎉🚀",
            "Product with <html>tags</html>",
            "Product with \"quotes\" and 'apostrophes'",
            "Product with line\nbreaks",
            "Product with tabs\tand spaces"
        ]
        
        for i, name in enumerate(special_names):
            response = self.client.post("/api/Products", json={
                "name": name,
                "sku": f"SPL-{i:03d}",
                "stock": 5,
                "price": "19.99",
                "category": "Special Category"
            })
            assert response.status_code == 200
        
        products = self.client.get("/api/Products").json()
        assert len(products) == len(special_names)
        
        for i, product in enumerate(products):
            assert product["name"] == special_names[i]