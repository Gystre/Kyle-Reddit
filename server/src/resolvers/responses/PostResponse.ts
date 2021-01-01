import { Post } from "../../entities/Post";
import { ObjectType, Field } from "type-graphql";
import { Response } from "./Response";

@ObjectType()
export class PostResponse extends Response {
    @Field(() => Post, { nullable: true })
    post?: Post;
}
