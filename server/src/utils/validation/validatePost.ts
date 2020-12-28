import { PostInput } from "../../resolvers/PostInput";

export const validatePost = (options: PostInput) => {
    //check if there is title
    if (options.title.length == 0) {
        return [
            {
                field: "title",
                message: "You need to put something for the title",
            },
        ];
    }

    //check if there is image and if there is then make sure in right file format
    if (options.imageLink.length != 0) {
        const ext = options.imageLink.split(".").pop()?.toLowerCase();
        if (
            ext != "jpeg" &&
            ext != "jpg" &&
            ext != "png" &&
            ext != "bmp" &&
            ext != "gif"
        ) {
            return [
                {
                    field: "imageLink",
                    message: "Ur file needs to be jpg, jpeg, png, bmp, or gif",
                },
            ];
        }
    }

    return null;
};
