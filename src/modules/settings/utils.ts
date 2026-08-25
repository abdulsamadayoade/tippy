import { BIO_MAX_LENGTH } from "@/modules/onboarding/data";
import type { ProfileValues, ProfileFormErrors } from "./types";

function validate(values: ProfileValues): ProfileFormErrors {
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

export { validate };
