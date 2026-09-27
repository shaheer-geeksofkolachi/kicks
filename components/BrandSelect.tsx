"use client";

import { useState } from "react";
import { BrandDropdown } from "@/components/BrandDropdown";

type BrandSelectProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  includeAllOption?: boolean;
  placeholder?: string;
  extraBrands?: string[];
  onChange?: (value: string) => void;
  className?: string;
};

/** Brand picker — custom scrollable dropdown (wraps shared {@link BrandDropdown}). */
export function BrandSelect({
  id,
  name,
  value: controlledValue,
  defaultValue = "",
  required,
  includeAllOption,
  placeholder,
  extraBrands = [],
  onChange,
  className,
}: BrandSelectProps) {
  const isControlled = controlledValue !== undefined;
  const [internal, setInternal] = useState(defaultValue);

  const value = isControlled ? controlledValue : internal;
  const handleChange = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <BrandDropdown
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      required={required}
      includeAllOption={includeAllOption}
      extraBrands={extraBrands}
      placeholder={placeholder ?? "Search brands…"}
      className={className}
    />
  );
}
