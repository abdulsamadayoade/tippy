type MonnifySDKCompleteResponse = {
  paymentStatus?: string;
  paymentReference?: string;
  transactionReference?: string;
  amountPaid?: number;
};

type MonnifySDKCloseResponse = {
  paymentStatus?: string;
  responseCode?: string;
};

type MonnifySDKInitializeConfig = {
  amount: number;
  currency: string;
  reference: string;
  customerFullName: string;
  customerEmail: string;
  apiKey: string;
  contractCode: string;
  paymentDescription?: string;
  metadata?: Record<string, unknown>;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onComplete?: (response: MonnifySDKCompleteResponse) => void;
  onClose?: (response: MonnifySDKCloseResponse) => void;
};

declare global {
  interface Window {
    MonnifySDK?: {
      initialize: (config: MonnifySDKInitializeConfig) => void;
    };
  }
}

export {};
