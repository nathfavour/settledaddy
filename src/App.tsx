import React, { useState, useEffect } from 'react';
import { 
  Coins, Terminal, Shield, ArrowUpRight, Cpu, HelpCircle, 
  Layers, Wallet, BookOpen, AlertCircle, Sparkles, LogOut, CheckCircle2
} from 'lucide-react';
import { PaymentLink, Transaction, WebhookEvent, MerchantBalance, CryptoSymbol } from './types';
import DeveloperDashboard from './components/DeveloperDashboard';
import CheckoutPreview from './components/CheckoutPreview';

const INITIAL_BALANCES: MerchantBalance = {
  totalProcessedUSD: 142490.00,
  availableUSD: 136377.50,
  pendingUSD: 6112.50,
  holdings: {
    BTC: 0.5841,
    ETH: 15.6521,
    SOL: 204.1503,
    USDC: 24500.00
  }
};

const INITIAL_PAYMENT_LINKS: PaymentLink[] = [
  {
    id: 'link_saas_pro_1',
    name: 'Pro Tier SaaS Access (Monthly)',
    description: 'Generates API endpoints, background worker threads, and dual webhook sync alerts.',
    amountUSD: 49.00,
    createdTime: '2026-05-15',
    isActive: true,
    timesUsed: 124
  },
  {
    id: 'link_mempool_feed',
    name: 'Ultra-Low Latency Mempool RPC Access',
    description: 'Instant transaction insertion queue direct to decentralized mining pools.',
    amountUSD: 199.00,
    createdTime: '2026-05-18',
    isActive: true,
    timesUsed: 42
  },
  {
    id: 'link_web3_pass',
    name: 'Hackathon Access Keycard (Soulbound)',
    description: 'Provides verified entry pass directly indexed in the decentralized IPFS ledger.',
    amountUSD: 19.00,
    createdTime: '2026-05-22',
    isActive: true,
    timesUsed: 249
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'ch_1a8f90b',
    paymentLinkId: 'link_web3_pass',
    productName: 'Hackathon Access Keycard (Soulbound)',
    amountUSD: 19.00,
    cryptoSymbol: 'SOL',
    cryptoAmount: 0.1019,
    customerEmail: 'vitalik@ethereum.org',
    customerName: 'Vitalik Buterin',
    status: 'succeeded',
    txHash: 'B4nKsY9FhR8U3p2cAdQ6kWeZ1fVx8n5vY9Z8U3pwR2AdSolHash',
    timestamp: '14:25:01'
  },
  {
    id: 'ch_4d0ea22',
    paymentLinkId: 'link_saas_pro_1',
    productName: 'Pro Tier SaaS Access (Monthly)',
    amountUSD: 49.00,
    cryptoSymbol: 'USDC',
    cryptoAmount: 49.00,
    customerEmail: 'satoshi@bitcoin.org',
    customerName: 'Satoshi Nakamoto',
    status: 'succeeded',
    txHash: '0x32e921fff3a0bde3c01c01e098a7293021fbc',
    timestamp: '13:10:45'
  }
];

const INITIAL_WEBHOOKS: WebhookEvent[] = [
  {
    id: 'evt_saas_success_init',
    type: 'payment_intent.succeeded',
    timestamp: '13:10:48',
    status: 'sent',
    payload: `{
  "id": "evt_saas_success_init",
  "object": "event",
  "api_version": "2026-06-04",
  "created": 1780512824,
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_3M2eWKqS82eW",
      "amount_usd": 49.00,
      "currency_usd": "usd",
      "status": "succeeded",
      "payment_method_types": ["usdc_polygon"],
      "customer": {
        "name": "Satoshi Nakamoto",
        "email": "satoshi@bitcoin.org"
      },
      "blockchain_receipt": {
        "symbol": "USDC",
        "crypto_amount": "49.00",
        "tx_hash": "0x32e921fff3a0bde3c01c01e098a7293021fbc",
        "gas_used_usd": "0.15"
      }
    }
  }
}`
  }
];

export default function App() {
  // Test Mode switch
  const [testMode, setTestMode] = useState<boolean>(true);

  // Core global database states
  const [balance, setBalance] = useState<MerchantBalance>(INITIAL_BALANCES);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>(INITIAL_PAYMENT_LINKS);
  const [activePaymentLinkId, setActivePaymentLinkId] = useState<string>('link_saas_pro_1');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>(INITIAL_WEBHOOKS);

  // Flash payment banner notification
  const [incomingSuccess, setIncomingSuccess] = useState<Transaction | null>(null);

  // Find currently active item
  const selectedPaymentLink = paymentLinks.find((link) => link.id === activePaymentLinkId) || paymentLinks[0];

  // Callback to insert newly generated product links
  const handleCreatePaymentLink = (name: string, description: string, price: number) => {
    const newId = `link_${Math.random().toString(36).substring(2, 9)}`;
    const newLink: PaymentLink = {
      id: newId,
      name,
      description,
      amountUSD: price,
      createdTime: new Date().toISOString().split('T')[0],
      isActive: true,
      timesUsed: 0
    };

    setPaymentLinks((prev) => [newLink, ...prev]);
    setActivePaymentLinkId(newId); // Focus right simulator to the new link immediately!
  };

  // Callback once the client pays the invoice on the checkout sidebar
  const handlePaymentSuccess = (newTx: Transaction) => {
    // 1. Add direct payment to recent transaction stack
    setTransactions((prev) => [newTx, ...prev]);

    // 2. Adjust Balance ledger holdings
    const coinSymbol = newTx.cryptoSymbol;
    setBalance((prev) => {
      // Find asset current mock conversion rate matching the checkout rate
      let conversionRate = 1.0;
      if (coinSymbol === 'BTC') conversionRate = 94220.50;
      if (coinSymbol === 'ETH') conversionRate = 3254.12;
      if (coinSymbol === 'SOL') conversionRate = 186.40;

      const addedCryptoAmount = newTx.amountUSD / conversionRate;

      return {
        totalProcessedUSD: prev.totalProcessedUSD + newTx.amountUSD,
        availableUSD: prev.availableUSD + newTx.amountUSD,
        pendingUSD: Math.max(0, prev.pendingUSD - 10), // Simulate pending clearance
        holdings: {
          ...prev.holdings,
          [coinSymbol]: prev.holdings[coinSymbol] + addedCryptoAmount
        }
      };
    });

    // 3. Increment counters on payment link structure
    setPaymentLinks((prev) => 
      prev.map((link) => 
        link.id === newTx.paymentLinkId 
          ? { ...link, timesUsed: link.timesUsed + 1 } 
          : link
      )
    );

    // 4. Dispatch a simulated developer webhook webhook event
    const webhookId = `evt_${Math.random().toString(36).substring(2, 11)}`;
    const prettyJsonPayload = `{
  "id": "${webhookId}",
  "object": "event",
  "api_version": "2026-06-04",
  "created": ${Math.floor(Date.now() / 1000)},
  "type": "payment_intent.succeeded",
  "livemode": ${!testMode},
  "data": {
    "object": {
      "id": "pi_${newTx.id}",
      "amount_usd": ${newTx.amountUSD.toFixed(2)},
      "currency_usd": "usd",
      "status": "succeeded",
      "payment_method_types": ["${coinSymbol.toLowerCase()}_${coinSymbol === 'SOL' ? 'phantom' : 'metamask'}"],
      "customer": {
        "name": "${newTx.customerName}",
        "email": "${newTx.customerEmail}"
      },
      "blockchain_receipt": {
        "symbol": "${coinSymbol}",
        "crypto_amount": "${newTx.cryptoAmount.toFixed(6)}",
        "tx_hash": "${newTx.txHash}",
        "gas_used_usd": "${coinSymbol === 'SOL' ? '0.02' : coinSymbol === 'BTC' ? '2.10' : '4.80'}"
      }
    }
  }
}`;

    const newWebhook: WebhookEvent = {
      id: webhookId,
      type: 'payment_intent.succeeded',
      payload: prettyJsonPayload,
      timestamp: new Date().toLocaleTimeString(),
      status: 'sent'
    };

    setWebhooks((prev) => [newWebhook, ...prev]);

    // 5. Fire incoming alert popup banner momentarily
    setIncomingSuccess(newTx);
    setTimeout(() => {
      setIncomingSuccess(null);
    }, 4500);
  };

  const handleClearLogs = () => {
    setWebhooks([]);
  };

  const tactileShadow = '1px 1px 0px #23211F, 2px 2px 0px #1E1B19, 3px 3px 0px #141211, 4px 4px 0px #0A0908, 5px 5px 0px #000000';

  return (
    <div className="min-h-screen bg-[#000000] text-gray-300 font-sans antialiased pb-12 flex flex-col">
      {/* Top Main Brand Header */}
      <header className="border-b-2 border-[#23211F] bg-[#0A0908] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold bg-amber-500 text-black px-2.5 py-1.5 rounded border border-[#23211F] font-outfit select-none">
              S
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-outfit font-bold tracking-widest text-white leading-tight uppercase">STRIPΞ // CRYPTO</span>
              <span className="text-[10px] text-gray-500 font-mono">INTELLIGENT BLOCKS BILLING GATEWAY</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live UTC Clock */}
            <span className="hidden sm:inline-block text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-[#141211] border border-[#23211F] px-3 py-1 rounded">
              NODE TIME: 2026-06-04 02:13 UTC
            </span>
            <span className="text-xs font-semibold text-white font-mono flex items-center gap-1.5 bg-[#141211] px-3 py-1.5 rounded border border-[#23211F]">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> Mainnet-V3 RPC Client
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full">
        {/* Dynamic Payment Success Notification Toast inside page */}
        {incomingSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-950/30 border-2 border-emerald-500/40 text-white flex items-center justify-between animate-bounce" style={{ boxShadow: tactileShadow }}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wide font-outfit text-emerald-400">Payment Succeeded (Webhook Sent)</h5>
                <p className="text-sm text-gray-200 mt-0.5">
                  Customer <strong className="text-white">{incomingSuccess.customerName}</strong> paid{' '}
                  <strong className="text-white">${incomingSuccess.amountUSD.toFixed(2)}</strong> via {incomingSuccess.cryptoSymbol} address.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-500/20">
              Tx Hash Settle Completed
            </span>
          </div>
        )}

        {/* Intro Alert Box */}
        <div className="mb-8 p-4 rounded-lg bg-[#141211] border-2 border-[#23211F] flex flex-col sm:flex-row items-center gap-4 justify-between relative overflow-hidden" style={{ boxShadow: tactileShadow }}>
          <div className="absolute top-0 right-0 p-1 flex">
            <Sparkles className="w-14 h-14 text-amber-500/5 rotate-12" />
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 text-amber-500 rounded p-2 border border-amber-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-outfit font-semibold text-white tracking-tight uppercase">Quick Sandbox Instruction</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-normal">
                This is a fully-fledged crypto payment gateway simulator. Customize payment products inside <strong className="text-amber-500">Active Payment Links</strong> or compile new ones. Then, use the high-fidelity invoice widget on the right to connect simulated MetaMask / Phantom keys, and process EVM transaction blocks to evaluate our developer webhooks.
              </p>
            </div>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Left Columns (3 span): Merchant portal (balances, charts, payment links, logs)*7 */}
          <DeveloperDashboard 
            balance={balance}
            paymentLinks={paymentLinks}
            transactions={transactions}
            webhooks={webhooks}
            testMode={testMode}
            setTestMode={setTestMode}
            onSelectPaymentLink={(link) => setActivePaymentLinkId(link.id)}
            activePaymentLinkId={activePaymentLinkId}
            onCreatePaymentLink={handleCreatePaymentLink}
            onClearLogs={handleClearLogs}
          />

          {/* Right Column (2 span): Customer Checkout Preview Simulation Widget */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="sticky top-20 flex flex-col gap-4">
              <CheckoutPreview 
                paymentLink={selectedPaymentLink}
                onPaymentSuccess={handlePaymentSuccess}
                testMode={testMode}
              />
              
              {/* Extra Simulated Metadata Panel */}
              <div 
                className="p-4 rounded-lg bg-[#141211] border-2 border-[#23211F] text-xs flex flex-col gap-2"
                style={{ boxShadow: tactileShadow }}
              >
                <div className="flex items-center gap-2 text-white font-medium mb-1 uppercase text-[11px] tracking-wide">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  Cryptostripe Protocol Overview
                </div>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Cryptostripe resolves multi-chain settlement times by operating secondary state channels and decentralized oracle listening nodes. Customers execute a signature approval, sending tokens to the smart contract, and our system fires off webhooks with verified ledger blocks so your servers deliver products or services in under 8 seconds.
                </p>
                <div className="flex gap-2 mt-1.5">
                  <span className="text-[9px] font-mono text-gray-500 bg-[#0A0908] border border-[#23211F] px-2 py-0.5 rounded">
                    EVM Layer-2 Ready
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 bg-[#0A0908] border border-[#23211F] px-2 py-0.5 rounded">
                    Solana SVM Ready
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Aesthetic Footer */}
      <footer className="mt-16 border-t border-[#23211F] py-8 bg-[#0A0908] text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Cryptostripe. Crafted in Pitch-Dark Sandbox Space.</p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span className="hover:text-gray-300 transition-colors">SMART CONTRACT: 0X92...E10B</span>
            <span className="hover:text-gray-300 transition-colors">DOCUMENTATION</span>
            <span className="hover:text-gray-300 transition-colors">DECENTRALIZED API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
