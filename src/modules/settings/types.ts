import type { TipPresets } from "@/types";
import type { ResolvedPreset } from "@/modules/profile/types";

type SettingsCreator = {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  categoryId: string;
  categoryName: string;
  tipPresets: TipPresets | null;
  allowCustomAmount: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
};

type SettingsProps = {
  creator: SettingsCreator;
  categories: CategoryOption[];
};

type ProfileCardProps = {
  creator: SettingsCreator;
  categories: CategoryOption[];
};

type TipPresetsCardProps = {
  presets: ResolvedPreset[];
  usingDefaults: boolean;
  allowCustomAmount: boolean;
};

type ProfileFormErrors = {
  displayName?: string;
  categoryId?: string;
  bio?: string;
  form?: string;
};

type PresetSlotErrors = {
  amount?: string;
  label?: string;
};

type PresetFormErrors = {
  slots?: Partial<Record<number, PresetSlotErrors>>;
  form?: string;
};

type ProfileValues = {
  displayName: string;
  categoryId: string;
  bio: string;
};

export type {
  SettingsCreator,
  CategoryOption,
  SettingsProps,
  ProfileCardProps,
  TipPresetsCardProps,
  ProfileFormErrors,
  PresetSlotErrors,
  PresetFormErrors,
  ProfileValues,
};
