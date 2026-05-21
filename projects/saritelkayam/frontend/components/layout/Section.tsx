import { type ReactNode, type HTMLAttributes } from 'react';
import { Container } from '@/components/ui/Container';

interface SectionProps extends Omit<HTMLAttributes<HTMLSectionElement>, 'title'> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  bg?: 'default' | 'cream' | 'white';
}

const bgClasses = {
  default: '',
   cream: 'bg-cream-100',
   white: 'bg-white',
 };

export function Section({
  children,
  title,
  subtitle,
  className = '',
  bg = 'default',
   ...rest
}: SectionProps) {
  return (
      <section
       className={`py-16 md:py-24 ${bgClasses[bg]} ${className}`}
        {...rest}
      >
        <Container>
          {title && (
              <div className="text-center mb-12">
                <h2 className="text-h2 mb-3">{title}</h2>
                {subtitle && (
                    <p className="text-charcoal-500 max-w-2xl mx-auto">{subtitle}</p>
                  )}
              </div>
            )}
          {children}
        </Container>
      </section>
    );
}

export default Section;
