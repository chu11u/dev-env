'use client';

import { useState, useEffect } from 'react';
import { getPosts, deletePost } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  updatedAt: string;
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
     } catch (error) {
      console.error('Failed to load posts:', error);
     } finally {
      setIsLoading(false);
     }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setConfirmDelete(null);
     } catch (error) {
      console.error('Failed to delete post:', error);
     }
  };

  return (
     <div>
       <div className="flex items-center justify-between mb-8">
         <div>
           <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">Blog Posts</h1>
           <p className="font-body text-charcoal-500">Manage your blog content</p>
         </div>
         <Button href="/admin/blog/new" variant="primary">
           + New Post
         </Button>
       </div>

       {/* Posts Table */}
       <Card className="overflow-hidden">
         {isLoading ? (
           <div className="p-8 text-center">
             <p className="font-body text-charcoal-500">Loading posts...</p>
           </div>
          ) : posts.length === 0 ? (
           <div className="p-8 text-center">
             <p className="font-body text-charcoal-500 mb-4">No posts yet. Create your first post to get started.</p>
             <Button href="/admin/blog/new" variant="primary">Create Post</Button>
           </div>
          ) : (
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-cream-200 bg-cream-50">
                   <th className="text-left px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">Title</th>
                   <th className="text-left px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">Status</th>
                   <th className="text-left px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">Published</th>
                   <th className="text-right px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {posts.map(post => (
                   <tr key={post.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                     <td className="px-6 py-4">
                       <a
                         href={`/admin/blog/${post.id}`}
                         className="font-body font-medium text-charcoal-800 hover:text-rose-400 transition-colors"
                       >
                         {post.title}
                       </a>
                       <p className="font-body text-xs text-charcoal-400 mt-0.5">/{post.slug}</p>
                     </td>
                     <td className="px-6 py-4">
                       <span className="font-body text-sm text-charcoal-600">{post.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span>
                     </td>
                     <td className="px-6 py-4">
                       <span className="font-body text-sm text-charcoal-500">
                         {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <Button
                           href={`/admin/blog/${post.id}`}
                           variant="outline"
                           size="sm"
                         >
                           Edit
                         </Button>
                         {confirmDelete === post.id ? (
                           <div className="flex items-center gap-1">
                             <Button
                               onClick={() => handleDelete(post.id)}
                               variant="secondary"
                               size="sm"
                               className="!bg-red-500 hover:!bg-red-600"
                             >
                               Delete
                             </Button>
                             <Button
                               onClick={() => setConfirmDelete(null)}
                               variant="outline"
                               size="sm"
                             >
                               Cancel
                             </Button>
                            </div>
                          ) : (
                           <Button
                             onClick={() => setConfirmDelete(post.id)}
                             variant="outline"
                             size="sm"
                             className="!border-red-300 !text-red-500 hover:!bg-red-500 hover:!text-white"
                           >
                             ×
                           </Button>
                          )}
                       </div>
                     </td>
                   </tr>
                  ))}
               </tbody>
             </table>
           </div>
          )}
       </Card>
     </div>
   );
}
