'use client';

import { useState } from 'react';
import { FundingSourceService, type ConnectManualRequest, type FundingSource } from '@/services/funding-source.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ManualBankLinkProps {
  accountId: string;
  onSuccess: (fundingSource: FundingSource) => void;
  className?: string;
  children?: React.ReactNode;
}

export function ManualBankLink({ accountId, onSuccess, className, children }: ManualBankLinkProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ConnectManualRequest>({
    bank_name: '',
    account_holder_name: '',
    account_number: '',
    routing_number: '',
    bank_account_type: 'CHECKING',
  });

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

    const rn = formData.routing_number?.trim();
    if (rn && rn.length < 9) {
      toast.error('Routing number must be 9 characters');
      return;
    }

    setLoading(true);
    try {
      const source = await FundingSourceService.connectManualAccount(accountId, formData);
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
    } catch (err: any) {
      console.error('Failed to connect manual account:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to add bank account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children || 'Add Account Manually'}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#07120F] border-[#1F4536] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Manual Bank Account</DialogTitle>
          <DialogDescription className="text-[#9DB9AB]">
            Enter your bank details to connect your account manually.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bank_name" className="text-sm font-medium text-[#E2E8F0]">Bank Name</Label>
            <Input
              id="bank_name"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              placeholder="e.g. Chase Bank"
              className="bg-[#0F2A20] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C]"
              disabled={loading}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="account_holder_name" className="text-sm font-medium text-[#E2E8F0]">Account Holder Name</Label>
            <Input
              id="account_holder_name"
              name="account_holder_name"
              value={formData.account_holder_name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="bg-[#0F2A20] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C]"
              disabled={loading}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="account_number" className="text-sm font-medium text-[#E2E8F0]">Account Number</Label>
            <Input
              id="account_number"
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              placeholder="Enter account number"
              className="bg-[#0F2A20] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C]"
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="routing_number" className="text-sm font-medium text-[#E2E8F0]">Routing Number (Optional)</Label>
            <Input
              id="routing_number"
              name="routing_number"
              value={formData.routing_number}
              onChange={handleChange}
              placeholder="Enter routing number"
              className="bg-[#0F2A20] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C]"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="bank_account_type" className="text-sm font-medium text-[#E2E8F0]">Account Type</Label>
            <Select
              id="bank_account_type"
              name="bank_account_type"
              value={formData.bank_account_type}
              // @ts-ignore
              onChange={handleChange}
              className="h-10 bg-[#0F2A20] border-[#1F4536] text-white focus-visible:ring-0 focus-visible:border-[#57B75C] rounded-md"
              disabled={loading}
            >
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="bg-transparent hover:bg-[#1E3D2F] text-white"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#57B75C] hover:bg-[#57B75C]/90 text-white"
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
