import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({
  children,
  className = '',
  ...rest
}: CardProps) {
  return (
     <div
       className={`
         bg-white
         rounded-2xl
         shadow-soft
         transition-shadow duration-300
         hover:shadow-lift
         ${className}
       `}
       {...rest}
     >
       {children}
     </div>
   );
}

export default Card;
