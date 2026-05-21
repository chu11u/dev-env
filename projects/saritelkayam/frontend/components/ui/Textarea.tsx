import { type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  placeholder?: string;
  name: string;
  required?: boolean;
  className?: string;
  rows?: number;
}

export function Textarea({
  label,
  placeholder,
  name,
  required = false,
  className = '',
  rows = 4,
  ...rest
}: TextareaProps) {
  return (
     <label className="flex flex-col gap-1.5">
       <span className="text-sm font-medium text-charcoal-700">
         {label}
         {required && <span className="text-rose-400 ml-1">*</span>}
       </span>
       <textarea
         name={name}
         placeholder={placeholder}
         required={required}
         rows={rows}
         className={`
           rounded-xl
           border border-cream-300
           bg-white
           px-4 py-2.5
           text-charcoal-600
           placeholder:text-charcoal-400
           transition duration-200
           input-focus
           resize-y
           ${className}
         `}
         {...rest}
       />
     </label>
   );
}

export default Textarea;
