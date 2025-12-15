import { Link } from "react-router-dom";
import type { ButtonProps } from "../types";

type Props = {
    path: string;
} & ButtonProps;

function LinkButton({ variant = "primary", children, path }: Props) {
    let classes = "";

    if (variant === "primary") {
        classes =
            "py-2 px-4 bg-accent text-black rounded-lg border-2 border-accent";
    } else if (variant === "secondary") {
        classes = "py-2 px-4 border-2 border-accent rounded-lg text-accent";
    } else if (variant === "tertiary") {
        classes =
            "underline px-1 decoration-accent text-accent underline-offset-4";
    }

    return (
        <Link
            to={path}
            className={classes}
        >
            {children}
        </Link>
    );
}
export default LinkButton;
