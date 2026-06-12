'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowRight, ArrowLeftRight, Wallet, Loader2, X, Info, ChevronDown, Building2, Plus, CheckCircle2, Trash2, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { AccountsIcon } from '../icons/nav-icons';
import { TransferService } from '@/services/transfer.service';
import { FundingSourceService, type FundingSource } from '@/services/funding-source.service';
import { PlaidLink } from './plaid/plaid-link';
import { ManualBankLink } from './manual-bank-link';
import { ManualTransferInstructions } from './manual-transfer-instructions';
import { useAccountStore } from '@/store/account.store';
import { useWallets, useFetchWallets } from '@/store/wallet.store';
import {
  defaultDepositOptionForCurrency,
  getDepositMethodLabel,
  getDepositMethodOptions,
  getEnabledDepositMethodOptions,
  type DepositMethodOption,
} from '@/lib/funding';
import { cn } from '@/lib/utils';
import type {
  DepositMethod,
  ExternalDepositResponse,
  AlpacaAchDetails,
  AlpacaWireDetails,
} from '@/lib/bluum-api.types';

interface DepositDialogProps {
  accountId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type DepositStep = 'selection' | 'instructions' | 'success';

const METHOD_ICONS: Record<DepositMethod, React.ComponentType<{ className?: string }>> = {
  manual_bank_transfer: Wallet,
  ach: AccountsIcon,
  wire: ArrowLeftRight,
};

function defaultCurrencyFromWallets(walletCurrencies: string[]): string {
  if (walletCurrencies.length === 0) return 'USD';
  if (walletCurrencies.includes('USD')) return 'USD';
  return walletCurrencies[0];
}

export function DepositDialog({ accountId, onSuccess, onCancel }: DepositDialogProps) {
  const wallets = useWallets();
  const fetchWallets = useFetchWallets();
  const walletCurrencies = useMemo(() => wallets.map((w) => w.currency), [wallets]);

  const [step, setStep] = useState<DepositStep>('selection');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);
  const [depositOptionId, setDepositOptionId] = useState('digital_wallet');
  const [depositMethod, setDepositMethod] = useState<DepositMethod>('manual_bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [depositResponse, setDepositResponse] = useState<ExternalDepositResponse | null>(null);

  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedFundingSourceId, setSelectedFundingSourceId] = useState<string | null>(null);

  const depositOptions = getDepositMethodOptions(currency);
  const enabledDepositOptions = getEnabledDepositMethodOptions(currency);
  const showCurrencyPicker = walletCurrencies.length >= 2;

  const selectDepositOption = (option: DepositMethodOption) => {
    if (option.disabled) return;
    setDepositOptionId(option.id);
    setDepositMethod(option.method);
  };
  const prevMountRef = useRef(false);

  const resetForm = useCallback(() => {
    const initialCurrency = defaultCurrencyFromWallets(walletCurrencies);
    setCurrency(initialCurrency);
    const defaultOption = defaultDepositOptionForCurrency(initialCurrency);
    setDepositOptionId(defaultOption.id);
    setDepositMethod(defaultOption.method);
    setStep('selection');
    setAmount('');
    setDepositResponse(null);
    setProcessing(false);
    setSelectedFundingSourceId(null);
    setFundingSources([]);
  }, [walletCurrencies]);

  useEffect(() => {
    if (!prevMountRef.current) {
      prevMountRef.current = true;
      void fetchWallets(accountId);
      resetForm();
    }
  }, [accountId, fetchWallets, resetForm]);

  useEffect(() => {
    if (step !== 'selection' || walletCurrencies.length === 0) return;
    setCurrency((prev) => (walletCurrencies.includes(prev) ? prev : defaultCurrencyFromWallets(walletCurrencies)));
  }, [step, walletCurrencies]);

  useEffect(() => {
    const enabled = getEnabledDepositMethodOptions(currency);
    if (!enabled.some((o) => o.id === depositOptionId)) {
      const defaultOption = defaultDepositOptionForCurrency(currency);
      setDepositOptionId(defaultOption.id);
      setDepositMethod(defaultOption.method);
    }
  }, [currency, depositOptionId]);

  useEffect(() => {
    if (depositMethod === 'ach') {
      setSelectedFundingSourceId(null);
      void fetchFundingSources(currency);
    }
  }, [depositMethod, currency]);

  const fetchFundingSources = async (selectedCurrency = currency) => {
    setLoadingAccounts(true);
    try {
      const sources = await FundingSourceService.getFundingSources(accountId, 'all');
      const active = sources
        .filter((s) => s.status === 'active')
        .filter((s) => {
          if (selectedCurrency === 'NGN') return s.currency === null || s.currency === 'NGN';
          return s.currency === null || s.currency === 'USD';
        });
      setFundingSources(active);
      setSelectedFundingSourceId(active[0]?.id ?? null);
    } catch {
      toast.error('Failed to load connected bank accounts');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handlePlaidSuccess = async (publicToken: string) => {
    try {
      await FundingSourceService.connectAccount(accountId, publicToken);
      toast.success('Bank account connected');
      await fetchFundingSources();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect bank account');
    }
  };

  const handleManualSuccess = async (source: FundingSource) => {
    await fetchFundingSources();
    setSelectedFundingSourceId(source.id);
  };

  const handleDeleteFundingSource = async (fundingSourceId: string, sourceType: 'plaid' | 'manual', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to disconnect this bank account?')) return;
    setLoadingAccounts(true);
    try {
      await FundingSourceService.disconnectFundingSource(accountId, fundingSourceId, sourceType);
      await fetchFundingSources();
      toast.success('Bank account disconnected');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to disconnect bank account');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleContinue = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (depositMethod === 'ach' && !selectedFundingSourceId) {
      toast.error('Select a linked bank account for this ACH deposit');
      return;
    }

    setProcessing(true);
    try {
      const response = await TransferService.createDeposit(accountId, {
        amount: parseFloat(amount).toFixed(2),
        currency,
        method: depositMethod,
        funding_source_id: depositMethod === 'ach' ? selectedFundingSourceId || undefined : undefined,
        description: `${getDepositMethodLabel(depositMethod, currency)} deposit`,
        manual_options: depositMethod === 'manual_bank_transfer' ? {} : undefined,
        wire_options: depositMethod === 'wire' ? {} : undefined,
        idempotency_key: crypto.randomUUID(),
      });
      setDepositResponse(response);
      void useAccountStore.getState().fetchAccount(accountId, { silent: true }).catch(() => null);
      void fetchWallets(accountId);

      if (depositMethod === 'wire' || depositMethod === 'manual_bank_transfer') {
        setStep('instructions');
      } else {
        setStep('success');
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during deposit');
    } finally {
      setProcessing(false);
    }
  };

  const handleDone = () => {
    void useAccountStore.getState().fetchAccount(accountId, { silent: true }).catch(() => null);
    onSuccess?.();
    onCancel?.();
  };

  const renderAchAccountSelector = () => {
    if (loadingAccounts) {
      return (
        <div className="flex items-center gap-2 text-[#9DB9AB] text-sm py-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading connected accounts...
        </div>
      );
    }

    if (fundingSources.length === 0) {
      return (
        <div className="bg-[#07120F] border border-[#1F4536] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#9DB9AB]" />
            <p className="text-[#9DB9AB] text-sm">No bank accounts connected. Connect one to use ACH transfers.</p>
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            {currency !== 'NGN' && (
              <PlaidLink
                accountId={accountId}
                onSuccess={handlePlaidSuccess}
                className="bg-[#57B75C] hover:bg-[#57B75C]/90 text-white rounded-full font-medium h-10 flex items-center gap-2 w-full justify-center"
              >
                <Plus className="h-4 w-4" />
                Connect Bank Account
              </PlaidLink>
            )}
            <ManualBankLink
              accountId={accountId}
              onSuccess={handleManualSuccess}
              currency={currency as 'USD' | 'NGN'}
              className="bg-transparent border border-[#57B75C] text-[#57B75C] hover:bg-[#57B75C]/10 rounded-full font-medium h-10 flex items-center gap-2 w-full justify-center"
            >
              <Plus className="h-4 w-4" />
              Add Account Manually
            </ManualBankLink>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {fundingSources.map((source) => {
          const isSelected = selectedFundingSourceId === source.id;
          return (
            <div key={source.id} className="group relative w-full">
              <button
                type="button"
                onClick={() => setSelectedFundingSourceId(source.id)}
                className={cn(
                  'w-full min-w-0 flex items-center justify-between gap-2 rounded-xl border p-4 pr-14 text-left transition-all',
                  isSelected ? 'bg-[#57B75C]/10 border-[#57B75C] pr-16' : 'bg-[#07120F] border-[#1F4536] hover:border-[#57B75C]/50'
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Building2 className={cn('h-5 w-5 shrink-0', isSelected ? 'text-[#57B75C]' : 'text-[#9DB9AB]')} />
                  <div className="min-w-0">
                    <div className="text-white text-sm font-medium truncate">{source.bankName}</div>
                    <div className="text-[#9DB9AB] text-xs truncate">
                      {source.accountName ? `${source.accountName} ` : ''}
                      {source.mask ? `•••• ${source.mask}` : ''}
                    </div>
                  </div>
                </div>
              </button>
              <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5">
                <button
                  type="button"
                  onClick={(e) => void handleDeleteFundingSource(source.id, source.type, e)}
                  disabled={loadingAccounts}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#9DB9AB] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:text-red-400"
                  aria-label="Disconnect bank account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-[#57B75C]" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWireInstructions = () => {
    if (!depositResponse) return null;
    const wireDetails = depositResponse.method_details as AlpacaWireDetails | undefined;
    return (
      <div className="space-y-3">
        {wireDetails?.funding_details && wireDetails.funding_details.length > 0 ? (
          wireDetails.funding_details.map((detail, index) => (
            <div key={`${detail.account_number || 'wire'}-${index}`} className="rounded-lg border border-[#1F4536] p-3 text-sm">
              <div className="text-[#9DB9AB]">Bank</div>
              <div className="text-white font-semibold">{detail.bank_name || 'Provided by bank'}</div>
              <div className="mt-2 text-[#9DB9AB]">Account Number</div>
              <div className="text-white font-semibold">{detail.account_number || '—'}</div>
              <div className="mt-2 text-[#9DB9AB]">Routing Code</div>
              <div className="text-white font-semibold">{detail.routing_code || '—'}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#9DB9AB]">Wire instructions will be available once the provider prepares them.</p>
        )}
      </div>
    );
  };

  const stepTitle =
    step === 'selection' ? 'Deposit Funds' : step === 'instructions' ? 'Transfer Instructions' : 'Deposit Initiated';

  const stepDescription =
    step === 'selection'
      ? `Add funds to your ${currency} wallet.`
      : step === 'instructions'
        ? 'Follow the instructions below to complete your transfer.'
        : 'Your deposit is being processed.';

  const successMessage =
    depositMethod === 'ach'
      ? 'Your ACH deposit has been securely initiated and is pending clearance.'
      : depositMethod === 'manual_bank_transfer'
        ? 'Complete the bank transfer using the instructions provided. Your wallet will be credited once we receive your funds.'
        : 'Your wire transfer has been initiated. Settlement timing depends on your bank.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardContent className="px-8">
          <div className="w-full pb-6 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-2xl font-bold leading-8">{stepTitle}</h2>
              <p className="text-[#A1BEAD] text-sm leading-5">{stepDescription}</p>
            </div>
            {onCancel && step === 'selection' && (
              <button onClick={onCancel} className="p-2 rounded-full hover:bg-[#1E3D2F] text-[#A1BEAD] hover:text-white" disabled={processing}>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {step === 'selection' && enabledDepositOptions.length === 0 && (
            <div className="py-10 flex flex-col items-center gap-3 text-center">
              <Ban className="h-10 w-10 text-[#9DB9AB]" />
              <p className="text-sm font-medium text-white">Coming soon</p>
              <p className="text-xs text-[#9DB9AB]">{currency} wallet deposits are not yet available.</p>
            </div>
          )}

          {step === 'selection' && enabledDepositOptions.length > 0 && (
            <div className="flex flex-col gap-6">
              {showCurrencyPicker && (
                <div className="flex flex-col gap-2">
                  <Label className="text-[#E2E8F0] text-sm">Target wallet</Label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCurrencyMenu((v) => !v)}
                      className="w-full flex items-center justify-between h-11 px-4 bg-[#07120F] border border-[#1F4536] rounded-lg text-white text-sm"
                    >
                      {currency} wallet
                      <ChevronDown className="h-4 w-4 text-[#9DB9AB]" />
                    </button>
                    {showCurrencyMenu && (
                      <div className="absolute z-10 mt-1 w-full bg-[#0F2A20] border border-[#1F4536] rounded-lg overflow-hidden">
                        {walletCurrencies.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setCurrency(c);
                              setShowCurrencyMenu(false);
                              const opt = defaultDepositOptionForCurrency(c);
                              setDepositOptionId(opt.id);
                              setDepositMethod(opt.method);
                            }}
                            className={cn(
                              'w-full px-4 py-2 text-sm text-left hover:bg-[#1F4536]',
                              currency === c ? 'text-[#30D158]' : 'text-white'
                            )}
                          >
                            {c} wallet
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Label className="text-[#E2E8F0] text-sm">Payment method</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {depositOptions.map((option) => {
                    const Icon = METHOD_ICONS[option.method];
                    const isActive = depositOptionId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectDepositOption(option)}
                        disabled={option.disabled || processing}
                        className={cn(
                          'flex flex-col items-center justify-center p-4 rounded-lg border transition-all',
                          option.disabled && 'opacity-40 cursor-not-allowed',
                          isActive ? 'bg-[#57B75C]/10 border-[#57B75C]' : 'bg-[#07120F] border-[#1F4536] hover:border-[#57B75C]/50'
                        )}
                      >
                        <Icon className={cn('h-6 w-6 mb-1', isActive ? 'text-[#57B75C]' : 'text-[#9DB9AB]')} />
                        <span className="text-[#8DA69B] text-xs font-medium text-center">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="amount" className="text-[#E2E8F0] text-sm">Amount ({currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={processing}
                  className="h-11 bg-[#07120F] border-[#1F4536] text-white text-lg"
                />
              </div>

              {depositMethod === 'ach' && (
                <div className="flex flex-col gap-3">
                  <Label className="text-[#E2E8F0] text-sm">Bank Account</Label>
                  {renderAchAccountSelector()}
                </div>
              )}

              <div className="bg-[#124031] border border-blue-900/30 rounded-lg p-3 flex gap-3 items-start">
                <Info className="h-5 w-5 text-[#30D158] shrink-0 mt-0.5" />
                <p className="text-[#8DA69B] text-xs leading-5">
                  {depositMethod === 'ach'
                    ? 'ACH deposits usually take 1-3 business days to clear.'
                    : depositMethod === 'wire'
                      ? "Wire deposits are usually faster but your bank may charge a fee."
                      : currency === 'NGN'
                        ? "You'll receive bank transfer instructions on the next screen. Transfer the exact amount before the deposit expires."
                        : "You'll receive bank transfer instructions with a reference code. Include it in your transfer memo."}
                </p>
              </div>
            </div>
          )}

          {step === 'instructions' && depositResponse && (
            depositMethod === 'wire' ? (
              renderWireInstructions()
            ) : (
              <ManualTransferInstructions deposit={depositResponse} onDone={() => setStep('success')} />
            )
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#57B75C]/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-[#57B75C]" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Processing</h4>
                <p className="text-sm text-[#9DB9AB] max-w-[300px] mt-2">{successMessage}</p>
              </div>
              {depositMethod === 'ach' && depositResponse?.method_details && (
                <div className="w-full text-left text-sm bg-[#07120F] border border-[#1F4536] rounded-xl p-4">
                  <p className="text-[#9DB9AB]">
                    Transfer ID:{' '}
                    <span className="text-white">
                      {(depositResponse.method_details as AlpacaAchDetails).transfer_id || 'Pending'}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="w-full py-4 flex gap-3">
            {step === 'selection' && (
              <>
                <Button variant="ghost" onClick={onCancel} disabled={processing} className="flex-1 border border-[#1F4536] text-white">
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleContinue()}
                  disabled={processing || enabledDepositOptions.length === 0}
                  className="flex-1 bg-[#57B75C] hover:bg-[#57B75C]/90 text-white rounded-full"
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4 ml-1" /></>}
                </Button>
              </>
            )}
            {(step === 'instructions' || step === 'success') && (
              <Button variant="ghost" onClick={handleDone} className="w-full border border-[#1F4536] text-white">
                {step === 'instructions' ? 'Done' : 'Close'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
