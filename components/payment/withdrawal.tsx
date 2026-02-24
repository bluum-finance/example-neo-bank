'use client';

import { useState, useEffect } from 'react';
import { Building2, ArrowRight, ArrowLeft, Loader2, X, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { InvestmentService } from '@/services/investment.service';
import { PlaidLink } from '@/components/payment/plaid/plaid-link';
import { PlaidService, type ConnectedAccount } from '@/services/plaid.service';
import { toast } from 'sonner';

interface WithdrawalProps {
  accountId: string;
  availableBalance: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type Step = 1 | 2;
type WithdrawalMethod = 'plaid' | 'manual';

export function Withdrawal({ accountId, availableBalance, onSuccess, onCancel }: WithdrawalProps) {
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
          setConnectedAccounts(accounts);
        } catch (error: any) {
          console.error('Failed to load connected accounts:', error);
          // Don't show error toast, just allow new connection
        } finally {
          setLoadingAccounts(false);
        }
      }
    };

    loadConnectedAccounts();
  }, [accountId, withdrawalMethod]);

  const handlePlaidSuccess = async (token: string, metadata: any) => {
    setPublicToken(token);
    // If multiple accounts, select the first one
    if (metadata.accounts && metadata.accounts.length > 0) {
      setSelectedPlaidAccount(metadata.accounts[0].id);
    }

    // Save the connection to the backend
    setLoadingAccounts(true);
    try {
      await PlaidService.connectAccount(accountId, token);

      const accounts = await PlaidService.getConnectedAccounts(accountId);
      setConnectedAccounts(accounts);

      // Auto-select the newly connected account if available
      if (metadata.accounts && metadata.accounts.length > 0 && accounts.length > 0) {
        const newAccountId = metadata.accounts[0].id;
        // Find the account in the loaded accounts
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
    e.stopPropagation(); // Prevent account selection when clicking delete
    if (!confirm('Are you sure you want to disconnect this bank account?')) {
      return;
    }

    setLoadingAccounts(true);
    try {
      await PlaidService.disconnectItem(accountId, fundingSourceId);
      // Reload accounts after deletion
      const accounts = await PlaidService.getConnectedAccounts(accountId);
      setConnectedAccounts(accounts);

      // Clear selection if deleted account was selected
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
    return true;
  };

  const validateStep2 = () => {
    if (withdrawalMethod === 'plaid') {
      // For Plaid, we need either a public token (new connection) or a selected stored account
      if (!publicToken && connectedAccounts.length === 0) {
        toast.error('Please connect a bank account');
        return false;
      }
      return true;
    } else {
      // Manual bank transfer validation
      if (!bankName || bankName.trim().length < 2) {
        toast.error('Please enter the bank name');
        return false;
      }
      if (!routingNumber || routingNumber.length !== 9) {
        toast.error('Please enter a valid 9-digit routing number');
        return false;
      }
      if (!accountNumber || accountNumber.length < 4) {
        toast.error('Please enter a valid account number');
        return false;
      }
      if (!accountHolderName || accountHolderName.trim().length < 2) {
        toast.error('Please enter the account holder name');
        return false;
      }
      return true;
    }
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

      // Handle Plaid withdrawals
      if (withdrawalMethod === 'plaid') {
        const request: any = {
          amount: amountStr,
          currency: 'USD',
          description: `Plaid ACH withdrawal of $${amountStr}`,
        };

        // Use stored account if available, otherwise use new connection
        if (connectedAccounts.length > 0 && !publicToken) {
          // Find selected account or use first available
          const selectedItem =
            connectedAccounts.find((item) => item.accounts.some((acc) => acc.accountId === selectedPlaidAccount)) || connectedAccounts[0];

          // Use itemId (from API) or providerId (legacy) as fallback
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

        const response = await PlaidService.initiateWithdrawal(accountId, request);
        toast.success('Withdrawal initiated successfully! Funds will be transferred once the ACH completes.');
        onSuccess?.();
        return;
      }

      // Handle manual bank transfer
      toast.error('Manual bank transfers not available at this time');
      setProcessing(false);
      return;

      toast.success('Withdrawal request submitted successfully!');
      onSuccess?.();
    } catch (error: any) {
      // Error message is already extracted by apiClient interceptor
      const errorMessage = error.message || 'Failed to process withdrawal';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Withdraw Funds</h2>
        {onCancel && (
          <button onClick={onCancel} className="rounded-full p-1 hover:bg-muted transition-colors" disabled={processing}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Step 1: Amount and Withdrawal Method */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={processing}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Available: $
              {availableBalance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawalMethod">Withdrawal Method</Label>
            <Select
              id="withdrawalMethod"
              value={withdrawalMethod}
              onChange={(e) => setWithdrawalMethod(e.target.value as WithdrawalMethod)}
              disabled={processing}
            >
              <option value="plaid">Bank Transfer (ACH) via Plaid</option>
              <option value="manual">Manual Bank Transfer</option>
            </Select>
            {withdrawalMethod === 'plaid' && (
              <p className="text-xs text-muted-foreground">Securely connect your bank account for ACH transfers</p>
            )}
            {withdrawalMethod === 'manual' && <p className="text-xs text-muted-foreground">Enter your bank account details manually</p>}
          </div>
        </div>
      )}

      {/* Step 2: Bank Details */}
      {step === 2 && (
        <div className="space-y-4">
          {withdrawalMethod === 'plaid' ? (
            <>
              {loadingAccounts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : connectedAccounts.length > 0 ? (
                <div className="space-y-3">
                  <Label>Select Bank Account</Label>
                  {connectedAccounts.map((item) =>
                    item.accounts.map((account) => (
                      <div
                        key={account.accountId}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlaidAccount === account.accountId ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedPlaidAccount(account.accountId)}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{item.institutionName}</div>
                            <div className="text-sm text-muted-foreground">
                              {account.accountName} •••• {account.mask}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteAccount(item.id, e)}
                            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive/80 transition-colors"
                            title="Disconnect account"
                            disabled={loadingAccounts}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="pt-2">
                    <PlaidLink
                      accountId={accountId}
                      onSuccess={handlePlaidSuccess}
                      onExit={(error) => {
                        if (error) {
                          toast.error('Failed to connect bank account');
                        }
                      }}
                      className="w-full"
                    >
                      Connect Another Bank Account
                    </PlaidLink>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>Connect Bank Account</Label>
                  <PlaidLink
                    accountId={accountId}
                    onSuccess={handlePlaidSuccess}
                    onExit={(error) => {
                      if (error) {
                        toast.error('Failed to connect bank account');
                      }
                    }}
                    className="w-full"
                  />
                  {publicToken && <p className="text-sm text-green-600">✓ Bank account connected successfully</p>}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  type="text"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={processing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  type="text"
                  placeholder="John Doe"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  disabled={processing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  type="text"
                  placeholder="123456789"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(formatRoutingNumber(e.target.value))}
                  disabled={processing}
                  maxLength={9}
                />
                <p className="text-xs text-muted-foreground">9-digit routing number</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(formatAccountNumber(e.target.value))}
                  disabled={processing}
                />
              </div>
            </>
          )}

          {/* Info Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Transfer Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Bank transfers typically take 1-3 business days to process</li>
                <li>Please ensure all bank details are correct</li>
                <li>You will receive a confirmation email once the transfer is initiated</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2 pt-4">
        {step > 1 && (
          <Button variant="outline" className="flex-1" onClick={handleBack} disabled={processing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        {onCancel && step === 1 && (
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={processing}>
            Cancel
          </Button>
        )}
        {step === 1 ? (
          <Button className="flex-1" onClick={handleNext} disabled={processing}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button className="flex-1" onClick={handleNext} disabled={processing}>
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Withdrawal'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
