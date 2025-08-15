"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCreateProductMutation } from "@/store/api/enhanced/products"
import { ProductForm } from "@/components/product-form"
import { ProductFormData } from "@/lib/validations/product"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function NewProductPage() {
  const router = useRouter()
  const [createProduct, { isLoading }] = useCreateProductMutation()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setError(null)
      await createProduct({
        createProductCommand: {
          name: data.name,
          sku: data.sku,
          stock: data.stock,
          price: data.price,
          category: data.category,
        },
      }).unwrap()
      
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err: any) {
      setError(err?.data?.detail || "Failed to create product. Please try again.")
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Product created successfully! Redirecting to dashboard...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">
          Create a new product in your inventory
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="max-w-2xl">
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          mode="create"
        />
      </div>
    </div>
  )
}