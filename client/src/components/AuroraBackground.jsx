
import React from "react";
import { cn } from "../lib/utils";

const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  // defaulting to dark as per project's cinemtic theme
  const theme = "dark"; 

  return (
    <main>
      <div
        className={cn(
          "relative flex flex-col h-[100vh] items-center justify-center transition-colors",
          theme === "light" ? "bg-zinc-50 text-slate-950" : "bg-[#0B0F1A] text-white",
          className
        )}
        {...props}
        data-name="aurora-container"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none" data-name="aurora-wrapper">
          <div
            className={cn(
              `
              [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
              [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
              [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
              [background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              filter blur-[10px]
              after:content-[""] after:absolute after:inset-0
              after:[background-size:200%,_100%] 
              after:[background-position:50%_50%,50%_50%]
              after:mix-blend-difference
              pointer-events-none
              absolute -inset-[10px] opacity-50 will-change-transform
              animate-aurora
              after:animate-aurora`,
              theme === "light"
                ? "[background-image:var(--white-gradient),var(--aurora)] after:[background-image:var(--white-gradient),var(--aurora)]"
                : "[background-image:var(--dark-gradient),var(--aurora)] after:[background-image:var(--dark-gradient),var(--aurora)] invert-0",
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
            data-name="aurora-effect"
          ></div>
        </div>
        <div className="relative z-10 w-full">
          {children}
        </div>
      </div>
    </main>
  );
};

export default AuroraBackground;
