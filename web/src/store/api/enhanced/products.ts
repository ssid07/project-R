import { productsApi } from "../generated/products";

export const productsEnhancedApi = productsApi.enhanceEndpoints({
    addTagTypes: [
        'PRODUCT', 
    ],
    endpoints: {
        getProducts: {
            providesTags: ['PRODUCT'],
        },
        createProduct: {
            invalidatesTags: ['PRODUCT'],
        },
        updateProduct: {
            invalidatesTags: ['PRODUCT'],
        },
        deleteProduct: {
            invalidatesTags: ['PRODUCT'],
        },
    }
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsEnhancedApi;