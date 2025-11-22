import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";
import React, { useCallback, useMemo } from "react";

interface ChipOption {
  value: string;
  label: string;
  icon?: LucideIcon | React.ReactNode; // Can be a LucideIcon or custom React component
  colorScheme?: {
    selected: string; // Selected state classes
    unselected: string; // Unselected state classes
  };
}

interface ChipSelectorProps {
  options: ChipOption[];
  selectedValues: string | string[]; // Can be comma-separated string or array
  onChange: (selectedValues: string[], fieldName: string) => void;
  label: string;
  name: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg'; // Chip size: sm (px-2 py-1), md (px-3 py-1.5), lg (px-4 py-2)
}

const ChipSelector = ({
  options,
  selectedValues,
  onChange,
  label,
  name,
  required = false,
  size = 'lg', // Default to large (px-4 py-2)
}: ChipSelectorProps) => {
  // Parse selectedValues: handle both comma-separated string and array
  const parseSelectedValues = (): string[] => {
    if (Array.isArray(selectedValues)) {
      return selectedValues.filter(Boolean);
    }
    if (typeof selectedValues === 'string' && selectedValues.trim() !== '') {
      return selectedValues.split(',').map(v => v.trim()).filter(Boolean);
    }
    return [];
  };

  const selectedArray = useMemo(() => parseSelectedValues(), [selectedValues]);

  // Size-based padding classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-sm',
  };

  // Size-based icon classes
  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const handleChipClick = useCallback((value: string) => {
    // Parse selectedValues inline to avoid stale closure
    let currentSelected: string[];
    if (Array.isArray(selectedValues)) {
      currentSelected = selectedValues.filter(Boolean);
    } else if (typeof selectedValues === 'string' && selectedValues.trim() !== '') {
      currentSelected = selectedValues.split(',').map(v => v.trim()).filter(Boolean);
    } else {
      currentSelected = [];
    }
    
    // Toggle selection
    if (currentSelected.includes(value)) {
      // Remove if already selected
      const newSelected = currentSelected.filter(v => v !== value);
      onChange(newSelected, name);
    } else {
      // Add if not selected
      const newSelected = [...currentSelected, value];
      onChange(newSelected, name);
    }
  }, [selectedValues, onChange, name]);

  return (
    <div>
      <Label htmlFor={name} className="block text-sm font-bold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedArray.includes(option.value);
          const IconComponent = option.icon;
          
          // Render icon helper - handle React components including forwardRef
          let IconElement: React.ReactNode = null;
          if (IconComponent !== undefined && IconComponent !== null) {
            const iconType = typeof IconComponent;
            const isValidElement = React.isValidElement(IconComponent);
            
            // Check if it's a React component (including forwardRef which shows as object)
            // forwardRef components are objects but can be rendered as components
            const isReactComponent = isValidElement || 
                                     iconType === 'function' || 
                                     (iconType === 'object' && IconComponent && (
                                       (IconComponent as any).$$typeof !== undefined ||
                                       typeof (IconComponent as any).render === 'function'
                                     ));
            
            if (isValidElement) {
              IconElement = IconComponent;
            } else if (isReactComponent) {
              try {
                // Handle both function components and forwardRef components
                const Icon = IconComponent as React.ComponentType<{ className?: string }>;
                IconElement = <Icon className={iconSizeClasses[size]} />;
              } catch (error) {
                console.error('Error rendering icon component:', error, IconComponent);
              }
            } else {
              console.warn('IconComponent is not a valid React component:', iconType, IconComponent);
            }
          }
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChipClick(option.value)}
              className={cn(
                sizeClasses[size],
                "rounded-full cursor-pointer transition-colors border",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400",
                "flex items-center gap-2",
                isSelected
                  ? option.colorScheme
                    ? option.colorScheme.selected
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              )}
              aria-pressed={isSelected}
            >
              {IconElement}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChipSelector;
