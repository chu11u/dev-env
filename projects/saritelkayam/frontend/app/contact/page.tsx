"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/layout/Section";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Badge } from "@/components/ui/Badge";
import { FadeInSection } from "@/components/common/FadeInSection";
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

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
              <Badge variant="accent">Get in Touch</Badge>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
                Contact Sarit
              </h1>
              <SectionDivider className="mb-4" />
              <p className="font-body text-charcoal-500">
                Have questions about our services? Want to book an appointment?
                We'd love to hear from you.
              </p>
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
                Send a Message
              </h2>

              {submitted ? (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 md:p-8 text-center">
                  <p className="font-heading text-lg md:text-xl text-rose-600 mb-2">
                    Thank you!
                  </p>
                  <p className="font-body text-sm text-charcoal-600">
                    Your message has been sent. Sarit will get back to you
                    within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label="Full Name"
                    name="name"
                    placeholder="Your full name"
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    placeholder="+972-50-000-0000"
                  />
                  <Textarea
                    label="Message"
                    name="message"
                    placeholder="Tell us about your skin goals, the service you're interested in, or any questions..."
                    rows={5}
                    required
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-xl md:text-2xl font-semibold text-charcoal-800 mb-6">
                  Studio Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                      <MapPin size={20} className="text-rose-400" />
                    </div>
                    <div>
                      <p className="font-body font-medium text-charcoal-800">
                        Location
                      </p>
                      <p className="font-body text-sm text-charcoal-500">
                        Tel Aviv, Israel
                        <br />
                        <span className="text-xs">
                          (Exact address shared upon booking)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                      <Mail size={20} className="text-rose-400" />
                    </div>
                    <div>
                      <p className="font-body font-medium text-charcoal-800">
                        Email
                      </p>
                      <a
                        href="mailto:hello@saritelkayam.com"
                        className="font-body text-sm text-rose-400 hover:underline"
                      >
                        hello@saritelkayam.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                      <Phone size={20} className="text-rose-400" />
                    </div>
                    <div>
                      <p className="font-body font-medium text-charcoal-800">
                        Phone
                      </p>
                      <a
                        href="tel:+972500000000"
                        className="font-body text-sm text-rose-400 hover:underline"
                      >
                        +972-50-000-0000
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <SectionDivider />

              <div>
                <h3 className="font-heading text-base md:text-lg font-semibold text-charcoal-800 mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <a
                    href="https://instagram.com/sarit.elkayam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-400 hover:bg-rose-400 hover:text-white transition-colors p-3"
                    aria-label="Follow on Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                  <a
                    href="https://facebook.com/sarit.elkayam"
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
                  Hours
                </h3>
                <dl className="font-body text-sm text-charcoal-600 space-y-1">
                  <div className="flex justify-between">
                    <dt>Sunday – Thursday</dt>
                    <dd>09:00 – 19:00</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Friday</dt>
                    <dd>09:00 – 14:00</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Saturday</dt>
                    <dd className="text-charcoal-400">Closed</dd>
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
