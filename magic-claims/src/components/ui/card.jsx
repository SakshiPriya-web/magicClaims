export const Card = ({ children, className }) => (
  <div className={`bg-white shadow rounded p-4 ${className || ""}`}>{children}</div>
);

export const CardHeader = ({ children, className }) => (
  <div className={`mb-2 ${className || ""}`}>{children}</div>
);

export const CardContent = ({ children, className }) => (
  <div className={`p-2 ${className || ""}`}>{children}</div>
);

export const CardTitle = ({ children, className }) => (
  <h2 className={`font-bold text-lg ${className || ""}`}>{children}</h2>
);

export const CardDescription = ({ children, className }) => (
  <p className={`text-sm text-gray-500 ${className || ""}`}>{children}</p>
);
