'use client';

import { useState, useEffect } from 'react';
import { Building2, ArrowRight, Loader2, X, ChevronDown, CheckCircle2, Trash2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { PlaidLink } from '@/components/payment/plaid/plaid-link';
import { ManualBankLink } from '@/components/payment/manual-bank-link';
import { FundingSourceService, type FundingSource } from '@/services/funding-source.service';
import { TransferService } from '@/services/transfer.service';
import { toast } from 'sonner';
import { useAccountStore } from '@/store/account.store';
import type { ExternalWithdrawalResponse, AlpacaWithdrawalDetails } from '@/lib/bluum-api.types';

interface WithdrawalDialogProps {
  accountId: string;
  availableBalance: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type WithdrawalMethod = 'ach' | 'wire';
type Step = 1 | 2 | 3;
type SupportedCurrency = 'USD' | 'NGN';

export function WithdrawalDialog({ accountId, availableBalance, onSuccess, onCancel }: WithdrawalDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod>('ach');
  const [withdrawalResponse, setWithdrawalResponse] = useState<ExternalWithdrawalResponse | null>(null);

  const [selectedFundingSourceId, setSelectedFundingSourceId] = useState<string | null>(null);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  useEffect(() => {
    if (withdrawalMethod !== 'ach') return;
    setSelectedFundingSourceId(null);
    setLoadingAccounts(true);
    FundingSourceService.getFundingSources(accountId, 'all')
      .then((sources) => {
        const active = sources
          .filter((s) => s.status === 'active')
          .filter((s) => {
            if (currency === 'NGN') return s.currency === null || s.currency === 'NGN';
            return s.currency === null || s.currency === 'USD';
          });
        setFundingSources(active);
        if (active.length > 0) {
          setSelectedFundingSourceId(active[0].id);
        }
      })
      .catch(() => setFundingSources([]))
      .finally(() => setLoadingAccounts(false));
  }, [accountId, withdrawalMethod, currency]);

  const handlePlaidSuccess = async (token: string) => {
    setLoadingAccounts(true);
    try {
      const newSources = await FundingSourceService.connectAccount(accountId, token);
      const allSources = await FundingSourceService.getFundingSources(accountId, 'all');
      const active = allSources.filter((s) => s.status === 'active');
      setFundingSources(active);
      if (newSources.length > 0) {
        setSelectedFundingSourceId(newSources[0].id);
      }
      toast.success('Bank account connected successfully!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to connect bank account';
      toast.error(message);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleManualSuccess = async (source: FundingSource) => {
    setLoadingAccounts(true);
    try {
      const allSources = await FundingSourceService.getFundingSources(accountId, 'all');
      const active = allSources.filter((s) => s.status === 'active');
      setFundingSources(active);
      setSelectedFundingSourceId(source.id);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleDeleteAccount = async (fundingSourceId: string, sourceType: 'plaid' | 'manual', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to disconnect this bank account?')) return;

    setLoadingAccounts(true);
    try {
      await FundingSourceService.disconnectFundingSource(accountId, fundingSourceId, sourceType);
      const updated = await FundingSourceService.getFundingSources(accountId, 'all');
      const active = updated.filter((s) => s.status === 'active');
      setFundingSources(active);
      if (selectedFundingSourceId === fundingSourceId) {
        setSelectedFundingSourceId(active[0]?.id ?? null);
      }
      toast.success('Bank account disconnected successfully');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect bank account';
      toast.error(message);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const validateStep1 = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    if (parseFloat(amount) > availableBalance) {
      toast.error('Insufficient balance');
      return false;
    }
    if (withdrawalMethod === 'ach' && fundingSources.length === 0) {
      toast.error('Please connect a bank account');
      return false;
    }
    if (withdrawalMethod === 'ach' && !selectedFundingSourceId) {
      toast.error('Please select a destination account');
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
      handleSubmit();
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
      const response = await TransferService.createWithdrawal(accountId, {
        amount: amountStr,
        currency,
        method: withdrawalMethod,
        funding_source_id: withdrawalMethod === 'ach' ? selectedFundingSourceId || undefined : undefined,
        description: withdrawalMethod === 'ach' ? `ACH withdrawal of ${currency === 'NGN' ? '₦' : '$'}${amountStr}` : `Wire withdrawal of ${currency === 'NGN' ? '₦' : '$'}${amountStr}`,
        wire_options: withdrawalMethod === 'wire' ? {} : undefined,
      });

      setWithdrawalResponse(response);
      setStep(3);
      toast.success('Withdrawal initiated successfully!');
      useAccountStore.getState().fetchAccount(accountId).catch(() => null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process withdrawal';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleDone = () => {
    onSuccess?.();
    onCancel?.();
  };

  const selectedFundingSource = fundingSources.find((s) => s.id === selectedFundingSourceId) ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardContent className="px-8">
          {/* Header */}
          <div className="w-full pb-6 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-2xl font-bold leading-8">Withdraw Funds</h2>
              <p className="text-[#A1BEAD] text-sm leading-5">Transfer money to your linked accounts securely.</p>
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
          <div className="w-full py-4 flex flex-col gap-6">
            {step === 1 && (
            <>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <Label className="text-[#E2E8F0] text-sm font-medium leading-5">Amount to withdraw</Label>
                <span className="text-[#30D158] text-xs leading-4">
                  Available: {currency === 'NGN' ? '₦' : '$'}
                  {availableBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} {currency}
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[#9DB9AB] font-medium">{currency === 'NGN' ? '₦' : '$'}</div>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={processing}
                  className="h-11 pl-8 pr-24 bg-[#07120F] border-[#1F4536] text-white text-lg focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                />
                <div className="absolute right-3">
                  <button
                    type="button"
                    onClick={() => setShowCurrencyMenu((v) => !v)}
                    className="flex items-center gap-1.5 bg-[#1A3329] hover:bg-[#1F4536] rounded-md px-2.5 py-1.5 transition-colors"
                  >
                    <span className="text-white text-sm font-medium">{currency}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-[#A1BEAD]" />
                  </button>
                  {showCurrencyMenu && (
                    <div className="absolute right-0 top-full mt-1 z-10 bg-[#0F2A20] border border-[#1F4536] rounded-lg shadow-lg overflow-hidden min-w-30">
                      {(['USD', 'NGN'] as SupportedCurrency[]).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setCurrency(c); setShowCurrencyMenu(false); }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[#1F4536]',
                            currency === c ? 'text-[#30D158] font-medium' : 'text-white',
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-[#E2E8F0] text-sm font-medium leading-5">Transfer method</Label>
                  <Select
                    value={withdrawalMethod}
                    onChange={(e) => setWithdrawalMethod(e.target.value as WithdrawalMethod)}
                    className="h-11 bg-[#07120F] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                    disabled={processing}
                  >
                    <option value="ach">ACH transfer</option>
                    <option value="wire">Wire transfer</option>
                  </Select>
                  <p className="text-xs text-[#9DB9AB]">
                    {withdrawalMethod === 'ach'
                      ? 'Use a linked bank account to receive ACH transfers.'
                      : 'Wire transfers will use bank instructions provided after submission.'}
                  </p>
                </div>

                {withdrawalMethod === 'ach' ? (
                  <div className="flex flex-col gap-2">
                    <Label className="text-[#E2E8F0] text-sm font-medium leading-5">Destination account</Label>
                    {loadingAccounts ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#57B75C]" />
                      </div>
                    ) : fundingSources.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-2">
                          {fundingSources.map((source) => {
                            const isSelected = selectedFundingSourceId === source.id;
                            return (
                              <div key={source.id} className="group relative w-full">
                                <button
                                  type="button"
                                  onClick={() => setSelectedFundingSourceId(source.id)}
                                  disabled={processing}
                                  className={cn(
                                    'w-full min-w-0 flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors',
                                    isSelected
                                      ? 'bg-[#57B75C]/10 border-[#57B75C] pr-16'
                                      : 'bg-[#07120F] border-[#1F4536] pr-14 hover:border-[#57B75C]/50',
                                  )}
                                >
                                  <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <Building2 className={`h-5 w-5 shrink-0 ${isSelected ? 'text-[#57B75C]' : 'text-[#9DB9AB]'}`} />
                                  <div className="min-w-0">
                                    <div className="text-white text-sm font-medium truncate">{source.bankName}</div>
                                    <div className="text-[#9DB9AB] text-xs truncate">
                                      {source.accountName ? `${source.accountName} · ` : ''}
                                      {source.mask ? `•••• ${source.mask}` : ''}
                                    </div>
                                  </div>
                                  </div>
                                </button>
                                <div className="absolute right-1.5 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={(e) => void handleDeleteAccount(source.id, source.type, e)}
                                    disabled={processing}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#9DB9AB] transition-opacity opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus:opacity-100 focus:pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#57B75C]/50 hover:text-red-400 disabled:pointer-events-none disabled:opacity-0"
                                    aria-label="Disconnect bank account"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-[#57B75C]" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#9DB9AB]">
                          Add a new linked account:
                          {currency !== 'NGN' && (
                            <>
                              <PlaidLink accountId={accountId} onSuccess={handlePlaidSuccess} className="inline bg-transparent! p-1 h-auto">
                                <span className="text-[#57B75C] text-sm hover:underline cursor-pointer font-medium">via Plaid</span>
                              </PlaidLink>
                              <span className="text-[#1F4536]">|</span>
                            </>
                          )}
                          <ManualBankLink accountId={accountId} onSuccess={handleManualSuccess} currency={currency} className="inline bg-transparent! p-1 h-auto">
                            <span className="text-[#57B75C] text-sm hover:underline cursor-pointer font-medium">Manually</span>
                          </ManualBankLink>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 gap-4 border-2 border-dashed border-[#1F4536] rounded-xl">
                        <Building2 className="h-12 w-12 text-[#1F4536]" />
                        <div className="text-center">
                          <p className="text-white font-medium">No bank account connected</p>
                          <p className="text-[#9DB9AB] text-sm">Connect your bank to start withdrawing funds</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
                          {currency !== 'NGN' && (
                            <PlaidLink accountId={accountId} onSuccess={handlePlaidSuccess} className="w-full bg-[#57B75C] hover:bg-[#57B75C]/90 text-white rounded-full h-10 font-medium">
                              Connect via Plaid
                            </PlaidLink>
                          )}
                          <ManualBankLink accountId={accountId} onSuccess={handleManualSuccess} currency={currency} className="w-full flex justify-center items-center h-10 border border-[#57B75C] text-[#57B75C] hover:bg-[#57B75C]/10 rounded-full font-medium">
                            Add Account Manually
                          </ManualBankLink>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#07120F] border border-[#1F4536] rounded-lg p-4 text-sm text-[#9DB9AB]">
                    Wire transfer instructions will be shown once your withdrawal is submitted.
                  </div>
                )}

                <div className="bg-[#124031] border border-[#1F4536]/50 rounded-lg p-3 flex gap-3 items-start">
                  <Info className="h-4 w-4 text-[#30D158] shrink-0 mt-0.5" />
                  <p className="text-[#8DA69B] text-xs leading-5">
                    Please ensure your bank details are up to date. Transfers to external accounts may be subject to additional verification.
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-white text-lg font-semibold">Review Withdrawal</h3>

                  <div className="bg-[#07120F] border border-[#1F4536] rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#9DB9AB] text-sm">Amount</span>
                      <span className="text-white text-lg font-semibold">
                        {currency === 'NGN' ? '₦' : '$'}
                        {parseFloat(amount || '0').toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })} {currency}
                      </span>
                    </div>

                    <div className="h-px w-full bg-[#1F4536]" />

                    <div className="flex justify-between items-start">
                      <span className="text-[#9DB9AB] text-sm">Destination</span>
                      <div className="text-right">
                        {withdrawalMethod === 'ach' ? (
                          selectedFundingSource ? (
                            <>
                              <div className="text-white text-sm font-medium">{selectedFundingSource.bankName}</div>
                              {(selectedFundingSource.accountName || selectedFundingSource.mask) && (
                                <div className="text-[#9DB9AB] text-xs mt-1">
                                  {selectedFundingSource.accountName}{selectedFundingSource.mask ? ` •••• ${selectedFundingSource.mask}` : ''}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-[#9DB9AB] text-sm">Not selected</span>
                          )
                        ) : (
                          <span className="text-[#9DB9AB] text-sm">Wire transfer</span>
                        )}
                      </div>
                    </div>

                    <div className="h-px w-full bg-[#1F4536]" />

                    <div className="flex justify-between items-center">
                      <span className="text-[#9DB9AB] text-sm">Estimated Arrival</span>
                      <span className="text-white text-sm font-medium">
                        {withdrawalMethod === 'wire' ? 'Same day (business hours)' : '1-3 business days'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#124031] border border-[#1F4536]/50 rounded-lg p-3 flex gap-3 items-start">
                  <Info className="h-4 w-4 text-[#30D158] shrink-0 mt-0.5" />
                  <p className="text-[#8DA69B] text-xs leading-5">
                    Please review all details carefully. Once confirmed, this withdrawal cannot be cancelled.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && withdrawalResponse && (
              <div className="flex flex-col gap-6">
                <div className="bg-[#07120F] border border-[#1F4536] rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white text-lg font-semibold">Withdrawal submitted</h3>
                      <p className="text-[#9DB9AB] text-sm">Your {withdrawalResponse.method} withdrawal is now pending.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#9DB9AB]">Status</div>
                      <div className="text-white text-sm font-semibold capitalize">{withdrawalResponse.status}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-[#9DB9AB]">Amount</div>
                      <div className="text-white font-semibold">{currency === 'NGN' ? '₦' : '$'}{parseFloat(withdrawalResponse.amount).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[#9DB9AB]">Withdrawal ID</div>
                      <div className="text-white font-semibold">{withdrawalResponse.withdrawal_id}</div>
                    </div>
                  </div>
                </div>

                {withdrawalResponse.method_details && (() => {
                  const details = withdrawalResponse.method_details as AlpacaWithdrawalDetails;
                  return (
                  <div className="bg-[#07120F] border border-[#1F4536]/70 rounded-xl p-5 space-y-3">
                    <h4 className="text-white font-semibold">Transfer details</h4>
                    <div className="text-sm text-[#9DB9AB]">
                      Transfer ID:{' '}
                      <span className="text-white">{details.transferId || 'Pending assignment'}</span>
                    </div>
                    <div className="text-sm text-[#9DB9AB]">
                      Provider status:{' '}
                      <span className="text-white">{details.alpacaStatus || 'Pending'}</span>
                    </div>
                  </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="w-full py-4 flex flex-col gap-4">
            <p className="text-center text-[#A1BEAD] text-xs leading-4.5">Withdrawals may take 1–3 business days depending on method.</p>
            <div className="flex gap-3">
              {step < 3 && (
                <Button
                  variant="ghost"
                  onClick={step === 1 ? onCancel : handleBack}
                  className="flex-1 px-6 h-11 bg-transparent border border-[#1F4536] hover:bg-[#1F4536] text-white rounded-lg font-medium"
                  disabled={processing}
                >
                  {step === 1 ? 'Cancel' : 'Back'}
                </Button>
              )}
              <Button
                onClick={step === 3 ? handleDone : handleNext}
                className="flex-1 px-6 h-11 bg-[#57B75C] hover:bg-[#57B75C]/90 text-white rounded-full font-semibold flex items-center justify-center gap-2"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : step === 1 ? (
                  <>
                    Review
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : step === 2 ? (
                  <>
                    Confirm Withdrawal
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>Done</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
