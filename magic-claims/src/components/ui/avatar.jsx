import { cn } from "../../lib/utils"; // Adjust path if your utils file is elsewhere

export function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ className, ...props }) {
  return (
    <img
      className={cn("aspect-square h-full w-full", className)}
      {...props}
      alt={props.alt || "Avatar"}
    />
  );
}

export function AvatarFallback({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted text-muted-foreground font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
