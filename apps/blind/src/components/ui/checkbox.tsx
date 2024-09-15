import * as React from "react";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "~/lib/utils";

const _Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "border-blind-700 focus-visible:ring-blind-700 data-[state=checked]:bg-blind-700 data-[state=checked]:text-blind-100 peer h-4 w-4 shrink-0 rounded-sm border ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4 text-white" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
_Checkbox.displayName = CheckboxPrimitive.Root.displayName;

interface CheckboxProps extends ComponentPropsWithoutRef<typeof _Checkbox> {
  id: string;
  label: string;
}

export function Checkbox({ label, id, ...props }: CheckboxProps) {
  return (
    <div className="flex items-start space-x-2">
      <_Checkbox className="mt-0.5" id={id} {...props} />
      <label
        htmlFor={id}
        className="cursor-pointer text-gray-700 peer-disabled:cursor-not-allowed"
      >
        {label}
      </label>
    </div>
  );
}
