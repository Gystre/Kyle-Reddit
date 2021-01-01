import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { Comment } from "./Comment";

// export type UserPermissionType = "admin" | "user";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field()
    @Column()
    password!: string;

    // @Column({
    //     type: "enum",
    //     enum: ["admin", "user"],
    //     default: "user",
    // })
    // permissionLevel: UserPermissionType;

    //one user can have multiple posts, an "array" of them wowoowowwo!!!!
    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[];

    @OneToMany(() => Comment, (comment) => comment.creator)
    comments: Comment[];

    @OneToMany(() => Updoot, (updoot) => updoot.user)
    updoots: Updoot[];

    @Field(() => String)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = new Date();
}
