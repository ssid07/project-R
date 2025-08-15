import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Product name must be less than 100 characters"),
  sku: z.string().min(1, "SKU is required").max(50, "SKU must be less than 50 characters"),
  stock: z.number().min(0, "Stock must be 0 or greater").int("Stock must be a whole number"),
  price: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num >= 0
  }, "Price must be a valid number 0 or greater"),
  category: z.string().min(1, "Category is required")
})

export type ProductFormData = z.infer<typeof productSchema>

export const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports",
  "Toys",
  "Food & Beverages",
  "Health & Beauty",
  "Automotive",
  "Other"
] as const