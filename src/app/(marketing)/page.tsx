import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { SpecialtiesInteractive } from "@/components/marketing/specialties-interactive";
import { QuoteSection } from "@/components/marketing/quote-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { FinalCta } from "@/components/marketing/final-cta";

function Divider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto h-px w-full max-w-7xl bg-gradient-to-r from-transparent via-black/10 to-transparent"
    />
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <Divider />
      <FeaturesGrid />
      <Divider />
      <SpecialtiesInteractive />
      <Divider />
      <QuoteSection />
      <Divider />
      <FaqAccordion />
      <Divider />
      <FinalCta />
    </>
  );
}
