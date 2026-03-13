import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-accent bg-accent [color:#ffffff] shadow-[0_10px_24px_rgba(23,58,94,0.16)] hover:border-accent-hover hover:bg-accent-hover hover:[color:#ffffff]",
        secondary:
          "border-border bg-surface text-text-primary shadow-[0_6px_16px_rgba(28,35,43,0.05)] hover:bg-surface-elevated hover:text-text-primary",
        ghost:
          "border-transparent bg-transparent text-text-secondary shadow-none hover:bg-surface-elevated hover:text-text-primary",
        dark:
          "border-text-primary bg-text-primary [color:#ffffff] shadow-[0_10px_24px_rgba(28,35,43,0.14)] hover:border-[#111821] hover:bg-[#111821] hover:[color:#ffffff]",
        whatsapp:
          "border-[#25D366] bg-[#25D366] [color:#ffffff] shadow-[0_10px_24px_rgba(37,211,102,0.18)] hover:border-[#1FB85A] hover:bg-[#1FB85A] hover:[color:#ffffff]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-10 px-4 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
