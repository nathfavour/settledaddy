import React, { useState, useEffect } from 'react';
import { 
  Wallet, ShieldCheck, ArrowRight, ArrowLeft, Loader2, CheckCircle2, 
  ExternalLink, Info, Copy, Check, Sparkles, Smartphone, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentLink, CryptoSymbol, CryptoAsset, Transaction } from '../types';

interface CheckoutPreviewProps {
  paymentLink: PaymentLink;
  onPaymentSuccess: (transaction: Transaction) => void;
  testMode: boolean;
}

const SUPPORTED_CRPYTOS: Record<CryptoSymbol, CryptoAsset> = {
  USDC: { symbol: 'USDC', name: 'USD Coin', icon: '🔵', network: 'Ethereum / Solana Polygon Multi-Chain', usdPrice: 1.00, gasUSD: 0.15 },
  ETH: { symbol: 'ETH', name: 'Ethereum', icon: '💎', network: 'Ethereum Layer 1', usdPrice: 3254.12, gasUSD: 4.80 },
  SOL: { symbol: 'SOL', name: 'Solana', icon: '🟣', network: 'Solana High-Performance Chain', usdPrice: 186.40, gasUSD: 0.02 },
  BTC: { symbol: 'BTC', name: 'Bitcoin', icon: '🪙', network: 'Bitcoin Network', usdPrice: 94220.50, gasUSD: 2.10 }
};

export default function CheckoutPreview({
  paymentLink,
  onPaymentSuccess,
  testMode
}: CheckoutPreviewProps) {
  // Checkout phase
  // 'form' -> 'wallet_connect' -> 'pay' -> 'processing' -> 'success'
  const [phase, setPhase] = useState<'form' | 'wallet_connect' | 'pay' | 'processing' | 'success'>('form');

  // Customer credentials
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Selected crypto
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSymbol>('USDC');

  // Wallet connection state
  const [selectedWallet, setSelectedWallet] = useState<'metamask' | 'phantom' | 'coinbase' | null>(null);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletConnectionStep, setWalletConnectionStep] = useState<string>('');

  // Payment process simulation state
  const [paymentStep, setPaymentStep] = useState<string>('');
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [simulatedTxHash, setSimulatedTxHash] = useState('');

  // Copy status
  const [copiedHash, setCopiedHash] = useState(false);

  // Computed Values
  const activeAsset = SUPPORTED_CRPYTOS[selectedCrypto];
  const cryptoPrice = activeAsset.usdPrice;
  const cryptoAmountNeeded = parseFloat((paymentLink.amountUSD / cryptoPrice).toFixed(6));
  const gasAmountInCrypto = parseFloat((activeAsset.gasUSD / cryptoPrice).toFixed(6));
  const cryptoTotalAmount = parseFloat((cryptoAmountNeeded + gasAmountInCrypto).toFixed(6));

  // Switch state reset if active payment link changes
  useEffect(() => {
    setPhase('form');
    setConnectedWalletAddress(null);
    setSelectedWallet(null);
  }, [paymentLink]);

  const tackleConnectWallet = (walletType: 'metamask' | 'phantom' | 'coinbase') => {
    setSelectedWallet(walletType);
    setIsWalletConnecting(true);

    const steps = [
      'Querying browser extension provider API...',
      'Requesting dual blockchain handshakes...',
      "Awaiting user's cryptographic signature...",
      'Registering secure session...'
    ];

    let stepIndex = 0;
    setWalletConnectionStep(steps[0]);

    const timer = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setWalletConnectionStep(steps[stepIndex]);
      } else {
        clearInterval(timer);
        // Completed connection
        let mockAddr = '';
        let mockBal = 0;
        if (walletType === 'metamask') {
          mockAddr = '0x7a69b776dc776dfbc3ea007892db23ea6e93e2a4';
          mockBal = selectedCrypto === 'ETH' ? 12.45 : selectedCrypto === 'USDC' ? 2450.00 : 0;
        } else if (walletType === 'phantom') {
          mockAddr = 'B4nKsY9FhR8U3p2cAdQ6kWeZ1fVx8n5vY9Z8U3pwR2Ad';
          mockBal = selectedCrypto === 'SOL' ? 412.80 : selectedCrypto === 'USDC' ? 380.00 : 0;
        } else {
          mockAddr = '0x0d3c01f6ce648dc8fce2b1f3be1ad3e0980c69d1';
          mockBal = selectedCrypto === 'USDC' ? 8200.00 : selectedCrypto === 'ETH' ? 4.12 : 55.0;
        }

        // Just to ensure wallet balance covers item cost!
        if (mockBal === 0) {
          mockBal = cryptoTotalAmount * 3.4;
        }

        setConnectedWalletAddress(mockAddr);
        setWalletBalance(mockBal);
        setIsWalletConnecting(false);
        setPhase('pay');
      }
    }, 1000);
  };

  const handleProcessDirectPayment = () => {
    setPhase('processing');
    setPaymentProgress(0);

    const steps = [
      { text: 'Broadcasting cryptographic transactions to pool nodes...', prog: 15 },
      { text: `Simulating EVM smart contract logic with ${selectedCrypto} validation...`, prog: 40 },
      { text: 'Accumulating validation consensus (3/6 network blocks complete)...', prog: 70 },
      { text: 'Indexing transaction hash payload in decentralized explorer ledger...', prog: 90 },
      { text: 'Payment fully settled and approved on-chain.', prog: 100 }
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

        // Generate fake transaction hash
        let hash = '';
        if (selectedCrypto === 'SOL') {
          hash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + 'SolHash';
        } else {
          hash = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
        }
        setSimulatedTxHash(hash);

        // Package transaction
        const finalTx: Transaction = {
          id: 'ch_' + Math.random().toString(36).substring(2, 9),
          paymentLinkId: paymentLink.id,
          productName: paymentLink.name,
          amountUSD: paymentLink.amountUSD,
          cryptoSymbol: selectedCrypto,
          cryptoAmount: cryptoAmountNeeded,
          customerEmail: customerEmail || 'unspecified_wallet@cryptostripe.com',
          customerName: customerName || 'Anonymized Peer Wallet',
          status: 'succeeded',
          txHash: hash,
          timestamp: new Date().toLocaleTimeString()
        };

        onPaymentSuccess(finalTx);
        setPhase('success');
      }
    }, 1200);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(simulatedTxHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const tactileShadow = '1px 1px 0px #23211F, 2px 2px 0px #1E1B19, 3px 3px 0px #141211, 4px 4px 0px #0A0908, 5px 5px 0px #000000';

  return (
    <div 
      className="p-6 rounded-lg bg-[#0A0908] border-2 border-[#23211F] flex flex-col gap-5 relative w-full"
      style={{ boxShadow: tactileShadow }}
    >
      {/* Brand Watermark Overlay */}
      <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-[#23211F] via-amber-500/30 to-[#23211F]" />

      {/* Title */}
      <div className="flex justify-between items-center border-b border-[#23211F] pb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-outfit font-semibold text-white tracking-widest uppercase">Decentralized Checkout link</h2>
        </div>
        <span className="text-[10px] font-mono font-medium text-gray-500 flex items-center gap-1.5 bg-[#141211] px-2 py-0.5 rounded border border-[#23211F]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Simulator Active
        </span>
      </div>

      {/* Left side Checkout Preview summary */}
      <div className="p-4 rounded bg-[#141211] border border-[#23211F] flex flex-col gap-2 relative">
        <div className="flex justify-between items-start">
          <div className="max-w-[70%]">
            <span className="text-[10px] font-semibold text-gray-500 font-mono">PRODUCT RECEIVING INVOICE</span>
            <h4 className="text-base font-outfit font-semibold text-white mt-0.5 leading-snug">{paymentLink.name}</h4>
            <p className="text-xs text-gray-400 mt-1">{paymentLink.description || 'Full instant privileges allocated.'}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 font-mono">TOTAL DUE</span>
            <div className="text-xl font-outfit font-bold text-white leading-none mt-1">${paymentLink.amountUSD.toFixed(2)}</div>
            <span className="text-[10px] text-gray-500 font-mono block mt-1">USD Value Pegged</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* PHASE 1: Customer info form */}
        {phase === 'form' && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cemail" className="text-[10px] font-mono text-gray-400">CUSTOMER EMAIL (RECORDS & ALERTS)</label>
                <input 
                  id="cemail"
                  type="email" 
                  placeholder="name@address.com" 
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="px-3 py-2 text-sm text-white rounded bg-[#0A0908] border border-[#23211F] focus:outline-none focus:ring-1 focus:ring-amber-500/40 font-space-grotesk tracking-wide w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="cname" className="text-[10px] font-mono text-gray-400">CUSTOMER FULL NAME</label>
                <input 
                  id="cname"
                  type="text" 
                  placeholder="Satoshi Nakamoto" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-2 text-sm text-white rounded bg-[#0A0908] border border-[#23211F] focus:outline-none focus:ring-1 focus:ring-amber-500/40 font-space-grotesk tracking-wide w-full"
                />
              </div>
            </div>

            {/* Selecting Crypto Coin */}
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase">SELECT CRYPTO PROTOCOL METHOD</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(SUPPORTED_CRPYTOS) as CryptoSymbol[]).map((sym) => {
                  const checkAsset = SUPPORTED_CRPYTOS[sym];
                  const isCoinSelected = selectedCrypto === sym;
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => setSelectedCrypto(sym)}
                      className={`p-3 rounded border text-left cursor-pointer transition-all flex flex-col items-start gap-1 justify-between ${
                        isCoinSelected 
                          ? 'border-amber-500 bg-[#1E1B19]' 
                          : 'border-[#23211F] bg-[#141211] hover:bg-[#1E1B19]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{checkAsset.icon}</span>
                        <span className="text-[10px] font-mono font-bold text-white">{sym}</span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono mt-2">${checkAsset.usdPrice.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Button proceed to wallet selection */}
            <button
              type="button"
              onClick={() => setPhase('wallet_connect')}
              className="w-full py-3 rounded text-sm font-semibold font-space-grotesk text-black bg-amber-500 hover:bg-amber-400 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Continue to Smart Wallet Selection <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </motion.div>
        )}

        {/* PHASE 2: Select wallet connection */}
        {phase === 'wallet_connect' && (
          <motion.div 
            key="wallets"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-4"
          >
            <button 
              type="button"
              onClick={() => setPhase('form')}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 self-start cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to details Form
            </button>

            <div className="flex flex-col gap-2 mt-1">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">Compatible Wallet Clients</span>
              
              {isWalletConnecting ? (
                <div className="p-8 rounded border-2 border-dashed border-[#23211F] bg-[#141211] flex flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <div>
                    <h5 className="text-sm font-semibold text-white font-outfit">Simulating Secure Handshake</h5>
                    <p className="text-xs text-amber-500 font-mono mt-1.5 bg-amber-950/20 px-3 py-1 rounded border border-amber-500/30">
                      {walletConnectionStep}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 max-w-[80%] font-medium">Verify your browser extension extension prompt to simulate consent signing.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {(['metamask', 'phantom', 'coinbase'] as const).map((w) => {
                    let text = 'MetaMask Wallet (EVM Keyring)';
                    let logo = '🔥';
                    let sub = 'Recommended for ETH, USDC, ERC-20';
                    if (w === 'phantom') {
                      text = 'Phantom Wallet (SVM Keyring)';
                      logo = '👻';
                      sub = 'Recommended for SOL, USDC, Metaplex';
                    } else if (w === 'coinbase') {
                      text = 'Coinbase MPC Portal';
                      logo = '🛡️';
                      sub = 'Compatible with Multi-Chain nodes';
                    }

                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => tackleConnectWallet(w)}
                        className="w-full flex items-center justify-between p-3.5 rounded border border-[#23211F] bg-[#141211] hover:bg-[#1E1B19] text-left cursor-pointer transition-all active:translate-x-0.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{logo}</span>
                          <div>
                            <span className="text-xs font-semibold text-white font-outfit block">{text}</span>
                            <span className="text-[10.5px] text-gray-400 font-mono">{sub}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PHASE 3: Wallet connected details & direct payment view */}
        {phase === 'pay' && (
          <motion.div 
            key="pay"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col gap-4"
          >
            {/* Wallet header information */}
            <div className="p-3.5 rounded bg-[#141211] border border-[#23211F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedWallet === 'metamask' ? '🔥' : selectedWallet === 'phantom' ? '👻' : '🛡️'}</span>
                <div>
                  <span className="text-[10px] font-mono text-gray-500 block uppercase">Wallet Connected</span>
                  <span className="text-xs font-mono font-medium text-white select-all">
                    {connectedWalletAddress?.substring(0, 8)}...{connectedWalletAddress?.substring(connectedWalletAddress.length - 8)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-500 block">BALANCE</span>
                <span className="text-xs font-mono font-bold text-amber-500">
                  {walletBalance.toFixed(selectedCrypto === 'USDC' ? 2 : 4)} {selectedCrypto}
                </span>
              </div>
            </div>

            {/* Direct Conversion Ledger details */}
            <div className="p-4 rounded bg-[#0A0908] border-2 border-[#23211F] flex flex-col gap-2">
              <span className="text-[10px] font-mono text-gray-400 block uppercase">DECENTRALIZED MEMPOOL ESCROW EST.</span>
              
              <div className="flex justify-between items-center text-xs text-gray-300">
                <span>Calculated Exchange Rate</span>
                <span className="font-mono">1 {selectedCrypto} = ${cryptoPrice.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-300 border-t border-[#23211F] pt-2 mt-1">
                <span>Subtotal ({selectedCrypto})</span>
                <span className="font-mono font-semibold text-white">{cryptoAmountNeeded.toFixed(6)} {selectedCrypto}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-300">
                <span className="flex items-center gap-1">Gas Cost Estimator <HelpCircle className="w-3.5 h-3.5 text-gray-500" title="Blockchain transaction fee" /></span>
                <span className="font-mono text-orange-400">+{gasAmountInCrypto.toFixed(6)} {selectedCrypto} (~${activeAsset.gasUSD.toFixed(2)})</span>
              </div>

              <div className="flex justify-between items-center text-sm text-white font-bold border-t border-[#23211F] pt-2 mt-1">
                <span>Total Crypto Charged</span>
                <span className="font-mono text-amber-500">{cryptoTotalAmount.toFixed(6)} {selectedCrypto}</span>
              </div>
            </div>

            {/* Interactive Settle Button */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleProcessDirectPayment}
                className="w-full py-3.5 rounded text-sm font-semibold font-space-grotesk text-black bg-amber-500 hover:bg-amber-400 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign & Transmit {cryptoTotalAmount.toFixed(4)} {selectedCrypto} Payment <Sparkles className="w-4 h-4 fill-black/20" />
              </button>
              
              <button
                type="button"
                onClick={() => setPhase('wallet_connect')}
                className="w-full py-1.5 text-xs text-gray-400 hover:text-white font-mono cursor-pointer transition-all"
              >
                Disconnect & Use Different Wallet
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 4: Transaction Processing */}
        {phase === 'processing' && (
          <motion.div 
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 px-4 rounded-lg bg-[#141211] border border-[#23211F] flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="absolute w-full h-full rotate-270">
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
              <h4 className="text-base font-outfit font-semibold text-white">Broadcasting On-Chain</h4>
              <p className="text-[11px] text-amber-500 font-mono mt-2.5 bg-amber-950/20 px-4 py-1.5 rounded border border-amber-500/30">
                {paymentStep}
              </p>
              <div className="text-[10px] text-gray-500 font-mono mt-4">
                Tx Status: BROADCASTING ({paymentProgress}% Consensus Verified)
              </div>
            </div>
          </motion.div>
        )}

        {/* PHASE 5: Successful checkout Receipt screen */}
        {phase === 'success' && (
          <motion.div 
            key="success"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col gap-5 text-center items-center"
          >
            <div className="p-3 bg-emerald-950/20 border-2 border-emerald-500/40 rounded-full text-emerald-400">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-xl font-outfit font-bold text-white leading-none">Payment Succeeded</h3>
              <p className="text-xs text-gray-400 mt-2">Decentralized asset ledger verified successfully.</p>
            </div>

            {/* Receipt Summary details */}
            <div className="w-full text-left p-4 rounded bg-[#141211] border border-[#23211F] text-xs flex flex-col gap-2">
              <div className="flex justify-between items-center text-gray-400 border-b border-[#23211F] pb-2 mb-1">
                <span>RECEIPT REFERENCE</span>
                <span className="font-mono text-white text-[11px] font-bold">
                  REC-{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Settled Amount USD</span>
                <span className="text-white font-semibold">${paymentLink.amountUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Crypto Settled</span>
                <span className="text-amber-500 font-mono font-bold">{(paymentLink.amountUSD / cryptoPrice).toFixed(6)} {selectedCrypto}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400">
                <span>Wallet Protocol Charged</span>
                <span className="font-mono text-gray-300 uppercase">{selectedWallet} API</span>
              </div>
              
              <div className="border-t border-[#23211F] pt-2 mt-1">
                <span className="text-[9px] font-mono text-gray-500 block">BLOCKCHAIN TRANSACTION ID</span>
                <div className="flex items-center justify-between gap-1.5 mt-1">
                  <span className="font-mono text-[10.5px] text-gray-400 select-all truncate break-all pr-2 max-w-[80%]">
                    {simulatedTxHash}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      className="p-1 hover:bg-[#1E1B19] rounded cursor-pointer text-gray-400 hover:text-white transition-all"
                      title="Copy Transaction Hash"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`https://explorer.solana.com/tx/${simulatedTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="p-1 hover:bg-[#1E1B19] rounded cursor-pointer text-gray-400 hover:text-white transition-all"
                      title="Inspect Ledger Block"
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
              className="w-full mt-2 py-3 rounded text-xs font-semibold font-space-grotesk text-white bg-[#141211] border-2 border-[#23211F] hover:bg-[#1E1B19] active:scale-98 transition-all cursor-pointer"
            >
              Securely Reset Simulator & Launch New Link
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
