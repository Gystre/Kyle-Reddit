import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

//[{postId: 5, userId: 10}]
//return [{postId: 5, userId: 10}, value: 1]

//will return the Updoot object or null if you haven't updooted the post
export const createUpdootLoader = () =>
    new DataLoader<{ postId: number; userId: number }, Updoot | null>(
        async (keys) => {
            //find the users by their ids
            const updoots = await Updoot.findByIds(keys as any);
            const updootIdsToUpdoot: Record<string, Updoot> = {};

            //fill the array with the users at the id index
            updoots.forEach((updoot) => {
                updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
            });

            //map the returned objects to their respective ids
            return keys.map(
                (key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]
            );
        }
    );
