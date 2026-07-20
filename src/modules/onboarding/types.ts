type ClaimLinkStepProps = {
  username: string;
  onUsernameChange: (username: string) => void;
  onContinue: () => void;
};

type ProfileStepProps = {
  displayName: string;
  onDisplayNameChange: (displayName: string) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  bio: string;
  onBioChange: (bio: string) => void;
  photoUrl: string | null;
  onPhotoChange: (file: File | undefined) => void;
  finishing: boolean;
  onBack: () => void;
  onFinish: () => void;
};

export type { ClaimLinkStepProps, ProfileStepProps };
