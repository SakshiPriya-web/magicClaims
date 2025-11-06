export const Popover = ({ children }) => <div className="relative">{children}</div>;
export const PopoverTrigger = ({ children, asChild }) => <div>{children}</div>;
export const PopoverContent = ({ children, className }) => (
  <div className={`absolute z-10 bg-white border p-2 rounded shadow ${className || ""}`}>
    {children}
  </div>
);
