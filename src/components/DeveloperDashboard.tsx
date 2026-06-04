import React, { useState } from 'react';
import { 
  TrendingUp, Coins, Terminal, Plus, Copy, Check, Eye, EyeOff, 
  FileText, ArrowUpRight, Zap, RefreshCw, BarChart2, ShieldCheck, Cpu
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion } from 'motion/react';
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
  onClearLogs
}: DeveloperDashboardProps) {
  // Local state for API keys display
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Link creator state
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');
  const [newLinkPrice, setNewLinkPrice] = useState('49.00');
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // Active Documentation Tab
  const [docTab, setDocTab] = useState<'react' | 'curl' | 'webhooks'>('react');

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

  // Mock chart data corresponding to the selected mode
  const chartData = [
    { day: 'Mon', volume: testMode ? 1200 : 8500 },
    { day: 'Tue', volume: testMode ? 2400 : 12400 },
    { day: 'Wed', volume: testMode ? 1800 : 15600 },
    { day: 'Thu', volume: testMode ? 3200 : 14200 },
    { day: 'Fri', volume: testMode ? 4100 : 22000 },
    { day: 'Sat', volume: testMode ? 3900 : 19800 },
    { day: 'Sun', volume: testMode ? 5400 : 28200 },
  ];

  const tactileShadow = '0 12px 32px -10px rgba(0,0,0,0.92), 4px 4px 0px 0px #23211F';
  const hoverTactileShadow = '0 20px 40px -10px rgba(0,0,0,0.95), 6px 6px 0px 0px #23211F';

  return (
    <div className="flex flex-col gap-6 w-full lg:col-span-3">
      {/* Upper Status Bar & Controls */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0A0908] border-2 border-[#23211F] relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
        style={{ boxShadow: tactileShadow }}
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500/10 via-orange-500/30 to-yellow-500/10" />
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#141211] border-2 border-[#23211F] text-amber-500 shadow-[1px_1px_0px_#23211F]">
            <Coins className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-outfit font-extrabold text-white tracking-tight flex items-center gap-2">
              Merchant Operations
              <span className="text-[10px] font-mono border-2 border-amber-500/30 text-amber-500 px-2 py-0.5 rounded-lg bg-amber-950/20 font-bold uppercase tracking-wider">
                PRO PAYMENTS
              </span>
            </h1>
            <p className="text-xs text-gray-400">Manage real-time crypto transactions & smart contracts</p>
          </div>
        </div>

        {/* Live / Test Toggle */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-[#141211] border-2 border-[#23211F] p-2 rounded-xl shadow-[1px_1px_0px_#000]">
          <span className={`text-xs font-mono font-bold tracking-tight ${!testMode ? 'text-emerald-400' : 'text-gray-500'}`}>LIVE</span>
          <button 
            type="button"
            onClick={() => setTestMode(!testMode)}
            className="w-12 h-6 rounded-full bg-[#0A0908] border-2 border-[#23211F] p-0.5 flex items-center cursor-pointer transition-colors relative"
            aria-label="Toggle network mode"
          >
            <div 
              className={`w-4 h-4 rounded-full transition-transform duration-200 ${testMode ? 'translate-x-6 bg-orange-500' : 'translate-x-0.5 bg-emerald-500'}`} 
            />
          </button>
          <span className={`text-xs font-mono font-bold tracking-tight ${testMode ? 'text-orange-400' : 'text-gray-500'}`}>TEST</span>
        </div>
      </div>

      {/* Main Balance statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Volumes Card */}
        <div 
          className="p-5 rounded-2xl bg-[#141211] border-2 border-[#23211F] flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:border-[#38332E] cursor-pointer"
          style={{ boxShadow: tactileShadow }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono text-gray-400 font-bold tracking-wider">VOLUME PROCESSED</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 duration-200" />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 font-mono inline-block mb-1">USD VALUE</span>
            <h3 className="text-3xl font-outfit text-white font-extrabold leading-none tracking-tight">
              ${(balance.totalProcessedUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {Object.entries(balance.holdings).map(([sym, qty]) => {
                let coinColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                if (sym === 'ETH') coinColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                if (sym === 'SOL') coinColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                if (sym === 'USDC') coinColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                return (
                  <span key={sym} className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border ${coinColor}`}>
                    {sym}: {qty.toFixed(sym === 'USDC' ? 0 : 4)}
                  </span>
                )
               })}
            </div>
          </div>
        </div>

        {/* Available payout Card */}
        <div 
          className="p-5 rounded-2xl bg-[#141211] border-2 border-[#23211F] flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:border-[#38332E] cursor-pointer"
          style={{ boxShadow: tactileShadow }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono text-gray-400 font-bold tracking-wider">AVAILABLE OUT</span>
            <Coins className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 font-mono inline-block mb-1">CONSOLIDATED</span>
            <h3 className="text-3xl font-outfit text-white font-extrabold leading-none tracking-tight">
              ${(balance.availableUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono mt-3 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-emerald-400/20" /> Instantly payout to multisig
            </span>
          </div>
        </div>

        {/* Pending Card */}
        <div 
          className="p-5 rounded-2xl bg-[#141211] border-2 border-[#23211F] flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 hover:border-[#38332E] cursor-pointer"
          style={{ boxShadow: tactileShadow }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-mono text-gray-400 font-bold tracking-wider">ON-CHAIN HOLD</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-500 font-mono inline-block mb-1">PENDING VERIFICATION</span>
            <h3 className="text-3xl font-outfit text-white font-extrabold leading-none tracking-tight">
              ${(balance.pendingUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="text-[10px] text-gray-400 font-mono mt-3 block">
              Waiting for consensus: {testMode ? '2' : '15'} nodes
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Volume Chart Panel */}
      <div 
        className="p-5 rounded-2xl bg-[#0A0908] border-2 border-[#23211F] flex flex-col gap-4"
        style={{ boxShadow: tactileShadow }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-gray-400" />
            <h3 className="text-xs font-outfit font-extrabold text-white tracking-widest uppercase">CONSOLIDATED VOLUMES CHART</h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5 bg-[#141211] px-3 py-1 rounded-lg border-2 border-[#23211F]">
            <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} /> Consensus Feed Active
          </span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={testMode ? '#f97316' : '#10b981'} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={testMode ? '#f97316' : '#10b981'} stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#524d49" fontSize={10} fontFamily="monospace" />
              <YAxis stroke="#524d49" fontSize={10} fontFamily="monospace" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141211', borderColor: '#23211F', borderRadius: '12px', borderWidth: '2px' }}
                labelStyle={{ color: '#aaa', fontSize: '11px', fontFamily: 'monospace' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: any) => [`$${value}`, 'Volume']}
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke={testMode ? '#f97316' : '#10b981'} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorVolume)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Link Generator and Links List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div 
          className="p-5 rounded-2xl bg-[#141211] border-2 border-[#23211F] flex flex-col gap-4 transition-all duration-300 hover:border-[#38332E]"
          style={{ boxShadow: tactileShadow }}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-outfit font-extrabold text-white tracking-widest uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Active Payment Links
            </h3>
            {!isCreatingLink && (
              <button 
                type="button"
                onClick={() => setIsCreatingLink(true)}
                className="text-[11px] font-space-grotesk font-extrabold text-white bg-[#0A0908] hover:bg-[#1E1B19] px-3 py-1.5 rounded-xl border-2 border-[#23211F] flex items-center gap-1 cursor-pointer transition-all duration-200 active:scale-95 shadow-[2px_2px_0px_#000] hover:shadow-[3px_3px_0px_#000]"
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" /> Create Link
              </button>
            )}
          </div>

          {/* Form to Create New Link */}
          {isCreatingLink ? (
            <motion.form 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              onSubmit={handleCreate} 
              className="p-4 rounded-xl border-2 border-[#23211F] bg-[#0A0908] flex flex-col gap-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"
            >
              <div className="flex justify-between items-center pb-2 border-b-2 border-[#23211F]">
                <span className="text-xs font-extrabold text-white font-outfit tracking-wider">GENERATE NEW LINK</span>
                <button 
                  type="button" 
                  onClick={() => setIsCreatingLink(false)}
                  className="text-[10px] uppercase font-bold text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="pname" className="text-[9px] font-mono font-bold tracking-tight text-gray-400">PRODUCT NAME</label>
                <input 
                  id="pname"
                  type="text" 
                  required 
                  placeholder="e.g. Premium Consulting Access" 
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  className="px-3 py-2 text-xs text-white rounded-xl bg-[#141211] border-2 border-[#23211F] focus:outline-none focus:border-amber-500/80 font-space-grotesk"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="pdesc" className="text-[9px] font-mono font-bold tracking-tight text-gray-400">DESCRIPTION (OPTIONAL)</label>
                <input 
                  id="pdesc"
                  type="text" 
                  placeholder="Briefly state checkout privileges..." 
                  value={newLinkDesc}
                  onChange={(e) => setNewLinkDesc(e.target.value)}
                  className="px-3 py-2 text-xs text-white rounded-xl bg-[#141211] border-2 border-[#23211F] focus:outline-none focus:border-amber-500/80 font-space-grotesk"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="pprice" className="text-[9px] font-mono font-bold tracking-tight text-gray-400">PRICE IN US DOLLARS (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-gray-500 font-mono">$</span>
                  <input 
                    id="pprice"
                    type="number" 
                    step="0.01" 
                    min="0.10"
                    required 
                    placeholder="49.00" 
                    value={newLinkPrice}
                    onChange={(e) => setNewLinkPrice(e.target.value)}
                    className="pl-6 pr-3 py-2 text-xs text-white rounded-xl w-full bg-[#141211] border-2 border-[#23211F] focus:outline-none focus:border-amber-500/80 font-space-grotesk"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold font-space-grotesk text-black bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer text-center shadow-[2px_2px_0px_#000]"
              >
                Compile Decentralized Payment Link
              </button>
            </motion.form>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[290px] overflow-y-auto pr-1">
              {paymentLinks.map((link) => {
                const isSelected = activePaymentLinkId === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onSelectPaymentLink(link)}
                    className={`w-full flex justify-between items-center p-3.5 rounded-xl text-left border-2 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-amber-500 bg-[#1E1B19] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]' 
                        : 'border-[#23211F] bg-[#0A0908] hover:bg-[#1E1B19] hover:border-[#38332E]'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-outfit truncate">{link.name}</span>
                        {isSelected && (
                          <span className="text-[8px] font-mono border border-emerald-500/40 text-emerald-400 px-1.5 py-0.5 rounded-md bg-emerald-950/20 uppercase font-bold animate-pulse">
                            Active State
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate mt-1">{link.description || 'No description provided.'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-white bg-[#141211] px-2 py-1 rounded-lg border border-[#23211F]">${link.amountUSD.toFixed(2)}</span>
                      <p className="text-[9px] text-gray-500 font-mono mt-1.5 font-bold tracking-tight">{link.timesUsed} PAID tx</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Developer Keys & Webhook Simulation Feed */}
        <div 
          className="p-5 rounded-2xl bg-[#141211] border-2 border-[#23211F] flex flex-col gap-4 relative transition-all duration-300 hover:border-[#38332E]"
          style={{ boxShadow: tactileShadow }}
        >
          {/* Developer API credentials */}
          <div>
            <h3 className="text-xs font-outfit font-extrabold text-white tracking-widest uppercase mb-3">Merchant API Credentials</h3>
            <div className="flex flex-col gap-2.5">
              {/* Public key card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0908] border-2 border-[#23211F] text-xs">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-gray-500 font-bold">PUBLISHABLE KEY</span>
                  <span className="font-mono text-[10.5px] text-gray-200 select-all">pk_test_crypto_5a83a9928f</span>
                </div>
                <button 
                  type="button"
                  onClick={() => copyToClipboard('pk_test_crypto_5a83a9928f', 'pub')}
                  className="p-2 rounded-lg hover:bg-[#1E1B19] text-gray-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-[#23211F]"
                  title="Copy Publishable Key"
                >
                  {copiedKey === 'pub' ? <span className="text-[10px] font-mono text-emerald-400 font-bold">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Secret key card */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0908] border-2 border-[#23211F] text-xs">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-gray-500 font-bold">SECRET KEY (KEEP PRIVILEGED)</span>
                  <span className="font-mono text-[10.5px] text-gray-200">
                    {showSecretKey ? 'sk_test_crypto_921ff390be103f' : 'sk_test_••••••••••••••••••••••••'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="p-1.5 rounded-lg hover:bg-[#1E1B19] text-gray-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-[#23211F]"
                    title={showSecretKey ? 'Hide Secret Key' : 'Reveal Secret Key'}
                  >
                    {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard('sk_test_crypto_921ff390be103f', 'sec')}
                    className="p-1.5 rounded-lg hover:bg-[#1E1B19] text-gray-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-[#23211F]"
                    title="Copy Secret Key"
                  >
                    {copiedKey === 'sec' ? <span className="text-[10px] font-mono text-emerald-400 font-bold">Copied</span> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Code Integration Panel */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">STATION ENDPOINT SDK</span>
              <div className="flex gap-1.5">
                {(['react', 'curl'] as const).map((tab) => (
                  <button 
                    key={tab}
                    type="button"
                    onClick={() => setDocTab(tab)}
                    className={`text-[9.5px] font-mono px-2 py-0.5 rounded-lg border-2 transition-all cursor-pointer uppercase ${
                      docTab === tab 
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-500 font-bold' 
                        : 'border-[#23211F] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-3.5 rounded-xl bg-[#0A0908] border-2 border-[#23211F] text-[11px] font-mono text-gray-300 overflow-x-auto select-all max-h-[125px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
              {docTab === 'react' && (
                <pre>{`import { loadCryptoGateway } from '@cryptostripe/react';

const gateway = await loadCryptoGateway({
  publishableKey: "pk_test_crypto_5a..."
});

// Launch beautiful crypto-native checkout overlay
const { txHash, status } = await gateway.checkout({
  paymentLinkId: "${activePaymentLinkId}"
});`}</pre>
              )}
              {docTab === 'curl' && (
                <pre>{`curl -X POST https://api.cryptostripe.com/v1/payment_intents \\
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

      {/* Webhook Events Stream Console */}
      <div 
        className="p-5 rounded-2xl bg-[#0A0908] border-2 border-[#23211F] flex flex-col gap-4 relative transition-all duration-300 hover:border-[#38332E]"
        style={{ boxShadow: tactileShadow }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500 animate-pulse" />
            <h3 className="text-xs font-outfit font-extrabold text-white tracking-widest uppercase">Simulated Webhook Server Feed</h3>
          </div>
          <button 
            type="button" 
            onClick={onClearLogs}
            className="text-[10px] font-mono text-gray-400 hover:text-white flex items-center gap-1.5 bg-[#141211] hover:bg-[#1E1B19] px-3 py-1.5 rounded-xl border-2 border-[#23211F] cursor-pointer transition-colors shadow-[2px_2px_0px_#000]"
          >
            Clear Log Terminal ({webhooks.length})
          </button>
        </div>

        {webhooks.length === 0 ? (
          <div className="py-10 text-center rounded-xl border-2 border-[#23211F] bg-[#141211] flex flex-col items-center justify-center gap-2.5">
            <Cpu className="w-8 h-8 text-gray-500" />
            <p className="text-xs text-gray-400 max-w-sm">No API callbacks triggered yet. Pay the simulated checkout invoice to watch blockchain payloads fire here in real-time!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
            {webhooks.map((hook, index) => {
              return (
                <div 
                  key={hook.id} 
                  className="p-3.5 rounded-xl border-2 border-[#23211F] bg-[#141211] font-mono text-xs flex flex-col gap-2 shadow-[2px_2px_0px_#000]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-[#23211F] pb-1.5 text-[9.5px] border-b-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-500 font-bold">EVENT ID:</span>
                      <span className="text-white font-bold">{hook.id}</span>
                      <span className={`px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        hook.type.includes('succeeded') 
                          ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-orange-950/20 text-orange-400 border border-orange-500/20'
                      }`}>
                        {hook.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-bold">{hook.timestamp}</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">● Sent (200 OK)</span>
                    </div>
                  </div>
                  <pre className="text-[11px] text-gray-300 overflow-x-auto bg-[#0A0908] p-3 rounded-lg font-mono select-all select-text whitespace-pre-wrap border border-[#23211F] max-h-[160px] overflow-y-auto">
                    {hook.payload}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
