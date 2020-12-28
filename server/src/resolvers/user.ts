import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
    Resolver,
    Field,
    Mutation,
    Ctx,
    Arg,
    ObjectType,
    Query,
    FieldResolver,
    Root,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { FieldError } from "./FieldErrorObject";
import { validateRegister } from "../utils/validation/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

//object types are returned from the mutations
//the return response from the mutation, will be optional (?) so that it's one or the other
@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

//passing the user int othe resolver
@Resolver(User)
export class UserResolver {
    //a field level resolver will run whenever a graphql query is made
    //make sure other users can't see other people's emails
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        //this is current user and its ok to show their own email
        if (req.session.userId === user.id) {
            return user.email;
        }
        //current user wants to see someone elses email
        return "";
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length < 3) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "length must be greater than 3",
                    },
                ],
            };
        }

        const key = FORGET_PASSWORD_PREFIX + token;

        //make sure the token is valid
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "token expired",
                    },
                ],
            };
        }

        //find the user according to their id
        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "user no longer exists",
                    },
                ],
            };
        }

        //save the new password to the db
        User.update(
            { id: userIdNum },
            { password: await argon2.hash(newPassword) }
        );

        //remove the key from redis so it can't be used anymore
        await redis.del(key);

        //login user after changing the password
        req.session.userId = user.id;

        return { user };
    }

    //email the user a link they can click to reset their password
    //contains a uuid that is good for one time
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            //email not in db
            //returning true and doing nothing to prevent people from phishing through website for valid emails
            return true;
        }

        //create unique one time use token
        const token = v4();

        //store the token in redis
        await redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            "ex",
            1000 * 60 * 60 * 24 * 3 //good for up to 3 days
        );

        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
        );
        return true;
    }

    @Query(() => User, { nullable: true })
    me(@Ctx() { req }: MyContext) {
        //not logged in
        if (!req.session.userId) {
            return null;
        }
        return User.findOne(req.session.userId);
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options")
        options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) {
            return { errors };
        }

        //add the user
        //hash password and create the object in the User table
        const hashedPassword = await argon2.hash(options.password);
        let user;
        try {
            // alternative:
            //User.create({ stuff goes here}).save()

            //insert user using the query builder
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    username: options.username,
                    email: options.email,
                    password: hashedPassword,
                })
                .returning("*") //the * means return everything
                .execute();

            user = result.raw[0];
        } catch (err) {
            //duplicate username error
            if (err.code === "23505" || err.detail.includes("already exists")) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username has already been taken",
                        },
                    ],
                };
            }
            console.log("message: ", err.message);
        }

        //store uid session
        //set a cookie on the user and keep them logged in
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        //find the user in the database
        const user = await User.findOne(
            usernameOrEmail.includes("@")
                ? { where: { email: usernameOrEmail } }
                : { where: { username: usernameOrEmail } }
        );
        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "that username doesn't exist",
                    },
                ],
            };
        }

        //check password
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password",
                    },
                ],
            };
        }

        //req.session kind of like a global object that can be accessed from all resolvers
        req.session.userId = user.id;

        return { user };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyContext) {
        //remove session from redis
        //wait for destroy to finsh with a promise
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                //destroy the cookie even if we couldn't destroy the session
                res.clearCookie(COOKIE_NAME);

                if (err) {
                    console.log(err);

                    //respond false
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        );
    }
}
