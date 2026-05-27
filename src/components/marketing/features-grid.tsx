import {
  MessageSquareText,
  FileText,
  PenLine,
  Scale,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { features, type Feature } from "./data";
import { FeatureCard } from "./feature-card";

const ICONS: Record<Feature["icon"], React.ReactNode> = {
  message: <MessageSquareText className="h-5 w-5" strokeWidth={1.5} />,
  file: <FileText className="h-5 w-5" strokeWidth={1.5} />,
  pen: <PenLine className="h-5 w-5" strokeWidth={1.5} />,
  scale: <Scale className="h-5 w-5" strokeWidth={1.5} />,
  calculator: <Calculator className="h-5 w-5" strokeWidth={1.5} />,
  shield: <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />,
};

export function FeaturesGrid() {
  return (
    <section
      id="capacidades"
      className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold tracking-tight text-black">
          Diseñado para la práctica legal moderna
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Deja atrás la búsqueda manual en códigos de papel y planillas
          desactualizadas. Haz que la inteligencia artificial trabaje para tu
          estudio.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <FeatureCard
            key={f.title}
            icon={ICONS[f.icon]}
            title={f.title}
            description={f.description}
          />
        ))}
      </div>
    </section>
  );
}
