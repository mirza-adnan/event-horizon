import { type ChangeEvent, type HTMLInputTypeAttribute } from "react";
import { cn } from "../utils/helpers";

type InputProps = {
  name?: string;
  className?: string;
  type: HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  label?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

function Input({
  name = "",
  className,
  type = "text",
  placeholder,
  required = false,
  label = "",
  onChange,
}: InputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="" className="block ml-1">
        {label}
        {"   "}
        {required && <span className="text-danger text-xl">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={cn(
          "p-3 rounded-lg bg-[#141414] text-text-strong w-full border-none outline-none focus:outline-1 focus:outline-accent",
          className
        )}
        required={required}
        onChange={onChange}
      />
    </div>
  );
}

export default Input;
