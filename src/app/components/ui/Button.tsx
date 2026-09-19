import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "accept" | "reject";
};

const backgrounds = {
  default: "bg-primary",
  accept: "bg-success",
  reject: "bg-badge",
};

export default function Button({
  children,
  variant = "default",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`${backgrounds[variant]} w-full rounded-lg px-1 py-1 text-center text-xs font-bold text-white ${className}`}
    >
      {children}
    </button>
  );
}
