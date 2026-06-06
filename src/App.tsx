import React, { useState, useEffect } from 'react';
import { 
  Coins, Terminal, Shield, ArrowUpRight, Cpu, HelpCircle, 
  Layers, Wallet, BookOpen, AlertCircle, Sparkles, LogOut, CheckCircle2,
  LayoutDashboard, CreditCard, Activity, Menu, X, List, Sliders, Globe
} from 'lucide-react';
import { PaymentLink, Transaction, WebhookEvent, MerchantBalance, CryptoSymbol, CryptoAsset } from './types';
import DeveloperDashboard from './components/DeveloperDashboard';
import CheckoutPreview from './components/CheckoutPreview';
import RpcConsole from './components/RpcConsole';

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

  // Layout navigation state
  // 'dashboard' controls showing DeveloperDashboard component
  const [activeView, setActiveView] = useState<'dashboard' | 'checkout' | 'rpcs'>('dashboard');
  
  // Controls which dashboard sub-tab is currently visible
  const [innerDashboardTab, setInnerDashboardTab] = useState<'links' | 'transactions' | 'webhooks' | 'api'>('links');

  // Core global databases & on-chain dynamic assets config state
  const [supportedAssets, setSupportedAssets] = useState<CryptoAsset[]>([
    { symbol: 'USDC', name: 'USD Coin', icon: '🔵', network: 'EVM Polygon Network', usdPrice: 1.00, gasUSD: 0.15, rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/demo', latencyMs: 15, blockHeight: 58912401, status: 'connected', isActive: true, type: 'EVM Sidechain' },
    { symbol: 'ETH', name: 'Ethereum', icon: '💎', network: 'Ethereum Layer 1', usdPrice: 3254.12, gasUSD: 4.80, rpcUrl: 'https://mainnet.infura.io/v3/demo', latencyMs: 12, blockHeight: 20115482, status: 'connected', isActive: true, type: 'Native Layer 1' },
    { symbol: 'SOL', name: 'Solana', icon: '🟣', network: 'Solana High-Performance Chain', usdPrice: 186.40, gasUSD: 0.02, rpcUrl: 'https://api.mainnet-beta.solana.com', latencyMs: 24, blockHeight: 274510911, status: 'connected', isActive: true, type: 'Native High-Speed SVM' },
    { symbol: 'BTC', name: 'Bitcoin', icon: '🪙', network: 'Bitcoin Network', usdPrice: 94220.50, gasUSD: 2.10, rpcUrl: 'https://btc-mainnet.rpc.host', latencyMs: 210, blockHeight: 847122, status: 'degraded', isActive: true, type: 'Layer 1 Legacy PoW' }
  ]);

  // Financial ledgers
  const [balance, setBalance] = useState<MerchantBalance>(INITIAL_BALANCES);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>(INITIAL_PAYMENT_LINKS);
  const [activePaymentLinkId, setActivePaymentLinkId] = useState<string>('link_saas_pro_1');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [webhooks, setWebhooks] = useState<WebhookEvent[]>(INITIAL_WEBHOOKS);

  // Success alert animation banner
  const [incomingSuccess, setIncomingSuccess] = useState<Transaction | null>(null);

  // Sync balances holdings array keys if custom tokens get paid
  useEffect(() => {
    // Ensure all supported asset tickers are populated in the balance structure
    setBalance(prev => {
      const updatedHoldings = { ...prev.holdings };
      let changed = false;
      supportedAssets.forEach(asset => {
        if (updatedHoldings[asset.symbol] === undefined) {
          updatedHoldings[asset.symbol] = 0;
          changed = true;
        }
      });
      if (changed) {
        return { ...prev, holdings: updatedHoldings };
      }
      return prev;
    });
  }, [supportedAssets]);

  const selectedPaymentLink = paymentLinks.find((link) => link.id === activePaymentLinkId) || paymentLinks[0];

  // Callback to insert newly generated links
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
    setActivePaymentLinkId(newId);
    
    // Auto shift view to the visual checkout simulation tab so they can test immediately
    setActiveView('checkout');
  };

  // Process transaction logic once payment resolves in checkout preview
  const handlePaymentSuccess = (newTx: Transaction) => {
    // 1. Queue into recent transaction ledger
    setTransactions((prev) => [newTx, ...prev]);

    // 2. Adjust Balance ledger holdings dynamically using current live price of the selected asset
    const coinSymbol = newTx.cryptoSymbol;
    const targetAsset = supportedAssets.find(a => a.symbol === coinSymbol);
    const conversionRate = targetAsset ? targetAsset.usdPrice : 1.0;
    const addedCryptoAmount = newTx.amountUSD / conversionRate;

    setBalance((prev) => {
      const currentHoldings = prev.holdings[coinSymbol] !== undefined ? prev.holdings[coinSymbol] : 0;
      return {
        totalProcessedUSD: prev.totalProcessedUSD + newTx.amountUSD,
        availableUSD: prev.availableUSD + newTx.amountUSD,
        pendingUSD: Math.max(0, prev.pendingUSD - 10),
        holdings: {
          ...prev.holdings,
          [coinSymbol]: currentHoldings + addedCryptoAmount
        }
      };
    });

    // 3. Increment counters
    setPaymentLinks((prev) => 
      prev.map((link) => 
        link.id === newTx.paymentLinkId 
          ? { ...link, timesUsed: link.timesUsed + 1 } 
          : link
      )
    );

    // 4. Fire Webhook event payload
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
      "payment_method_types": ["${coinSymbol.toLowerCase()}"],
      "customer": {
        "name": "${newTx.customerName}",
        "email": "${newTx.customerEmail}"
      },
      "blockchain_receipt": {
        "symbol": "${coinSymbol}",
        "crypto_amount": "${newTx.cryptoAmount.toFixed(6)}",
        "tx_hash": "${newTx.txHash}",
        "gas_used_usd": "${(targetAsset?.gasUSD || 0.15).toFixed(2)}"
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

  const premiumElevatedShadow = '1px 1px 0px #23211F, 2px 2px 0px #1E1B19, 3px 3px 0px #141211, 4px 4px 0px #0A0908, 5px 5px 0px #000000';

  return (
    <div className="min-h-screen bg-[#000000] text-[#9B9691] font-sans antialiased flex flex-col lg:flex-row selection:bg-amber-500/20 selection:text-white">
      
      {/* 1. DESKTOP SIDEBAR - Locked on the left */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed top-0 left-0 bg-[#0A0908] border-r-2 border-[#23211F] p-6 justify-between select-none z-30">
        <div className="flex flex-col gap-8">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold bg-amber-500 text-black px-2.5 py-1.5 rounded-xl border-2 border-[#23211F] font-outfit shadow-[2px_2px_0px_#23211F]">
              S
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-outfit font-extrabold tracking-widest text-white leading-tight uppercase">SETTLΞR ENGINE</span>
              <span className="text-[9px] text-gray-500 font-mono tracking-tight font-bold">MULTICHAIN ORACLE V3</span>
            </div>
          </div>

          {/* Navigation link stacks */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest px-2 mb-1.5 block">WORKSPACE SYSTEMS</span>
            
            <button
              type="button"
              onClick={() => { setActiveView('dashboard'); setInnerDashboardTab('links'); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider font-space-grotesk transition-all cursor-pointer border-2 ${
                activeView === 'dashboard' && innerDashboardTab === 'links'
                  ? 'bg-[#1E1B19] text-white border-[#23211F] shadow-[1px_1px_0px_#000]'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-500" /> Merchant Overview
            </button>

            <button
              type="button"
              onClick={() => setActiveView('checkout')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider font-space-grotesk transition-all cursor-pointer border-2 ${
                activeView === 'checkout'
                  ? 'bg-[#1E1B19] text-white border-[#23211F] shadow-[1px_1px_0px_#000]'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-500" /> Checkout Terminal
            </button>

            <button
              type="button"
              onClick={() => setActiveView('rpcs')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider font-space-grotesk transition-all cursor-pointer border-2 ${
                activeView === 'rpcs'
                  ? 'bg-[#1E1B19] text-white border-[#23211F] shadow-[1px_1px_0px_#000]'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-amber-500" /> RPC Node Engine
            </button>

            <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest px-2 mt-4 mb-1.5 block">LEDGERS & PIPELINES</span>

            <button
              type="button"
              onClick={() => { setActiveView('dashboard'); setInnerDashboardTab('transactions'); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider font-space-grotesk transition-all cursor-pointer border-2 ${
                activeView === 'dashboard' && innerDashboardTab === 'transactions'
                  ? 'bg-[#1E1B19] text-white border-[#23211F] shadow-[1px_1px_0px_#000]'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <List className="w-4 h-4 text-blue-400" /> Settle Ledger
            </button>

            <button
              type="button"
              onClick={() => { setActiveView('dashboard'); setInnerDashboardTab('webhooks'); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider font-space-grotesk transition-all cursor-pointer border-2 ${
                activeView === 'dashboard' && innerDashboardTab === 'webhooks'
                  ? 'bg-[#1E1B19] text-white border-[#23211F] shadow-[1px_1px_0px_#000]'
                  : 'bg-transparent text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" /> Webhook Pipeline
            </button>
          </div>
        </div>

        {/* Live indicator block */}
        <div className="p-4 rounded-2xl bg-[#141211] border border-[#23211F] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9.5px] font-mono font-black text-white uppercase tracking-wider">Mainnet RPC online</span>
          </div>
          <span className="text-[9px] font-mono text-gray-500 leading-tight">Block height indexed globally. Oracle active.</span>
        </div>
      </aside>

      {/* 2. MOBILE TOP HEADER - Sits on top of viewport on smaller devices */}
      <header className="lg:hidden flex items-center justify-between px-4 h-15 bg-[#0A0908] border-b-2 border-[#23211F] sticky top-0 z-30 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold bg-amber-500 text-black px-2 py-1 rounded-lg border border-[#23211F] font-outfit shadow-[1px_1px_0px_#000]">
            S
          </span>
          <span className="text-xs font-outfit font-extrabold tracking-widest text-white uppercase">SETTLΞR ENGINE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono text-gray-400 border border-[#23211F] px-2 py-0.5 bg-[#141211] rounded uppercase">
            {testMode ? 'SANDBOX DEV' : 'LIVE'}
          </span>
        </div>
      </header>

      {/* 3. MAIN PRODUCT WORKSPACE */}
      <main className="flex-1 min-h-screen lg:pl-64 flex flex-col pb-24 lg:pb-8 bg-[#000000]">
        
        <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto flex flex-col gap-6">
          
          {/* Real-time Payment Success Notification Toast inside page */}
          {incomingSuccess && (
            <div 
              className="p-4 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/40 text-white flex items-center justify-between animate-bounce" 
              style={{ boxShadow: premiumElevatedShadow }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider font-outfit text-emerald-400">Transaction Finalized On Ledger</h5>
                  <p className="text-xs text-xs text-gray-200 mt-0.5">
                    Customer <strong className="text-white font-space-grotesk">{incomingSuccess.customerName}</strong> paid{' '}
                    <strong className="text-white font-mono">${incomingSuccess.amountUSD.toFixed(2)}</strong> via {incomingSuccess.cryptoSymbol} address.
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-500/20 uppercase font-black tracking-wider">
                COMMITTED
              </span>
            </div>
          )}

          {/* Render content based on activeView */}
          {activeView === 'dashboard' && (
            <DeveloperDashboard 
              balance={balance}
              paymentLinks={paymentLinks}
              transactions={transactions}
              webhooks={webhooks}
              testMode={testMode}
              setTestMode={setTestMode}
              onSelectPaymentLink={(link) => {
                setActivePaymentLinkId(link.id);
                setActiveView('checkout');
              }}
              activePaymentLinkId={activePaymentLinkId}
              onCreatePaymentLink={handleCreatePaymentLink}
              onClearLogs={handleClearLogs}
              activeTab={innerDashboardTab}
              onTabChange={setInnerDashboardTab}
            />
          )}

          {activeView === 'checkout' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Checkout widget takes 3 columns */}
              <div className="md:col-span-3">
                <CheckoutPreview 
                  paymentLink={selectedPaymentLink}
                  onPaymentSuccess={handlePaymentSuccess}
                  testMode={testMode}
                  supportedAssets={supportedAssets}
                />
              </div>

              {/* Guide card takes 2 columns */}
              <div className="md:col-span-2 flex flex-col gap-4">
                <div 
                  className="p-5 rounded-2xl bg-[#0A0908] border-2 border-[#23211F] text-xs flex flex-col gap-3"
                  style={{ boxShadow: premiumElevatedShadow }}
                >
                  <div className="flex items-center gap-2 text-white font-extrabold pb-2 border-b border-[#23211F] uppercase text-[10px] tracking-widest font-outfit">
                    <BookOpen className="w-4 h-4 text-amber-500 animate-pulse" />
                    Checkout Sandbox Guide
                  </div>
                  <p className="text-gray-400 leading-normal font-sans">
                    This simulated terminal lets developers evaluate the customer experience checkout flow. Click any link in the <strong>Merchant Overview</strong> to host it in this portal.
                  </p>
                  
                  <div className="flex flex-col gap-2 mt-1">
                    <label className="text-[8.5px] font-mono text-gray-500 uppercase font-bold">Currently SIMULATED PRODUCT</label>
                    <select
                      value={activePaymentLinkId}
                      onChange={(e) => setActivePaymentLinkId(e.target.value)}
                      className="px-3.5 py-2.5 text-xs text-white rounded-xl bg-[#141211] border-2 border-[#23211F] focus:outline-none focus:border-amber-500 cursor-pointer font-sans"
                    >
                      {paymentLinks.map(link => (
                        <option key={link.id} value={link.id}>{link.name} — ${link.amountUSD.toFixed(0)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3.5 bg-[#000]/60 border border-[#23211F] rounded-xl text-gray-400 font-mono text-[9px] uppercase font-bold leading-relaxed mt-2 flex flex-col gap-1.5">
                    <span>Active Gateway Mode: {testMode ? 'Sandbox Simulator' : 'Public Mainnet'}</span>
                    <span>Direct Webhook Dispatch: Enabled</span>
                    <span>Cryptographic SLA Hash: Active</span>
                  </div>
                </div>

                <div 
                  className="p-5 rounded-2xl bg-[#0A0908] border-2 border-[#23211F] text-xs flex flex-col gap-2.5"
                  style={{ boxShadow: premiumElevatedShadow }}
                >
                  <div className="flex items-center gap-2 text-white font-extrabold uppercase text-[10px] tracking-widest font-outfit">
                    <Sliders className="w-4 h-4 text-amber-500" /> Node Parameters
                  </div>
                  <p className="text-gray-400 leading-relaxed font-sans">
                    You can toggle which coins are active in checkout or change node properties (latency, gas fees, block numbers) via the <strong>RPC Node Engine</strong> settings. Any modification to endpoints automatically updates this terminal.
                  </p>
                </div>
              </div>

            </div>
          )}

          {activeView === 'rpcs' && (
            <RpcConsole 
              assets={supportedAssets}
              setAssets={setSupportedAssets}
            />
          )}

        </div>

        {/* Desktop Footer spacer */}
        <footer className="mt-auto border-t-2 border-[#23211F]/30 py-6 bg-[#000] text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-medium text-[10px] sm:text-xs">© 2026 SettlerEngine. Pitch-Dark Consensus Ledger Space.</p>
            <div className="flex gap-4 font-mono text-[9px] uppercase font-bold">
              <span className="hover:text-amber-500 transition-colors cursor-pointer text-gray-400">SMART CONTRACT: 0X92...E10B</span>
              <span className="hover:text-amber-500 transition-colors cursor-pointer text-gray-400">DOCUMENTATION</span>
            </div>
          </div>
        </footer>

      </main>

      {/* 4. MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0A0908] border-t-2 border-[#23211F] z-40 flex items-center justify-around pb-safe px-2 shadow-[0_-5px_25px_rgba(0,0,0,0.85)]">
        
        <button
          type="button"
          onClick={() => { setActiveView('dashboard'); setInnerDashboardTab('links'); }}
          className={`flex flex-col items-center justify-center p-2 text-center transition-all ${
            activeView === 'dashboard' && innerDashboardTab === 'links' ? 'text-amber-500' : 'text-gray-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-tighter mt-1 font-bold uppercase">Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('checkout')}
          className={`flex flex-col items-center justify-center p-2 text-center transition-all relative ${
            activeView === 'checkout' ? 'text-amber-500' : 'text-gray-400'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-tighter mt-1 font-bold uppercase">Checkout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('rpcs')}
          className={`flex flex-col items-center justify-center p-2 text-center transition-all ${
            activeView === 'rpcs' ? 'text-amber-500' : 'text-gray-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-tighter mt-1 font-bold uppercase">RPC Nodes</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('dashboard'); setInnerDashboardTab('transactions'); }}
          className={`flex flex-col items-center justify-center p-2 text-center transition-all ${
            activeView === 'dashboard' && innerDashboardTab === 'transactions' ? 'text-blue-400' : 'text-gray-400'
          }`}
        >
          <List className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-tighter mt-1 font-bold uppercase">Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('dashboard'); setInnerDashboardTab('webhooks'); }}
          className={`flex flex-col items-center justify-center p-2 text-center transition-all ${
            activeView === 'dashboard' && innerDashboardTab === 'webhooks' ? 'text-emerald-400' : 'text-gray-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-tighter mt-1 font-bold uppercase">Webhooks</span>
        </button>

      </nav>

    </div>
  );
}
