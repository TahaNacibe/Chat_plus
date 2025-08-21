import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Info, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const FormField = ({
  label,
  icon: Icon,
  description,
  children,
  htmlFor,
  hint
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  children: React.ReactNode;
  htmlFor: string;
  hint?: string;
}) => (
  <div className="space-y-3">
    <div className="flex items-center space-x-2">
      {Icon && <Icon className="h-4 w-4 text-gray-900 dark:text-white" />}
      <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-900 dark:text-white">
        {label}
      </label>
    </div>
    {hint && <Hint message={hint} />}
    {description && (
      <p className="text-xs text-gray-600 dark:text-gray-100 -mt-1">{description}</p>
    )}
    {children}
  </div>
);


const Hint = ({ message }: { message: string }) => (
  <div className="flex items-start space-x-2 p-3 bg-gray-50 border border-gray-200 dark:bg-black/50 dark:border-gray-800 rounded-lg">
    <Info className="h-4 w-4 text-gray-600 dark:text-gray-300 mt-0.5 flex-shrink-0" />
    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
  </div>
);
const PasswordInput = ({
  value,
  onChange,
  placeholder,
  id,
  className = ""
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  id: string;
  className?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700  dark:text-gray-200 dark:hover:text-gray-300"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

const SwitchField = ({
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (e: boolean) => void;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
    <div className="flex items-center space-x-3">
      {Icon && <Icon className="h-5 w-5 text-gray-900 dark:text-white" />}
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && <p className="text-sm text-gray-600 dark:text-gray-200">{description}</p>}
      </div>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="ml-4 bg-black dark:bg-white"
    />
  </div>
);


const TextInput = ({
  value,
  onChange,
  placeholder,
  id,
  className = ""
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  id: string;
  className?: string;
}) => {
  
  return (
    <div className="relative">
      <Input
        id={id}
        type={"text"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`pr-10 ${className}`}
      />
    </div>
  );
};


const NumberInput = ({
  value,
  onChange,
  id,
  className = "",
  min,
  max,
  step
}: {
  value: number;
  onChange: (value: any) => void;
  id: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}) => {
  return (
    <div className="relative">
      <Input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const num = parseInt(e.target.value, 10);
          if (!isNaN(num)) {
            onChange(num);
          } else {
            onChange(0); // fallback if empty or invalid
          }
        }}
        className={`pr-10 ${className}`}
      />
    </div>
  );
}


const SelectInput = ({
  value,
  onChange,
  placeholder,
  options,
  className = ""
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  id: string;
  options: {label:string, value:string}[]
  className?: string;
}) => {
  
  return (
    <div className="relative">
      <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
        <SelectContent className={ className }>
          {options.map((item, index) => {
            return <SelectItem value={item.value} key={item.value}> {item.label} </SelectItem>
        })}
      </SelectContent>
    </Select>
    </div>
  );
};


export {
  FormField,
  Hint,
  SwitchField,
  PasswordInput,
  TextInput,
NumberInput,
SelectInput
}