'use client';

import { useState, useEffect } from 'react';
import { Building2, ArrowRight, Loader2, X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { PlaidLink } from '@/components/payment/plaid/plaid-link';
import { PlaidService, type ConnectedAccount } from '@/services/plaid.service';
import { TransferService } from '@/services/transfer.service';
import { toast } from 'sonner';
import type { ExternalWithdrawalResponse } from '@/types/bluum';

interface WithdrawalDialogProps {
  accountId: string;
  availableBalance: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type WithdrawalMethod = 'ach' | 'wire';
type Step = 1 | 2 | 3;

export function WithdrawalDialog({ accountId, availableBalance, onSuccess, onCancel }: WithdrawalDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod>('ach');
  const [withdrawalResponse, setWithdrawalResponse] = useState<ExternalWithdrawalResponse | null>(null);

  // Plaid fields
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [selectedPlaidAccount, setSelectedPlaidAccount] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Load connected Plaid accounts
  useEffect(() => {
    const loadConnectedAccounts = async () => {
      if (withdrawalMethod === 'ach') {
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
  }, [accountId, withdrawalMethod]);

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
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > availableBalance) {
      toast.error('Insufficient balance');
      return false;
    }
    if (withdrawalMethod === 'ach' && connectedAccounts.length > 0 && !selectedPlaidAccount) {
      toast.error('Please select a destination account');
      return false;
    }
    if (withdrawalMethod === 'ach' && connectedAccounts.length === 0 && !publicToken) {
      toast.error('Please connect a bank account');
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

      if (withdrawalMethod === 'ach') {
        if (connectedAccounts.length > 0 && !selectedPlaidAccount) {
          toast.error('Please select a destination account');
          setProcessing(false);
          return;
        }

        if (connectedAccounts.length === 0 && !publicToken) {
          toast.error('Please connect a bank account');
          setProcessing(false);
          return;
        }
      }

      const response = await TransferService.createWithdrawal(accountId, {
        amount: amountStr,
        currency: 'USD',
        method: withdrawalMethod,
        description:
          withdrawalMethod === 'ach'
            ? `ACH withdrawal of $${amountStr}`
            : `Wire withdrawal of $${amountStr}`,
        wire_options: withdrawalMethod === 'wire' ? {} : undefined,
      });

      setWithdrawalResponse(response);
      setStep(3);
      toast.success('Withdrawal initiated successfully!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process withdrawal';
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleDone = () => {
    onSuccess?.();
    onCancel?.();
  };

  const getSelectedAccountDetails = () => {
    if (!selectedPlaidAccount) return null;
    for (const item of connectedAccounts) {
      const account = item.accounts.find((acc) => acc.accountId === selectedPlaidAccount);
      if (account) {
        return {
          institutionName: item.institutionName,
          accountName: account.accountName,
          mask: account.mask,
        };
      }
    }
    return null;
  };

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
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <Label className="text-white text-sm font-medium leading-5">Amount to withdraw</Label>
                <span className="text-[#30D158] text-xs leading-4">
                  Available: $
                  {availableBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-4 text-[#A1BEAD] font-medium">$</div>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={processing}
                  className="h-11 pl-8 pr-24 bg-[#07120F] border-[#1E3D2F] text-white text-xl font-medium focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg placeholder:text-[#5A7065]"
                />
                <div className="absolute right-4 flex items-center gap-2">
                  <div className="bg-[#1A3329] rounded-md px-3 py-2">
                    <span className="text-white text-sm font-medium">USD</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#A1BEAD]" />
                </div>
              </div>
            </div>

            {step === 1 && (
              <>
                <div className="flex flex-col gap-2">
                  <Label className="text-white text-sm font-medium leading-5">Transfer method</Label>
                  <Select
                    value={withdrawalMethod}
                    onChange={(e) => setWithdrawalMethod(e.target.value as WithdrawalMethod)}
                    className="h-11 bg-[#07120F] border-[#1E3D2F] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                    disabled={processing}
                  >
                    <option value="ach">ACH (linked bank)</option>
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
                    <Label className="text-white text-sm font-medium leading-5">Destination account</Label>
                    {loadingAccounts ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#57B75C]" />
                      </div>
                    ) : connectedAccounts.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <Select
                          value={selectedPlaidAccount || ''}
                          onChange={(e) => setSelectedPlaidAccount(e.target.value || null)}
                          className="h-11 bg-[#07120F] border-[#1E3D2F] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                          disabled={processing}
                        >
                          <option value="">Select account...</option>
                          {connectedAccounts.map((item) =>
                            item.accounts.map((account) => (
                              <option key={account.accountId} value={account.accountId}>
                                {item.institutionName} •••• {account.mask} - {account.accountName}
                              </option>
                            ))
                          )}
                        </Select>
                        <div className="text-xs text-[#9DB9AB]">
                          Add a new linked account
                          <PlaidLink accountId={accountId} onSuccess={handlePlaidSuccess} className="inline bg-transparent! p-1">
                            <span className="text-[#57B75C] text-sm hover:underline cursor-pointer font-medium">Connect Account</span>
                          </PlaidLink>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 gap-4 border-2 border-dashed border-[#1E3D2F] rounded-xl">
                        <Building2 className="h-12 w-12 text-[#1E3D2F]" />
                        <div className="text-center">
                          <p className="text-white font-medium">No bank account connected</p>
                          <p className="text-[#9DB9AB] text-sm">Connect your bank to start withdrawing funds</p>
                        </div>
                        <PlaidLink accountId={accountId} onSuccess={handlePlaidSuccess}>
                          <Button className="bg-[#57B75C] hover:bg-[#57B75C]/90 text-white px-8 rounded-full">Connect Bank Account</Button>
                        </PlaidLink>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#07120F] border border-[#1E3D2F] rounded-lg p-4 text-sm text-[#9DB9AB]">
                    Wire transfer instructions will be shown once your withdrawal is submitted.
                  </div>
                )}

                <div className="bg-[#124031] border border-[#1E3D2F]/50 rounded-lg p-3 flex gap-3 items-start">
                  <CheckCircle2 className="h-4 w-4 text-[#0FBD66] shrink-0 mt-0.5" />
                  <p className="text-[#A1BEAD] text-xs leading-[19.5px]">
                    Please ensure your bank details are up to date. Transfers to external accounts may be subject to additional
                    verification.
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-white text-lg font-semibold">Review Withdrawal</h3>

                  <div className="bg-[#07120F] border border-[#1E3D2F] rounded-lg p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[#9DB9AB] text-sm">Amount</span>
                      <span className="text-white text-lg font-semibold">
                        $
                        {parseFloat(amount || '0').toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="h-px w-full bg-[#1E3D2F]" />

                    <div className="flex justify-between items-start">
                      <span className="text-[#9DB9AB] text-sm">Destination</span>
                      <div className="text-right">
                        {withdrawalMethod === 'ach' ? (
                          getSelectedAccountDetails() ? (
                            <>
                              <div className="text-white text-sm font-medium">{getSelectedAccountDetails()!.institutionName}</div>
                              <div className="text-[#9DB9AB] text-xs mt-1">
                                {getSelectedAccountDetails()!.accountName} •••• {getSelectedAccountDetails()!.mask}
                              </div>
                            </>
                          ) : (
                            <span className="text-[#9DB9AB] text-sm">Not selected</span>
                          )
                        ) : (
                          <span className="text-[#9DB9AB] text-sm">Wire transfer</span>
                        )}
                      </div>
                    </div>

                    <div className="h-px w-full bg-[#1E3D2F]" />

                    <div className="flex justify-between items-center">
                      <span className="text-[#9DB9AB] text-sm">Estimated Arrival</span>
                      <span className="text-white text-sm font-medium">
                        {withdrawalMethod === 'wire' ? 'Same day (business hours)' : '1-3 business days'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#124031] border border-[#1E3D2F]/50 rounded-lg p-3 flex gap-3 items-start">
                  <CheckCircle2 className="h-4 w-4 text-[#0FBD66] shrink-0 mt-0.5" />
                  <p className="text-[#A1BEAD] text-xs leading-[19.5px]">
                    Please review all details carefully. Once confirmed, this withdrawal cannot be cancelled.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && withdrawalResponse && (
              <div className="flex flex-col gap-6">
                <div className="bg-[#07120F] border border-[#1E3D2F] rounded-lg p-4 flex flex-col gap-3">
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
                      <div className="text-white font-semibold">${parseFloat(withdrawalResponse.amount).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[#9DB9AB]">Withdrawal ID</div>
                      <div className="text-white font-semibold">{withdrawalResponse.withdrawal_id}</div>
                    </div>
                  </div>
                </div>

                {withdrawalResponse.method_details && (
                  <div className="bg-[#07120F] border border-[#1E3D2F]/70 rounded-xl p-5 space-y-3">
                    <h4 className="text-white font-semibold">Transfer details</h4>
                    <div className="text-sm text-[#9DB9AB]">
                      Transfer ID:{' '}
                      <span className="text-white">{(withdrawalResponse.method_details as any).transferId || 'Pending assignment'}</span>
                    </div>
                    <div className="text-sm text-[#9DB9AB]">
                      Provider status:{' '}
                      <span className="text-white">{(withdrawalResponse.method_details as any).alpacaStatus || 'Pending'}</span>
                    </div>
                  </div>
                )}
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
                  className="flex-1 px-6 h-11 bg-transparent border border-[#1E3D2F] hover:bg-[#1E3D2F] text-white rounded-lg font-medium"
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
