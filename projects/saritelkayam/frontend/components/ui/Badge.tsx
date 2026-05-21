import { type ReactNode, type HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'accent' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-rose-100 text-rose-700',
   accent: 'bg-burgundy-500 text-white',
   neutral: 'bg-charcoal-100 text-charcoal-700',
 };

export function Badge({
  children,
  variant = 'default',
  className = '',
  ...rest
}: BadgeProps) {
  return (
     <span
       className={`
         inline-flex items-center
         rounded-full
         px-2.5 py-0.5
         text-xs font-medium
         ${variantClasses[variant]}
         ${className}
       `}
       {...rest}
     >
       {children}
     </span>
   );
}

export default Badge;
