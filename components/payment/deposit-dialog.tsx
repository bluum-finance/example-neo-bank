'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeftRight, Wallet, Loader2, X, Info, ChevronDown, Building2, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { AccountsIcon } from '../icons/nav-icons';
import { TransferService } from '@/services/transfer.service';
import { PlaidService, type ConnectedAccount } from '@/services/plaid.service';
import { PlaidLink } from './plaid/plaid-link';
import { useAccountStore } from '@/store/account.store';
import type { ExternalDepositResponse } from '@/types/bluum';

interface DepositDialogProps {
  accountId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type DepositMethod = 'ach' | 'wire' | 'manual_bank_transfer';
type Step = 1 | 2 | 3;

export function DepositDialog({ accountId, onSuccess, onCancel }: DepositDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState<DepositMethod>('manual_bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [depositResponse, setDepositResponse] = useState<ExternalDepositResponse | null>(null);

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedPlaidItemId, setSelectedPlaidItemId] = useState<string | null>(null);

  const DEPOSIT_METHODS = [
    { id: 'manual_bank_transfer', label: 'Digital Wallet', icon: Wallet },
    { id: 'ach', label: 'ACH Transfer', icon: AccountsIcon },
    { id: 'wire', label: 'Wire Transfer', icon: ArrowLeftRight },
  ] as const;

  const METHOD_LABELS: Record<DepositMethod, string> = {
    ach: 'ACH Transfer',
    wire: 'Wire Transfer',
    manual_bank_transfer: 'Digital Wallet',
  };

  useEffect(() => {
    if (depositMethod === 'ach') {
      fetchConnectedAccounts();
    }
  }, [depositMethod]);

  const fetchConnectedAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const items = await PlaidService.getConnectedAccounts(accountId);
      setConnectedAccounts(items);
      if (items.length > 0 && !selectedPlaidItemId) {
        setSelectedPlaidItemId(items[0].itemId || items[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to load connected bank accounts');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handlePlaidSuccess = async (publicToken: string) => {
    try {
      await PlaidService.connectAccount(accountId, publicToken);
      toast.success('Bank account connected');
      await fetchConnectedAccounts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to connect bank account');
    }
  };

  const validateStep1 = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    if (depositMethod === 'ach' && connectedAccounts.length === 0) {
      toast.error('Please connect a bank account for ACH transfers');
      return false;
    }
    if (depositMethod === 'ach' && !selectedPlaidItemId) {
      toast.error('Please select a bank account');
      return false;
    }
    return true;
  };

  const getArrivalEstimate = (method: DepositMethod) => {
    if (method === 'wire') return 'Same day (business hours)';
    if (method === 'manual_bank_transfer') return '1-3 business days after transfer';
    return '1-3 business days';
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const amountStr = parseFloat(amount).toFixed(2);
      const response = await TransferService.createDeposit(accountId, {
        amount: amountStr,
        currency: 'USD',
        method: depositMethod,
        funding_source_id: depositMethod === 'ach' ? selectedPlaidItemId || undefined : undefined,
        description: `${METHOD_LABELS[depositMethod]} deposit`,
        manual_options: depositMethod === 'manual_bank_transfer' ? {} : undefined,
        wire_options: depositMethod === 'wire' ? {} : undefined,
      });

      setDepositResponse(response);
      setStep(3);
      toast.success('Deposit initiated successfully');
      useAccountStore.getState().fetchAccount(accountId).catch(() => null);
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.error(error.message || 'An error occurred during deposit');
    } finally {
      setProcessing(false);
    }
  };

  const handleDone = () => {
    onSuccess?.();
    onCancel?.();
  };

  const selectedAccount = connectedAccounts.find(
    (item) => (item.itemId || item.id) === selectedPlaidItemId,
  );

  const renderAchAccountSelector = () => {
    if (loadingAccounts) {
      return (
        <div className="flex items-center gap-2 text-[#9DB9AB] text-sm py-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading connected accounts...
        </div>
      );
    }

    if (connectedAccounts.length === 0) {
      return (
        <div className="bg-[#07120F] border border-[#1F4536] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#9DB9AB]" />
            <p className="text-[#9DB9AB] text-sm">No bank accounts connected. Connect one to use ACH transfers.</p>
          </div>
          <PlaidLink
            accountId={accountId}
            onSuccess={handlePlaidSuccess}
            className="bg-[#57B75C] hover:bg-[#57B75C]/90 text-white rounded-full font-medium h-10 flex items-center gap-2 w-full justify-center"
          >
            <Plus className="h-4 w-4" />
            Connect Bank Account
          </PlaidLink>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {connectedAccounts.map((item) => {
          const itemKey = item.itemId || item.id;
          const isSelected = selectedPlaidItemId === itemKey;
          return (
            <button
              key={itemKey}
              onClick={() => setSelectedPlaidItemId(itemKey)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                isSelected ? 'bg-[#57B75C]/10 border-[#57B75C]' : 'bg-[#07120F] border-[#1F4536] hover:border-[#57B75C]/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className={`h-5 w-5 ${isSelected ? 'text-[#57B75C]' : 'text-[#9DB9AB]'}`} />
                <div>
                  <div className="text-white text-sm font-medium">{item.institutionName}</div>
                  <div className="text-[#9DB9AB] text-xs">
                    {item.accounts.length} account{item.accounts.length !== 1 ? 's' : ''} linked
                  </div>
                </div>
              </div>
              {isSelected && <CheckCircle2 className="h-5 w-5 text-[#57B75C]" />}
            </button>
          );
        })}
        <PlaidLink
          accountId={accountId}
          onSuccess={handlePlaidSuccess}
          className="flex items-center gap-2 text-[#57B75C] text-sm font-medium hover:underline bg-transparent border-none p-0 h-auto justify-start"
        >
          <Plus className="h-4 w-4" />
          Add another bank
        </PlaidLink>
      </div>
    );
  };

  const renderDepositInstructions = () => {
    if (!depositResponse) return null;

    const methodDetails = depositResponse.method_details as any;
    const responseMethod = depositResponse.method || depositMethod;
    const fundingDetails = methodDetails?.fundingDetails || methodDetails?.funding_details;
    const referenceCode = methodDetails?.referenceCode;
    const bankDetails = methodDetails?.bankDetails;
    const expiresAt = depositResponse.expires_at || methodDetails?.expiresAt;

    return (
      <div className="flex flex-col gap-4">
        <div className="bg-[#07120F] border border-[#1F4536] rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-white font-bold text-lg">Deposit submitted</h3>
              <p className="text-[#9DB9AB] text-sm">Your {METHOD_LABELS[responseMethod as DepositMethod] ?? responseMethod} is now pending.</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#9DB9AB]">Status</div>
              <div className="text-white text-sm font-semibold capitalize">{depositResponse.status}</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[#9DB9AB]">Amount</div>
              <div className="text-white font-semibold">${parseFloat(depositResponse.amount).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[#9DB9AB]">Deposit ID</div>
              <div className="text-white font-semibold">{depositResponse.deposit_id}</div>
            </div>
          </div>
        </div>

        {responseMethod === 'ach' && (
          <div className="bg-[#07120F] border border-[#1F4536]/70 rounded-xl p-5 space-y-3">
            <h4 className="text-white font-semibold">ACH transfer details</h4>
            <div className="text-sm text-[#9DB9AB]">
              Transfer ID: <span className="text-white">{methodDetails?.transferId || 'Pending assignment'}</span>
            </div>
            <div className="text-sm text-[#9DB9AB]">
              Provider status: <span className="text-white">{methodDetails?.alpacaStatus || 'Pending'}</span>
            </div>
          </div>
        )}

        {responseMethod === 'wire' && (
          <div className="bg-[#07120F] border border-[#1F4536]/70 rounded-xl p-5 space-y-3">
            <h4 className="text-white font-semibold">Wire instructions</h4>
            {Array.isArray(fundingDetails) && fundingDetails.length > 0 ? (
              <div className="space-y-3 text-sm">
                {fundingDetails.map((detail: any, index: number) => (
                  <div key={`${detail?.account_number || 'wire'}-${index}`} className="rounded-lg border border-[#1F4536] p-3">
                    <div className="text-[#9DB9AB]">Bank</div>
                    <div className="text-white font-semibold">{detail?.bank_name || 'Provided by bank'}</div>
                    <div className="mt-2 text-[#9DB9AB]">Account Number</div>
                    <div className="text-white font-semibold">{detail?.account_number || 'Provided by bank'}</div>
                    <div className="mt-2 text-[#9DB9AB]">Routing Code</div>
                    <div className="text-white font-semibold">{detail?.routing_code || 'Provided by bank'}</div>
                    <div className="mt-2 text-[#9DB9AB]">Currency</div>
                    <div className="text-white font-semibold">{detail?.currency || 'USD'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#9DB9AB]">Wire instructions will be available once the provider prepares them.</p>
            )}
          </div>
        )}

        {responseMethod === 'manual_bank_transfer' && (
          <div className="bg-[#07120F] border border-[#1F4536]/70 rounded-xl p-5 space-y-3">
            <h4 className="text-white font-semibold">Digital wallet instructions</h4>
            <div className="text-sm text-[#9DB9AB]">
              Reference code: <span className="text-white font-semibold">{referenceCode || 'Pending assignment'}</span>
            </div>
            {bankDetails && (
              <div className="space-y-2 text-sm">
                {bankDetails.bankName && (
                  <div className="text-[#9DB9AB]">Bank: <span className="text-white">{bankDetails.bankName}</span></div>
                )}
                {bankDetails.accountName && (
                  <div className="text-[#9DB9AB]">Account Name: <span className="text-white">{bankDetails.accountName}</span></div>
                )}
                {bankDetails.accountNumber && (
                  <div className="text-[#9DB9AB]">Account Number: <span className="text-white">{bankDetails.accountNumber}</span></div>
                )}
                {bankDetails.routingNumber && (
                  <div className="text-[#9DB9AB]">Routing Number: <span className="text-white">{bankDetails.routingNumber}</span></div>
                )}
                {bankDetails.swiftCode && (
                  <div className="text-[#9DB9AB]">SWIFT: <span className="text-white">{bankDetails.swiftCode}</span></div>
                )}
                {bankDetails.instructions && (
                  <div className="text-[#9DB9AB]">Instructions: <span className="text-white">{bankDetails.instructions}</span></div>
                )}
              </div>
            )}
            {expiresAt && (
              <div className="text-sm text-[#9DB9AB]">
                Expires: <span className="text-white">{new Date(expiresAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
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
                  <Label className="text-[#E2E8F0] text-sm font-medium leading-5">Deposit Method</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {DEPOSIT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isActive = depositMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setDepositMethod(method.id)}
                          className={`relative flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                            isActive
                              ? 'bg-[#57B75C]/10 border-[#57B75C]'
                              : 'bg-[#07120F] border-[#1F4536] hover:border-[#57B75C]/50'
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

                {/* ACH bank account selector */}
                {depositMethod === 'ach' && (
                  <div className="flex flex-col gap-3">
                    <Label className="text-[#E2E8F0] text-sm font-medium leading-5">Bank Account</Label>
                    {renderAchAccountSelector()}
                  </div>
                )}

                <div className="bg-[#07120F] border border-[#1F4536]/50 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9DB9AB] text-sm">Processing Fee</span>
                    <span className="text-white text-sm font-medium">Free</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9DB9AB] text-sm">Estimated Arrival</span>
                    <span className="text-white text-sm font-medium">{getArrivalEstimate(depositMethod)}</span>
                  </div>
                </div>

                <div className="bg-[#124031] border border-blue-900/30 rounded-lg p-3 flex gap-3 items-start">
                  <Info className="h-5 w-5 text-[#30D158] shrink-0 mt-0.5" />
                  <p className="text-[#8DA69B] text-xs leading-5">
                    Deposits are subject to verification and settlement timelines. ACH deposits typically arrive within 1-3 business days,
                    while wires may post sooner based on your bank.
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Confirmation */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="bg-[#07120F] border border-[#1F4536] rounded-xl p-6 flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-[#57B75C]/10 rounded-full flex items-center justify-center">
                      {depositMethod === 'ach' && <AccountsIcon className="h-8 w-8 text-[#57B75C]" />}
                      {depositMethod === 'wire' && <ArrowLeftRight className="h-8 w-8 text-[#57B75C]" />}
                      {depositMethod === 'manual_bank_transfer' && <Wallet className="h-8 w-8 text-[#57B75C]" />}
                    </div>
                    <div className="text-center">
                      <h3 className="text-white font-bold text-lg">Confirm Deposit</h3>
                      <p className="text-[#9DB9AB] text-sm">You are about to deposit funds via {METHOD_LABELS[depositMethod]}.</p>
                    </div>
                    <div className="w-full border-t border-[#1F4536] pt-4 mt-2 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#9DB9AB] text-sm">Amount</span>
                        <span className="text-white font-bold">
                          ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#9DB9AB] text-sm">Deposit Method</span>
                        <span className="text-white font-medium">{METHOD_LABELS[depositMethod]}</span>
                      </div>
                      {depositMethod === 'ach' && selectedAccount && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#9DB9AB] text-sm">Bank</span>
                          <span className="text-white font-medium">{selectedAccount.institutionName}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-[#9DB9AB] text-sm">Estimated Arrival</span>
                        <span className="text-white font-medium">{getArrivalEstimate(depositMethod)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && <div className="flex flex-col gap-6">{renderDepositInstructions()}</div>}
          </div>

          {/* Footer */}
          <div className="w-full py-4 bg-[#0F2A20] border-t border-[#1F4536] flex justify-end items-center gap-3">
            {step < 3 && (
              <Button
                variant="ghost"
                onClick={step === 1 ? onCancel : handleBack}
                className="px-6 py-2.5 bg-[#1F4536] hover:bg-[#1F4536]/80! text-white rounded-full font-medium h-11 min-w-25"
                disabled={processing}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
            )}
            <Button
              onClick={step === 3 ? handleDone : handleNext}
              disabled={processing || (depositMethod === 'ach' && step === 1 && loadingAccounts)}
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
              ) : step === 2 ? (
                <>
                  Confirm Deposit
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>Done</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
