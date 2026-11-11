import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:pointer-events-none disabled:opacity-50", { variants: { variant: { default: "bg-[var(--primary)] text-white hover:opacity-90", outline: "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]", ghost: "text-[var(--ink)] hover:bg-[var(--hover)]" } }, defaultVariants: { variant: "default" } });
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export function Button({ className, variant, asChild = false, ...props }: ButtonProps) { const Comp = asChild ? Slot : "button"; return <Comp className={cn(buttonVariants({variant}),className)} {...props}/>; }
