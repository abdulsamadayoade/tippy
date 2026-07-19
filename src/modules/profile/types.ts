import type { RefObject } from "react";
import type { Tip } from "@/store/types";

type Step = "form" | "success";

type CheckoutResponse = {
  paymentReference: string;
  tip: Tip;
};

type SuccessProps = {
  creatorFirstName: string;
  confettiRef: RefObject<HTMLCanvasElement | null>;
  checkRef: RefObject<HTMLSpanElement | null>;
  checkState: "out" | "in";
  amount: number;
  message: string;
  reset: () => void;
};

export type { Step, CheckoutResponse, SuccessProps };
