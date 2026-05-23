'use client';

import { useState, useEffect } from 'react';
import { getTestimonials, deleteTestimonial, updateTestimonial } from '@/lib/admin-api';
import type { Testimonial } from '@/lib/admin-api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/lib/i18n';

export default function TestimonialsListPage() {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadTestimonials = async () => {
    try {
      const data = await getTestimonials();
      setTestimonials(data);
      } catch {
      setError('Failed to load testimonials.');
      } finally {
      setIsLoading(false);
      }
    };

  useEffect(() => {
    loadTestimonials();
    }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      setConfirmDelete(null);
      setSuccess('Testimonial deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
      } catch {
      setError('Failed to delete testimonial.');
      }
    };

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      await updateTestimonial(testimonial.id, { featured: !testimonial.featured });
      setTestimonials(prev =>
        prev.map(t => t.id === testimonial.id ? { ...t, featured: !t.featured } : t)
      );
      setSuccess('Testimonial updated.');
      setTimeout(() => setSuccess(''), 3000);
      } catch {
      setError('Failed to update testimonial.');
      }
    };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

  return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
              {t.adminTestimonials}
            </h1>
            <p className="font-body text-charcoal-500">
              Manage client testimonials and reviews
            </p>
          </div>
          <Button href="/admin/testimonials/new" variant="primary">
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

        {/* Testimonials Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="font-body text-charcoal-500">Loading testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-body text-charcoal-500 mb-4">
                No testimonials yet. Add your first client review.
              </p>
              <Button href="/admin/testimonials/new" variant="primary">
                {t.adminAddNew}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-200 bg-cream-50">
                    <th className="text-start px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                      Name (He)
                    </th>
                    <th className="text-start px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                      Service
                    </th>
                    <th className="text-center px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                      Rating
                    </th>
                    <th className="text-center px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                      Featured
                    </th>
                    <th className="text-end px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((testimonial) => (
                    <tr key={testimonial.id} className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {testimonial.avatar && (
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.nameHe}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-body font-medium text-charcoal-800">
                              {testimonial.nameHe}
                            </p>
                            <p className="font-body text-xs text-charcoal-400">
                              {testimonial.nameEn}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-body text-sm text-charcoal-600">
                          {testimonial.serviceHe}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-body text-sm text-gold-500">
                          {renderStars(testimonial.rating)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={testimonial.featured}
                            onChange={() => toggleFeatured(testimonial)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-charcoal-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-rose-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            href={`/admin/testimonials/${testimonial.id}`}
                            variant="outline"
                            size="sm"
                          >
                            Edit
                          </Button>
                          {confirmDelete === testimonial.id ? (
                            <div className="flex items-center gap-1">
                              <Button
                                onClick={() => handleDelete(testimonial.id)}
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
                              onClick={() => setConfirmDelete(testimonial.id)}
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
