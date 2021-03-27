import {
  Resolver,
  Mutation,
  Arg,
  InputType,
  Field,
  ObjectType,
  Query,
  ID,
} from "type-graphql";
import { User, UserModel } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DocumentType } from "@typegoose/typegoose";
import { sendEmail, sendWelcomeEmail, sendByeEmail } from "../utils/sendEmail";
import { stripe } from "../stripe";
import Stripe from "stripe";

@InputType()
class RegisterInput {
  @Field()
  username: string;
  @Field()
  email: string;
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

  @Field(() => String, { nullable: true })
  token?: string | null;
}

function generateToken(user: DocumentType<User> | null) {
  return jwt.sign(
    {
      id: user?.id,
      username: user?.username,
    },
    process.env.JWT_KEY || "@njkddm#jkim"
  );
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Arg("token") token: string): Promise<User | null> {
    const decodedUser = jwt.decode(token);
    const uid = (decodedUser as any)?.id;
    const user = await UserModel.findOne({ _id: uid });
    if (!user) {
      return null;
    }
    return user;
  }

  @Mutation(() => Boolean, { nullable: true })
  async report(
    @Arg("problem") problem: string,
    @Arg("username") username: string
  ): Promise<Boolean | null> {
    if (!username) {
      return false;
    }
    sendEmail(process.env.REPORT_TARGET_EMAIL!, problem, username);
    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: RegisterInput
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

    if (!options.email.includes("@") && !options.email.includes(".")) {
      return {
        errors: [
          {
            field: "email",
            message: "Email is not formated properly",
          },
        ],
      };
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(options.password, salt);

    const saveUser = UserModel.create({
      username: options.username,
      email: options.email,
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
    const token = generateToken(user);
    sendWelcomeEmail(options.email);
    return { user, token };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("emailOrUsername") emailOrUsername: string,
    @Arg("password") password: string
  ): Promise<UserResponse> {
    const user = await UserModel.findOne(
      emailOrUsername.includes("@")
        ? { email: emailOrUsername }
        : { username: emailOrUsername }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "emailOrUsername",
            message: "A user with that emailOrUsername does not exist",
          },
        ],
      };
    }
    const valid = await bcrypt.compare(password, user.password);
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
    const token = generateToken(user);
    return { user, token };
  }

  @Mutation(() => User!, { nullable: true })
  async delete(
    @Arg("email", () => String) email: string
  ): Promise<User | undefined | null> {
    const user = await UserModel.findOne({ email });

    if (user) {
      await user.deleteOne();
      sendByeEmail(email, (user as any).username);
      return user;
    }

    return null;
  }

  @Mutation(() => User!, { nullable: true })
  async addCreditCard(
    @Arg("userId", () => ID!) userId: typeof ID,
    @Arg("address", () => String!)
    address: Stripe.Emptyable<Stripe.AddressParam>
  ): Promise<User | null> {
    const user = UserModel.findById(userId);

    if (user) {
      await stripe.customers.create({
        email: (user as any).email,
        name: (user as any).username,
        address,
      });
    }
    return null;
  }
}
