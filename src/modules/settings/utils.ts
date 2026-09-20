import { MAXIMUM_TIP, MINIMUM_TIP } from "@/data/constants";
import { formatNaira } from "@/lib/utils";
import { BIO_MAX_LENGTH } from "@/modules/onboarding/data";
import type { TipPreset } from "@/types";
import type {
  PresetFormErrors,
  ProfileFormErrors,
  ProfileValues,
} from "./types";

function validateProfile(values: ProfileValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (!values.displayName.trim()) {
    errors.displayName = "Enter your display name.";
  }
  if (!values.categoryId) {
    errors.categoryId = "Pick a category from the list.";
  }
  if (values.bio.trim().length > BIO_MAX_LENGTH) {
    errors.bio = `Your bio can’t be longer than ${BIO_MAX_LENGTH} characters.`;
  }

  return errors;
}

function validatePresets(values: TipPreset[]): PresetFormErrors {
  const errors: PresetFormErrors = {};

  values.forEach(({ amount, label }, index) => {
    const slot: { amount?: string; label?: string } = {};
    if (amount < MINIMUM_TIP) {
      slot.amount = `Each amount needs to be at least ${formatNaira(MINIMUM_TIP)}.`;
    } else if (amount > MAXIMUM_TIP) {
      slot.amount = `Each amount can’t be more than ${formatNaira(MAXIMUM_TIP)}.`;
    }
    if (!label.trim()) {
      slot.label = "Add a short label.";
    }
    if (slot.amount || slot.label) {
      (errors.slots ??= {})[index] = slot;
    }
  });

  const amounts = values.map(({ amount }) => amount);
  if (!errors.slots && new Set(amounts).size !== amounts.length) {
    errors.form = "Each preset needs a different amount.";
  }

  return errors;
}

export { validatePresets, validateProfile };
