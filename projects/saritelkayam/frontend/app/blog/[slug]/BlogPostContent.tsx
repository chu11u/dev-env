'use client';

import { Container } from '@/components/ui/Container';
import { SectionDivider } from '@/components/common/SectionDivider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FadeInSection } from '@/components/common/FadeInSection';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';

interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  date: string;
  readTime: number;
  category?: string;
  coverImage?: string;
}

export default function BlogPostContent({ post }: { post: BlogPost }) {
    // Simple markdown rendering: convert headers, paragraphs, lists, links
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;

    lines.forEach((line, i) => {
      if (line.match(/^######\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
         }
        elements.push(
           <h6
            key={i}
            className="font-heading text-base font-semibold text-charcoal-700 mt-6 mb-2"
           >
             {line.replace(/^######\s/, '')}
           </h6>,
         );
       } else if (line.match(/^#####\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
         }
        elements.push(
           <h5
            key={i}
            className="font-heading text-lg font-semibold text-charcoal-700 mt-6 mb-2"
           >
             {line.replace(/^#####\s/, '')}
           </h5>,
         );
       } else if (line.match(/^####\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
         }
        elements.push(
           <h4
            key={i}
            className="font-heading text-xl font-semibold text-charcoal-800 mt-8 mb-3"
           >
             {line.replace(/^####\s/, '')}
           </h4>,
         );
       } else if (line.match(/^###\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
         }
        elements.push(
           <h3
            key={i}
            className="font-heading text-xl md:text-2xl font-semibold text-charcoal-800 mt-8 mb-3"
           >
             {line.replace(/^###\s/, '')}
           </h3>,
         );
       } else if (line.match(/^##\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
         }
        elements.push(
           <h2
            key={i}
            className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mt-8 mb-4"
           >
             {line.replace(/^##\s/, '')}
           </h2>,
         );
       } else if (line.match(/^#\s/)) {
        if (inList) {
          elements.push(<></>);
          inList = false;
         }
        elements.push(
           <h1
            key={i}
            className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mt-8 mb-4"
           >
             {line.replace(/^#\s/, '')}
           </h1>,
         );
       } else if (line.match(/^- /)) {
        if (!inList) {
          elements.push(
             <ul
              key={`list-${i}`}
              className="list-disc list-inside space-y-1 my-4 text-charcoal-600 font-body"
             >
               <li key={i}>{renderInlineMarkdown(line.replace(/^- /, ''))}</li>
             </ul>,
           );
          inList = true;
         } else {
          elements.push(
             <li key={i} className="text-charcoal-600 font-body">
               {renderInlineMarkdown(line.replace(/^- /, ''))}
             </li>,
           );
         }
       } else if (line.match(/^\d+\.\s/)) {
        if (!inList) {
          elements.push(
             <ol
              key={`olist-${i}`}
              className="list-decimal list-inside space-y-1 my-4 text-charcoal-600 font-body"
             >
               <li key={i}>
                 {renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
               </li>
             </ol>,
           );
          inList = true;
         } else {
          elements.push(
             <li key={i} className="text-charcoal-600 font-body">
               {renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}
             </li>,
           );
         }
       } else if (line.trim() === '') {
        if (inList) {
          elements.push(<></>);
          inList = false;
         }
        elements.push(<br key={i} />);
       } else {
        if (inList) {
          elements.push(<></>);
          inList = false;
         }
        elements.push(
           <p
            key={i}
            className="font-body text-charcoal-600 leading-relaxed mb-4"
           >
             {renderInlineMarkdown(line)}
           </p>,
         );
       }
      });

    return elements;
    };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    // Basic inline markdown: **bold**, *italic*, `code`, [link](url)
    const parts: (string | React.ReactNode)[] = [];
    let remaining = text;

    while (remaining) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== null) {
        parts.push(remaining.slice(0, boldMatch.index));
        parts.push(
           <strong
            key={parts.length}
            className="font-semibold text-charcoal-700"
           >
             {boldMatch[1]}
           </strong>,
         );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        continue;
       }

      // Italic
      const italicMatch = remaining.match(/\*(.+?)\*/);
      if (italicMatch && italicMatch.index !== null) {
        parts.push(remaining.slice(0, italicMatch.index));
        parts.push(<em key={parts.length}>{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
        continue;
       }

      // Inline code
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (codeMatch && codeMatch.index !== null) {
        parts.push(remaining.slice(0, codeMatch.index));
        parts.push(
           <code
            key={parts.length}
            className="bg-cream-200 text-rose-600 px-1.5 py-0.5 rounded text-sm"
           >
             {codeMatch[1]}
           </code>,
         );
        remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
        continue;
       }

      // Links
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && linkMatch.index !== null) {
        parts.push(remaining.slice(0, linkMatch.index));
        parts.push(
           <a
            key={parts.length}
            href={linkMatch[2]}
            className="text-rose-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
           >
             {linkMatch[1]}
           </a>,
         );
        remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
        continue;
       }

      parts.push(remaining);
      break;
      }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
    };

  return (
     <>
       {/* Post header */}
       <FadeInSection>
         <section className="bg-cream-100 py-8 md:py-12 lg:py-16">
           <Container>
             <div className="max-w-3xl mx-auto">
               <div className="flex items-center gap-3 mb-4">
                 {post.category && (
                   <Badge variant="default">{post.category}</Badge>
                 )}
                 <span className="flex items-center gap-1 font-body text-xs text-charcoal-400">
                   <Calendar size={12} />{' '}
                   {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                   })}
                 </span>
                 <span className="flex items-center gap-1 font-body text-xs text-charcoal-400">
                   <Clock size={12} /> {post.readTime} min read
                 </span>
               </div>

               <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-charcoal-800 mb-4">
                 {post.title}
               </h1>

               {post.excerpt && (
                 <p className="font-body text-base md:text-lg text-charcoal-500 leading-relaxed">
                   {post.excerpt}
                 </p>
               )}

               <SectionDivider className="mt-6" />
             </div>
           </Container>
         </section>
       </FadeInSection>

       {/* Post content */}
       <FadeInSection>
         <article className="py-8 md:py-16 lg:py-20">
           <Container>
             <div className="max-w-3xl mx-auto prose-lg">
               {renderMarkdown(post.content)}
             </div>
           </Container>
         </article>
       </FadeInSection>

       {/* Back to blog */}
       <FadeInSection>
         <section className="bg-cream-100 py-8 md:py-12">
           <Container>
             <div className="max-w-3xl mx-auto text-center">
               <Button
                variant="outline"
                size="md"
                href="/blog"
                className="inline-flex items-center gap-2"
               >
                 <ArrowLeft size={16} /> Back to Blog
               </Button>
             </div>
           </Container>
         </section>
       </FadeInSection>
     </>
   );
}
