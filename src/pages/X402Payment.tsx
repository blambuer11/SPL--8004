import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight,
  ExternalLink,
  AlertCircle,
  CreditCard,
  History
} from 'lucide-react';

interface PaymentHistory {
  signature: string;
  amount: string;
  recipient: string;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
  memo?: string;
  explorerUrl?: string;
}

interface FacilitatorInfo {
  version: string;
  network: string;
  paymentScheme: string;
  feePayer: string;
  tokens: Array<{
    mint: string;
    symbol: string;
    decimals: number;
  }>;
  endpoints: {
    verify: string;
    settle: string;
  };
}

export default function X402Payment() {
  const { publicKey, connected, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [facilitatorInfo, setFacilitatorInfo] = useState<FacilitatorInfo | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [settling, setSettling] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

  const FACILITATOR_URL = 'http://localhost:3001';
  const RPC_URL = 'https://api.devnet.solana.com';
  const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'); // Devnet USDC
  const connection = new Connection(RPC_URL, 'confirmed');

  // Load facilitator info and balance
  useEffect(() => {
    loadFacilitatorInfo();
    loadPaymentHistory();
    if (connected && publicKey) {
      loadUsdcBalance();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]);

  const loadUsdcBalance = async () => {
    if (!publicKey) return;
    
    try {
      const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);
      const balance = await connection.getTokenAccountBalance(ata);
      setUsdcBalance(parseFloat(balance.value.uiAmountString || '0'));
    } catch (err) {
      console.error('Failed to load USDC balance:', err);
      setUsdcBalance(0);
    }
  };

  const loadFacilitatorInfo = async () => {
    try {
      const response = await fetch(`${FACILITATOR_URL}/supported`);
      const data = await response.json();
      setFacilitatorInfo(data);
    } catch (err) {
      console.error('Failed to load facilitator info:', err);
    }
  };

  const loadPaymentHistory = () => {
    const stored = localStorage.getItem('x402_payment_history');
    if (stored) {
      setPaymentHistory(JSON.parse(stored));
    }
  };

  const savePaymentHistory = (payment: PaymentHistory) => {
    const updated = [payment, ...paymentHistory].slice(0, 10); // Keep last 10
    setPaymentHistory(updated);
    localStorage.setItem('x402_payment_history', JSON.stringify(updated));
  };

  const handleDirectPayment = async () => {
    if (!connected || !publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    if (!recipient || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    let signature: string | null = null;
    let explorerUrl: string | null = null;

    try {
      // Validate recipient address
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(recipient);
      } catch {
        throw new Error('Invalid recipient address');
      }

      // Get sender's USDC token account
      const senderAta = await getAssociatedTokenAddress(
        USDC_MINT, 
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      // Get recipient's USDC token account
      const recipientAta = await getAssociatedTokenAddress(
        USDC_MINT, 
        recipientPubkey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      // Check if sender has USDC account
      let senderBalance;
      try {
        senderBalance = await connection.getTokenAccountBalance(senderAta);
      } catch {
        throw new Error('You don\'t have a USDC token account. Please get some devnet USDC first.');
      }

      // Calculate amount in smallest units (USDC has 6 decimals)
      const amountInSmallestUnit = Math.floor(parseFloat(amount) * 1_000_000);
      
      if (amountInSmallestUnit <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Check if sender has enough balance
      const currentBalance = parseInt(senderBalance.value.amount);
      if (currentBalance < amountInSmallestUnit) {
        throw new Error(`Insufficient USDC balance. You have ${(currentBalance / 1_000_000).toFixed(6)} USDC`);
      }

      // Create transaction
      const transaction = new Transaction();
      
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      transaction.lastValidBlockHeight = lastValidBlockHeight;

      // Check if recipient's token account exists, if not create it
      let recipientAccountExists = false;
      try {
        await connection.getTokenAccountBalance(recipientAta);
        recipientAccountExists = true;
      } catch {
        // Recipient doesn't have token account, we need to create it
        console.log('Creating recipient token account...');
        setSuccess('Creating recipient USDC account...');
        
        const createAtaInstruction = createAssociatedTokenAccountInstruction(
          publicKey, // payer
          recipientAta, // associated token account
          recipientPubkey, // owner
          USDC_MINT, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        
        transaction.add(createAtaInstruction);
      }

      // Add transfer instruction
      const transferInstruction = createTransferInstruction(
        senderAta,
        recipientAta,
        publicKey,
        amountInSmallestUnit,
        [],
        TOKEN_PROGRAM_ID
      );
      
      transaction.add(transferInstruction);

      // Sign transaction
      const signedTx = await signTransaction(transaction);
      
      // Send transaction with skipPreflight for faster processing
      signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3
      });
      
      // Confirm transaction
      setSuccess(`Transaction sent! Confirming... Signature: ${signature.slice(0, 8)}...`);
      
      explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      
      // Try to confirm with timeout handling
      let confirmed = false;
      let confirmationError = null;
      
      try {
        // Use a more reliable confirmation strategy
        const startTime = Date.now();
        const timeout = 60000; // 60 second timeout
        
        while (!confirmed && Date.now() - startTime < timeout) {
          const status = await connection.getSignatureStatus(signature);
          
          if (status.value?.confirmationStatus === 'confirmed' || 
              status.value?.confirmationStatus === 'finalized') {
            if (status.value.err) {
              throw new Error('Transaction failed on-chain');
            }
            confirmed = true;
            break;
          }
          
          // Wait 1 second before checking again
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (!confirmed) {
          // Even if not confirmed yet, check if transaction succeeded
          const txResult = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (txResult && !txResult.meta?.err) {
            confirmed = true;
          } else {
            throw new Error('Transaction confirmation timeout - please check Explorer');
          }
        }
      } catch (err) {
        confirmationError = err;
        // Even if confirmation fails, transaction might have succeeded
        // Check transaction status one more time
        try {
          const txResult = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (txResult && !txResult.meta?.err) {
            confirmed = true;
            confirmationError = null;
          }
        } catch {
          // If we can't check, assume it might have worked
        }
      }
      
      if (confirmed) {
        setSuccess(`✅ Payment successful! ${amount} USDC sent to ${recipient.slice(0, 8)}...`);
        
        // Save to history
        savePaymentHistory({
          signature,
          amount: amount,
          recipient,
          timestamp: Date.now(),
          status: 'success',
          memo: memo || undefined,
          explorerUrl,
        });

        // Reset form and reload balance
        setRecipient('');
        setAmount('');
        setMemo('');
        loadUsdcBalance();
      } else {
        // Transaction sent but confirmation unclear
        setSuccess(`⚠️ Transaction sent but confirmation pending. Check Explorer: ${signature.slice(0, 12)}...`);
        
        // Save to history as pending
        savePaymentHistory({
          signature,
          amount: amount,
          recipient,
          timestamp: Date.now(),
          status: 'pending',
          memo: memo || undefined,
          explorerUrl,
        });
        
        // Don't reset form, user might want to retry
        loadUsdcBalance();
        
        if (confirmationError) {
          console.warn('Confirmation error:', confirmationError);
        }
      }

    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      
      // If we have a signature, transaction was sent - check if it succeeded
      if (signature) {
        console.log('Transaction was sent, checking status despite error...');
        
        try {
          // Wait a bit for transaction to settle
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check transaction status on blockchain
          const txResult = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (txResult && !txResult.meta?.err) {
            // Transaction actually succeeded!
            console.log('Transaction succeeded on blockchain despite confirmation error');
            
            setSuccess(`✅ Payment successful! ${amount} USDC sent (confirmed on blockchain)`);
            
            if (explorerUrl) {
              savePaymentHistory({
                signature,
                amount: amount,
                recipient,
                timestamp: Date.now(),
                status: 'success',
                memo: memo || undefined,
                explorerUrl,
              });
            }
            
            // Reset form and reload balance
            setRecipient('');
            setAmount('');
            setMemo('');
            loadUsdcBalance();
            
            setLoading(false);
            return; // Exit here, don't show error
          }
        } catch (checkError) {
          console.error('Error checking transaction status:', checkError);
        }
        
        // If we reach here, show a helpful message
        setError(`⚠️ ${errorMessage}\n\nTransaction was sent. Please check Solana Explorer to verify:\n${explorerUrl}`);
        
        if (explorerUrl) {
          savePaymentHistory({
            signature,
            amount: amount,
            recipient,
            timestamp: Date.now(),
            status: 'pending',
            memo: memo || undefined,
            explorerUrl,
          });
        }
      } else {
        // No signature, transaction wasn't sent
        setError(errorMessage);
        
        savePaymentHistory({
          signature: 'failed',
          amount: amount,
          recipient,
          timestamp: Date.now(),
          status: 'failed',
          memo: memo || undefined,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!recipient || !amount) {
      setError('Please fill in recipient and amount');
      return;
    }

    setVerifying(true);
    setError('');
    setSuccess('');

    try {
      // Create a mock transaction for verification
      const mockTransaction = 'dGVzdC10cmFuc2FjdGlvbi12ZXJpZnk='; // Base64 encoded

      const response = await fetch(`${FACILITATOR_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '0.0.1',
          network: 'solana-devnet',
          transaction: mockTransaction,
          metadata: {
            endpoint: '/payment',
            amount: parseFloat(amount).toString(),
            recipient,
          },
        }),
      });

      const data = await response.json();

      if (!data.isValid) {
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess(`✅ Payment verified! Amount: ${data.amount}, Network: ${data.network}`);
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleSettlePayment = async () => {
    if (!recipient || !amount) {
      setError('Please fill in recipient and amount');
      return;
    }

    setSettling(true);
    setError('');
    setSuccess('');

    try {
      // Create a mock transaction for settlement
      const mockTransaction = 'dGVzdC10cmFuc2FjdGlvbi1zZXR0bGU='; // Base64 encoded

      const response = await fetch(`${FACILITATOR_URL}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '0.0.1',
          network: 'solana-devnet',
          transaction: mockTransaction,
          metadata: {
            endpoint: '/payment',
            amount: parseFloat(amount).toString(),
            recipient,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Settlement failed');
      }

      setSuccess(`✅ Payment settled! Signature: ${data.signature}`);
      
      // Save to history
      savePaymentHistory({
        signature: data.signature,
        amount: amount,
        recipient,
        timestamp: Date.now(),
        status: 'success',
        memo: 'Settled via X402',
        explorerUrl: data.explorerUrl,
      });

    } catch (err) {
      console.error('Settlement error:', err);
      setError(err instanceof Error ? err.message : 'Settlement failed');
    } finally {
      setSettling(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">X402 Payment Layer</h1>
          <p className="text-muted-foreground">
            HTTP 402 Payment Required Protocol - Gasless USDC Payments
          </p>
        </div>
        {connected && publicKey && (
          <Badge variant="outline" className="text-sm">
            <Wallet className="w-4 h-4 mr-2" />
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </Badge>
        )}
      </div>

      {!connected && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to use X402 Payment features
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facilitator Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Facilitator Info
            </CardTitle>
            <CardDescription>X402 Payment Gateway Status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {facilitatorInfo ? (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">Version</Label>
                  <p className="text-sm font-mono">{facilitatorInfo.version}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Network</Label>
                  <p className="text-sm font-mono">{facilitatorInfo.network}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payment Scheme</Label>
                  <p className="text-sm font-mono">{facilitatorInfo.paymentScheme}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fee Payer</Label>
                  <p className="text-sm font-mono break-all">{facilitatorInfo.feePayer}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Supported Tokens</Label>
                  {facilitatorInfo.tokens.map((token, i) => (
                    <div key={i} className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{token.symbol}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {token.decimals} decimals
                      </span>
                    </div>
                  ))}
                </div>
                {connected && publicKey && (
                  <div className="pt-4 border-t">
                    <Label className="text-xs text-muted-foreground">Your USDC Balance</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {usdcBalance !== null ? (
                        <>
                          <p className="text-2xl font-bold">{usdcBalance.toFixed(6)}</p>
                          <Badge variant="secondary">USDC</Badge>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Loading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Facilitator Online
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading facilitator info...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Make Payment</CardTitle>
            <CardDescription>
              Send gasless USDC payments via X402 Protocol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="direct" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="direct">Direct Payment</TabsTrigger>
                <TabsTrigger value="verify">Verify</TabsTrigger>
                <TabsTrigger value="settle">Settle</TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="Solana address (e.g., 11111...)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={loading || !connected}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDC)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading || !connected}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Textarea
                    id="memo"
                    placeholder="Payment description..."
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    disabled={loading || !connected}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleDirectPayment}
                  disabled={loading || !connected}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Payment
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="verify" className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Verify payment without broadcasting to the network
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="verify-recipient">Recipient Address</Label>
                  <Input
                    id="verify-recipient"
                    placeholder="Solana address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={verifying}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verify-amount">Amount (USDC)</Label>
                  <Input
                    id="verify-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={verifying}
                  />
                </div>

                <Button
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                  className="w-full"
                  variant="outline"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify Payment
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="settle" className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sign and broadcast verified payment to Solana network
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="settle-recipient">Recipient Address</Label>
                  <Input
                    id="settle-recipient"
                    placeholder="Solana address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={settling}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="settle-amount">Amount (USDC)</Label>
                  <Input
                    id="settle-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={settling}
                  />
                </div>

                <Button
                  onClick={handleSettlePayment}
                  disabled={settling}
                  className="w-full"
                  variant="default"
                >
                  {settling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Settling...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Settle Payment
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  {success}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Payment History
          </CardTitle>
          <CardDescription>Recent X402 transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment history yet
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {payment.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : payment.status === 'pending' ? (
                        <Loader2 className="w-4 h-4 text-yellow-500 animate-spin flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="font-mono text-sm font-medium">
                        {payment.amount} USDC
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-mono text-xs text-muted-foreground truncate">
                        {payment.recipient.slice(0, 8)}...{payment.recipient.slice(-8)}
                      </span>
                    </div>
                    {payment.memo && (
                      <p className="text-xs text-muted-foreground">{payment.memo}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {payment.explorerUrl && payment.status === 'success' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(payment.explorerUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    <Badge
                      variant={
                        payment.status === 'success'
                          ? 'default'
                          : payment.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
