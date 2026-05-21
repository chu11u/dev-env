import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Calendar, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Book Appointment | Sarit Elkayam",
  description:
    "Book your appointment with Sarit Elkayam — professional cosmetician. Choose your service and preferred time.",
  openGraph: {
    title: "Book Appointment | Sarit Elkayam",
    description: "Schedule your personalized beauty treatment.",
  },
};

const bookingSteps = [
  {
    icon: <Calendar size={24} className="text-rose-400" />,
    title: "Choose Your Service",
    description: "Browse our services and pick the treatment right for you.",
  },
  {
    icon: <Clock size={24} className="text-rose-400" />,
    title: "Select a Time",
    description: "Pick a date and time that works for your schedule.",
  },
  {
    icon: <span className="text-rose-400 text-2xl">✓</span>,
    title: "You're All Set",
    description: "Receive a confirmation email with all the details.",
  },
];

export default function BookPage() {
  return (
    <FadeInSection>
      <section className="bg-cream-100 min-h-[60vh] flex items-center">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-rose-400" />
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-4">
              Book Your Appointment
            </h1>

            <SectionDivider className="mb-4" />

            <p className="font-body text-lg text-charcoal-500 mb-2">
              Booking System Coming Soon
            </p>
            <p className="font-body text-charcoal-500 mb-12">
              Our online booking system is under development. In the meantime,
              you can reach out directly to schedule your treatment.
            </p>

            {/* Steps preview */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {bookingSteps.map((step, i) => (
                <div key={step.title} className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center mb-3">
                    {step.icon}
                  </div>
                  <p className="font-body font-semibold text-charcoal-800 mb-1">
                    {step.title}
                  </p>
                  <p className="font-body text-xs text-charcoal-500">
                    {step.description}
                  </p>
                  {i < bookingSteps.length - 1 && (
                    <div
                      className="hidden sm:block absolute"
                      style={{ left: "45%" }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" href="/contact">
                Contact to Book
              </Button>
              <Button variant="outline" size="lg" href="/services">
                Browse Services
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </FadeInSection>
  );
}
