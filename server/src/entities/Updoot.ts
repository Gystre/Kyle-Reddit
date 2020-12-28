import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

/*
many to many

user <-> posts
user -> join table <- posts
user -> updoot <- posts
*/

//this table will be uniquely categorized by the userId and postId
//meaning only one person can like or dislike the post once
@Entity()
export class Updoot extends BaseEntity {
    //the "value" of the post, as in like the points
    @Column({ type: "int" })
    value: number;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, (user) => user.updoots) //will create a foreign key to user's table so store in creatorId
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, (post) => post.updoots, {
        onDelete: "CASCADE", //delete the entry if a Post is deleted
    })
    post: Post;
}
