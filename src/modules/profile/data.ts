import type { TipPresets } from "@/types";
import type { PresetLabels, ResolvedPreset } from "./types";

const NUMBER_FLOW_TIMING = {
  duration: 240,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} satisfies EffectTiming;

const NUMBER_FLOW_OPACITY_TIMING = {
  duration: 140,
  easing: "ease-out",
} satisfies EffectTiming;

const PRESET_AMOUNTS = [500, 1000, 2000, 5000] as const;

const POPULAR_PRESET_INDEX = 1;
const PRESET_LABEL_MAX_LENGTH = 20;

const DEFAULT_PRESET_LABELS: PresetLabels = [
  "Small thanks",
  "Show some love",
  "Big support",
  "Super fan",
];
const REASONS = [
  { value: "impersonation", label: "Pretending to be someone else" },
  { value: "scam", label: "Scam or fraud" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
];

const CATEGORY_PRESET_LABELS: Record<string, PresetLabels> = {
  Streamer: ["Coffee", "Stream fuel", "Big support", "Next upgrade"],
  Musician: ["Coffee", "Practice fuel", "Studio hour", "Next single"],
  Artist: ["Coffee", "Sketch fuel", "Canvas fund", "Gallery push"],
  Writer: ["Coffee", "Late-night pages", "New notebook", "Next chapter"],
  Podcaster: ["Coffee", "Mic check", "Editing hours", "Next episode"],
  "Video creator": ["Coffee", "Render fuel", "Props budget", "Next video"],
  Comedian: ["Coffee", "Mic time", "New material", "Front row energy"],
  Photographer: ["Coffee", "Film rolls", "Lens fund", "Next shoot"],
  "Software Engineer": [
    "Coffee",
    "Late-night fuel",
    "Server bills",
    "Ship it fund",
  ],
  Designer: ["Coffee", "Pixel fuel", "New tools", "Next project"],
  Educator: ["Coffee", "Class prep", "New materials", "Next lesson"],
  Other: DEFAULT_PRESET_LABELS,
};

/** A creator's stored presets win; otherwise their category's defaults. */
function resolvePresets(
  tipPresets: TipPresets | null,
  categoryName: string,
): ResolvedPreset[] {
  if (tipPresets) {
    return tipPresets.map((preset, index) => ({
      ...preset,
      popular: index === POPULAR_PRESET_INDEX,
    }));
  }

  const labels = CATEGORY_PRESET_LABELS[categoryName] ?? DEFAULT_PRESET_LABELS;

  return PRESET_AMOUNTS.map((amount, index) => ({
    amount,
    label: labels[index],
    popular: index === POPULAR_PRESET_INDEX,
  }));
}

export {
  REASONS,
  NUMBER_FLOW_OPACITY_TIMING,
  NUMBER_FLOW_TIMING,
  POPULAR_PRESET_INDEX,
  PRESET_LABEL_MAX_LENGTH,
  resolvePresets,
};
