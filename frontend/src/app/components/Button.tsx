import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-colors ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}