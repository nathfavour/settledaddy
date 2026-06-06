import React, { useState, useEffect } from 'react';
import { 
  Wallet, ShieldCheck, ArrowRight, ArrowLeft, Loader2, CheckCircle2, 
  ExternalLink, Info, Copy, Check, Sparkles, HelpCircle, 
  User, Mail, ArrowUpRight, Flame, Ghost, ShieldAlert, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentLink, CryptoSymbol, CryptoAsset, Transaction } from '../types';

interface CheckoutPreviewProps {
  paymentLink: PaymentLink;
  onPaymentSuccess: (transaction: Transaction) => void;
  testMode: boolean;
  supportedAssets: CryptoAsset[];
}

export default function CheckoutPreview({
  paymentLink,
  onPaymentSuccess,
  testMode,
  supportedAssets
}: CheckoutPreviewProps) {
  // Checkout phases: 'form' -> 'wallet_connect' -> 'pay' -> 'processing' -> 'success'
  const [phase, setPhase] = useState<'form' | 'wallet_connect' | 'pay' | 'processing' | 'success'>('form');

  // Customer state inputs
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Dynamic active assets from parent
  const activeAssets = supportedAssets.filter(a => a.isActive);

  // Currently selected payment token
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSymbol>('USDC');

  // Synchronize dynamic payment selection when configurations evolve
  useEffect(() => {
    if (activeAssets.length > 0 && !activeAssets.some(a => a.symbol === selectedCrypto)) {
      setSelectedCrypto(activeAssets[0].symbol);
    }
  }, [activeAssets, selectedCrypto]);

  // Selected client wallet provider to hook
  const [selectedWallet, setSelectedWallet] = useState<'metamask' | 'phantom' | 'coinbase' | null>(null);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletConnectionStep, setWalletConnectionStep] = useState<string>('');

  // Ledger settlement state
  const [paymentStep, setPaymentStep] = useState<string>('');
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [simulatedTxHash, setSimulatedTxHash] = useState('');

  // Copy click tracking
  const [copiedHash, setCopiedHash] = useState(false);

  // Computations
  const activeAsset = activeAssets.find(a => a.symbol === selectedCrypto) || activeAssets[0] || supportedAssets[0];
  const cryptoPrice = activeAsset ? activeAsset.usdPrice : 1.0;
  const cryptoAmountNeeded = parseFloat((paymentLink.amountUSD / cryptoPrice).toFixed(6));
  const gasAmountInCrypto = parseFloat(((activeAsset ? activeAsset.gasUSD : 0.1) / cryptoPrice).toFixed(6));
  const cryptoTotalAmount = parseFloat((cryptoAmountNeeded + gasAmountInCrypto).toFixed(6));

  // Auto-reset customer simulation fields if target invoice changes
  useEffect(() => {
    setPhase('form');
    setConnectedWalletAddress(null);
    setSelectedWallet(null);
  }, [paymentLink]);

  const handleConnectWallet = (walletType: 'metamask' | 'phantom' | 'coinbase') => {
    setSelectedWallet(walletType);
    setIsWalletConnecting(true);

    const steps = [
      'Locating browser provider extension APIs...',
      'Requesting modern multi-chain websocket shake...',
      'Awaiting encrypted signature authorization...',
      'Binding secure session token to SettlerEngine...'
    ];

    let stepIndex = 0;
    setWalletConnectionStep(steps[0]);

    const timer = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setWalletConnectionStep(steps[stepIndex]);
      } else {
        clearInterval(timer);
        
        let mockAddr = '';
        let mockBal = 0;
        
        if (walletType === 'metamask') {
          mockAddr = '0x17c9b276fc776dfbc3ea097892db23ea6e92e2a4';
          mockBal = selectedCrypto === 'ETH' ? 9.8421 : selectedCrypto === 'USDC' ? 12500.00 : 0;
        } else if (walletType === 'phantom') {
          mockAddr = 'SolPrv7aB4nKsY9FhR8U3p2cAdQ6kWeZ1fVx8n5vY9Z8U3p';
          mockBal = selectedCrypto === 'SOL' ? 245.1852 : selectedCrypto === 'USDC' ? 342.10 : 0;
        } else {
          mockAddr = '0x0d3c01f6ce648dc8fce2b1f3be1ad3e0980c69d1';
          mockBal = selectedCrypto === 'USDC' ? 42500.00 : selectedCrypto === 'ETH' ? 14.1522 : 88.0;
        }

        if (mockBal === 0) {
          mockBal = cryptoTotalAmount * 2.85;
        }

        setConnectedWalletAddress(mockAddr);
        setWalletBalance(mockBal);
        setIsWalletConnecting(false);
        setPhase('pay');
      }
    }, 850);
  };

  const handleProcessPayment = () => {
    setPhase('processing');
    setPaymentProgress(0);

    const steps = [
      { text: 'Synthesizing cryptographic token approvals...', prog: 12 },
      { text: 'Constructing decentralized transaction blocks...', prog: 35 },
      { text: `Broadcasting validated signature to multi-chain RPCs...`, prog: 62 },
      { text: 'Retrieving oracle consensus confirmation from chain miners...', prog: 85 },
      { text: 'Ledger finalized. Firing off webhook events to merchant.', prog: 100 }
    ];

    let stepIndex = 0;
    setPaymentStep(steps[0].text);

    const simulationPeriod = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setPaymentStep(steps[stepIndex].text);
        setPaymentProgress(steps[stepIndex].prog);
      } else {
        clearInterval(simulationPeriod);

        let hash = '';
        if (selectedCrypto === 'SOL') {
          hash = 'SolTx_' + Array.from({length: 32}, () => Math.floor(Math.random()*36).toString(36)).join('') + '_stler';
        } else {
          hash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
        }
        setSimulatedTxHash(hash);

        // Build completed tx record
        const finalTx: Transaction = {
          id: 'ch_' + Math.random().toString(36).substring(2, 9),
          paymentLinkId: paymentLink.id,
          productName: paymentLink.name,
          amountUSD: paymentLink.amountUSD,
          cryptoSymbol: selectedCrypto,
          cryptoAmount: cryptoAmountNeeded,
          customerEmail: customerEmail || 'anonymous_peer@settlerengine.io',
          customerName: customerName || 'Autonomous Peer Node',
          status: 'succeeded',
          txHash: hash,
          timestamp: new Date().toLocaleTimeString()
        };

        onPaymentSuccess(finalTx);
        setPhase('success');
      }
    }, 900);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(simulatedTxHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  // Shadow specifications adhering directly to Openbricks 2.0 design framework
  const tactileShadow = '1px 1px 0px #23211F, 2px 2px 0px #1E1B19, 3px 3px 0px #141211, 4px 4px 0px #0A0908, 5px 5px 0px #000000';

  return (
    <div 
      className="p-6 rounded-3xl bg-[#0A0908] border-2 border-[#23211F] flex flex-col gap-5 relative w-full overflow-hidden"
      style={{ boxShadow: tactileShadow }}
    >
      {/* Top micro gloss divider line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#23211F]" />

      {/* Embedded Shopify/Stripe style checkout top header */}
      <div className="flex justify-between items-center border-b border-[#23211F] pb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-space-grotesk font-bold text-white hover:text-amber-500 transition-colors uppercase tracking-widestLabel">
            GATEWAY DISPATCH
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#141211] border border-[#23211F] px-2.5 py-1 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">SECURED SESSION</span>
        </div>
      </div>

      {/* Product Summary Invoice element */}
      <div className="p-5 rounded-2xl bg-[#141211] border border-[#23211F] flex flex-col gap-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[8.5px] font-mono font-bold text-amber-500 bg-[#1E1B19] px-2 py-0.5 rounded border border-[#23211F] uppercase tracking-wider">
              Item Checkout
            </span>
            <h4 className="text-sm font-outfit font-extrabold text-white mt-2 leading-snug">{paymentLink.name}</h4>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-[8.5px] font-mono font-bold text-gray-500 uppercase tracking-widest">AMOUNT DUE</span>
            <div className="text-2xl font-outfit font-extrabold text-white leading-none mt-1">${paymentLink.amountUSD.toFixed(2)}</div>
            <span className="text-[9px] text-emerald-400 font-mono font-bold mt-1.5 inline-block uppercase bg-[#141211] border border-[#23211F] px-1.5 py-0.5 rounded-md text-emerald-500">USD Pegged</span>
          </div>
        </div>
        {paymentLink.description && (
          <p className="text-xs text-gray-400 border-t border-[#23211F] pt-2.5 mt-1 leading-relaxed font-sans">{paymentLink.description}</p>
        )}
      </div>

      {/* Dynamic Content Transitions with framer motion list state */}
      <AnimatePresence mode="wait">
        
        {/* STEP 1: Details Entry Form & Target Crypto Coin selection */}
        {phase === 'form' && (
          <motion.div 
            key="p_form"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-4"
          >
            {/* Input fields with Space Grotesk typing and modern User icons */}
            <div className="space-y-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer_email" className="text-[8.5px] font-mono font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-500" /> CUSTOMER EMAIL ADDRESS (DELIVERY RECIPIENT)
                </label>
                <input 
                  id="customer_email"
                  type="email" 
                  placeholder="e.g. vitalik@ethereum.org" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="px-4 py-3 leading-none text-xs text-white rounded-xl bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500/80 font-space-grotesk tracking-wide w-full max-w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="customer_name" className="text-[8.5px] font-mono font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-500" /> BRAND OR PEER FULL NAME
                </label>
                <input 
                  id="customer_name"
                  type="text" 
                  placeholder="e.g. Vitalik Buterin" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-4 py-3 leading-none text-xs text-white rounded-xl bg-[#0A0908] border-2 border-[#23211F] focus:outline-none focus:border-amber-500/80 font-space-grotesk tracking-wide w-full max-w-full"
                />
              </div>
            </div>

            {/* Select Protocol Crypto Coin selection */}
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-[8.5px] font-mono font-extrabold text-gray-400 block uppercase tracking-wider">
                Select Your On-Chain Token
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {activeAssets.map((asset) => {
                  const isCurrent = selectedCrypto === asset.symbol;
                  return (
                    <button
                      key={asset.symbol}
                      type="button"
                      onClick={() => setSelectedCrypto(asset.symbol)}
                      className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 relative ${
                        isCurrent 
                          ? 'border-amber-500 bg-[#1E1B19]' 
                          : 'border-[#23211F] bg-[#141211] hover:bg-[#1E1B19]/30 hover:border-[#38332E]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{asset.icon}</span>
                        <div>
                          <span className="text-[11px] font-space-grotesk font-extrabold text-white block">{asset.symbol}</span>
                          <span className="text-[8.5px] text-gray-500 font-mono tracking-tighter uppercase">{asset.name}</span>
                        </div>
                      </div>
                      
                      {/* Active status bubble */}
                      {isCurrent && (
                        <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-amber-500" />
                      )}

                      <div className="mt-2 text-[9.5px] text-gray-400 font-mono font-bold">
                        ${asset.usdPrice.toLocaleString(undefined, { maximumFractionDigits: asset.usdPrice < 10 ? 4 : 2 })} USD
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPhase('wallet_connect')}
              className="w-full py-3.5 rounded-xl text-xs font-black font-space-grotesk text-black bg-amber-500 hover:bg-amber-400 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 shadow-[3px_3px_0px_#000] uppercase tracking-wider"
            >
              Continue to Smart Wallet <ArrowRight className="w-4 h-4 text-black stroke-[3px]" />
            </button>
          </motion.div>
        )}

        {/* STEP 2: Wallet Provider Connection Drawer */}
        {phase === 'wallet_connect' && (
          <motion.div 
            key="p_wallet"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-4"
          >
            <button 
              type="button"
              onClick={() => setPhase('form')}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 self-start cursor-pointer transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Modify form parameters
            </button>

            <div className="flex flex-col gap-2.5">
              <span className="text-[8.5px] font-mono font-extrabold text-gray-500 block uppercase tracking-wider">
                Select Your Local Cryptographic Wallet
              </span>
              
              {isWalletConnecting ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-[#23211F] bg-[#141211] flex flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <div>
                    <h5 className="text-xs font-extrabold text-white font-outfit uppercase tracking-widest">Handshake Request Transmitted</h5>
                    <div className="text-[10px] text-amber-500 font-mono mt-3 bg-amber-500/5 px-4 py-2 rounded-xl border border-amber-500/30 font-bold max-w-xs mx-auto break-words select-none leading-relaxed">
                      {walletConnectionStep}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-500 max-w-xs font-sans">Accept the simulated wallet signature approval in your web browser extension to proceed.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {/* METAMASK */}
                  <button
                    type="button"
                    onClick={() => handleConnectWallet('metamask')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#23211F] bg-[#141211] hover:bg-[#1E1B19]/50 text-left cursor-pointer transition-all hover:border-[#38332E] shadow-[2px_2px_0px_#000]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 border border-orange-500/20">
                        <Flame className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-outfit font-extrabold text-white block">MetaMask Chrome Client</span>
                        <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">EVM Ethereum and ERC-20 ready</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* PHANTOM */}
                  <button
                    type="button"
                    onClick={() => handleConnectWallet('phantom')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#23211F] bg-[#141211] hover:bg-[#1E1B19]/50 text-left cursor-pointer transition-all hover:border-[#38332E] shadow-[2px_2px_0px_#000]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                        <Ghost className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-outfit font-extrabold text-white block">Phantom SVM Wallet</span>
                        <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Solana and token-program support</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* COINBASE MPC */}
                  <button
                    type="button"
                    onClick={() => handleConnectWallet('coinbase')}
                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#23211F] bg-[#141211] hover:bg-[#1E1B19]/50 text-left cursor-pointer transition-all hover:border-[#38332E] shadow-[2px_2px_0px_#000]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-outfit font-extrabold text-white block">Coinbase Smart MPC Portal</span>
                        <span className="text-[9px] text-gray-500 font-mono uppercase tracking-wider">Multi-Chain decentralized routing</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Cryptographical Breakdown of target tokens & Gas limits */}
        {phase === 'pay' && (
          <motion.div 
            key="p_pay"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-4"
          >
            {/* Connected signature badge */}
            <div className="p-4 rounded-xl bg-[#141211] border border-[#23211F] flex items-center justify-between shadow-[1px_1px_0px_#000]">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{selectedWallet === 'metamask' ? '🔥' : selectedWallet === 'phantom' ? '👻' : '🛡️'}</span>
                <div>
                  <span className="text-[8px] font-mono text-gray-500 block uppercase tracking-wider">Wallet Connected</span>
                  <span className="text-[11px] font-mono font-bold text-white select-all">
                    {connectedWalletAddress?.substring(0, 10)}...{connectedWalletAddress?.substring(connectedWalletAddress.length - 10)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-mono text-gray-500 block">LOCAL DECK</span>
                <span className="text-xs font-mono font-black text-amber-500">
                  {walletBalance.toFixed(selectedCrypto === 'USDC' ? 2 : 5)} {selectedCrypto}
                </span>
              </div>
            </div>

            {/* Smart contract escrow fee calculation details */}
            <div className="p-4 rounded-xl bg-[#0A0908] border-2 border-[#23211F] flex flex-col gap-2.5">
              <span className="text-[8.5px] font-mono font-extrabold text-gray-400 block uppercase tracking-widest border-b border-[#23211F] pb-1.5 mb-1 bg-transparent">
                Consensus Settlement Estimates
              </span>
              
              <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                <span>Oracle Conversion Rate</span>
                <span className="font-mono font-bold text-gray-300">1 {selectedCrypto} = ${cryptoPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400 border-t border-[#23211F] pt-2.5 mt-1 font-medium">
                <span>Subtotal ({selectedCrypto})</span>
                <span className="font-mono font-bold text-white bg-[#141211] px-2 py-0.5 rounded border border-[#23211F]">
                  {cryptoAmountNeeded.toFixed(6)} {selectedCrypto}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                <span className="flex items-center gap-1">On-Chain Gas Fee <HelpCircle className="w-3.5 h-3.5 text-gray-500 cursor-help" title="Blockchain transaction fee" /></span>
                <span className="font-mono text-orange-400 font-bold">
                  +{gasAmountInCrypto.toFixed(6)} {selectedCrypto} (~${activeAsset.gasUSD.toFixed(2)})
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-white font-bold border-t border-[#23211F] pt-2.5 mt-1.5">
                <span className="uppercase text-[10px] tracking-wider font-extrabold">Final Blockchain Charge</span>
                <span className="font-mono text-amber-500 text-sm font-black bg-[#1E1B19] border border-[#23211F] px-2 py-0.5 rounded">
                  {cryptoTotalAmount.toFixed(6)} {selectedCrypto}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <button
                type="button"
                onClick={handleProcessPayment}
                className="w-full py-4 rounded-xl text-xs font-black font-space-grotesk text-black bg-amber-500 hover:bg-amber-400 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000] uppercase tracking-wider"
              >
                Approve & Execute Ledger Payment <Sparkles className="w-4 h-4 fill-black/20" />
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setPhase('wallet_connect');
                  setConnectedWalletAddress(null);
                  setSelectedWallet(null);
                }}
                className="w-full py-2.5 text-[9px] text-gray-500 hover:text-white font-mono font-bold tracking-widest cursor-pointer uppercase transition-colors"
              >
                Change connection provider
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Transaction Processing loading wheel with custom consensus statuses */}
        {phase === 'processing' && (
          <div className="py-12 px-4 rounded-2xl bg-[#141211] border-2 border-[#23211F] flex flex-col items-center justify-center text-center gap-5">
            {/* Spinning SVG circle */}
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-[#23211F]"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-amber-500 transition-all duration-300"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={175}
                  strokeDashoffset={175 - (175 * paymentProgress) / 100}
                />
              </svg>
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>

            <div>
              <h4 className="text-xs font-outfit font-extrabold text-white uppercase tracking-widest">TRANSMITTING LEDGER BLOCK</h4>
              <div className="text-[10.5px] text-amber-500 font-mono mt-4 bg-[#1E1B19] px-4 py-2 rounded-xl border border-[#23211F] font-bold max-w-xs mx-auto break-words leading-relaxed">
                {paymentStep}
              </div>
              <div className="text-[9px] text-gray-500 font-mono mt-5 font-bold uppercase tracking-widest">
                Settled parameter: {paymentProgress}%
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Receipt design mimicking a gorgeous tangible paper ticket summary */}
        {phase === 'success' && (
          <motion.div 
            key="p_success"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col gap-5 text-center items-center"
          >
            <div className="p-3.5 bg-[#141211] border-2 border-[#23211F] rounded-full text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-base font-outfit font-extrabold text-white uppercase tracking-widest">Consensus Finalized</h3>
              <p className="text-xs text-emerald-400 mt-1.5 font-semibold">Payment payload committed cleanly.</p>
            </div>

            {/* Simulated Printed Thermal Paper Ticket summary */}
            <div className="w-full text-left p-5 rounded-2xl bg-[#000000] border-2 border-[#23211F] text-xs flex flex-col gap-3 relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
              {/* Top jagged teeth paper cut design decoration with simple HTML lines */}
              <div className="absolute -top-1.5 left-2 right-2 flex justify-between overflow-hidden h-1 text-[#23211F]">
                {"^".repeat(40)}
              </div>

              <div className="flex justify-between items-center text-gray-400 border-b border-[#23211F] pb-2.5 mb-1">
                <span className="font-extrabold font-mono text-[9px] text-gray-500 uppercase tracking-widest">BLOCK RECEIPT ID</span>
                <span className="font-mono text-white text-xs font-bold uppercase">
                  SETTL-{Math.floor(200000 + Math.random() * 700000)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-gray-400 font-medium">
                  <span>Merchant Product Name</span>
                  <span className="text-white font-semibold truncate max-w-[160px]">{paymentLink.name}</span>
                </div>
                
                <div className="flex justify-between items-center text-gray-400 font-medium">
                  <span>Invoice Amount USD</span>
                  <span className="text-white font-extrabold">${paymentLink.amountUSD.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center text-gray-400 font-medium">
                  <span>Decentralized Token Settled</span>
                  <span className="text-amber-500 font-mono font-black uppercase bg-[#1E1B19] px-2 py-0.5 rounded border border-[#23211F]">
                    {(paymentLink.amountUSD / cryptoPrice).toFixed(6)} {selectedCrypto}
                  </span>
                </div>

                <div className="flex justify-between items-center text-gray-400 font-medium">
                  <span>Connection Pipeline</span>
                  <span className="font-mono text-gray-300 uppercase text-[10px]">{selectedWallet} WebSDK</span>
                </div>
              </div>
              
              <div className="border-t border-[#23211F] pt-3 mt-1">
                <span className="text-[8.5px] font-mono text-gray-500 block uppercase font-bold tracking-wider">BLOCK AUDIT LINK</span>
                <div className="flex items-center justify-between gap-1.5 mt-1.5">
                  <span className="font-mono text-[10.5px] text-gray-400 select-all truncate break-all pr-4 max-w-[80%] uppercase font-bold" title={simulatedTxHash}>
                    {simulatedTxHash}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      className="p-1.5 bg-[#141211] hover:bg-[#1E1B19] rounded-lg border border-[#23211F] cursor-pointer text-gray-400 hover:text-white transition-colors"
                      title="Copy transaction anchor hash"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://explorer.solana.com/tx/${simulatedTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="p-1.5 bg-[#141211] hover:bg-[#1E1B19] rounded-lg border border-[#23211F] cursor-pointer text-gray-400 hover:text-white transition-colors"
                      title="View transaction block explorer link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPhase('form');
                setConnectedWalletAddress(null);
                setSelectedWallet(null);
              }}
              className="w-full mt-2 py-3.5 rounded-xl text-xs font-black font-space-grotesk text-white bg-[#141211] border-2 border-[#23211F] hover:bg-[#1E1B19] hover:border-[#38332E] active:scale-98 transition-all cursor-pointer shadow-[3px_3px_0px_#000] uppercase tracking-wider"
            >
              Reset Terminal Simulator
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
