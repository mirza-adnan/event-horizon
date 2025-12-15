import type { ButtonProps } from "../types";

function Button({ variant = "primary", children }: ButtonProps) {
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

    return <button className={classes + " text-base"}>{children}</button>;
}
export default Button;
