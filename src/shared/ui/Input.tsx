import * as React from "react"
import { cn } from "@/shared/lib/cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    const errorId = React.useId();
    return (
      <div className="relative w-full space-y-1">
        <input
          type={type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 backdrop-blur-xl transition-all duration-300",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400",
            "focus-visible:outline-none focus-visible:border-white/15 focus-visible:bg-white/7 focus-visible:ring-1 focus-visible:ring-white/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive/50 focus-visible:border-destructive/60 focus-visible:ring-destructive/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-[10px] font-mono uppercase tracking-wider text-destructive/80 ml-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, ...props }, ref) => {
    const errorId = React.useId();
    return (
      <div className="relative w-full space-y-1">
        <textarea
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 backdrop-blur-xl transition-all",
            "placeholder:text-zinc-400 focus-visible:outline-none focus-visible:border-white/15 focus-visible:bg-white/7 focus-visible:ring-1 focus-visible:ring-white/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive/50 focus-visible:border-destructive/60 focus-visible:ring-destructive/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-[10px] font-mono uppercase tracking-wider text-destructive/80 ml-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
TextArea.displayName = "TextArea"

export { Input, TextArea }
