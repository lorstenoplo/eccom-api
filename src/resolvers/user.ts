import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  ObjectType,
} from "type-graphql";
import { User, UserModel } from "../entities/User";
import bcrypt from "bcryptjs";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User | null;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Username should be atleast 3 charecters long",
          },
        ],
      };
    }

    if (options.password.length <= 5) {
      return {
        errors: [
          {
            field: "password",
            message: "Password should be atleast 6 charecters long",
          },
        ],
      };
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(options.password, salt);

    const saveUser = UserModel.create({
      username: options.username,
      password: hashedPassword,
      createdAt: new Date(),
    });

    try {
      (await saveUser).save();
    } catch (error) {
      if (error.message.includes("duplicate key error")) {
        return {
          errors: [
            {
              field: "username",
              message: "That username is already taken",
            },
          ],
        };
      }
    }
    const user = await UserModel.findOne({ username: options.username });

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput
  ): Promise<UserResponse> {
    const user = await UserModel.findOne({ username: options.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "A user with that username does not exist",
          },
        ],
      };
    }
    const valid = await bcrypt.compare(options.password, user.password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect password",
          },
        ],
      };
    }
    return { user };
  }

  @Mutation(() => User!, { nullable: true })
  async delete(
    @Arg("username", () => String) username: string
  ): Promise<User | undefined | null> {
    const user = await UserModel.findOne({ username });

    if (user) {
      await user.deleteOne();
      return user;
    }

    return null;
  }
}