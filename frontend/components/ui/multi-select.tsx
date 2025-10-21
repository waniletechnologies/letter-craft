// Create a new component for multi-select
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MultiSelect = ({
  options,
  value,
  onValueChange,
  placeholder = "Select options",
  disabled = false,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onValueChange(value.filter((v) => v !== optionValue));
    } else {
      onValueChange([...value, optionValue]);
    }
  };

  // const selectedLabels = options
  //   .filter((option) => value.includes(option.value))
  //   .map((option) => option.label);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full justify-between shadow-none h-9 bg-white"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className="truncate">
          {value.length === 0 ? placeholder : `${value.length} selected`}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => toggleOption(option.value)}
              >
                <Checkbox
                  checked={value.includes(option.value)}
                  onCheckedChange={() => toggleOption(option.value)}
                />
                <label className="text-sm cursor-pointer">{option.label}</label>
              </div>
            ))}
            {options.length === 0 && (
              <div className="p-2 text-sm text-gray-500">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
