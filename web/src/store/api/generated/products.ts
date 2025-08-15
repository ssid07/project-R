/* eslint-disable -- Auto Generated File */
/* eslint-disable -- Auto Generated File */
import { emptySplitApi as api } from "../empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<GetProductsApiResponse, GetProductsApiArg>({
      query: () => ({ url: `/api/Products` }),
    }),
    createProduct: build.mutation<CreateProductApiResponse, CreateProductApiArg>({
      query: (queryArg) => ({
        url: `/api/Products`,
        method: "POST",
        body: queryArg.createProductCommand,
      }),
    }),
    updateProduct: build.mutation<UpdateProductApiResponse, UpdateProductApiArg>({
      query: (queryArg) => ({
        url: `/api/Products/${queryArg.id}`,
        method: "PUT",
        body: queryArg.updateProductCommand,
      }),
    }),
    deleteProduct: build.mutation<DeleteProductApiResponse, DeleteProductApiArg>({
      query: (queryArg) => ({
        url: `/api/Products/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as productsApi };
export type GetProductsApiResponse =
  /** status 200 Successful Response */ Product[];
export type GetProductsApiArg = void;
export type CreateProductApiResponse =
  /** status 200 Successful Response */ number;
export type CreateProductApiArg = {
  createProductCommand: CreateProductCommand;
};
export type UpdateProductApiResponse = /** status 200 Successful Response */ any;
export type UpdateProductApiArg = {
  id: number;
  updateProductCommand: UpdateProductCommand;
};
export type DeleteProductApiResponse = /** status 200 Successful Response */ any;
export type DeleteProductApiArg = {
  id: number;
};
export type Product = {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: string;
  category: string;
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type CreateProductCommand = {
  name: string;
  sku: string;
  stock: number;
  price: string;
  category: string;
};
export type UpdateProductCommand = {
  name: string;
  sku: string;
  stock: number;
  price: string;
  category: string;
};
export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = injectedRtkApi;
