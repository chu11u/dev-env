import { type ReactNode, type HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Container({
  children,
  className = '',
  ...rest
}: ContainerProps) {
  return (
     <div
       className={`
         w-full
         max-w-7xl
         mx-auto
         px-4
         sm:px-6
         lg:px-8
         ${className}
       `}
       {...rest}
     >
       {children}
     </div>
   );
}

export default Container;
