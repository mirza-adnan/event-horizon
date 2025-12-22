export type ButtonProps = {
    variant: "primary" | "secondary" | "tertiary";
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    onClick?: (e: MouseEvent) => void;
};
