import { Field, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Comment } from "./Comment";
import { Updoot } from "./Updoot";
import { User } from "./User";

@ObjectType()
@Entity()
//BaseEntity = generic entity that lets us do Post.find or Post.insert
export class Post extends BaseEntity {
    //4 columns will be created b/c there are 4 properties here
    @Field() //a "field" exposes this column of information to the api
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    creatorId: number;

    @Field(() => Int, { nullable: true })
    voteStatus: number | null; //1 or -1 or null

    @Field()
    @ManyToOne(() => User, (user) => user.posts) //will create a foreign key to user's table so store in creatorId
    creator: User;

    @OneToMany(() => Updoot, (updoot) => updoot.post)
    updoots: Updoot[];

    @OneToMany(() => Comment, (comment) => comment.post)
    comments: Comment[];

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({ type: "int", default: 0 })
    points!: number;

    @Field(() => String) //make sure explicitly defining type for every field
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => String)
    @Column({ default: "" })
    imageLink: String;
}
