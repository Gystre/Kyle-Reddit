import { MyContext } from "src/types";
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";
import { isAuth } from "../middleware/isAuth";
import { PostInput } from "./PostInput";
import { PostResponse } from "./responses/PostResponse";
import { validatePost } from "./validation/validatePost";

const SNIPPET_LENGTH = 250;
const SNIPPET_WITH_PICTURE_LENGTH = 100;

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    //Query = getting data
    //Mutation = updating, inserting, or deleting data (anything changing)

    //FieldResolver = will be called every time we get a post object
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        if (root.imageLink != "") {
            return root.text.slice(0, SNIPPET_WITH_PICTURE_LENGTH);
        }

        return root.text.slice(0, SNIPPET_LENGTH);
    }

    //will always fetch the creator
    @FieldResolver(() => User)
    creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
        //batch all sql requests into a single one using dataloader
        return userLoader.load(post.creatorId);
    }

    @FieldResolver(() => Int, { nullable: true })
    async voteStatus(
        @Root() post: Post,
        @Ctx() { updootLoader, req }: MyContext
    ) {
        if (!req.session.userId) {
            return null;
        }

        //gather the updoot values in one big sql statement
        const updoot = await updootLoader.load({
            postId: post.id,
            userId: req.session.userId,
        });

        return updoot ? updoot.value : null;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;

        const updoot = await Updoot.findOne({ where: { postId, userId } });
        //user has voted on post before
        //and they are changing their vote
        if (updoot && updoot.value !== realValue) {
            await getConnection().transaction(async (tm) => {
                await tm.query(
                    `
                    update updoot
                    set value = $1
                    where "postId" = $2 and "userId" = $3
                `,
                    [realValue, postId, userId]
                );

                //update the point value on the post
                await tm.query(
                    `
                    update post
                    set points = points + $1
                    where id = $2
                `,
                    [2 * realValue, postId] //multiply by 2 here b/c post needs to go from say 1 -> -1 a 2 point difference
                );
            });
        } else if (!updoot) {
            //never vote before
            await getConnection().transaction(async (tm) => {
                //create new entry inside the updoot table containg who voted, what they voted, and on what post they voted
                await tm.query(
                    `
                    insert into updoot ("userId", "postId", value)
                    values ($1, $2, $3);
                `,
                    [userId, postId, realValue]
                );

                //update the post's own point count
                await tm.query(
                    `
                    update post
                    set points = points + $1
                    where id = $2
                `,
                    [realValue, postId]
                );
            });
        }

        return true;
    }

    @Query(() => PaginatedPosts) //return type
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);

        //add one to the amount of posts we're getting, if that 1 extra post exists then there is more data
        const realLimitPlusOne = realLimit + 1;

        const replacements: any[] = [realLimitPlusOne];

        //passed in a cursor? then take all posts after the timestamp
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        //performing a join between 2 queries, one post and one for the post itself
        //first line = reference the post table and select all the fields on it
        //inner join = using public.user b/c we have table conflicts when just using the user table
        const posts = await getConnection().query(
            `
            select p.*
            from post p
            ${cursor ? `where p."createdAt" < $2` : ""}
            order by p."createdAt" DESC
            limit $1
          `,
            replacements
        );

        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }

    @Query(() => Post, { nullable: true })
    post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
        //need to add creator relation b/c we expect it on the post.graphql in the frontend
        //called "creator" b/c name inside entity
        return Post.findOne(id);
    }

    @Mutation(() => PostResponse)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<PostResponse> {
        const errors = validatePost(input);
        if (errors) {
            return { errors };
        }

        return {
            post: await Post.create({
                ...input,
                creatorId: req.session.userId,
            }).save(),
        };
    }

    @Mutation(() => PostResponse, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", () => Int) id: number,
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<PostResponse | null> {
        console.log(input);
        const errors = validatePost(input);

        if (errors) {
            return { errors };
        }

        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({
                title: input.title,
                text: input.text,
                imageLink: input.imageLink,
            })
            .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
            .returning("*")
            .execute();

        //return the newly edited post
        return { post: result.raw[0] };
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        //not cascade way
        // const post = await Post.findOne(id);
        // //ensure post exists
        // if (!post) {
        //     return false;
        // }

        // //make sure they are author of post
        // if (post?.creatorId !== req.session.userId) {
        //     throw new Error("not authorized");
        // }

        // //delete updoot entry and post entry
        // await Updoot.delete({ postId: id });
        // await Post.delete({ id });

        //cascade way
        //urql will handle deleting any entries that use the postId b/c we specify it in the entity (Updoot)
        await Post.delete({ id, creatorId: req.session.userId });

        return true;
    }
}
