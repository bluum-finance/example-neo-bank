'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, X, CreditCard, Wallet, Info, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { AccountsIcon } from '../icons/nav-icons';
import { TransferService } from '@/services/transfer.service';
import { useAccountStore } from '@/store/account.store';

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

  const PAYMENT_METHODS = [
    { id: 'wallet', label: 'Digital Wallet', icon: Wallet },
    { id: 'plaid', label: 'Bank Transfer', icon: AccountsIcon },
    { id: 'card', label: 'Credit Card', icon: CreditCard },
  ] as const;

  const validateStep1 = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (paymentMethod === 'wallet') {
      return true;
    }
    toast.error('This payment method is not yet available');
    return false;
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
    if (paymentMethod !== 'wallet') {
      toast.error('This payment method is not yet available');
      return;
    }

    setProcessing(true);
    try {
      await TransferService.createDeposit(accountId, {
        amount: amount,
        currency: 'USD',
        method: 'manual_bank_transfer',
        description: 'Wallet deposit',
      });

      toast.success('Deposit initiated successfully');
      // Refetch account balance to reflect the new deposit
      useAccountStore.getState().fetchAccount(accountId).catch(() => null);
      onSuccess?.();
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'An error occurred during deposit');
    } finally {
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

            {/* Step 2: Confirmation or Not Available */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                {paymentMethod === 'wallet' ? (
                  <div className="flex flex-col gap-4">
                    <div className="bg-[#07120F] border border-[#1F4536] rounded-xl p-6 flex flex-col items-center gap-4">
                      <div className="h-16 w-16 bg-[#57B75C]/10 rounded-full flex items-center justify-center">
                        <Wallet className="h-8 w-8 text-[#57B75C]" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-white font-bold text-lg">Confirm Deposit</h3>
                        <p className="text-[#9DB9AB] text-sm">You are about to deposit funds from your digital wallet.</p>
                      </div>
                      <div className="w-full border-t border-[#1F4536] pt-4 mt-2 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[#9DB9AB] text-sm">Amount</span>
                          <span className="text-white font-bold">
                            ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#9DB9AB] text-sm">Payment Method</span>
                          <span className="text-white font-medium">Digital Wallet</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#9DB9AB] text-sm">Fee</span>
                          <span className="text-[#57B75C] font-medium">Free</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 border border-[#1F4536] rounded-xl bg-[#07120F]">
                    <div className="h-16 w-16 bg-[#1F4536] rounded-full flex items-center justify-center">
                      {paymentMethod === 'card' ? (
                        <CreditCard className="h-8 w-8 text-[#9DB9AB]" />
                      ) : (
                        <AccountsIcon className="h-8 w-8 text-[#9DB9AB]" />
                      )}
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-white font-bold text-lg">Coming Soon</h3>
                      <p className="text-[#9DB9AB] text-sm max-w-62.5">
                        {paymentMethod === 'card' ? 'Credit Card' : 'Bank Transfer'} deposits are not available yet. We're working on
                        bringing this feature to you soon!
                      </p>
                    </div>
                  </div>
                )}
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
              disabled={processing}
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
