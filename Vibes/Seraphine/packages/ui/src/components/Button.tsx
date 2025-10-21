import { ComponentPropsWithoutRef } from "react";

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary";
};

export const Button = ({ variant = "primary", className = "", ...props }: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variantClass =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-500"
      : "bg-muted text-foreground hover:bg-muted/80 focus-visible:ring-muted";

  return <button className={`${base} ${variantClass} ${className}`.trim()} {...props} />;
};
