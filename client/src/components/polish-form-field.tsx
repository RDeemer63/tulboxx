import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import PolishWithAIButton from "@/components/polish-with-ai-button";

interface PolishFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "input" | "textarea";
  rows?: number;
  fieldType: string;
  className?: string;
}

export default function PolishFormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "input",
  rows = 3,
  fieldType,
  className = ""
}: PolishFormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && " *"}
      </Label>
      <div className="space-y-2">
        {type === "textarea" ? (
          <Textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            required={required}
          />
        ) : (
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
          />
        )}
        <PolishWithAIButton
          text={value}
          onPolished={onChange}
          fieldType={fieldType}
          disabled={!value.trim()}
        />
      </div>
    </div>
  );
}