'use client';

import { useState, useEffect } from 'react';
import { Building2, ArrowRight, Loader2, X, Trash2, CreditCard, Wallet, Info, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PlaidLink } from '@/components/payment/plaid/plaid-link';
import { PlaidService, type ConnectedAccount } from '@/services/plaid.service';
import { toast } from 'sonner';
import { AccountsIcon } from '../icons/nav-icons';

interface DepositDialogProps {
  accountId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'plaid' | 'card' | 'wallet';
type Step = 1 | 2;

export function DepositDialog({ accountId, onSuccess, onCancel }: DepositDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [processing, setProcessing] = useState(false);

  // Plaid fields
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [selectedPlaidAccount, setSelectedPlaidAccount] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const PAYMENT_METHODS = [
    { id: 'wallet', label: 'Digital Wallet', icon: Wallet },
    { id: 'plaid', label: 'Bank Transfer', icon: AccountsIcon },
    { id: 'card', label: 'Credit Card', icon: CreditCard },
  ] as const;

  // Load connected Plaid accounts
  useEffect(() => {
    const loadConnectedAccounts = async () => {
      if (paymentMethod === 'plaid') {
        setLoadingAccounts(true);
        try {
          const accounts = await PlaidService.getConnectedAccounts(accountId);
          setConnectedAccounts(accounts || []);
        } catch (error: any) {
          console.error('Failed to load connected accounts:', error);
          setConnectedAccounts([]);
        } finally {
          setLoadingAccounts(false);
        }
      }
    };

    loadConnectedAccounts();
  }, [accountId, paymentMethod, step]);

  const handlePlaidSuccess = async (token: string, metadata: any) => {
    setPublicToken(token);
    if (metadata.accounts && metadata.accounts.length > 0) {
      setSelectedPlaidAccount(metadata.accounts[0].id);
    }

    setLoadingAccounts(true);
    try {
      await PlaidService.connectAccount(accountId, token);
      const accounts = await PlaidService.getConnectedAccounts(accountId);
      setConnectedAccounts(accounts);

      if (metadata.accounts && metadata.accounts.length > 0 && accounts.length > 0) {
        const newAccountId = metadata.accounts[0].id;
        const accountExists = accounts.some((item) => item.accounts.some((acc) => acc.accountId === newAccountId));
        if (accountExists) {
          setSelectedPlaidAccount(newAccountId);
        }
      }

      toast.success('Bank account connected successfully!');
    } catch (error: any) {
      console.error('Failed to connect or reload accounts:', error);
      toast.error(error.message || 'Failed to connect bank account');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleDeleteAccount = async (fundingSourceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to disconnect this bank account?')) {
      return;
    }

    setLoadingAccounts(true);
    try {
      await PlaidService.disconnectItem(accountId, fundingSourceId);
      const accounts = await PlaidService.getConnectedAccounts(accountId);
      setConnectedAccounts(accounts);

      if (
        connectedAccounts.some((item) => item.id === fundingSourceId && item.accounts.some((acc) => acc.accountId === selectedPlaidAccount))
      ) {
        setSelectedPlaidAccount(null);
      }

      toast.success('Bank account disconnected successfully');
    } catch (error: any) {
      console.error('Failed to disconnect account:', error);
      toast.error(error.message || 'Failed to disconnect bank account');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const validateStep1 = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (paymentMethod === 'plaid') {
      if (!publicToken && connectedAccounts.length === 0) {
        toast.error('Please connect a bank account');
        return false;
      }
    } else {
      toast.error('This payment method is not yet available');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const amountStr = parseFloat(amount).toFixed(2);
      const request: any = {
        amount: amountStr,
        currency: 'USD',
        description: `Plaid ACH deposit of $${amountStr}`,
      };

      if (connectedAccounts.length > 0 && !publicToken) {
        const selectedItem =
          connectedAccounts.find((item) => item.accounts.some((acc) => acc.accountId === selectedPlaidAccount)) || connectedAccounts[0];

        request.itemId = selectedItem.itemId || selectedItem.providerId;
        if (selectedPlaidAccount) {
          request.accountId = selectedPlaidAccount;
        } else if (selectedItem.accounts.length > 0) {
          request.accountId = selectedItem.accounts[0].accountId;
        }
      } else if (publicToken) {
        request.publicToken = publicToken;
        if (selectedPlaidAccount) {
          request.accountId = selectedPlaidAccount;
        }
      }

      await PlaidService.createDeposit(accountId, request);
      toast.success('Deposit initiated successfully! Funds will be available once the transfer completes.');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process deposit';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardContent className="px-8">
          {/* Header */}
          <div className="w-full pb-6 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-2xl font-bold leading-8">Deposit Funds</h2>
              <p className="text-[#A1BEAD] text-sm leading-5">Add funds securely to your Bluum wallet.</p>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 rounded-full hover:bg-[#1E3D2F] transition-colors text-[#A1BEAD] hover:text-white"
                disabled={processing}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {/* Content */}
          <div className="w-full flex flex-col gap-6 overflow-hidden">
            {/* Step 1: Amount and Payment Method */}
            {step === 1 && (
              <>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="amount" className="text-[#E2E8F0] text-sm font-medium leading-5">
                    Amount to Deposit
                  </Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4 text-[#9DB9AB] font-medium">$</div>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={processing}
                      className="h-11 pl-8 pr-20 bg-[#07120F] border-[#1F4536] text-white text-lg focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                    />
                    <div className="absolute right-4 flex items-center gap-2">
                      <span className="text-[#9DB9AB] text-sm font-medium">USD</span>
                      <ChevronDown className="h-4 w-4 text-[#B0B8BD]" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Label className="text-[#E2E8F0] text-sm font-medium leading-5">Payment Method</Label>

                  <div className="grid grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isActive = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`relative flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                            isActive ? 'bg-[#57B75C]/10 border-[#57B75C]' : 'bg-[#07120F] border-[#1F4536] hover:border-[#57B75C]/50'
                          }`}
                        >
                          <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-[#57B75C]' : 'text-[#9DB9AB]'}`} />

                          <span className="text-[#8DA69B] text-xs font-medium text-center">{method.label}</span>
                          {isActive && (
                            <div className="absolute top-2 right-2 h-3 w-3 bg-[#57B75C] rounded-full flex items-center justify-center">
                              <div className="h-1.5 w-1.5 bg-white rounded-full" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#07120F] border border-[#1F4536]/50 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9DB9AB] text-sm">Processing Fee</span>
                    <span className="text-white text-sm font-medium">Free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9DB9AB] text-sm">Estimated Arrival</span>
                    <span className="text-white text-sm font-medium">Instant</span>
                  </div>
                </div>

                <div className="bg-[#124031] border border-blue-900/30 rounded-lg p-3 flex gap-3 items-start">
                  <Info className="h-5 w-5 text-[#30D158] shrink-0 mt-0.5" />
                  <p className="text-[#8DA69B] text-xs leading-5">
                    Deposits are subject to verification and settlement timelines. Funds typically arrive within 1-3 business days depending
                    on your bank.
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Bank Selection (Plaid) */}
            {step === 2 && paymentMethod === 'plaid' && (
              <div className="flex flex-col gap-4">
                <Label className="text-[#E2E8F0] text-sm font-medium">Select Bank Account</Label>
                {loadingAccounts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#57B75C]" />
                  </div>
                ) : connectedAccounts.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {connectedAccounts.map((item) =>
                      item.accounts.map((account) => (
                        <div
                          key={account.accountId}
                          onClick={() => setSelectedPlaidAccount(account.accountId)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center gap-4 ${
                            selectedPlaidAccount === account.accountId
                              ? 'border-[#57B75C] bg-[#57B75C]/10'
                              : 'border-[#1F4536] bg-[#07120F] hover:border-[#57B75C]/50'
                          }`}
                        >
                          <div className="h-10 w-10 bg-[#1F4536] rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-[#9DB9AB]" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{item.institutionName}</div>
                            <div className="text-[#9DB9AB] text-sm">
                              {account.accountName} •••• {account.mask}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteAccount(item.id, e)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-[#9DB9AB] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                    <PlaidLink
                      accountId={accountId}
                      onSuccess={handlePlaidSuccess}
                      className="mt-2 w-full border-[#1F4536] text-white hover:bg-[#1F4536]"
                    >
                      Connect Another Bank Account
                    </PlaidLink>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-4 border-2 border-dashed border-[#1F4536] rounded-xl">
                    <Building2 className="h-12 w-12 text-[#1F4536]" />
                    <div className="text-center">
                      <p className="text-white font-medium">No bank account connected</p>
                      <p className="text-[#9DB9AB] text-sm">Connect your bank to start depositing funds</p>
                    </div>
                    <PlaidLink accountId={accountId} onSuccess={handlePlaidSuccess}>
                      <Button className="bg-[#57B75C] hover:bg-[#57B75C]/90 text-white px-8 rounded-full">Connect Bank Account</Button>
                    </PlaidLink>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Not Available (Card/Wallet) */}
            {step === 2 && paymentMethod !== 'plaid' && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 border border-[#1F4536] rounded-xl bg-[#07120F]">
                <div className="h-16 w-16 bg-[#1F4536] rounded-full flex items-center justify-center">
                  {paymentMethod === 'card' ? (
                    <CreditCard className="h-8 w-8 text-[#9DB9AB]" />
                  ) : (
                    <Wallet className="h-8 w-8 text-[#9DB9AB]" />
                  )}
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-white font-bold text-lg">Coming Soon</h3>
                  <p className="text-[#9DB9AB] text-sm max-w-62.5">
                    {paymentMethod === 'card' ? 'Credit Card' : 'Digital Wallet'} deposits are not available yet. We're working on bringing
                    this feature to you soon!
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="w-full py-4 bg-[#0F2A20] border-t border-[#1F4536] flex justify-end items-center gap-3">
            <Button
              variant="ghost"
              onClick={step === 1 ? onCancel : handleBack}
              className="px-6 py-2.5 bg-[#1F4536] hover:bg-[#1F4536]/80! text-white rounded-full font-medium h-11 min-w-25"
              disabled={processing}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={handleNext}
              disabled={processing || (step === 2 && paymentMethod !== 'plaid')}
              className="px-6 py-2.5 bg-[#57B75C] hover:bg-[#57B75C]/90 text-white rounded-full font-bold h-11 flex items-center gap-2 min-w-40"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : step === 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Confirm Deposit
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
