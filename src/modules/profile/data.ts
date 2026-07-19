const NUMBER_FLOW_TIMING = {
  duration: 240,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} satisfies EffectTiming;

const NUMBER_FLOW_OPACITY_TIMING = {
  duration: 140,
  easing: "ease-out",
} satisfies EffectTiming;

const PRESETS = [
  { amount: 500, label: "Coffee", popular: false },
  { amount: 1000, label: "Stream fuel", popular: true },
  { amount: 2000, label: "Big support", popular: false },
  { amount: 5000, label: "Next upgrade", popular: false },
] as const;

export { NUMBER_FLOW_OPACITY_TIMING, NUMBER_FLOW_TIMING, PRESETS };
