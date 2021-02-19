import { isHotkey } from "is-hotkey";
import React, { useCallback, useMemo } from "react";
import { Helmet } from "react-helmet";
import {
    createEditor,
    Editor,
    Node,
    Element as SlateElement,
    Transforms,
} from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, useSlate, withReact } from "slate-react";
import { Icon, Toolbar, ToolBarButton } from "./Toolbar";

const HOTKEYS: any = {
    "mod+b": "bold",
    "mod+i": "italic",
    "mod+u": "underline",
    "mod+`": "code",
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

interface RichTextEditorProps {
    textBody: Node[];
    setTextBodyValue: React.Dispatch<React.SetStateAction<Node[]>>;
    placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    textBody,
    setTextBodyValue,
    placeholder,
}) => {
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const renderElement = useCallback((props) => <Element {...props} />, []);
    const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

    return (
        <div>
            <Helmet>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/icon?family=Material+Icons"
                />
            </Helmet>
            <Slate
                editor={editor}
                value={textBody}
                onChange={(value) => setTextBodyValue(value)}
            >
                <Toolbar>
                    <MarkButton format="bold" icon="format_bold" />
                    <MarkButton format="italic" icon="format_italic" />
                    <MarkButton format="underline" icon="format_underlined" />
                    <MarkButton format="code" icon="code" />
                    <BlockButton format="heading-one" icon="looks_one" />
                    <BlockButton format="heading-two" icon="looks_two" />
                    <BlockButton format="block-quote" icon="format_quote" />
                    <BlockButton
                        format="numbered-list"
                        icon="format_list_numbered"
                    />
                    <BlockButton
                        format="bulleted-list"
                        icon="format_list_bulleted"
                    />
                </Toolbar>
                <Editable
                    style={{ paddingLeft: "16px" }}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    placeholder={placeholder || ""}
                    spellCheck
                    autoFocus
                    onKeyDown={(event) => {
                        for (const hotkey in HOTKEYS) {
                            if (isHotkey(hotkey, event as any)) {
                                event.preventDefault();
                                const mark = HOTKEYS[hotkey];
                                toggleMark(editor, mark);
                            }
                        }
                    }}
                />
            </Slate>
        </div>
    );
};

interface RichTextViewerProps {
    textBody: Node[];
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({ textBody }) => {
    const editor = useMemo(() => withReact(createEditor()), []);
    const renderElement = useCallback((props) => <Element {...props} />, []);
    const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

    return (
        <Slate editor={editor} value={textBody} onChange={(value) => {}}>
            <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                readOnly
            />
        </Slate>
    );
};

const isBlockActive = (editor: Editor, format: string) => {
    const [match] = Editor.nodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === format,
    });

    return !!match;
};

const toggleBlock = (editor: Editor, format: string) => {
    const isActive = isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
        match: (n) =>
            LIST_TYPES.includes(
                !Editor.isEditor(n) && SlateElement.isElement(n) && n.type
            ),
        split: true,
    });
    const newProperties: Partial<SlateElement> = {
        type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
    Transforms.setNodes(editor, newProperties);

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};

const BlockButton = ({ format, icon }: any) => {
    const editor = useSlate();
    return (
        <ToolBarButton
            active={isBlockActive(editor, format)}
            onMouseDown={(event: Event) => {
                event.preventDefault();
                toggleBlock(editor, format);
            }}
        >
            <Icon>{icon}</Icon>
        </ToolBarButton>
    );
};

const MarkButton = ({ format, icon }: any) => {
    const editor = useSlate();
    return (
        <ToolBarButton
            active={isMarkActive(editor, format)}
            onMouseDown={(event: Event) => {
                event.preventDefault();
                toggleMark(editor, format);
            }}
        >
            <Icon>{icon}</Icon>
        </ToolBarButton>
    );
};

const isMarkActive = (editor: Editor, format: string) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: string) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

const Element = ({ attributes, children, element }: any) => {
    switch (element.type) {
        case "block-quote":
            return (
                <blockquote
                    style={{
                        borderLeft: "2px solid #ddd",
                        marginLeft: 0,
                        MarginRight: 0,
                        paddingLeft: "10px",
                        color: "#aaa",
                        fontStyle: "italic",
                    }}
                    {...attributes}
                >
                    {children}
                </blockquote>
            );
        case "bulleted-list":
            return <ul {...attributes}>{children}</ul>;
        case "heading-one":
            return (
                <h1
                    style={{ fontSize: "2em", fontWeight: "bold" }}
                    {...attributes}
                >
                    {children}
                </h1>
            );
        case "heading-two":
            return (
                <h2
                    style={{ fontSize: "1.5em", fontWeight: "bold" }}
                    {...attributes}
                >
                    {children}
                </h2>
            );
        case "list-item":
            return <li {...attributes}>{children}</li>;
        case "numbered-list":
            return <ol {...attributes}>{children}</ol>;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const Leaf = ({ attributes, children, leaf }: any) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code>{children}</code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }

    if (leaf.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};
