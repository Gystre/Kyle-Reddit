//kinda of a hacky solution but, takes in a string and returns whether or not it's from slate
//need this cuz supporting old style text and newer formatted style text
export const isSlateObject = (text: string) => {
    return text.startsWith('[{"type":"');
};
