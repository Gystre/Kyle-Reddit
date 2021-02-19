import React, { PropsWithChildren, Ref, RefObject } from "react";
import { ClassNames } from "@emotion/react";

interface BaseProps {
    className: string;
    [key: string]: unknown;
}

type OrNull<T> = T | null;

const Menu = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref:
            | string
            | ((instance: OrNull<HTMLDivElement>) => void)
            | RefObject<HTMLDivElement>
            | null
            | undefined
    ) => (
        <ClassNames>
            {({ css, cx }) => (
                <div
                    {...props}
                    ref={ref}
                    className={cx(
                        className,
                        css`
                            & > * {
                                display: inline-block;
                            }
                            & > * + * {
                                margin-left: 15px;
                            }
                        `
                    )}
                />
            )}
        </ClassNames>
    )
);

export const ToolBarButton = React.forwardRef(
    (
        {
            className,
            active,
            reversed,
            ...props
        }: PropsWithChildren<
            {
                active: boolean;
                reversed: boolean;
            } & BaseProps
        >,
        ref:
            | string
            | ((instance: OrNull<HTMLSpanElement>) => void)
            | RefObject<HTMLSpanElement>
            | null
            | undefined
    ) => (
        <ClassNames>
            {({ css, cx }) => (
                <span
                    {...props}
                    ref={ref}
                    className={cx(
                        className,
                        css`
                            cursor: pointer;
                            color: ${reversed
                                ? active
                                    ? "white"
                                    : "#aaa"
                                : active
                                ? "black"
                                : "#ccc"};
                        `
                    )}
                />
            )}
        </ClassNames>
    )
);

export const Icon = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref:
            | string
            | RefObject<HTMLSpanElement>
            | ((instance: OrNull<HTMLSpanElement>) => void)
            | null
            | undefined
    ) => (
        <ClassNames>
            {({ css, cx }) => (
                <span
                    {...props}
                    ref={ref}
                    className={cx(
                        "material-icons",
                        className,
                        css`
                            font-size: 18px;
                            vertical-align: text-bottom;
                        `
                    )}
                />
            )}
        </ClassNames>
    )
);

export const Toolbar = React.forwardRef(
    (
        { className, ...props }: PropsWithChildren<BaseProps>,
        ref:
            | RefObject<HTMLDivElement>
            | ((instance: OrNull<HTMLDivElement>) => void)
            | null
            | undefined
    ) => (
        <ClassNames>
            {({ css, cx }) => (
                <Menu
                    {...props}
                    ref={ref}
                    className={cx(
                        className,
                        css`
                            position: relative;
                            padding: 1px 18px 17px;
                            border-bottom: 2px solid #eee;
                            margin-top: 20px;
                            margin-bottom: 20px;
                        `
                    )}
                />
            )}
        </ClassNames>
    )
);
