import { Comment } from "../../entities/Comment";
import { Field, ObjectType } from "type-graphql";
import { Response } from "./Response";

@ObjectType()
export class CommentResponse extends Response {
    @Field(() => Comment, { nullable: true })
    comment?: Comment;
}
