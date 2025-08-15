"use client"

import { useState } from "react"
import Link from "next/link"
import { useGetProductsQuery, useDeleteProductMutation } from "@/store/api/enhanced/products"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Edit, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DashboardPage() {
  const { data: products, isLoading, isError, error } = useGetProductsQuery()
  const [deleteProduct] = useDeleteProductMutation()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await deleteProduct({ id: productToDelete }).unwrap()
        setDeleteDialogOpen(false)
        setProductToDelete(null)
      } catch (error) {
        console.error("Failed to delete product:", error)
      }
    }
  }

  const openDeleteDialog = (productId: number) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading products...</div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load products. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Inventory</h1>
          <p className="text-muted-foreground">
            Manage your product inventory
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/dashboard/products/${product.id}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit product</span>
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete product</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">No products found</p>
                    <Button asChild>
                      <Link href="/dashboard/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add your first product
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}