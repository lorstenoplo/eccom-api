import { ObjectType, Field, ID } from "type-graphql";
import { prop as Property, getModelForClass } from "@typegoose/typegoose";

@ObjectType()
export class Product {
  @Field(() => ID)
  id: number;

  @Field()
  @Property({ required: true })
  title: String;

  @Field()
  @Property({ required: true })
  price: number;

  @Field()
  @Property({ required: true })
  rating: number;

  @Field()
  @Property({ required: true })
  imageURL: string;
}

export const ProductModel = getModelForClass(Product);
console.log(ProductModel);
