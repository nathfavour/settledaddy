import React, { useState, useEffect } from 'react';
import { 
  Coins, Terminal, Shield, ArrowUpRight, Cpu, HelpCircle, 
  Layers, Wallet, BookOpen, AlertCircle, Sparkles, LogOut, CheckCircle2,
  LayoutDashboard, CreditCard, Activity, Menu, X, List, Sliders, Globe,
  MessageSquare, User, Laptop
} from 'lucide-react';
import { PaymentLink, Transaction, WebhookEvent, MerchantBalance, CryptoSymbol, CryptoAsset } from './types';
import DeveloperDashboard from './components/DeveloperDashboard';
import CheckoutPreview from './components/CheckoutPreview';
import RpcConsole from './components/RpcConsole';

const INITIAL_BALANCES: MerchantBalance = {
  totalProcessedUSD: 0.00,
  availableUSD: 0.00,
  pendingUSD: 0.00,
  holdings: {
    BTC: 0,
    ETH: 0,
    SOL: 0,
    USDC: 0
  }
};

const INITIAL_PAYMENT_LINKS: PaymentLink[] = [
  {
    id: 'link_saas_pro_1',
    name: 'Professional API Access Subscription',
    description: 'Generates API endpoints, background worker threads, and dual webhook sync alerts.',
    amountUSD: 49.00,
    createdTime: '2026-06-06',
    isActive: true,
    timesUsed: 0
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_WEBHOOKS: WebhookEvent[] = [];

export default function App() {
  // Test Mode switch
  const [testMode, setTestMode] = useState<boolean>(true);

  // Layout navigation state
  // 'dashboard' controls showing DeveloperDashboard component
  const [activeView, setActiveView] = useState<'dashboard' | 'checkout' | 'rpcs'>('dashboard');
  
  // Controls which dashboard sub-tab is currently visible
  const [innerDashboardTab, setInnerDashboardTab] = useState<'links' | 'transactions' | 'webhooks' | 'api'>('links');

  // Interactive Web3 Wallet states - "We only use wallet connect here"
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSignconnecting, setIsSignconnecting] = useState<boolean>(false);
  const [connectStepText, setConnectStepText] = useState<string>('');
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);

  // Compact developer discussion notes tray
  const [showCommentTray, setShowCommentTray] = useState<boolean>(false);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [comments, setComments] = useState<{ id: string; author: string; text: string; time: string }[]>([
    { id: '1', author: 'Nath Favour', text: 'Cleanest web3 gateway. The live node sync rules feel extremely premium and high-fidelity!', time: '1m ago' },
    { id: '2', author: 'Satoshi (Node)', text: 'Multi-chain consensus pipeline is verified ready. Gas fees align nicely.', time: 'Just now' }
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const fresh = {
      id: Math.random().toString(),
      author: walletConnected && walletAddress ? `Peer Node (${walletAddress.substring(0, 6)})` : 'Anonymous Node',
      text: newCommentText,
      time: 'Just now'
    };
    setComments(prev => [...prev, fresh]);
    setNewCommentText('');
  };

  const handleWalletProviderClick = (walletName: string) => {
    setIsSignconnecting(true);
    const steps = [
      'Locating local secure seed pipeline...',
      'Opening WalletConnect peer linkage handshake...',
      'Signing authorization secure credentials payload...',
      'Successfully connected.'
    ];

    let current = 0;
    setConnectStepText(steps[current]);
    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setConnectStepText(steps[current]);
      } else {
        clearInterval(interval);
        let addr = '';
        if (walletName === 'metamask') addr = '0x71C21A4e652a652A652a65223EA6e92E2a4921f0';
        else if (walletName === 'phantom') addr = 'SolPrv7aB4nKsY9FhR8U3p2cAdQ6kWeZ1fVx89Z';
        else addr = '0x0d3C01f6CE648dC8Fce2B1f3bE1ad3e0980C69D1';
        setWalletAddress(addr);
        setWalletConnected(true);
        setIsSignconnecting(false);
        setShowConnectModal(false);
      }
    }, 550);
  };

  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setWalletConnected(false);
  };

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
    <div className="min-h-screen bg-[#000000] text-[#9B9691] font-sans antialiased flex flex-col selection:bg-amber-500/20 selection:text-white pb-32">
      
      {/* 1. GLOBAL PREMIUM TOPBAR SHARABLE HEADER */}
      <header className="sticky top-0 z-30 w-full bg-[#0A0908] border-b-2 border-[#23211F] px-4 sm:px-8 py-4 flex items-center justify-between select-none">
        
        {/* Left: Premium branded clickable Logo */}
        <button 
          onClick={() => {
            if (!walletConnected) {
              setShowConnectModal(true);
            }
          }}
          className="flex items-center gap-3 active:scale-95 transition-all text-left cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-outfit font-black text-black border-2 border-[#23211F] shadow-[1px_1px_0px_#23211F] group-hover:bg-amber-400">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-outfit font-black tracking-[0.25em] text-white leading-none uppercase group-hover:text-amber-500 transition-colors">
              SETTLΞRDADDY
            </span>
            <span className="text-[9px] text-gray-500 font-mono tracking-wider mt-1 font-bold">PITCH-DARK GATEWAY</span>
          </div>
        </button>

        {/* Right: Comments Tray & Connect Wallet Trigger */}
        <div className="flex items-center gap-3.5">
          {/* Discussion comments button */}
          <button 
            type="button"
            onClick={() => setShowCommentTray(!showCommentTray)}
            className="p-2.5 rounded-xl bg-[#141211] hover:bg-[#1E1B19] text-gray-400 hover:text-white transition-all border-2 border-[#23211F] cursor-pointer relative"
            title="SaaS Terminal Logs & Remarks"
          >
            <MessageSquare className="w-4 h-4" />
            {comments.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border border-[#141211]" />
            )}
          </button>

          {/* Web3 Wallet connect button. We only use wallet connect here */}
          {walletConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  SIGN SIGNATURE OK
                </span>
                <span className="text-[10px] text-gray-400 font-mono font-semibold uppercase">{walletAddress?.substring(0,6)}...{walletAddress?.substring(walletAddress.length - 4)}</span>
              </div>
              <button 
                type="button"
                onClick={handleDisconnectWallet}
                className="p-2.5 rounded-xl bg-[#141211] hover:bg-[#1E1B19] text-red-400 hover:text-red-300 transition-all border-2 border-[#23211F] cursor-pointer"
                title="Disconnect Wallet Signature"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setShowConnectModal(true)}
              className="px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black font-space-grotesk text-black bg-amber-500 hover:bg-amber-400 transition-transform active:scale-95 cursor-pointer shadow-[2px_2px_0px_#000] border border-[#23211F] uppercase tracking-wider"
            >
              CONNECT WALLET
            </button>
          )}
        </div>
      </header>

      {/* 2. MAIN PRODUCT WORKSPACE */}
      <main className="flex-1 min-h-screen flex flex-col pb-32 bg-[#000000]">
        
        <div className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto flex flex-col gap-6">
          
          {/* Real-time Payment Success Notification Toast inside page */}
          {incomingSuccess && (
            <div 
              className="p-4 rounded-2xl bg-emerald-950/20 border-2 border-emerald-500/40 text-white flex items-center justify-between" 
              style={{ boxShadow: premiumElevatedShadow }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider font-outfit text-emerald-400">Transaction Finalized On Ledger</h5>
                  <p className="text-xs text-gray-200 mt-0.5">
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
                    <BookOpen className="w-4 h-4 text-amber-500" />
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
              <span className="hover:text-amber-500 transition-colors cursor-pointer text-gray-400 font-extrabold">SMART CONTRACT: 0X92...E10B</span>
              <span className="hover:text-amber-500 transition-colors cursor-pointer text-gray-400 font-extrabold">DOCUMENTATION</span>
            </div>
          </div>
        </footer>

      </main>

      {/* 3. FLOATING COZY BOTTOM NAV - Only 5 items max, text-labels completely removed */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-sm w-11/12 bg-[#141211] border-2 border-[#23211F] rounded-full h-14 z-40 flex items-center justify-around px-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.85)] select-none">
        
        <button
          type="button"
          onClick={() => { setActiveView('dashboard'); setInnerDashboardTab('links'); }}
          className={`relative p-2.5 rounded-full transition-colors duration-200 cursor-pointer ${
            activeView === 'dashboard' && innerDashboardTab === 'links' 
              ? 'text-amber-500 bg-[#1E1B19]' 
              : 'text-gray-400 hover:text-white hover:bg-[#1E1B19]/50'
          }`}
          title="Overview"
        >
          <LayoutDashboard className="w-5 h-5" />
          {activeView === 'dashboard' && innerDashboardTab === 'links' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveView('checkout')}
          className={`relative p-2.5 rounded-full transition-colors duration-200 cursor-pointer ${
            activeView === 'checkout' 
              ? 'text-amber-500 bg-[#1E1B19]' 
              : 'text-gray-400 hover:text-white hover:bg-[#1E1B19]/50'
          }`}
          title="Checkout Invoice"
        >
          <CreditCard className="w-5 h-5" />
          {activeView === 'checkout' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveView('rpcs')}
          className={`relative p-2.5 rounded-full transition-colors duration-200 cursor-pointer ${
            activeView === 'rpcs' 
              ? 'text-amber-500 bg-[#1E1B19]' 
              : 'text-gray-400 hover:text-white hover:bg-[#1E1B19]/50'
          }`}
          title="RPC Node Clusters"
        >
          <Activity className="w-5 h-5" />
          {activeView === 'rpcs' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('dashboard'); setInnerDashboardTab('transactions'); }}
          className={`relative p-2.5 rounded-full transition-colors duration-200 cursor-pointer ${
            activeView === 'dashboard' && innerDashboardTab === 'transactions' 
              ? 'text-blue-400 bg-[#1E1B19]' 
              : 'text-gray-400 hover:text-white hover:bg-[#1E1B19]/50'
          }`}
          title="Settlement Receipts"
        >
          <List className="w-5 h-5" />
          {activeView === 'dashboard' && innerDashboardTab === 'transactions' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveView('dashboard'); setInnerDashboardTab('webhooks'); }}
          className={`relative p-2.5 rounded-full transition-colors duration-200 cursor-pointer ${
            activeView === 'dashboard' && innerDashboardTab === 'webhooks' 
              ? 'text-emerald-400 bg-[#1E1B19]' 
              : 'text-gray-400 hover:text-white hover:bg-[#1E1B19]/50'
          }`}
          title="Webhook Relays"
        >
          <Layers className="w-5 h-5" />
          {activeView === 'dashboard' && innerDashboardTab === 'webhooks' && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

      </nav>

      {/* 5. INTERACTIVE COZY COMMENTS OVERLAY PANEL */}
      {showCommentTray && (
        <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#0A0908] border-l-2 border-[#23211F] shadow-[0_0_50px_rgba(0,0,0,0.9)] z-50 flex flex-col justify-between">
          <div className="p-5 border-b border-[#23211F] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-outfit font-black uppercase tracking-wider text-white">Developer Discussion Logs</span>
            </div>
            <button 
              onClick={() => setShowCommentTray(false)}
              className="p-1 rounded-lg bg-[#141211] hover:bg-[#1E1B19] border border-[#23211F] text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Comments scrolling list */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {comments.map((cmt) => (
              <div 
                key={cmt.id} 
                className="p-3.5 rounded-xl bg-[#141211] border border-[#23211F] text-xs flex flex-col gap-2"
              >
                <div className="flex items-center justify-between font-mono text-[9px] text-gray-500 font-bold">
                  <span className="text-gray-300 font-extrabold uppercase">{cmt.author}</span>
                  <span>{cmt.time}</span>
                </div>
                <p className="text-gray-400 font-sans leading-relaxed">{cmt.text}</p>
              </div>
            ))}
          </div>

          {/* New message input */}
          <form onSubmit={handleAddComment} className="p-4 bg-[#141211] border-t-2 border-[#23211F] flex flex-col gap-2">
            <input 
              type="text" 
              placeholder="Suggest configurations or logs..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full bg-[#000000] border border-[#23211F] px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
            />
            <button 
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black font-space-grotesk uppercase tracking-wider cursor-pointer"
            >
              Submit Comment
            </button>
          </form>
        </div>
      )}

      {/* 6. WALLETCONNECT AUTH MODAL */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0A0908] border-2 border-[#23211F] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            
            {/* Header */}
            <div className="p-5 border-b border-[#23211F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-outfit font-black uppercase tracking-wider text-white">WalletConnect Client Signature</span>
              </div>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="p-1 rounded-lg bg-[#141211] hover:bg-[#1E1B19] border border-[#23211F] text-gray-400 hover:text-white cursor-pointer"
                disabled={isSignconnecting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Handshaking body */}
            <div className="p-6 flex flex-col gap-4">
              {isSignconnecting ? (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-10 h-10 border-4 border-[#23211F] border-t-amber-500 rounded-full animate-spin" />
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-mono font-bold text-gray-500 uppercase">ACTIVE Handshake sequence</span>
                    <span className="text-xs font-mono font-black text-white px-4 py-2 bg-[#141211] rounded-xl border border-[#23211F]">{connectStepText}</span>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 leading-normal font-sans">
                    Authenticate peer connections securely. Select your installed blockchain provider below to sign and activate peer-to-peer developer accounts.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2.5 mt-2">
                    <button 
                      type="button"
                      onClick={() => handleWalletProviderClick('metamask')}
                      className="w-full p-3 bg-[#141211] hover:bg-[#1E1B19] border border-[#23211F] hover:border-amber-500/50 rounded-xl flex items-center justify-between transition-all group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🦊</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-outfit font-extrabold text-white">MetaMask Ext</span>
                          <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">SECURE EVM DEPLOY</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-500 group-hover:translate-x-1 transition-transform">CONNECT &rarr;</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleWalletProviderClick('phantom')}
                      className="w-full p-3 bg-[#141211] hover:bg-[#1E1B19] border border-[#23211F] hover:border-amber-500/50 rounded-xl flex items-center justify-between transition-all group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">👻</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-outfit font-extrabold text-white">Phantom Wallet</span>
                          <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">HIGH-SPEED SVM COOPERATIVE</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-500 group-hover:translate-x-1 transition-transform">CONNECT &rarr;</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => handleWalletProviderClick('coinbase')}
                      className="w-full p-3 bg-[#141211] hover:bg-[#1E1B19] border border-[#23211F] hover:border-amber-500/50 rounded-xl flex items-center justify-between transition-all group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🔵</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-outfit font-extrabold text-white">Coinbase Wallet</span>
                          <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">BASE NETWORK INTERCEPT</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-500 group-hover:translate-x-1 transition-transform">CONNECT &rarr;</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Decentered branding footer line */}
            <div className="px-6 py-4 bg-[#141211] border-t border-[#23211F] flex items-center justify-between text-[9px] font-mono text-gray-500 uppercase font-black tracking-widest">
              <span>LEDGER PROTOCOL STANDARD</span>
              <span>STANDBY</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
