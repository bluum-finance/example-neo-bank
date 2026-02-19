'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  ArrowRight,
  Loader2,
  X,
  Trash2,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { PlaidLink } from '@/components/plaid/plaid-link';
import { PlaidService, type ConnectedAccount } from '@/services/plaid.service';
import { toast } from 'sonner';

interface WithdrawalDialogProps {
  accountId: string;
  availableBalance: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type WithdrawalMethod = 'plaid' | 'manual';
type Step = 1 | 2;

export function WithdrawalDialog({
  accountId,
  availableBalance,
  onSuccess,
  onCancel,
}: WithdrawalDialogProps) {
  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod>('plaid');

  // Bank transfer fields (for manual entry)
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  // Plaid fields
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [selectedPlaidAccount, setSelectedPlaidAccount] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const formatRoutingNumber = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 9);
  };

  const formatAccountNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };

  // Load connected Plaid accounts
  useEffect(() => {
    const loadConnectedAccounts = async () => {
      if (withdrawalMethod === 'plaid') {
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
        const accountExists = accounts.some((item) =>
          item.accounts.some((acc) => acc.accountId === newAccountId),
        );
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
        connectedAccounts.some(
          (item) =>
            item.id === fundingSourceId &&
            item.accounts.some((acc) => acc.accountId === selectedPlaidAccount),
        )
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
    if (
      withdrawalMethod === 'plaid' &&
      connectedAccounts.length > 0 &&
      !selectedPlaidAccount
    ) {
      toast.error('Please select a destination account');
      return false;
    }
    if (withdrawalMethod === 'plaid' && connectedAccounts.length === 0 && !publicToken) {
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

      if (withdrawalMethod === 'plaid') {
        const request: any = {
          amount: amountStr,
          currency: 'USD',
          description: `Plaid ACH withdrawal of $${amountStr}`,
        };

        if (connectedAccounts.length > 0 && !publicToken) {
          const selectedItem =
            connectedAccounts.find((item) =>
              item.accounts.some((acc) => acc.accountId === selectedPlaidAccount),
            ) || connectedAccounts[0];

          request.item_id = selectedItem.itemId || selectedItem.providerId;
          if (selectedPlaidAccount) {
            request.plaid_account_id = selectedPlaidAccount;
          } else if (selectedItem.accounts.length > 0) {
            request.plaid_account_id = selectedItem.accounts[0].accountId;
          }
        } else if (publicToken) {
          request.public_token = publicToken;
          if (selectedPlaidAccount) {
            request.plaid_account_id = selectedPlaidAccount;
          }
        }

        await PlaidService.initiateWithdrawal(accountId, request);
        toast.success(
          'Withdrawal initiated successfully! Funds will be transferred once the ACH completes.',
        );
        onSuccess?.();
        return;
      }

      toast.error('Manual bank transfers not available at this time');
      setProcessing(false);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process withdrawal';
      toast.error(errorMessage);
      setProcessing(false);
    }
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
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(8, 52, 35, 0.5)' }}
    >
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardContent className="px-8">
          {/* Header */}
          <div className="w-full pb-6 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h2 className="text-white text-2xl font-bold leading-8">Withdraw Funds</h2>
              <p className="text-[#A1BEAD] text-sm leading-5">
                Transfer money to your linked accounts securely.
              </p>
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
                <Label className="text-white text-sm font-medium leading-5">
                  Amount to withdraw
                </Label>
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
                  <Label className="text-white text-sm font-medium leading-5">
                    Destination account
                  </Label>
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
                              {item.institutionName} •••• {account.mask} -{' '}
                              {account.accountName}
                            </option>
                          )),
                        )}
                      </Select>
                      <div className="text-xs text-[#9DB9AB]">
                        Add a new linked account
                        <PlaidLink
                          accountId={accountId}
                          onSuccess={handlePlaidSuccess}
                          className="inline bg-transparent! p-1"
                        >
                          <span className="text-[#57B75C] text-sm hover:underline cursor-pointer font-medium">
                            Connect Account
                          </span>
                        </PlaidLink>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 gap-4 border-2 border-dashed border-[#1E3D2F] rounded-xl">
                      <Building2 className="h-12 w-12 text-[#1E3D2F]" />
                      <div className="text-center">
                        <p className="text-white font-medium">No bank account connected</p>
                        <p className="text-[#9DB9AB] text-sm">
                          Connect your bank to start withdrawing funds
                        </p>
                      </div>
                      <PlaidLink accountId={accountId} onSuccess={handlePlaidSuccess}>
                        <Button className="bg-[#57B75C] hover:bg-[#57B75C]/90 text-white px-8 rounded-full">
                          Connect Bank Account
                        </Button>
                      </PlaidLink>
                    </div>
                  )}
                </div>

                <div className="bg-[#124031] border border-[#1E3D2F]/50 rounded-lg p-3 flex gap-3 items-start">
                  <CheckCircle2 className="h-4 w-4 text-[#0FBD66] shrink-0 mt-0.5" />
                  <p className="text-[#A1BEAD] text-xs leading-[19.5px]">
                    Please ensure your bank details are up to date. Transfers to external
                    accounts may be subject to additional verification.
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
                      <span className="text-[#9DB9AB] text-sm">Destination Account</span>
                      <div className="text-right">
                        {getSelectedAccountDetails() ? (
                          <>
                            <div className="text-white text-sm font-medium">
                              {getSelectedAccountDetails()!.institutionName}
                            </div>
                            <div className="text-[#9DB9AB] text-xs mt-1">
                              {getSelectedAccountDetails()!.accountName} ••••{' '}
                              {getSelectedAccountDetails()!.mask}
                            </div>
                          </>
                        ) : (
                          <span className="text-[#9DB9AB] text-sm">Not selected</span>
                        )}
                      </div>
                    </div>

                    <div className="h-px w-full bg-[#1E3D2F]" />

                    <div className="flex justify-between items-center">
                      <span className="text-[#9DB9AB] text-sm">Estimated Arrival</span>
                      <span className="text-white text-sm font-medium">1-3 business days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#124031] border border-[#1E3D2F]/50 rounded-lg p-3 flex gap-3 items-start">
                  <CheckCircle2 className="h-4 w-4 text-[#0FBD66] shrink-0 mt-0.5" />
                  <p className="text-[#A1BEAD] text-xs leading-[19.5px]">
                    Please review all details carefully. Once confirmed, this withdrawal cannot
                    be cancelled.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="w-full py-4 flex flex-col gap-4">
            <p className="text-center text-[#A1BEAD] text-xs leading-[18px]">
              Withdrawals may take 1–3 business days depending on method.
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={step === 1 ? onCancel : handleBack}
                className="flex-1 px-6 h-11 bg-transparent border border-[#1E3D2F] hover:bg-[#1E3D2F] text-white rounded-lg font-medium"
                disabled={processing}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <Button
                onClick={handleNext}
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
                ) : (
                  <>
                    Confirm Withdrawal
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
