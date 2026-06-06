import React, { useState } from 'react';
import { 
  TrendingUp, Coins, Terminal, Plus, Copy, Check, Eye, EyeOff, 
  ArrowUpRight, Zap, RefreshCw, BarChart2, ShieldCheck, Cpu,
  Search, Filter, Database, Code, Clock, Globe, Laptop,
  Sparkles, ChevronRight, CheckCircle2, AlertCircle, FileSpreadsheet, ListFilter
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentLink, Transaction, WebhookEvent, MerchantBalance } from '../types';

interface DeveloperDashboardProps {
  balance: MerchantBalance;
  paymentLinks: PaymentLink[];
  transactions: Transaction[];
  webhooks: WebhookEvent[];
  testMode: boolean;
  setTestMode: (val: boolean) => void;
  onSelectPaymentLink: (link: PaymentLink) => void;
  activePaymentLinkId: string;
  onCreatePaymentLink: (name: string, description: string, price: number) => void;
  onClearLogs: () => void;
  activeTab?: 'links' | 'transactions' | 'webhooks' | 'api';
  onTabChange?: (tab: 'links' | 'transactions' | 'webhooks' | 'api') => void;
}

export default function DeveloperDashboard({
  balance,
  paymentLinks,
  transactions,
  webhooks,
  testMode,
  setTestMode,
  onSelectPaymentLink,
  activePaymentLinkId,
  onCreatePaymentLink,
  onClearLogs,
  activeTab: controlledTab,
  onTabChange
}: DeveloperDashboardProps) {
  // Local state for API keys display
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Link creator state
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');
  const [newLinkPrice, setNewLinkPrice] = useState('49.00');
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // Active Menu Tab inside the lower workspace
  const [localTab, setLocalTab] = useState<'links' | 'transactions' | 'webhooks' | 'api'>('links');
  const activeTab = controlledTab || localTab;
  const setActiveTab = (tab: 'links' | 'transactions' | 'webhooks' | 'api') => {
    setLocalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Search filters
  const [linkSearch, setLinkSearch] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [webhookSearch, setWebhookSearch] = useState('');

  // Active Chart range selection
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '24H'>('7D');

  // Interactive documentation sub-tab
  const [docTab, setDocTab] = useState<'react' | 'curl' | 'webhooks'>('react');

  // Expanded webhook event ID state for inspect details accordion
  const [expandedWebhookId, setExpandedWebhookId] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkName || !newLinkPrice) return;
    
    const priceNum = parseFloat(newLinkPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    onCreatePaymentLink(newLinkName, newLinkDesc, priceNum);
    setNewLinkName('');
    setNewLinkDesc('');
    setNewLinkPrice('49.00');
    setIsCreatingLink(false);
  };

  // Dynamic values based on selected chart range
  const getChartData = () => {
    if (chartRange === '24H') {
      return [
        { day: '02:00', volume: testMode ? 200 : 1200 },
        { day: '06:00', volume: testMode ? 600 : 2500 },
        { day: '10:00', volume: testMode ? 1400 : 8900 },
        { day: '14:00', volume: testMode ? 2200 : 12200 },
        { day: '18:00', volume: testMode ? 1900 : 11000 },
        { day: '22:00', volume: testMode ? 3100 : 15400 },
        { day: 'Now', volume: testMode ? 4400 : 19800 },
      ];
    }
    if (chartRange === '30D') {
      return [
        { day: 'Wk 1', volume: testMode ? 6200 : 38000 },
        { day: 'Wk 2', volume: testMode ? 12400 : 74000 },
        { day: 'Wk 3', volume: testMode ? 9800 : 61000 },
        { day: 'Wk 4', volume: testMode ? 16500 : 96200 },
        { day: 'Wk 5', volume: testMode ? 21200 : 124000 },
      ];
    }
    // Default 7 Days
    return [
      { day: 'Mon', volume: testMode ? 1200 : 8500 },
      { day: 'Tue', volume: testMode ? 2400 : 12400 },
      { day: 'Wed', volume: testMode ? 1800 : 15600 },
      { day: 'Thu', volume: testMode ? 3200 : 14200 },
      { day: 'Fri', volume: testMode ? 4100 : 22000 },
      { day: 'Sat', volume: testMode ? 3900 : 19800 },
      { day: 'Sun', volume: testMode ? 5400 : 28200 },
    ];
  };

  // Filter lists based on search
  const filteredPaymentLinks = paymentLinks.filter(l => 
    l.name.toLowerCase().includes(linkSearch.toLowerCase()) ||
    l.description.toLowerCase().includes(linkSearch.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => 
    t.customerName.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.customerEmail.toLowerCase().includes(txSearch.toLowerCase()) ||
    t.cryptoSymbol.toLowerCase().includes(txSearch.toLowerCase()) ||
    (t.txHash && t.txHash.toLowerCase().includes(txSearch.toLowerCase()))
  );

  const filteredWebhooks = webhooks.filter(w => 
    w.id.toLowerCase().includes(webhookSearch.toLowerCase()) ||
    w.type.toLowerCase().includes(webhookSearch.toLowerCase()) ||
    w.payload.toLowerCase().includes(webhookSearch.toLowerCase())
  );

  const formatCurrency = (val: number) => {
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Tactile Drop shadow values in accordance with Openbricks skeuomorphism depth
  const tactileShadow = '1px 1px 0px #23211F, 2px 2px 0px #1E1B19, 3px 3px 0px #141211, 4px 4px 0px #0A0908, 5px 5px 0px #000000';

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Dynamic Header & Operational Control Panel */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0A0908] border-2 border-[#23211F]"
        style={{ boxShadow: tactileShadow }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#141211] border-2 border-[#23211F] text-amber-500 shadow-[1px_1px_0px_#23211F] flex-shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-outfit font-extrabold text-white tracking-tight leading-none">
                SettlerEngine Operational Console
              </h1>
              <span className="text-[10px] font-mono border border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-md bg-amber-950/20 font-bold uppercase tracking-wider">
                Active Nodes
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 hover:text-gray-300 transition-colors">
              Administrative interface for autonomous multi-chain checkout and on-chain verification contracts.
            </p>
          </div>
        </div>

        {/* Live / Test Toggle Switch with refined modern aesthetic */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-[#141413] border-2 border-[#23211F] p-2 rounded-xl shadow-[1px_1px_0px_#000]">
          <span className={`text-[10px] font-mono font-extrabold tracking-wider ${!testMode ? 'text-emerald-400' : 'text-gray-500'}`}>LIVE NETWORK</span>
          <button 
            type="button"
            onClick={() => setTestMode(!testMode)}
            className="w-12 h-6 rounded-full bg-[#000000] border-2 border-[#23211F] p-0.5 flex items-center cursor-pointer transition-colors relative"
            aria-label="Toggle network mode"
          >
            <div 
              className={`w-4 h-4 rounded-full transition-transform duration-300 ${testMode ? 'translate-x-6 bg-orange-500' : 'translate-x-0.5 bg-emerald-500'}`} 
            />
          </button>
          <span className={`text-[10px] font-mono font-extrabold tracking-wider ${testMode ? 'text-orange-400' : 'text-gray-500'}`}>SANDBOX DEV</span>
        </div>
      </div>

      {/* Premium Statistics Deck (No terminal layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric Card 1: Volume Processed */}
        <div 
          className="p-5 rounded-2xl bg-[#141211] border-2 border-[#23211F] flex flex-col justify-between group transition-all duration-300 hover:border-[#38332E]"
          style={{ boxShadow: tactileShadow }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-gray-400 font-extrabold tracking-widest uppercase">CONSOLIDATED VOLUME</span>
            <div className="p-1.5 rounded-lg bg-[#0A0908] border border-[#23211F]">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 duration-200" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider block uppercase mb-1">AGGREGATED CAP</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-outfit text-white font-extrabold leading-none tracking-tight">
                ${formatCurrency(balance.totalProcessedUSD)}
              </span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">USD</span>
            </div>
            
            {/* Holdings breakdown bubbles (Beautifully itemized micro elements) */}
            <div className="flex gap-1.5 mt-4 flex-wrap">
              {Object.entries(balance.holdings).map(([sym, qty]) => {
                let badgeStyle = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                if (sym === 'ETH') badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                if (sym === 'SOL') badgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                if (sym === 'USDC') badgeStyle = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                return (
                  <span key={sym} className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${badgeStyle}`}>
                    <span className="w-1 h-1 rounded-full bg-current opacity-80" />
                    {sym}: {qty.toLocaleString(undefined, { maximumFractionDigits: sym === 'USDC' ? 0 : 4 })}
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Metric Card 2: Settled Cash/Payouts */}
        <div 
          className="p-5 rounded-2xl bg-[#141211] border-2 border-[#23211F] flex flex-col justify-between group transition-all duration-300 hover:border-[#38332E]"
          style={{ boxShadow: tactileShadow }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-gray-400 font-extrabold tracking-widest uppercase">AVAILABLE TO PAYOUT</span>
            <div className="p-1.5 rounded-lg bg-[#0A0908] border border-[#23211F]">
              <Coins className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider block uppercase mb-1">LIQUID RESERVE</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-outfit text-white font-extrabold leading-none tracking-tight text-amber-500">
                ${formatCurrency(balance.availableUSD)}
              </span>
              <span className="text-[9px] font-mono text-amber-500/70 font-bold">LIQ</span>
            </div>
            <div className="text-[9.5px] text-gray-400 mt-4 font-mono font-semibold flex items-center gap-1.5 bg-[#0A0908] border border-[#23211F] px-2.5 py-1.5 rounded-xl w-fit">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500/25" /> Ready for wallet sweep
            </div>
          </div>
        </div>

        {/* Metric Card 3: Pending Consensus Holds */}
        <div 
          className="p-5 rounded-2xl bg-[#141211] border-2 border-[#23211F] flex flex-col justify-between group transition-all duration-300 hover:border-[#38332E]"
          style={{ boxShadow: tactileShadow }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-mono text-gray-400 font-extrabold tracking-widest uppercase">ESCROW CONSENSUS HOLD</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-85"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider block uppercase mb-1">MEMPOOL ESCROW</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-outfit text-white font-extrabold leading-none tracking-tight">
                ${formatCurrency(balance.pendingUSD)}
              </span>
              <span className="text-[10px] font-mono text-orange-400 font-bold">UNCONFIRMED</span>
            </div>
            <p className="text-[9px] text-gray-400 mt-4 font-mono font-bold leading-none uppercase tracking-wide">
              Waiting for {testMode ? '2 node signatures' : '12 block network verifications'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Segment: High Fidelity Area Graph */}
      <div 
        className="p-6 rounded-2xl bg-[#0A0908] border-2 border-[#23211F] flex flex-col gap-4"
        style={{ boxShadow: tactileShadow }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-outfit font-extrabold text-white tracking-widest uppercase">Decentralized Revenue Streams</h3>
          </div>
          
          {/* Dynamic Range Filtering Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-[#141211] border border-[#23211F] rounded-xl self-start sm:self-auto">
            {(['24H', '7D', '30D'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setChartRange(r)}
                className={`text-[9.5px] font-mono font-black px-2.5 py-1 rounded-lg transition-transform duration-200 active:scale-95 cursor-pointer uppercase ${
                  chartRange === r 
                    ? 'bg-amber-500 text-black border border-transparent font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Beautiful Custom Area Chart */}
        <div className="h-44 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getChartData()} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={testMode ? '#f97316' : '#10b981'} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={testMode ? '#f97316' : '#10b981'} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e1a17" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="#524d49" fontSize={9} fontFamily="monospace" tickLine={false} />
              <YAxis stroke="#524d49" fontSize={9} fontFamily="monospace" tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141211', borderColor: '#23211F', borderRadius: '16px', borderWidth: '2px', boxShadow: '0 8px 16px rgba(0,0,0,0.4)' }}
                labelStyle={{ color: '#888', fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Processed Volume']}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke={testMode ? '#f97316' : '#10b981'} 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorVolume)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Tab Navigation Hub inside Dashboard - Gives standard rich desktop structure */}
      <div 
        className="rounded-2xl border-2 border-[#23211F] bg-[#141211] overflow-hidden" 
        style={{ boxShadow: tactileShadow }}
      >
        {/* Navigation Tabs Header */}
        <div className="flex border-b-2 border-[#23211F] overflow-x-auto bg-[#0A0908]">
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`px-5 py-4 text-xs font-outfit uppercase tracking-widest font-extrabold flex items-center gap-2 border-r border-[#23211F] transition-all relative ${
              activeTab === 'links' 
                ? 'bg-[#141211] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-[#141211]/50'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            Checkout Links ({paymentLinks.length})
            {activeTab === 'links' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-5 py-4 text-xs font-outfit uppercase tracking-widest font-extrabold flex items-center gap-2 border-r border-[#23211F] transition-all relative ${
              activeTab === 'transactions' 
                ? 'bg-[#141211] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-[#141211]/50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            Settle Ledger ({transactions.length})
            {activeTab === 'transactions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('webhooks')}
            className={`px-5 py-4 text-xs font-outfit uppercase tracking-widest font-extrabold flex items-center gap-2 border-r border-[#23211F] transition-all relative ${
              activeTab === 'webhooks' 
                ? 'bg-[#141211] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-[#141211]/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            Webhook Pipeline ({webhooks.length})
            {activeTab === 'webhooks' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`px-5 py-4 text-xs font-outfit uppercase tracking-widest font-extrabold flex items-center gap-2 transition-all relative ${
              activeTab === 'api' 
                ? 'bg-[#141211] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-[#141211]/50'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            API & SDK Config
            {activeTab === 'api' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
          </button>
        </div>

        {/* Tab Panel Context Areas */}
        <div className="p-6 bg-[#141211]">
          
          {/* TAB 1: Payment Links Center */}
          {activeTab === 'links' && (
            <div className="flex flex-col gap-4">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Search Inputs */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search active checkout products..."
                    value={linkSearch}
                    onChange={(e) => setLinkSearch(e.target.value)}
                    className="w-full bg-[#0A0908] border-2 border-[#23211F] text-xs text-white rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-amber-500/80 font-sans"
                  />
                </div>

                {!isCreatingLink ? (
                  <button 
                    type="button"
                    onClick={() => setIsCreatingLink(true)}
                    className="text-[11px] font-space-grotesk font-black text-black bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-xl border-2 border-[#23211F] flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95 shadow-[2px_2px_0px_#000]"
                  >
                    <Plus className="w-4 h-4 stroke-[3px]" /> Deploy Payment Link
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setIsCreatingLink(false)}
                    className="text-[11.5px] font-space-grotesk font-bold text-gray-400 bg-transparent hover:text-white px-3 py-1.5 text-center transition-colors"
                  >
                    Close Deployer Panel
                  </button>
                )}
              </div>

              {/* Deployment / Creation Panel (Styled premiumly with glass feel) */}
              <AnimatePresence>
                {isCreatingLink && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }} 
                    onSubmit={handleCreate} 
                    className="p-5 rounded-2xl border-2 border-[#23211F] bg-[#0A0908] flex flex-col gap-4 overflow-hidden"
                  >
                    <div className="flex justify-between items-center pb-2 border-b-2 border-[#23211F]">
                      <span className="text-[10px] font-mono font-black text-amber-500 tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> DEPLOY NEW MULTI-CHAIN PAYMENT PROTOCOL
                      </span>
                      <span className="text-[9px] text-gray-500 font-mono font-bold">READY TO DEPLOY</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pname" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">PRODUCT OR PRIVILEGE NAME</label>
                        <input 
                          id="pname"
                          type="text" 
                          required 
                          placeholder="e.g. Elite Developer API Key (SaaS Monthly)" 
                          value={newLinkName}
                          onChange={(e) => setNewLinkName(e.target.value)}
                          className="px-3.5 py-2.5 text-xs text-white rounded-xl bg-[#141211] border-2 border-[#23211F] focus:outline-none focus:border-amber-500/80 font-sans"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="pprice" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">PEG PRICE VALUE (USD)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono font-black">$</span>
                          <input 
                            id="pprice"
                            type="number" 
                            step="0.01" 
                            min="0.10"
                            required 
                            placeholder="49.00" 
                            value={newLinkPrice}
                            onChange={(e) => setNewLinkPrice(e.target.value)}
                            className="pl-7 pr-4 py-2.5 text-xs text-white rounded-xl w-full bg-[#141211] border-2 border-[#23211F] focus:outline-none focus:border-amber-500/80 font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="pdesc" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">PRODUCT BRIEF DESCRIPTION</label>
                      <input 
                        id="pdesc"
                        type="text" 
                        placeholder="Generates private on-chain credentials, RPC routing nodes, and webhook deliveries..." 
                        value={newLinkDesc}
                        onChange={(e) => setNewLinkDesc(e.target.value)}
                        className="px-3.5 py-2.5 text-xs text-white rounded-xl bg-[#141211] border-2 border-[#23211F] focus:outline-none focus:border-amber-500/80 font-sans"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-xs font-black font-space-grotesk text-black bg-amber-500 hover:bg-amber-400 active:scale-98 transition-all cursor-pointer text-center shadow-[3px_3px_0px_#000] uppercase tracking-wider mt-1.5"
                    >
                      Sign & Compile Decentralized Invoice Link
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Rendered Payment Link Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {filteredPaymentLinks.length === 0 ? (
                  <div className="col-span-2 py-10 text-center rounded-2xl border-2 border-[#23211F] bg-[#0A0908] flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-8 h-8 text-gray-500" />
                    <p className="text-xs text-gray-400 font-medium">No payout items matches query.</p>
                  </div>
                ) : (
                  filteredPaymentLinks.map((link) => {
                    const isSelected = activePaymentLinkId === link.id;
                    return (
                      <div 
                        key={link.id}
                        onClick={() => onSelectPaymentLink(link)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative flex flex-col justify-between gap-4 ${
                          isSelected 
                            ? 'border-amber-500 bg-[#1E1B19]' 
                            : 'border-[#23211F] bg-[#0A0908] hover:bg-[#1E1B19]/40 hover:border-[#38332E]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="text-[8px] font-mono border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/40 uppercase font-black tracking-wider animate-pulse">
                              ACTIVE PREVIEW
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <div className="flex items-center gap-2 pr-12">
                            <span className="text-sm font-outfit font-extrabold text-white leading-tight">{link.name}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-2 font-sans line-clamp-2 leading-relaxed">{link.description || 'Seamless automatic delivery setup.'}</p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-[#23211F]/60 pt-3.5 mt-2">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black">PEG COST</span>
                            <span className="text-sm font-mono font-bold text-white">${link.amountUSD.toFixed(2)}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-black">COMPLETIONS</span>
                            <span className="text-xs font-mono font-extrabold text-amber-500">{link.timesUsed} PAID tx</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 2: Settlement Audit Ledger (Highly detailed table list, previously missing!) */}
          {activeTab === 'transactions' && (
            <div className="flex flex-col gap-4">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search merchant transactions, wallet blocks or client emails..."
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="w-full bg-[#0A0908] border-2 border-[#23211F] text-xs text-white rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-amber-500/80 font-sans"
                  />
                </div>
                <div className="text-[10px] font-mono text-orange-400 font-extrabold flex items-center gap-1.5 self-start sm:self-auto uppercase">
                  <Clock className="w-3.5 h-3.5" /> Block consensus speed: ~3.2s
                </div>
              </div>

              {/* High-Fidelity Settlement Ledger Table */}
              <div className="w-full overflow-x-auto rounded-xl border-2 border-[#23211F] bg-[#0A0908]">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b-2 border-[#23211F] bg-[#141211]/70 text-[9.5px] font-mono font-black text-gray-400 uppercase tracking-wider">
                      <th className="p-4">Tx ID / Email</th>
                      <th className="p-4">Client Name</th>
                      <th className="p-4">Paid Product</th>
                      <th className="p-4 text-right">Peg Value (USD)</th>
                      <th className="p-4">Paid On-Chain Layer</th>
                      <th className="p-4">Consensus Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23211F] text-xs">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          No successful ledger transactions match your query. Try paying the checkout invoice.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        let coinAccent = 'text-amber-500';
                        if (tx.cryptoSymbol === 'ETH') coinAccent = 'text-sky-400';
                        if (tx.cryptoSymbol === 'SOL') coinAccent = 'text-purple-400';
                        return (
                          <tr key={tx.id} className="hover:bg-[#141211]/30 transition-colors">
                            <td className="p-4 font-mono">
                              <span className="text-white font-extrabold block">{tx.id}</span>
                              <span className="text-[10px] text-gray-500 select-all font-sans">{tx.customerEmail}</span>
                            </td>
                            <td className="p-4 font-outfit text-white font-bold">{tx.customerName}</td>
                            <td className="p-4 text-gray-300 font-sans truncate max-w-[200px]" title={tx.productName}>{tx.productName}</td>
                            <td className="p-4 text-right">
                              <span className="text-white font-mono font-bold">${tx.amountUSD.toFixed(2)}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-mono text-white text-[11px] font-bold flex items-center gap-1.5">
                                  {tx.cryptoAmount.toFixed(4)} <strong className={coinAccent}>{tx.cryptoSymbol}</strong>
                                </span>
                                {tx.txHash && (
                                  <span className="text-[9px] font-mono text-gray-500 select-all truncate max-w-[120px] inline-block" title={tx.txHash}>
                                    {tx.txHash.substring(0, 16)}...
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> CONFIRMED
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: Simulated Webhook Dispatch Center */}
          {activeTab === 'webhooks' && (
            <div className="flex flex-col gap-4">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search payloads or event types..."
                    value={webhookSearch}
                    onChange={(e) => setWebhookSearch(e.target.value)}
                    className="w-full bg-[#0A0908] border-2 border-[#23211F] text-xs text-white rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:border-amber-500/80 font-sans"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={onClearLogs}
                  className="text-[10px] font-mono font-bold text-gray-400 hover:text-white flex items-center justify-center gap-2 bg-[#0A0908] hover:bg-[#1E1B19] px-4 py-2.5 rounded-xl border-2 border-[#23211F] cursor-pointer transition-colors shadow-[2px_2px_0px_#000]"
                >
                  Clear Hook Logs ({webhooks.length})
                </button>
              </div>

              {/* Loop webhooks to display as premium accordion inspections list */}
              <div className="flex flex-col gap-3">
                {filteredWebhooks.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border-2 border-[#23211F] bg-[#0A0908] flex flex-col items-center justify-center gap-3">
                    <Terminal className="w-8 h-8 text-gray-500" />
                    <p className="text-xs text-gray-400 max-w-sm">No API callbacks triggered yet. Pay the checkout preview invoice to initiate live decentralized mempool event dispatches!</p>
                  </div>
                ) : (
                  filteredWebhooks.map((hook) => {
                    const isExpanded = expandedWebhookId === hook.id;
                    return (
                      <div 
                        key={hook.id} 
                        className="rounded-2xl border-2 border-[#23211F] bg-[#0A0908] overflow-hidden"
                      >
                        {/* Summary Header of each hook callback */}
                        <div 
                          onClick={() => setExpandedWebhookId(isExpanded ? null : hook.id)}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141211]/40 border-b border-[#23211F]/30 cursor-pointer hover:bg-[#1E1B19]/30 transition-colors"
                        >
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                            <span className="text-gray-500 font-bold">EVENT:</span>
                            <span className="text-white font-extrabold">{hook.id}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-black tracking-widest text-[8px]">
                              {hook.type}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-[8px]">
                              MOCK SERVER CALL
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[10.5px] font-mono self-end sm:self-auto">
                            <span className="text-gray-400 font-semibold">{hook.timestamp}</span>
                            <span className="text-emerald-400 flex items-center gap-1 font-extrabold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-500/20">
                              ● Sent (200 OK)
                            </span>
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {/* Collapsible JSON console */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 bg-[#050505] border-t border-[#23211F] flex flex-col gap-3">
                                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                                  <span>CALLBACK JSON PAYLOAD SCHEMATIC</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(hook.payload, hook.id);
                                    }}
                                    className="text-amber-500 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                                  >
                                    {copiedKey === hook.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copiedKey === hook.id ? 'Copied Payload' : 'Copy JSON'}
                                  </button>
                                </div>
                                <pre className="text-[11px] text-gray-300 overflow-x-auto bg-[#0A0908] p-4 rounded-xl border border-[#23211F] font-mono select-all select-text whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed">
                                  {hook.payload}
                                </pre>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* TAB 4: API & SDK Configuration Details with Premium Browser Mockup representation */}
          {activeTab === 'api' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Credentials Box */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-outfit font-extrabold text-white tracking-wider uppercase">Sandbox Access Credentials</h4>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Publishable API Token */}
                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#0A0908] border border-[#23211F] relative">
                    <span className="text-[8.5px] font-mono text-gray-500 font-extrabold tracking-widest uppercase mb-1">PUBLISHABLE AUTH ID (SAFE FOR CLIENT)</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-white select-all break-all pr-12">pk_test_crypto_5a83a9928f</span>
                      <button 
                        type="button"
                        onClick={() => copyToClipboard('pk_test_crypto_5a83a9928f', 'pub')}
                        className="p-1.5 rounded-lg bg-[#141211] border border-[#23211F] text-gray-400 hover:text-white transition-colors cursor-pointer absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {copiedKey === 'pub' ? <span className="text-[9px] font-mono text-emerald-400 font-bold">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Secret Token */}
                  <div className="flex flex-col gap-2 p-4 rounded-2xl bg-[#0A0908] border border-[#23211F] relative">
                    <span className="text-[8.5px] font-mono text-gray-500 font-extrabold tracking-widest uppercase mb-1">SECRET SECURITY ID (CONFIDENTIAL)</span>
                    <div className="flex items-center justify-between gap-3 pr-24">
                      <span className="font-mono text-xs text-white">
                        {showSecretKey ? 'sk_test_crypto_921ff390be103f' : 'sk_test_••••••••••••••••••••••••'}
                      </span>
                      <div className="flex items-center gap-1 absolute right-3 top-1/2 -translate-y-1/2">
                        <button 
                          type="button"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="p-1.5 rounded-lg bg-[#141211] hover:bg-[#1E1B19] text-gray-400 hover:text-white transition-colors border border-[#23211F]"
                          title={showSecretKey ? 'Hide Secret Key' : 'Reveal Secret Key'}
                        >
                          {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          type="button"
                          onClick={() => copyToClipboard('sk_test_crypto_921ff390be103f', 'sec')}
                          className="p-1.5 rounded-lg bg-[#141211] hover:bg-[#1E1B19] text-gray-400 hover:text-white transition-colors border border-[#23211F]"
                        >
                          {copiedKey === 'sec' ? <span className="text-[9px] font-mono text-emerald-400 font-bold">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#0A0908] border border-orange-500/20 text-xs text-gray-400 leading-relaxed font-sans mt-1">
                  <div className="flex items-center gap-2 text-orange-400 font-extrabold tracking-wide uppercase text-[10px] mb-1.5">
                    <Zap className="w-3.5 h-3.5 text-orange-500" />
                    Autonomous Oracle Sweep Trigger
                  </div>
                  SettlerEngine automatically sweeps transactions into your registered decentralized multisig vault address on physical Mainnet-consensus cycles once transactions cross block confirmation depth parameters. No manual payout is ever required.
                </div>
              </div>

              {/* IDE Code Blocks SDK Panel - MAC OS Premium design */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">INTEGRATION ENDPOINT CODE</span>
                  <div className="flex gap-1">
                    {(['react', 'curl'] as const).map((tab) => (
                      <button 
                        key={tab}
                        type="button"
                        onClick={() => setDocTab(tab)}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border-2 transition-all cursor-pointer uppercase ${
                          docTab === tab 
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' 
                            : 'border-[#23211F] text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* macOS Styled IDE Window mock */}
                <div className="rounded-2xl border-2 border-[#23211F] bg-[#000000] overflow-hidden flex flex-col shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] max-h-[290px]">
                  
                  {/* MacOS Header Dot elements */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#0A0908] border-b border-[#23211F]/60">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-[9.5px] font-mono text-gray-500 font-bold">settlerengine-client-sdk</span>
                    <button
                      type="button"
                      onClick={() => {
                        const copyString = docTab === 'react' 
                          ? `import { loadSettlerEngine } from '@settlerengine/react';\nconst gateway = await loadSettlerEngine({\n  publishableKey: "pk_test_crypto_5a..."\n});` 
                          : `curl -X POST https://api.settlerengine.com/v1/payment_intents ...`;
                        copyToClipboard(copyString, 'sdk_copy');
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedKey === 'sdk_copy' ? <span className="font-mono text-emerald-400 text-[9px] font-bold">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-4 overflow-x-auto text-[11px] font-mono text-gray-300 leading-relaxed max-h-[240px] overflow-y-auto">
                    {docTab === 'react' && (
                      <pre>{`import { loadSettlerEngine } from '@settlerengine/react';

// Initialize the visual overlay payment gateway
const gateway = await loadSettlerEngine({
  publishableKey: "pk_test_crypto_5a..."
});

// Launch on behalf of the customer
const { txHash, status } = await gateway.checkout({
  paymentLinkId: "${activePaymentLinkId}"
});

if (status === 'succeeded') {
  console.log("Blockchain transaction complete:", txHash);
}`}</pre>
                    )}
                    {docTab === 'curl' && (
                      <pre>{`curl -X POST https://api.settlerengine.com/v1/payment_intents \\
  -u sk_test_crypto_921ff390be103f: \\
  -d amount="${paymentLinks.find(l=>l.id===activePaymentLinkId)?.amountUSD || 49.00}" \\
  -d currency="usd" \\
  -d payment_method_types[]="sol" \\
  -d metadata[link_id]="${activePaymentLinkId}"`}</pre>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
