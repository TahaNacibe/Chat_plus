const Section = ({
  title,
  icon: Icon,
  children
}: {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <div className="space-y-6 bg-white dark:bg-black p-6">
    {title && (
      <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 pb-4">
        {Icon && <Icon className="h-5 w-5 text-gray-900 dark:text-gray-100" />}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      </div>
    )}
    {children}
  </div>
);



export default Section