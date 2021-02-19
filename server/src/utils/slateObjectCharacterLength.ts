import { Node } from "slate";
import jp from "jsonpath";

export const slateObjectCharacterLength = (textBody: Node[]) => {
    var textCount = 0;
    const texts = jp.query(textBody, "$..text");

    texts.forEach((item) => {
        textCount += item.length;
    });

    return textCount;
};
