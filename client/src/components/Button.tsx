import type { ButtonProps } from "../types";
import { cn } from "../utils/helpers";

function Button({
    variant = "primary",
    disabled = false,
    className,
    children,
    onClick,
}: ButtonProps) {
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
        <button
            disabled={disabled}
            className={cn(classes, "text-base", className, {
                "cursor-not-allowed opacity-40": disabled,
            })}
        >
            {children}
        </button>
    );
}
export default Button;
