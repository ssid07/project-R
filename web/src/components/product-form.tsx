"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormData, categories } from "@/lib/validations/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => void
  isLoading?: boolean
  mode?: "create" | "edit"
}

export function ProductForm({ 
  defaultValues, 
  onSubmit, 
  isLoading = false, 
  mode = "create" 
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      stock: 0,
      price: "",
      category: "",
      ...defaultValues,
    },
  })

  const categoryValue = watch("category")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter product name"
            aria-describedby={errors.name ? "name-error" : undefined}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <Alert variant="destructive" id="name-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.name.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">
            SKU <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sku"
            {...register("sku")}
            placeholder="Enter SKU"
            aria-describedby={errors.sku ? "sku-error" : undefined}
            className={errors.sku ? "border-destructive" : ""}
          />
          {errors.sku && (
            <Alert variant="destructive" id="sku-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.sku.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">
            Stock Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="stock"
            type="number"
            min="0"
            {...register("stock", { valueAsNumber: true })}
            placeholder="Enter stock quantity"
            aria-describedby={errors.stock ? "stock-error" : undefined}
            className={errors.stock ? "border-destructive" : ""}
          />
          {errors.stock && (
            <Alert variant="destructive" id="stock-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.stock.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">
            Price <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            {...register("price")}
            placeholder="Enter price"
            aria-describedby={errors.price ? "price-error" : undefined}
            className={errors.price ? "border-destructive" : ""}
          />
          {errors.price && (
            <Alert variant="destructive" id="price-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.price.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={categoryValue}
            onValueChange={(value) => setValue("category", value)}
          >
            <SelectTrigger 
              className={errors.category ? "border-destructive" : ""}
              aria-describedby={errors.category ? "category-error" : undefined}
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <Alert variant="destructive" id="category-error">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.category.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}