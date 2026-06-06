import React, { useState } from 'react';
import { 
  Cpu, Globe, RefreshCw, Plus, Trash2, Edit2, ShieldAlert, 
  CheckCircle2, Wifi, WifiOff, Sparkles, Sliders, ExternalLink, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CryptoAsset } from '../types';

interface RpcConsoleProps {
  assets: CryptoAsset[];
  setAssets: React.Dispatch<React.SetStateAction<CryptoAsset[]>>;
}

const PRESET_EXTENSIONS = [
  { symbol: 'OP', name: 'Optimism L2', icon: '🔴', network: 'Optimism L2 Rollup', usdPrice: 3254.12, gasUSD: 0.08, rpcUrl: 'https://mainnet.optimism.io', type: 'Optimistic EVM Rollup' },
  { symbol: 'ARB', name: 'Arbitrum One', icon: '🌀', network: 'Arbitrum One Layer-2', rpcUrl: 'https://arb1.arbitrum.io/rpc', usdPrice: 3254.12, gasUSD: 0.12, type: 'Optimistic EVM Rollup' },
  { symbol: 'AVAX', name: 'Avalanche C-Chain', icon: '🔺', network: 'Avalanche C-Chain', rpcUrl: 'https://api.avax.network/ext/bc/C/rpc', usdPrice: 34.20, gasUSD: 0.25, type: 'Consensus Subnet' },
  { symbol: 'BSC', name: 'BNB Smart Chain', icon: '🟡', network: 'BNB Smart Chain', rpcUrl: 'https://bsc-dataseed.binance.org', usdPrice: 582.40, gasUSD: 0.18, type: 'Proof of Staked Authority' },
];

export default function RpcConsole({ assets, setAssets }: RpcConsoleProps) {
  const [activeTab, setActiveTab] = useState<'nodes' | 'extensions' | 'compile'>('nodes');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Editing RPC values state
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [editRpcUrl, setEditRpcUrl] = useState('');
  const [editGasUSD, setEditGasUSD] = useState('');

  // Compiler state for adding custom chain
  const [customName, setCustomName] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [customIcon, setCustomIcon] = useState('⛓️');
  const [customNetwork, setCustomNetwork] = useState('');
  const [customRpc, setCustomRpc] = useState('');
  const [customPrice, setCustomPrice] = useState('1.00');
  const [customGas, setCustomGas] = useState('0.10');
  const [customType, setCustomType] = useState('EVM Compatible');
  const [compilerError, setCompilerError] = useState('');
  const [compilerSuccess, setCompilerSuccess] = useState(false);

  // Micro-shaping system trigger: Simulated node check ping
  const handlePingNodes = () => {
    setIsSyncing(true);
    setSyncMessage('Pinging remote RPC servers...');

    const statuses = [
      'Evaluating response latency...',
      'Awaiting handshake confirmation...',
      'Network checks complete.'
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < statuses.length) {
        setSyncMessage(statuses[index]);
        index++;
      } else {
        clearInterval(interval);
        
        // Randomize ping latency and increase block height slightly for active chains
        setAssets(prev => prev.map(asset => {
          if (!asset.isActive) return asset;
          const statusRand = Math.random();
          let status: 'connected' | 'degraded' | 'disconnected' = 'connected';
          if (asset.symbol === 'BTC') {
            status = 'degraded'; // Keep BTC degraded conceptually
          } else if (statusRand < 0.03) {
            status = 'disconnected';
          } else if (statusRand < 0.12) {
            status = 'degraded';
          }
          
          return {
            ...asset,
            latencyMs: status === 'disconnected' ? 0 : Math.max(8, Math.floor(asset.latencyMs * (0.8 + Math.random() * 0.4))),
            blockHeight: asset.blockHeight + Math.floor(1 + Math.random() * 3),
            status
          };
        }));
        setIsSyncing(false);
        setSyncMessage('');
      }
    }, 700);
  };

  // Toggle dynamic active status
  const handleToggleActive = (symbol: string) => {
    setAssets(prev => prev.map(a => a.symbol === symbol ? { ...a, isActive: !a.isActive } : a));
  };

  // Quick remove of a chain (especially extension or custom chains)
  const handleRemoveChain = (symbol: string) => {
    setAssets(prev => prev.filter(a => a.symbol !== symbol));
  };

  // Inline editing save action
  const handleSaveRpc = (symbol: string) => {
    const gasVal = parseFloat(editGasUSD);
    setAssets(prev => prev.map(a => {
      if (a.symbol === symbol) {
        return {
          ...a,
          rpcUrl: editRpcUrl,
          gasUSD: isNaN(gasVal) ? a.gasUSD : gasVal
        };
      }
      return a;
    }));
    setEditingSymbol(null);
  };

  const startEditing = (asset: CryptoAsset) => {
    setEditingSymbol(asset.symbol);
    setEditRpcUrl(asset.rpcUrl);
    setEditGasUSD(asset.gasUSD.toString());
  };

  // Installing preset extension
  const handleInstallPreset = (preset: typeof PRESET_EXTENSIONS[0]) => {
    // Check if original already lives in table
    if (assets.some(a => a.symbol === preset.symbol)) return;

    setIsSyncing(true);
    setSyncMessage(`Deploying ${preset.name} connector...`);

    setTimeout(() => {
      const newAsset: CryptoAsset = {
        symbol: preset.symbol,
        name: preset.name,
        icon: preset.icon,
        network: preset.network,
        rpcUrl: preset.rpcUrl,
        usdPrice: preset.usdPrice,
        gasUSD: preset.gasUSD,
        latencyMs: Math.floor(12 + Math.random() * 15),
        blockHeight: Math.floor(14000000 + Math.random() * 5000000),
        status: 'connected',
        isActive: true,
        type: preset.type,
        isExtension: true
      };

      setAssets(prev => [...prev, newAsset]);
      setIsSyncing(false);
      setSyncMessage('');
    }, 1200);
  };

  // Build completely custom user-designed extension
  const handleCompileCustomChain = (e: React.FormEvent) => {
    e.preventDefault();
    setCompilerError('');
    setCompilerSuccess(false);

    if (!customName || !customSymbol || !customRpc) {
      setCompilerError('Required validation parameters missing.');
      return;
    }

    if (assets.some(a => a.symbol.toUpperCase() === customSymbol.toUpperCase())) {
      setCompilerError(`Node registry token '${customSymbol.toUpperCase()}' already exists.`);
      return;
    }

    setIsSyncing(true);
    setSyncMessage(`Registering network configurations for ${customName}...`);

    setTimeout(() => {
      const newCustom: CryptoAsset = {
        symbol: customSymbol.toUpperCase(),
        name: customName,
        icon: customIcon,
        network: customNetwork || `${customName} Mainnet`,
        rpcUrl: customRpc,
        usdPrice: parseFloat(customPrice) || 1.00,
        gasUSD: parseFloat(customGas) || 0.15,
        latencyMs: Math.floor(10 + Math.random() * 50),
        blockHeight: Math.floor(100000 + Math.random() * 800000),
        status: 'connected',
        isActive: true,
        type: customType || 'Custom VM Integration',
        isExtension: true
      };

      setAssets(prev => [...prev, newCustom]);
      setIsSyncing(false);
      setSyncMessage('');
      setCompilerSuccess(true);
      
      // Reset compiler form values
      setCustomName('');
      setCustomSymbol('');
      setCustomIcon('⛓️');
      setCustomNetwork('');
      setCustomRpc('');
      setCustomPrice('1.00');
      setCustomGas('0.10');
      setCustomType('EVM Compatible');
    }, 1500);
  };

  // Shadows
  const tactileShadow = '1px 1px 0px #23211F, 2px 2px 0px #1E1B19, 3px 3px 0px #141211, 4px 4px 0px #0A0908, 5px 5px 0px #000000';

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Upper Descriptive Header card */}
      <div 
        className="p-6 rounded-2xl bg-[#0A0908] border-2 border-[#23211F] flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ boxShadow: tactileShadow }}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#141211] border-2 border-[#23211F] text-amber-500 shadow-[1px_1px_0px_#23211F] flex-shrink-0">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-sm font-outfit font-extrabold text-white tracking-widest uppercase leading-none">
                SettlerEngine Multi-Chain RPC Node Hub
              </h1>
              <span className="text-[9px] font-mono border border-[#23211F] text-amber-500 px-2 py-0.5 rounded-md bg-[#1E1B19] font-bold uppercase tracking-wider">
                RPC NODE REGISTRY
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-sans max-w-xl">
              Control the exact RPC endpoints SettlerEngine queries for on-chain block consensus. Toggle networks out of the box, deploy plug-and-play extension protocols, or compile custom chain pipelines.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isSyncing}
          onClick={handlePingNodes}
          className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-black bg-amber-500 hover:bg-amber-400 disabled:opacity-50 transition-colors uppercase font-space-grotesk tracking-widest rounded-xl border-2 border-[#23211F] shadow-[2px_2px_0px_#000] cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5px] ${isSyncing ? 'animate-spin' : ''}`} /> Test Node Latency
        </button>
      </div>

      {/* Sync Status Banner */}
      {isSyncing && (
        <div 
          className="p-4 rounded-xl bg-[#0A0908] border-2 border-[#23211F] text-white flex items-center justify-between"
          style={{ boxShadow: '1px 1px 0px #000' }}
        >
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-amber-500 animate-spin" />
            <span className="text-xs font-mono font-bold text-amber-400">
              {syncMessage}
            </span>
          </div>
          <span className="text-[9px] font-mono bg-[#141211] text-amber-500 px-2.5 py-1 rounded-lg border border-[#23211F]">
            ORACLE HANDSHAKE
          </span>
        </div>
      )}

      {/* Sub tabs configuration */}
      <div 
        className="rounded-2xl border-2 border-[#23211F] bg-[#141211] overflow-hidden"
        style={{ boxShadow: tactileShadow }}
      >
        <div className="flex border-b-2 border-[#23211F] bg-[#0A0908] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('nodes')}
            className={`px-5 py-4 text-xs font-outfit uppercase tracking-widest font-extrabold flex items-center gap-2 border-r border-[#23211F] transition-all relative ${
              activeTab === 'nodes' ? 'bg-[#141211] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            Active RPC Nodes ({assets.length})
            {activeTab === 'nodes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('extensions')}
            className={`px-5 py-4 text-xs font-outfit uppercase tracking-widest font-extrabold flex items-center gap-2 border-r border-[#23211F] transition-all relative ${
              activeTab === 'extensions' ? 'bg-[#141211] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            1-Click Extensions Catalogue
            {activeTab === 'extensions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compile')}
            className={`px-5 py-4 text-xs font-outfit uppercase tracking-widest font-extrabold flex items-center gap-2 transition-all relative ${
              activeTab === 'compile' ? 'bg-[#141211] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Compile Custom Node VM
            {activeTab === 'compile' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
        </div>

        <div className="p-6 bg-[#141211]">
          
          {/* TAB 1: Active Nodes Master List */}
          {activeTab === 'nodes' && (
            <div className="flex flex-col gap-4">
              <div className="text-xs text-gray-400 leading-normal flex items-center gap-2 bg-[#0A0908] px-4 py-3 rounded-xl border border-[#23211F]">
                <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  All active, checked nodes are dynamically provided to the checkout terminal interface under real-time integrated network lists. Disabling a node immediately suspends customer transactions on that network.
                </span>
              </div>

              {/* RPC Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {assets.map((asset) => {
                  const isEditing = editingSymbol === asset.symbol;
                  
                  // Ping colors
                  let pingColor = 'bg-emerald-500';
                  let pingText = 'text-emerald-400';
                  if (asset.status === 'degraded') {
                    pingColor = 'bg-orange-500';
                    pingText = 'text-orange-400';
                  } else if (asset.status === 'disconnected') {
                    pingColor = 'bg-red-500';
                    pingText = 'text-red-400';
                  }

                  return (
                    <div 
                      key={asset.symbol}
                      className={`p-5 rounded-2xl border-2 bg-[#0A0908] flex flex-col justify-between gap-4 transition-all ${
                        asset.isActive ? 'border-[#23211F]' : 'border-[#23211F]/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{asset.icon}</span>
                          <div>
                            <span className="text-xs font-outfit font-extrabold text-white block uppercase">{asset.name}</span>
                            <span className="text-[9px] font-mono text-gray-500 font-bold uppercase">{asset.type} • ID: {asset.symbol}</span>
                          </div>
                        </div>

                        {/* Connection status badge */}
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${pingColor}`} />
                          <span className={`text-[9px] font-mono font-black uppercase ${pingText}`}>
                            {asset.status === 'connected' ? `${asset.latencyMs}ms` : asset.status}
                          </span>
                        </div>
                      </div>

                      {/* Display or Edit Area */}
                      {isEditing ? (
                        <div className="p-4 rounded-xl bg-[#141211] border-2 border-[#23211F] flex flex-col gap-3">
                          <span className="text-[8px] font-mono text-gray-500 uppercase font-black tracking-widest block">Configure RPC properties</span>
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] text-gray-400 font-mono">RPC ENDPOINT URL</label>
                            <input
                              type="text"
                              value={editRpcUrl}
                              onChange={(e) => setEditRpcUrl(e.target.value)}
                              className="w-full bg-[#0A0908] border border-[#23211F] text-xs font-mono text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 rounded-lg"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[8px] text-gray-400 font-mono">SIMULATED GAS FEES (USD)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editGasUSD}
                              onChange={(e) => setEditGasUSD(e.target.value)}
                              className="w-full bg-[#0A0908] border border-[#23211F] text-xs font-mono text-white px-2.5 py-1.5 focus:outline-none focus:border-amber-500 rounded-lg"
                            />
                          </div>
                          <div className="flex gap-2 justify-end mt-2">
                            <button
                              type="button"
                              onClick={() => setEditingSymbol(null)}
                              className="text-[9px] font-mono text-gray-400 hover:text-white px-2.5 py-1 uppercase"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveRpc(asset.symbol)}
                              className="text-[9.5px] font-mono font-black text-black bg-amber-500 hover:bg-amber-400 px-3 py-1 rounded-md uppercase"
                            >
                              Save Node
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#141211]/50 border border-[#23211F]/50">
                          <div className="flex justify-between text-[9px] font-mono text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap gap-4">
                            <span>RPC: {asset.rpcUrl}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 border-t border-[#23211F]/30 pt-2 mt-0.5">
                            <span>Block: {asset.blockHeight.toLocaleString()}</span>
                            <span>Gas Cost: ~${asset.gasUSD.toFixed(2)} USD</span>
                          </div>
                        </div>
                      )}

                      {/* Control bar */}
                      <div className="flex items-center justify-between border-t border-[#23211F]/60 pt-3.5 mt-1.5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => startEditing(asset)}
                            className="text-[10px] font-mono font-bold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3 text-amber-500" /> Edit Node
                          </button>

                          {asset.isExtension && (
                            <button
                              type="button"
                              onClick={() => handleRemoveChain(asset.symbol)}
                              className="text-[10px] font-mono font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                              title="Delete installed extension"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" /> Remove
                            </button>
                          )}
                        </div>

                        {/* Interactive Toggle Switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">{asset.isActive ? 'Active' : 'Offline'}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(asset.symbol)}
                            className="w-9 h-5 rounded-full bg-[#000000] border border-[#23211F] p-0.5 transition-colors relative cursor-pointer"
                          >
                            <div className={`w-3.5 h-3.5 rounded-full transition-transform ${asset.isActive ? 'translate-x-4 bg-emerald-500' : 'bg-gray-600'}`} />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Ready Preset Catalogue */}
          {activeTab === 'extensions' && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-outfit font-extrabold text-white tracking-widest uppercase">Decentralized Plug-and-Play Extensions</span>
                <p className="text-xs text-gray-400 font-sans max-w-xl leading-relaxed">
                  Install verified blockchain routing containers direct from SettlerEngine Repository using a single-click setup. Verified extensions automatically configure secure RPC relays, spot feeds, and test smart contracts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                {PRESET_EXTENSIONS.map((preset) => {
                  const isInstalled = assets.some(a => a.symbol === preset.symbol);
                  return (
                    <div 
                      key={preset.symbol}
                      className="p-5 rounded-2xl border-2 border-[#23211F] bg-[#0A0908] flex items-center justify-between gap-4 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{preset.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-outfit font-extrabold text-white uppercase">{preset.name}</span>
                            <span className="text-[7.5px] font-mono bg-[#1E1B19] border border-[#23211F] text-purple-400 px-1.5 py-0.2 rounded font-black tracking-wider">L2 ACCELERATOR</span>
                          </div>
                          <span className="text-[9px] font-mono text-gray-500 font-bold block uppercase mt-0.5">{preset.type} • ID: {preset.symbol}</span>
                          <span className="text-[10px] text-gray-400 font-mono font-medium block mt-1">Default RPC: {preset.rpcUrl.substring(0, 30)}...</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isInstalled || isSyncing}
                        onClick={() => handleInstallPreset(preset)}
                        className={`px-3 py-2 text-[10px] font-space-grotesk font-black uppercase tracking-wider rounded-lg border cursor-pointer transition-all ${
                          isInstalled 
                            ? 'bg-transparent border-emerald-500/30 text-emerald-400 pointer-events-none' 
                            : 'bg-white hover:bg-gray-100 text-black border-[#23211F]'
                        }`}
                      >
                        {isInstalled ? '✔ Active' : 'Install'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Node VM Compiler Form */}
          {activeTab === 'compile' && (
            <form onSubmit={handleCompileCustomChain} className="flex flex-col gap-5">
              <div className="pb-2.5 border-b-2 border-[#23211F] flex justify-between items-center">
                <span className="text-xs font-outfit font-extrabold text-white tracking-widest uppercase">Compile Custom Chains</span>
                <span className="text-[8.5px] font-mono text-gray-500 font-black uppercase">Compile Custom Genesis Layer</span>
              </div>

              {compilerError && (
                <div className="p-3.5 bg-red-950/20 text-red-400 border border-red-500/30 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <Sliders className="w-4 h-4 text-red-500" /> {compilerError}
                </div>
              )}

              {compilerSuccess && (
                <div className="p-3.5 bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom blockchain extension compiled and initialized on local RPC register successfully!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="comp_name" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">CHAIN DISPLAY NAME</label>
                  <input
                    id="comp_name"
                    type="text"
                    required
                    placeholder="e.g. Soneium L2 Network"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="px-3.5 py-2.5 text-xs text-white rounded-xl bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="comp_sym" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">CRYPTO TICKER SYMBOL</label>
                  <input
                    id="comp_sym"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. SONE"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    className="px-3.5 py-2.5 text-xs text-white rounded-xl bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500 font-mono font-bold uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="comp_rpc" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">RPC ENDPOINT NODE NODE URL</label>
                  <input
                    id="comp_rpc"
                    type="url"
                    required
                    placeholder="https://rpc.soneium.mint.mainnet.network"
                    value={customRpc}
                    onChange={(e) => setCustomRpc(e.target.value)}
                    className="px-3.5 py-2.5 text-xs text-white rounded-xl bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="comp_net" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">SUBNET BLOCKCHAIN TITLE</label>
                  <input
                    id="comp_net"
                    type="text"
                    placeholder="e.g. Soneium Mainnet Bridge"
                    value={customNetwork}
                    onChange={(e) => setCustomNetwork(e.target.value)}
                    className="px-3.5 py-2.5 text-xs text-white rounded-xl bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="comp_icon" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">EMOJI ACCENT / INSTANT IDENTIFIER</label>
                  <select
                    id="comp_icon"
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    className="px-3.5 py-2.5 text-xs text-white rounded-xl bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500 cursor-pointer font-sans"
                  >
                    <option value="⛓️">⛓️ Genesis chain</option>
                    <option value="🔴">🔴 Ruby ruby</option>
                    <option value="🟢">🟢 Jade circle</option>
                    <option value="🔵">🔵 Sapphire orb</option>
                    <option value="🟣">🟣 Amethyst token</option>
                    <option value="🟡">🟡 Golden coin</option>
                    <option value="💎">💎 Diamond stone</option>
                    <option value="⚡">⚡ Lightning fast</option>
                    <option value="🔺">🔺 Triangle delta</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="comp_type" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">ARCHITECTURE TYPE</label>
                  <input
                    id="comp_type"
                    type="text"
                    placeholder="e.g. Optimistic EVM Rollup, SVM High Speed"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="px-3.5 py-2.5 text-xs text-white rounded-xl bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="comp_price" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">ESTIMATED FEED PRICE (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono font-black">$</span>
                    <input
                      id="comp_price"
                      type="number"
                      step="0.0001"
                      required
                      placeholder="1.00"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="pl-7 pr-4 py-2.5 text-xs text-white rounded-xl w-full bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="comp_gas" className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">TYPICAL ON-CHAIN GAS LIMIT USD</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono font-black">$</span>
                    <input
                      id="comp_gas"
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.10"
                      value={customGas}
                      onChange={(e) => setCustomGas(e.target.value)}
                      className="pl-7 pr-4 py-2.5 text-xs text-white rounded-xl w-full bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSyncing}
                className="w-full mt-2 py-4 rounded-xl text-xs font-black font-space-grotesk text-black bg-emerald-500 hover:bg-emerald-400 cursor-pointer shadow-[3px_3px_0px_#000] uppercase tracking-wider active:scale-98 transition-transform"
              >
                Compile and Register Chain Extension
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
