'use client';

import { useState, useEffect } from 'react';
import { FundingSourceService, type ConnectManualRequest, type FundingSource, type NigerianBank } from '@/services/funding-source.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

type SupportedCurrency = 'USD' | 'NGN';

const CURRENCY_COUNTRY: Record<SupportedCurrency, string> = {
  USD: 'US',
  NGN: 'NG',
};

interface ManualBankLinkProps {
  accountId: string;
  onSuccess: (fundingSource: FundingSource) => void;
  className?: string;
  children?: React.ReactNode;
  currency?: SupportedCurrency;
}

export function ManualBankLink({ accountId, onSuccess, className, children, currency: initialCurrency }: ManualBankLinkProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<SupportedCurrency>(initialCurrency ?? 'USD');
  const [nigerianBanks, setNigerianBanks] = useState<NigerianBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBankCode, setSelectedBankCode] = useState<string>('');

  const [formData, setFormData] = useState<ConnectManualRequest>({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    routing_number: '',
    bank_account_type: 'CHECKING',
  });

  // Fetch Nigerian banks when NGN is selected
  useEffect(() => {
    if (currency === 'NGN' && open) {
      setLoadingBanks(true);
      FundingSourceService.getNigerianBanks()
        .then((banks) => setNigerianBanks(banks))
        .catch((err) => {
          console.error('Failed to load Nigerian banks:', err);
          toast.error('Failed to load bank list');
        })
        .finally(() => setLoadingBanks(false));
    }
  }, [currency, open]);

  // Sync with parent currency prop when dialog opens
  useEffect(() => {
    if (open && initialCurrency) {
      setCurrency(initialCurrency);
    }
  }, [open, initialCurrency]);

  // Reset bank selection when currency changes
  useEffect(() => {
    setSelectedBankCode('');
    setFormData((prev) => ({ ...prev, bank_name: '' }));
  }, [currency]);

  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedBankCode(code);
    const bank = nigerianBanks.find((b) => b.code === code);
    if (bank) {
      setFormData((prev) => ({ ...prev, bank_name: bank.name }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bank_name || !formData.account_holder_name || !formData.account_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.account_number.length < 4) {
      toast.error('Account number must be at least 4 characters');
      return;
    }

    // Routing number validation only for USD
    if (currency === 'USD') {
      const rn = formData.routing_number?.trim();
      if (rn && rn.length < 9) {
        toast.error('Routing number must be 9 characters');
        return;
      }
    }

    setLoading(true);
    try {
      const payload: ConnectManualRequest = {
        ...formData,
        currency,
        country: CURRENCY_COUNTRY[currency],
        routing_number: formData.routing_number?.trim() || undefined,
      };

      // Include bank_code for Nigerian banks
      if (currency === 'NGN' && selectedBankCode) {
        payload.bank_code = selectedBankCode;
      }

      const source = await FundingSourceService.connectManualAccount(accountId, payload);
      toast.success('Manual bank account added successfully');
      setOpen(false);
      onSuccess(source);
      // Reset form
      setFormData({
        bank_name: '',
        account_holder_name: '',
        account_number: '',
        routing_number: '',
        bank_account_type: 'CHECKING',
      });
      setSelectedBankCode('');
    } catch (err: unknown) {
      console.error('Failed to connect manual account:', err);
      const message = err instanceof Error ? err.message : 'Failed to add bank account';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children || 'Add Account Manually'}
      </button>

      <Dialog open={open} onOpenChange={setOpen} cardClassName="py-0! bg-[#07120F]">
        <DialogContent className=" sm:max-w-125 text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#57B75C]/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-[#57B75C]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Add Manual Bank Account</DialogTitle>
                <DialogDescription className="text-[#9DB9AB]">Connect your bank account for deposits and withdrawals.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col px-2 gap-8 mt-2">
            <div className="rounded-xl">
              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-[#E2E8F0]">
                    Currency
                  </Label>
                  <Select
                    id="currency"
                    name="currency"
                    value={currency}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value as SupportedCurrency)}
                    className="h-11 bg-[#07120F] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                    disabled={true}
                  >
                    <option value="USD">USD — United States Dollar</option>
                    <option value="NGN">NGN — Nigerian Naira</option>
                  </Select>
                </div>

                {currency === 'NGN' ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bank_select" className="text-sm font-medium text-[#E2E8F0]">
                      Bank Name
                    </Label>
                    <Select
                      id="bank_select"
                      name="bank_select"
                      value={selectedBankCode}
                      onChange={handleBankSelect}
                      className="h-11 bg-[#0F2A20] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                      disabled={loading || loadingBanks}
                      required
                    >
                      <option value="">{loadingBanks ? 'Loading banks...' : 'Select a bank'}</option>
                      {nigerianBanks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bank_name" className="text-sm font-medium text-[#E2E8F0]">
                      Bank Name
                    </Label>
                    <Input
                      id="bank_name"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      placeholder="e.g. Chase Bank"
                      className="h-11 bg-[#07120F] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                      disabled={loading}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="account_holder_name" className="text-sm font-medium text-[#E2E8F0]">
                    Account Holder Name
                  </Label>
                  <Input
                    id="account_holder_name"
                    name="account_holder_name"
                    value={formData.account_holder_name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="h-11 bg-[#07120F] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="account_number" className="text-sm font-medium text-[#E2E8F0]">
                    Account Number
                  </Label>
                  <Input
                    id="account_number"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    placeholder="Enter account number"
                    className="h-11 bg-[#07120F] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                    disabled={loading}
                    required
                  />
                </div>

                {currency === 'USD' && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="routing_number" className="text-sm font-medium text-[#E2E8F0]">
                      Routing Number (Optional)
                    </Label>
                    <Input
                      id="routing_number"
                      name="routing_number"
                      value={formData.routing_number}
                      onChange={handleChange}
                      placeholder="9-digit routing number"
                      className="h-11 bg-[#07120F] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                      disabled={loading}
                    />
                  </div>
                )}

              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="bank_account_type" className="text-sm font-medium text-[#E2E8F0]">
                    Account Type
                  </Label>
                  <Select
                    id="bank_account_type"
                    name="bank_account_type"
                    value={formData.bank_account_type}
                    onChange={handleChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
                    className="h-11 bg-[#07120F] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-lg"
                    disabled={loading}
                  >
                    <option value="CHECKING">Checking</option>
                    <option value="SAVINGS">Savings</option>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="flex-1 h-11 bg-transparent border border-[#1F4536] hover:bg-[#1F4536] text-white rounded-lg font-medium"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-[#57B75C] hover:bg-[#57B75C]/90 text-white rounded-full font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Add Account'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
