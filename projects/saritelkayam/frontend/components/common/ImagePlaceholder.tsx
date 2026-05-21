import { HTMLAttributes } from 'react';

interface ImagePlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  className?: string;
}

export function ImagePlaceholder({
  width = 'w-full',
  height = 'h-64',
  className = '',
   ...rest
}: ImagePlaceholderProps) {
  return (
      <div
       className={`
         ${width}
         ${height}
         bg-cream-200
         rounded-2xl
         animate-pulse
          ${className}
        `}
       role="img"
       aria-label="Image loading"
        {...rest}
      />
    );
}

export default ImagePlaceholder;
