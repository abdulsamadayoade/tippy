import type { RefObject } from "react";
import type { TipPresets } from "@/types";

type PublicCreator = {
  displayName: string;
  username: string;
  categoryName: string;
  bio: string | null;
  avatarUrl: string | null;
  tipPresets: TipPresets | null;
  allowCustomAmount: boolean;
};

type MonnifyClientConfig = {
  apiKey: string;
  contractCode: string;
};

type ProfileProps = {
  creator: PublicCreator;
  viewerSignedIn: boolean;
  monnify: MonnifyClientConfig | null;
};

type Step = "form" | "success";

type CheckoutResponse = {
  paymentReference: string;
  amount: number;
  customerFullName: string;
  customerEmail: string;
};

type SuccessProps = {
  creatorName: string;
  confettiRef: RefObject<HTMLCanvasElement | null>;
  checkRef: RefObject<HTMLSpanElement | null>;
  checkState: "out" | "in";
  amount: number;
  message: string;
  receiptEmail?: string;
  reset: () => void;
};

type CheckoutPanelProps = {
  creatorName: string;
  creatorPhotoUrl?: string | null;
  amount: number;
  message: string;
  paying: boolean;
  error?: string;
  onSubmit: () => void;
  onClose: () => void;
  closeRef?: RefObject<HTMLButtonElement | null>;
};

type PresetLabels = [string, string, string, string];

type ResolvedPreset = {
  amount: number;
  label: string;
  popular: boolean;
};

export type {
  PublicCreator,
  ProfileProps,
  MonnifyClientConfig,
  Step,
  CheckoutResponse,
  SuccessProps,
  CheckoutPanelProps,
  PresetLabels,
  ResolvedPreset,
};
