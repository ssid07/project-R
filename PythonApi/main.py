from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, RedirectResponse
from typing import List
from models import Product, CreateProductCommand, UpdateProductCommand
from database import db

app = FastAPI(title="Product Inventory API", version="v1", docs_url="/swagger", redoc_url="/redoc")
app.title = "Product Inventory API"
app.version = "v1"
app.description = "Product Inventory API"

# Configure CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Send interactive user to swagger page by default
@app.get("/")
async def redirect_to_swagger():
    return RedirectResponse(url="/swagger")

@app.get("/api/Products", response_model=List[Product], tags=["Products"], operation_id="GetProducts")
async def get_products():
    return db.get_all_products()


@app.post("/api/Products", response_model=int, tags=["Products"], operation_id="CreateProduct")
async def create_product(command: CreateProductCommand):
    product_id = db.create_product(command.name, command.sku, command.stock, command.price, command.category)
    return product_id


@app.put("/api/Products/{id}", tags=["Products"], operation_id="UpdateProduct")
async def update_product(id: int, command: UpdateProductCommand):
    # Use the ID from the path, not from the command body
    success = db.update_product(id, command.name, command.sku, command.stock, command.price, command.category)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return Response(status_code=200)


@app.delete("/api/Products/{id}", tags=["Products"], operation_id="DeleteProduct")
async def delete_product(id: int):
    success = db.delete_product(id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return Response(status_code=200)
