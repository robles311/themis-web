/**
 * Centralized legal specialties.
 *
 * Canonical keys are UPPERCASE (used as API specialty IDs and as keys in
 * SPECIALTY_PROMPTS). The display layer uses the lowercase `slug` for URLs
 * and UI ids, and `displayName` for human-readable labels.
 */

export const SPECIALTY_IDS = [
  "CIVIL",
  "PENAL",
  "LABORAL",
  "CONTRATOS",
  "FAMILIAR",
  "TRIBUTARIO",
  "INMUEBLES",
] as const;

export type SpecialtyId = (typeof SPECIALTY_IDS)[number];

export type SpecialtyMeta = {
  id: SpecialtyId;
  slug: string;
  displayName: string;
};

export const SPECIALTIES: Record<SpecialtyId, SpecialtyMeta> = {
  CIVIL: { id: "CIVIL", slug: "civil", displayName: "Derecho Civil" },
  PENAL: { id: "PENAL", slug: "penal", displayName: "Derecho Penal" },
  LABORAL: { id: "LABORAL", slug: "laboral", displayName: "Derecho Laboral" },
  CONTRATOS: { id: "CONTRATOS", slug: "contratos", displayName: "Derecho de Contratos" },
  FAMILIAR: { id: "FAMILIAR", slug: "familiar", displayName: "Derecho de Familia" },
  TRIBUTARIO: { id: "TRIBUTARIO", slug: "tributario", displayName: "Derecho Tributario" },
  INMUEBLES: { id: "INMUEBLES", slug: "inmuebles", displayName: "Derecho Inmobiliario" },
};

export const SPECIALTY_LIST: SpecialtyMeta[] = SPECIALTY_IDS.map((id) => SPECIALTIES[id]);

const SLUG_TO_ID: Record<string, SpecialtyId> = Object.fromEntries(
  SPECIALTY_LIST.map((s) => [s.slug, s.id])
) as Record<string, SpecialtyId>;

export function slugToSpecialtyId(slug: string): SpecialtyId | undefined {
  return SLUG_TO_ID[slug];
}

export function specialtyDisplayName(slugOrId: string): string {
  const id = (SPECIALTIES as Record<string, SpecialtyMeta>)[slugOrId]?.id
    ?? slugToSpecialtyId(slugOrId);
  return id ? SPECIALTIES[id].displayName : "Themis";
}
