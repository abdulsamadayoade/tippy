type CategoryOption = {
  id: string;
  name: string;
};

type ClaimLinkStepProps = {
  username: string;
  onUsernameChange: (username: string) => void;
  serverError: string | null;
  checking: boolean;
  onContinue: () => void;
};

type ProfileStepProps = {
  categories: CategoryOption[];
  displayName: string;
  onDisplayNameChange: (displayName: string) => void;
  categoryId: string;
  onCategoryIdChange: (categoryId: string) => void;
  bio: string;
  onBioChange: (bio: string) => void;
  photoUrl: string | null;
  onPhotoChange: (file: File | undefined) => void;
  finishing: boolean;
  formError: string | null;
  onBack: () => void;
  onFinish: () => void;
};

export type { CategoryOption, ClaimLinkStepProps, ProfileStepProps };
