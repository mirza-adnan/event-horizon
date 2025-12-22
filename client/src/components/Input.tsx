import { type ChangeEvent, type HTMLInputTypeAttribute } from "react";
import { cn } from "../utils/helpers";

type InputProps = {
    name?: string;
    className?: string;
    type?: HTMLInputTypeAttribute;
    placeholder?: string;
    required?: boolean;
    label?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    error?: string;
};

function Input({
    name = "",
    className,
    type = "text",
    placeholder,
    required = false,
    label = "",
    onChange,
    value,
    error,
}: InputProps) {
    return (
        <div className="space-y-2">
            <label className="block ml-1">
                {label}
                {"   "}
                {required && <span className="text-danger text-xl">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                placeholder={placeholder}
                className={cn(
                    "w-full px-4 py-2 rounded-lg bg-zinc-800 text-white border-none outline-none ring-1 ring-[#373737] focus:ring-accent",
                    className
                )}
                required={required}
                onChange={onChange}
            />
            {error && <p className="text-danger text-sm mt-1">{error}</p>}
        </div>
    );
}

export default Input;
