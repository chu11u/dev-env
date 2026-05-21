import { HTMLAttributes } from 'react';

interface SectionDividerProps extends HTMLAttributes<HTMLHRElement> {
  className?: string;
}

export function SectionDivider({ className = '' }: SectionDividerProps) {
  return (
      <hr
       className={`
         border-none
         mx-auto
         w-24
         h-px
         bg-gradient-to-r from-transparent via-rose-300 to-transparent
          ${className}
        `}
       role="presentation"
      />
    );
}

export default SectionDivider;
