'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  Lock,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { InvestmentService } from '@/services/investment.service';
import { PlaidLink } from '@/components/plaid/plaid-link';
import { PlaidService, type ConnectedAccount } from '@/services/plaid.service';
import { toast } from 'sonner';

interface DepositProps {
  accountId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'card' | 'plaid';
type Step = 1 | 2;

export function Deposit({ accountId, onSuccess, onCancel }: DepositProps) {
  const [step, setStep] = useState<Step>(1);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);

  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Plaid fields
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [selectedPlaidAccount, setSelectedPlaidAccount] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

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
          // Don't show error toast, just allow new connection
        } finally {
          setLoadingAccounts(false);
        }
      }
    };

    loadConnectedAccounts();
  }, [accountId, paymentMethod, step]);

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
        const accountExists = accounts.some((item) =>
          item.accounts.some((acc) => acc.accountId === newAccountId)
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

  const handleDeleteAccount = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent account selection when clicking delete
    if (!confirm('Are you sure you want to disconnect this bank account?')) {
      return;
    }

    setLoadingAccounts(true);
    try {
      await PlaidService.disconnectItem(itemId);
      // Reload accounts after deletion
      const accounts = await PlaidService.getConnectedAccounts(accountId);
      setConnectedAccounts(accounts);

      // Clear selection if deleted account was selected
      if (
        connectedAccounts.some(
          (item) =>
            item.itemId === itemId &&
            item.accounts.some((acc) => acc.accountId === selectedPlaidAccount)
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
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (paymentMethod === 'plaid') {
      // For Plaid, we need either a public token (new connection) or a selected stored account
      if (!publicToken && connectedAccounts.length === 0) {
        toast.error('Please connect a bank account');
        return false;
      }
      return true;
    }
    if (paymentMethod === 'card') {
      const cardNumberDigits = cardNumber.replace(/\s/g, '');
      if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
        toast.error('Please enter a valid card number');
        return false;
      }
      if (!expiryDate || expiryDate.length !== 5) {
        toast.error('Please enter a valid expiry date (MM/YY)');
        return false;
      }
      const [month, year] = expiryDate.split('/');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt('20' + year, 10);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      if (monthNum < 1 || monthNum > 12) {
        toast.error('Please enter a valid month');
        return false;
      }
      if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        toast.error('Card has expired');
        return false;
      }
      if (!cvv || cvv.length < 3) {
        toast.error('Please enter a valid CVV');
        return false;
      }
      if (!cardholderName || cardholderName.trim().length < 2) {
        toast.error('Please enter the cardholder name');
        return false;
      }
      return true;
    }
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
    setProcessing(true);
    try {
      const amountStr = parseFloat(amount).toFixed(2);

      // Handle Plaid transfers
      if (paymentMethod === 'plaid') {
        const request: any = {
          amount: amountStr,
          currency: 'USD',
          description: `Plaid ACH deposit of $${amountStr}`,
        };

        // Use stored account if available, otherwise use new connection
        if (connectedAccounts.length > 0 && !publicToken) {
          // Find selected account or use first available
          const selectedItem =
            connectedAccounts.find((item) =>
              item.accounts.some((acc) => acc.accountId === selectedPlaidAccount)
            ) || connectedAccounts[0];

          request.item_id = selectedItem.itemId;
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

        const response = await PlaidService.initiateTransfer(accountId, request);
        toast.success(
          'Deposit initiated successfully! Funds will be available once the transfer completes.'
        );
        onSuccess?.();
        return;
      }

      // Handle card payment
      const fundingDetails = {
        funding_type: 'fiat' as const,
        fiat_currency: 'USD' as const,
        bank_account_id: `card_${cardNumber.replace(/\s/g, '').slice(-4)}`,
        method: 'ach' as const, // Using ACH as the method, but in reality this would be 'card'
      };

      await InvestmentService.fundAccount({
        account_id: accountId,
        amount: amountStr,
        funding_details: fundingDetails,
        description: `Card deposit of $${amountStr}`,
        external_reference_id: `card_${Date.now()}`,
      });

      toast.success('Deposit successful!');
      onSuccess?.();
    } catch (error: any) {
      // Error message is already extracted by apiClient interceptor
      const errorMessage = error.message || 'Failed to process deposit';
      toast.error(errorMessage);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Deposit Funds</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-full p-1 hover:bg-muted transition-colors"
            disabled={processing}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Step 1: Amount and Payment Method */}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              id="paymentMethod"
              value={paymentMethod || ''}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              disabled={processing}
            >
              <option value="">Select payment method</option>
              <option value="plaid">Bank Transfer (ACH) via Plaid</option>
              <option value="card">Card Payment - Instant deposit</option>
            </Select>
            {paymentMethod === 'plaid' && (
              <p className="text-xs text-muted-foreground">
                Securely connect your bank account for ACH transfers
              </p>
            )}
            {paymentMethod === 'card' && (
              <p className="text-xs text-muted-foreground">
                Instant deposit with credit or debit card
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Payment Details */}
      {step === 2 && (
        <div className="space-y-4">
          {paymentMethod === 'plaid' ? (
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
                          selectedPlaidAccount === account.accountId
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted'
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
                            onClick={(e) => handleDeleteAccount(item.itemId, e)}
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
                  {publicToken && connectedAccounts.length === 0 && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ Bank account connected successfully
                      </p>
                      <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                        You can proceed with this account or connect another one below.
                      </p>
                    </div>
                  )}
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
                </div>
              )}
            </>
          ) : paymentMethod === 'card' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    disabled={processing}
                    maxLength={19}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  placeholder="John Doe"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  disabled={processing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    disabled={processing}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))
                      }
                      disabled={processing}
                      maxLength={4}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Your payment information is encrypted and secure. We never store your full
                  card details.
                </p>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2 pt-4">
        {step > 1 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleBack}
            disabled={processing}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        {onCancel && step === 1 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={processing}
          >
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
              `Deposit $${parseFloat(amount || '0').toFixed(2)}`
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
