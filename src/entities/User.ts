import { ObjectType, Field, ID } from "type-graphql";
import { prop as Property, getModelForClass } from "@typegoose/typegoose";

@ObjectType()
export class User {
  @Field(() => ID)
  id!: typeof ID;

  @Field(() => String)
  @Property({ required: true, unique: true })
  username: string;

  @Field(() => String)
  @Property({ required: true, unique: true })
  email: string;

  @Field(() => String)
  @Property({ required: true })
  createdAt = new Date();

  @Field(() => String)
  @Property({ required: true })
  password: string;
}

export const UserModel = getModelForClass(User);
