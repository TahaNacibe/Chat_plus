import { Button } from "@/components/ui/button";

const ActionButton = ({
  onClick,
  icon: Icon,
  label,
  description,
  variant = "default",
  className = "",
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
  className?: string;
}) => (
  <Button
    onClick={onClick}
    variant={variant}
    className={`
      flex items-center justify-between text-left px-4 py-3 
      ${className}
      ${
        variant === "default"
          ? "bg-gray-900 text-white hover:bg-gray-800"
          : variant === "outline"
          ? "border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
          : variant === "destructive"
          ? "bg-red-600 text-white hover:bg-red-700"
          : ""
      }
    `}
  >
    <div className="flex flex-col">
      <span className="text-sm font-medium">{label}</span>
      {description && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </div>
    <Icon className="h-4 w-4 ml-4 shrink-0" />
  </Button>
);



export default ActionButton