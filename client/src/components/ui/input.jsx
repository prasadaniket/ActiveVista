import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "input-dark h-9 w-full min-w-0 rounded-md px-3 py-1 text-sm shadow-xs transition-all outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text",
        "placeholder:text-muted/50 selection:bg-primary/30 selection:text-white",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props} />
  );
}

export { Input }
