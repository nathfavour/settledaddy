export type CryptoSymbol = 'BTC' | 'ETH' | 'SOL' | 'USDC';

export interface CryptoAsset {
  symbol: CryptoSymbol;
  name: string;
  icon: string; // Color accent or representation
  network: string; // e.g. "Bitcoin Mainnet", "Ethereum Mainnet", "Solana Mainnet"
  usdPrice: number; // Simulated live conversion rate
  gasUSD: number; // Cost of simulated gas fee
}

export interface PaymentLink {
  id: string;
  name: string;
  description: string;
  amountUSD: number;
  createdTime: string;
  isActive: boolean;
  timesUsed: number;
}

export interface Transaction {
  id: string;
  paymentLinkId?: string;
  productName: string;
  amountUSD: number;
  cryptoSymbol: CryptoSymbol;
  cryptoAmount: number;
  customerEmail: string;
  customerName: string;
  status: 'pending' | 'succeeded' | 'failed' | 'expired';
  txHash?: string;
  timestamp: string;
}

export interface WebhookEvent {
  id: string;
  type: 'payment_intent.created' | 'payment_intent.succeeded' | 'payment_intent.failed' | 'charge.refunded';
  payload: string; // JSON pretty-string
  timestamp: string;
  status: 'sent' | 'retrying' | 'failed';
}

export interface MerchantBalance {
  totalProcessedUSD: number;
  availableUSD: number;
  pendingUSD: number;
  holdings: {
    BTC: number;
    ETH: number;
    SOL: number;
    USDC: number;
  };
}
