type ActionTileProps = {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  variant?: "default" | "destructive";
  className?: string;
};

export const WideAction = ({
  onClick,
  icon: Icon,
  label,
  description,
  variant = "default",
  className = "",
}: ActionTileProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between text-left rounded-lg border px-4 py-3 transition-colors
        ${variant === "destructive"
          ? "text-red-600 hover:bg-red-100 border-red-300 dark:text-red-100 dark:hover:bg-red-950 dark:border-red-900"
          : "hover:bg-gray-100 border-gray-300 text-gray-900 dark:hover:bg-gray-900 dark:border-gray-600 dark:text-gray-100"}
        ${className}
      `}
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <Icon className="w-4 h-4 ml-4 shrink-0" />
    </button>
  );
};


export default WideAction