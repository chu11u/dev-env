import { type InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number';
  label: string;
  placeholder?: string;
  name: string;
  required?: boolean;
  className?: string;
}

export function Input({
  type = 'text',
  label,
  placeholder,
  name,
  required = false,
  className = '',
  ...rest
}: InputProps) {
  return (
     <label className="flex flex-col gap-1.5">
       <span className="text-sm font-medium text-charcoal-700">
         {label}
         {required && <span className="text-rose-400 ml-1">*</span>}
       </span>
       <input
         type={type}
         name={name}
         placeholder={placeholder}
         required={required}
         className={`
           rounded-xl
           border border-cream-300
           bg-white
           px-4 py-2.5
           text-charcoal-600
           placeholder:text-charcoal-400
           transition duration-200
           input-focus
           ${className}
         `}
         {...rest}
       />
     </label>
   );
}

export default Input;
