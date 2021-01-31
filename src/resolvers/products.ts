import "reflect-metadata";
import { Resolver, Query, Arg, ID, Mutation, Int } from "type-graphql";
import { Product, ProductModel } from "../entities/Product";

@Resolver()
export class ProductResolver {
  @Query(() => [Product])
  async products(): Promise<Product[]> {
    return await ProductModel.find();
  }

  @Query(() => Product, { nullable: true })
  async product(
    @Arg("id", () => ID) id: typeof ID
  ): Promise<Product | undefined | null> {
    return await ProductModel.findOne({ _id: id });
  }

  @Mutation(() => Product!)
  async createProduct(
    @Arg("title", () => String) title: string,
    @Arg("price", () => Int) price: number,
    @Arg("rating", () => Int) rating: number,
    @Arg("imageURL", () => String) imageURL: string
  ): Promise<Product> {
    const product = ProductModel.create({
      title,
      price,
      rating,
      imageURL,
    });

    return (await product).save();
  }

  @Mutation(() => Product!, { nullable: true })
  async deleteProduct(
    @Arg("id", () => ID) id: typeof ID
  ): Promise<Product | null | undefined> {
    const product = await ProductModel.findOne({ _id: id });

    if (product) {
      product.deleteOne();

      return product;
    }

    return null;
  }
}
