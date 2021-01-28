import "reflect-metadata";
import { Resolver, Query } from "type-graphql";
import { Product, ProductModel } from "../types/Product";

@Resolver()
export class ProductResolver {
  @Query(() => [Product])
  async products() {
    return await ProductModel.find();
  }
}
