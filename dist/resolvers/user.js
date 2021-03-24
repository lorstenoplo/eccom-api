"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const User_1 = require("../entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../utils/sendEmail");
let RegisterInput = class RegisterInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RegisterInput.prototype, "username", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RegisterInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], RegisterInput.prototype, "password", void 0);
RegisterInput = __decorate([
    type_graphql_1.InputType()
], RegisterInput);
let FieldError = class FieldError {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    type_graphql_1.ObjectType()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    type_graphql_1.Field(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    type_graphql_1.Field(() => User_1.User, { nullable: true }),
    __metadata("design:type", Object)
], UserResponse.prototype, "user", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", Object)
], UserResponse.prototype, "token", void 0);
UserResponse = __decorate([
    type_graphql_1.ObjectType()
], UserResponse);
function generateToken(user) {
    return jsonwebtoken_1.default.sign({
        id: user === null || user === void 0 ? void 0 : user.id,
        username: user === null || user === void 0 ? void 0 : user.username,
    }, process.env.JWT_KEY || "@njkddm#jkim");
}
let UserResolver = class UserResolver {
    me(token) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const decodedUser = jsonwebtoken_1.default.decode(token);
            const uid = (_a = decodedUser) === null || _a === void 0 ? void 0 : _a.id;
            const user = yield User_1.UserModel.findOne({ _id: uid });
            if (!user) {
                return null;
            }
            return user;
        });
    }
    report(problem, username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!username) {
                return false;
            }
            sendEmail_1.sendEmail(process.env.REPORT_TARGET_EMAIL, problem, username);
            return true;
        });
    }
    register(options) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const salt = bcryptjs_1.default.genSaltSync(10);
            const hashedPassword = yield bcryptjs_1.default.hash(options.password, salt);
            const saveUser = User_1.UserModel.create({
                username: options.username,
                email: options.email,
                password: hashedPassword,
                createdAt: new Date(),
            });
            try {
                (yield saveUser).save();
            }
            catch (error) {
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
            const user = yield User_1.UserModel.findOne({ username: options.username });
            const token = generateToken(user);
            sendEmail_1.sendWelcomeEmail(options.email);
            return { user, token };
        });
    }
    login(emailOrUsername, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.UserModel.findOne(emailOrUsername.includes("@")
                ? { email: emailOrUsername }
                : { username: emailOrUsername });
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
            const valid = yield bcryptjs_1.default.compare(password, user.password);
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
        });
    }
    delete(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.UserModel.findOne({ username });
            if (user) {
                yield user.deleteOne();
                return user;
            }
            return null;
        });
    }
};
__decorate([
    type_graphql_1.Query(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean, { nullable: true }),
    __param(0, type_graphql_1.Arg("problem")),
    __param(1, type_graphql_1.Arg("username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "report", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => UserResponse),
    __param(0, type_graphql_1.Arg("emailOrUsername")),
    __param(1, type_graphql_1.Arg("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    type_graphql_1.Mutation(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg("username", () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "delete", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map