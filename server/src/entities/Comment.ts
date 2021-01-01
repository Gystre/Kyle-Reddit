import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
    @Field() //a "field" exposes this column of information to the api
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    creatorId: number;

    @Field()
    @ManyToOne(() => User)
    creator: User;

    @Field()
    @Column({ type: "int" })
    postId: number;

    @Field()
    @Column()
    text!: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();

    @ManyToOne(() => Post, (post) => post.comments, {
        onDelete: "CASCADE", //delete the entry if a Post is deleted
    })
    post: Post;
}
