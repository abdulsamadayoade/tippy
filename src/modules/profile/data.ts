import type { PresetLabels } from "./types";

const NUMBER_FLOW_TIMING = {
  duration: 240,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} satisfies EffectTiming;

const NUMBER_FLOW_OPACITY_TIMING = {
  duration: 140,
  easing: "ease-out",
} satisfies EffectTiming;

const PRESET_AMOUNTS = [
  { amount: 500, popular: false },
  { amount: 1000, popular: true },
  { amount: 2000, popular: false },
  { amount: 5000, popular: false },
] as const;

const DEFAULT_PRESET_LABELS: PresetLabels = [
  "Small thanks",
  "Show some love",
  "Big support",
  "Super fan",
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

function getPresets(categoryName: string) {
  const labels = CATEGORY_PRESET_LABELS[categoryName] ?? DEFAULT_PRESET_LABELS;

  return PRESET_AMOUNTS.map((preset, index) => ({
    ...preset,
    label: labels[index],
  }));
}

const DEFAULT_TIP = 1_000;

export {
  NUMBER_FLOW_OPACITY_TIMING,
  NUMBER_FLOW_TIMING,
  getPresets,
  DEFAULT_TIP,
};
