"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useGetProductsQuery, useUpdateProductMutation } from "@/store/api/enhanced/products"
import { ProductForm } from "@/components/product-form"
import { ProductFormData } from "@/lib/validations/product"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { notFound } from "next/navigation"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter()
  const productId = parseInt(params.id)
  const { data: products, isLoading: isLoadingProducts, isError } = useGetProductsQuery()
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const product = useMemo(() => {
    return products?.find(p => p.id === productId)
  }, [products, productId])

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setError(null)
      await updateProduct({
        id: productId,
        updateProductCommand: {
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
      setError(err?.data?.detail || "Failed to update product. Please try again.")
    }
  }

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading product...</div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Product not found or failed to load.
        </AlertDescription>
      </Alert>
    )
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Product updated successfully! Redirecting to dashboard...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const defaultValues: ProductFormData = {
    name: product.name,
    sku: product.sku,
    stock: product.stock,
    price: product.price,
    category: product.category,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">
          Update product information
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
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          mode="edit"
        />
      </div>
    </div>
  )
}