'use client';

import { useState, useEffect } from 'react';
import { getServices, deleteService, updateService } from '@/lib/admin-api';
import type { Service } from '@/lib/admin-api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/lib/i18n';

export default function ServicesListPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
     } catch {
      setError('Failed to load services.');
     } finally {
      setIsLoading(false);
     }
   };

  useEffect(() => {
    loadServices();
   }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      setServices(prev => prev.filter(s => s.id !== id));
      setConfirmDelete(null);
      setSuccess('Service deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
     } catch {
      setError('Failed to delete service.');
     }
   };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Facials': return 'default';
      case 'Skin Analysis': return 'accent';
      case 'Body Treatments': return 'neutral';
      case 'Makeup': return 'default';
      default: return 'neutral';
     }
   };

  return (
     <div>
       <div className="flex items-center justify-between mb-8">
         <div>
           <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
             {t.adminServices}
           </h1>
           <p className="font-body text-charcoal-500">
            Manage beauty treatments and services
           </p>
         </div>
         <Button href="/admin/services/new" variant="primary">
           + {t.adminAddNew}
         </Button>
       </div>

       {error && (
         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm mb-4">
           {error}
         </div>
       )}

       {success && (
         <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-body text-sm mb-4">
           {success}
         </div>
       )}

       {/* Services Table */}
       <Card className="overflow-hidden">
         {isLoading ? (
           <div className="p-8 text-center">
             <p className="font-body text-charcoal-500">Loading services...</p>
           </div>
         ) : services.length === 0 ? (
           <div className="p-8 text-center">
             <p className="font-body text-charcoal-500 mb-4">
              No services yet. Add your first treatment.
             </p>
             <Button href="/admin/services/new" variant="primary">
               {t.adminAddNew}
             </Button>
           </div>
         ) : (
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-cream-200 bg-cream-50">
                   <th className="text-start px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Title (He)
                   </th>
                   <th className="text-start px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Category
                   </th>
                   <th className="text-start px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Duration
                   </th>
                   <th className="text-start px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Price
                   </th>
                   <th className="text-end px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Actions
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {services.map((service) => (
                   <tr key={service.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                     <td className="px-6 py-4">
                       <div>
                         <p className="font-body font-medium text-charcoal-800">
                           {service.titleHe}
                         </p>
                         <p className="font-body text-xs text-charcoal-400">
                           {service.titleEn}
                         </p>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <Badge variant={getCategoryBadge(service.category)}>
                         {service.category}
                       </Badge>
                     </td>
                     <td className="px-6 py-4">
                       <span className="font-body text-sm text-charcoal-600">
                         {service.duration}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <span className="font-body text-sm text-charcoal-600">
                         {service.price}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-end">
                       <div className="flex items-center justify-end gap-2">
                         <Button
                          href={`/admin/services/${service.id}`}
                          variant="outline"
                          size="sm"
                         >
                          Edit
                         </Button>
                         {confirmDelete === service.id ? (
                           <div className="flex items-center gap-1">
                             <Button
                              onClick={() => handleDelete(service.id)}
                              variant="secondary"
                              size="sm"
                              className="!bg-red-500 hover:!bg-red-600"
                             >
                              {t.adminDelete}
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
                            onClick={() => setConfirmDelete(service.id)}
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
