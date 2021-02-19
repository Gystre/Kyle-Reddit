import { MyContext } from "src/types";
import {
    Arg,
    Ctx,
    FieldResolver,
    Int,
    Mutation,
    Query,
    Resolver,
    Root,
    UseMiddleware,
} from "type-graphql";
import { Comment } from "../entities/Comment";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { CommentResponse } from "./responses/CommentResponse";
import { User } from "../entities/User";
import { slateObjectCharacterLength } from "../utils/slateObjectCharacterLength";

@Resolver(Comment)
export class CommentResolver {
    @FieldResolver(() => User)
    creator(@Root() comment: Comment, @Ctx() { userLoader }: MyContext) {
        //batch all sql requests into a single one using dataloader
        return userLoader.load(comment.creatorId);
    }

    @Query(() => [Comment])
    async comments(
        @Arg("postId", () => Int) postId: number
    ): Promise<Comment[]> {
        const comments = await getConnection()
            .getRepository(Comment)
            .createQueryBuilder("comment")
            .leftJoinAndSelect("comment.post", "post")
            .where("comment.postId = :postId", {
                postId,
            })
            .orderBy('comment."createdAt"', "DESC")
            .getMany();

        return comments;
    }

    @Mutation(() => CommentResponse)
    @UseMiddleware(isAuth)
    async createComment(
        @Arg("postId", () => Int) postId: number,
        @Arg("text", () => String) text: string,
        @Ctx() { req }: MyContext
    ): Promise<CommentResponse> {
        //text is in slate form so gonna be an object
        var characterCount = slateObjectCharacterLength(JSON.parse(text));
        //make sure comment isn't empty
        if (characterCount == 0) {
            return {
                errors: [
                    {
                        field: "text",
                        message:
                            "Your comment needs to be longer than 0 characters!",
                    },
                ],
            };
        }

        //can't be longer than 250
        if (characterCount > 250) {
            return {
                errors: [
                    {
                        field: "text",
                        message:
                            "Your comment can't be longer than 250 characters!",
                    },
                ],
            };
        }

        //increase the amount of comments on the post
        await getConnection().transaction(async (tm) => {
            await tm.query(
                `
                    update post
                    set "commentsCount" = "commentsCount" + 1
                    where id = $1
                `,
                [postId]
            );
        });

        return {
            comment: await Comment.create({
                text,
                postId,
                creatorId: req.session.userId,
            }).save(),
        };
    }
}
