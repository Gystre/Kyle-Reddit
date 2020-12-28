import { Field, Int, ObjectType } from "type-graphql";
import {
    Entity,
    BaseEntity,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    ManyToOne,
} from "typeorm";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
    @Column({ type: "string" })
    text: string;

    @Field()
    @Column({ type: "int" })
    userId: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();

    @ManyToOne(() => Post, (post) => post.comments, {
        onDelete: "CASCADE",
    })
    post: Post;
}
