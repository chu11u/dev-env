import {
 type ButtonHTMLAttributes,
 type AnchorHTMLAttributes,
 type ReactNode,
} from "react";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "outline";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}

interface ButtonProps extends BaseProps, ButtonHTMLAttributes\u003cHTMLButtonElement\u003e {
  onClick?: () =\u003e void;
  href?: never;
}

interface LinkButtonProps extends BaseProps, AnchorHTMLAttributes\u003cHTMLAnchorElement\u003e {
  href: string;
  onClick?: never;
}

type Props = ButtonProps | LinkButtonProps;

const variantClasses: Record\u003cButtonVariant, string\u003e = {
  primary: "bg-rose-400 text-white hover:bg-rose-500 focus-visible:bg-rose-600",
  secondary:
      "bg-burgundy-500 text-white hover:bg-burgundy-600 focus-visible:bg-burgundy-700",
  outline:
      "border-2 border-rose-400 text-rose-400 hover:bg-rose-400 hover:text-white focus-visible:bg-rose-400 focus-visible:text-white",
 };

const sizeClasses: Record\u003cButtonSize, string\u003e = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-7 py-3 text-lg rounded-2xl",
 };

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
   ...rest
}: Props) {
  const base =
      "inline-flex items-center justify-center font-body font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:btn-focus";

  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in rest \u0026\u0026 rest.href) {
    return (
         \u003ca
          href={rest.href}
          className={classes}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
           {...(rest as AnchorHTMLAttributes\u003cHTMLAnchorElement\u003e)}
        \u003e
          {children}
        \u003c/a\u003e
      );
    }

  return (
      \u003cbutton
       className={classes}
       disabled={disabled}
        {...(rest as ButtonHTMLAttributes\u003cHTMLButtonElement\u003e)}
      \u003e
        {children}
      \u003c/button\u003e
    );
}

export default Button;
