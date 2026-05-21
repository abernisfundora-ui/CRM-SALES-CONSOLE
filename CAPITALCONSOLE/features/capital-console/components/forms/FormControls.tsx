'use client';

type BaseFieldProps = {
  label: string;
};

type FormFieldProps = BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

type FormSelectProps = BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  getLabel?: (value: string) => string;
};

export function FormField({ label, value, onChange, type = 'text', required = false }: FormFieldProps) {
  return (
    <label className="create-field-label">
      {label}
      <input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="ds-input-control" />
    </label>
  );
}

export function FormSelect({ label, value, onChange, options, getLabel }: FormSelectProps) {
  return (
    <label className="create-field-label">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="ds-select-control">
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel?.(option) ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
