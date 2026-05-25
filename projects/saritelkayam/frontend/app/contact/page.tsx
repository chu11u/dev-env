"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/layout/Section";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Badge } from "@/components/ui/Badge";
import { FadeInSection } from "@/components/common/FadeInSection";
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { getPublicSettings } from "@/lib/admin-api";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { t, isRtl } = useTranslation();

  // Fetch settings for dynamic contact info
  const [email, setEmail] = useState("hello@saritelkayam.com");
  const [phone, setPhone] = useState("+972-50-000-0000");
  const [instagramUrl, setInstagramUrl] = useState(
    "https://instagram.com/sarit.elkayam",
  );
  const [facebookUrl, setFacebookUrl] = useState(
    "https://facebook.com/sarit.elkayam",
  );

  useEffect(() => {
    getPublicSettings()
      .then((settings) => {
        const getEmail = (s: typeof settings) =>
          s.find((x) => x.key === "email")?.valueHe ||
          s.find((x) => x.key === "email")?.valueEn ||
          "hello@saritelkayam.com";
        const getPhone = (s: typeof settings) =>
          s.find((x) => x.key === "phone")?.valueHe ||
          s.find((x) => x.key === "phone")?.valueEn ||
          "+972-50-000-0000";
        const getInstagram = (s: typeof settings) =>
          s.find((x) => x.key === "instagram")?.valueEn ||
          "https://instagram.com/sarit.elkayam";
        const getFacebook = (s: typeof settings) =>
          s.find((x) => x.key === "facebook")?.valueEn ||
          "https://facebook.com/sarit.elkayam";

        setEmail(getEmail(settings));
        setPhone(getPhone(settings));
        setInstagramUrl(getInstagram(settings));
        setFacebookUrl(getFacebook(settings));
      })
      .catch(() => {
        // Fall back to hardcoded defaults (already set above)
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Page header */}
      <FadeInSection>
        <section className="bg-cream-100 py-8 md:py-16 lg:py-20">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="accent">{t.contactBadge}</Badge>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
                {t.contactTitle}
              </h1>
              <SectionDivider className="mb-4" />
              <p className="font-body text-charcoal-500">{t.contactSubtitle}</p>
            </div>
          </Container>
        </section>
      </FadeInSection>

      {/* Contact form + info */}
      <FadeInSection>
        <Section bg="white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Contact form */}
            <div>
              <h2 className="font-heading text-xl md:text-2xl font-semibold text-charcoal-800 mb-6">
                {t.contactSendTitle}
              </h2>

              {submitted ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 md:p-8 text-center">
                  <p className="font-heading text-lg md:text-xl text-rose-600 mb-2">
                    {t.contactThankYou}
                  </p>
                  <p className="font-body text-sm text-charcoal-600">
                    {t.contactThankYouMsg}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSubmitted(false)}
                  >
                    {t.contactSendAnother}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label={t.contactFullName}
                    name="name"
                    placeholder={t.contactFullNamePlaceholder}
                    required
                  />
                  <Input
                    label={t.contactEmail}
                    name="email"
                    type="email"
                    placeholder={t.contactEmailPlaceholder}
                    required
                  />
                  <Input
                    label={t.contactPhone}
                    name="phone"
                    type="tel"
                    placeholder={t.contactPhonePlaceholder}
                  />
                  <Textarea
                    label={t.contactMessage}
                    name="message"
                    placeholder={t.contactMessagePlaceholder}
                    rows={5}
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {t.contactSendMessage}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-xl md:text-2xl font-semibold text-charcoal-800 mb-6">
                  {t.contactStudioTitle}
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                      <MapPin size={20} className="text-rose-400" />
                    </div>
                    <div>
                      <p className="font-body font-medium text-charcoal-800">
                        {t.contactLocation}
                      </p>
                      <p className="font-body text-sm text-charcoal-500">
                        {t.contactLocationDetail}
                        <br />
                        <span className="text-xs">{t.contactLocationNote}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                      <Mail size={20} className="text-rose-400" />
                    </div>
                    <div>
                      <p className="font-body font-medium text-charcoal-800">
                        {t.contactEmailLabel}
                      </p>
                      <a
                        href={`mailto:${email}`}
                        className="font-body text-sm text-rose-400 hover:underline"
                      >
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                      <Phone size={20} className="text-rose-400" />
                    </div>
                    <div>
                      <p className="font-body font-medium text-charcoal-800">
                        {t.contactPhoneLabel}
                      </p>
                      <a
                        href={`tel:${phone}`}
                        className="font-body text-sm text-rose-400 hover:underline"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <SectionDivider />

              <div>
                <h3 className="font-heading text-base md:text-lg font-semibold text-charcoal-800 mb-4">
                  {t.contactFollowUs}
                </h3>
                <div className="flex gap-4">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-400 hover:text-white transition-colors p-3"
                    aria-label="Follow on Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-400 hover:text-white transition-colors p-3"
                    aria-label="Follow on Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                </div>
              </div>

              <SectionDivider />

              <div className="bg-cream-100 rounded-2xl p-6">
                <h3 className="font-heading text-base md:text-lg font-semibold text-charcoal-800 mb-2">
                  {t.contactHoursTitle}
                </h3>
                <dl className="font-body text-sm text-charcoal-600 space-y-1">
                  <div className="flex justify-between">
                    <dt>{t.contactSundayThursday}</dt>
                    <dd>09:00 – 19:00</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t.contactFriday}</dt>
                    <dd>09:00 – 14:00</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t.contactSaturday}</dt>
                    <dd className="text-charcoal-400">{t.contactClosed}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </Section>
      </FadeInSection>
    </>
  );
}
