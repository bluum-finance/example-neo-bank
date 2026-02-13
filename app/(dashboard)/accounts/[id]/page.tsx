'use client';

import { use } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  MoreHorizontal,
  ChevronRight,
  Copy,
  Eye,
  Info,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { transactions } from '@/data/transaction';
import { TransactionDatatable } from '@/components/dashboard/transaction-datatable';

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-medium text-white">Checking •• 3168</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Balance Card */}
        <Card className="bg-[#0F2A20] border-[#1E3D2F]">
          <CardContent className="flex flex-col justify-between h-full">
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-[#A1BEAD]">Available</p>
                    <Info className="h-3.5 w-3.5 text-[#A1BEAD]" />
                  </div>
                  <div className="flex items-end">
                    <span className="text-4xl text-white font-medium leading-none">$0</span>
                    <span className="text-2xl text-[#B0B8BD] leading-none mb-0.5">.00</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button className="bg-[#57B75C] hover:bg-[#48a64a] text-white px-4 py-2 h-9 rounded-full shadow-sm">
                    <Plus className="h-4 w-4 mr-1.5" />
                    Deposit
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-[#1A3A2C] border-[#1E3D2F] text-white px-4 py-2 h-9 rounded-full hover:bg-[#244d3b]"
                  >
                    Transfer
                  </Button>
                </div>
              </div>

              <div className="flex gap-12">
                <div>
                  <p className="text-xs text-[#A1BEAD] mb-1">Type</p>
                  <p className="text-sm text-white font-medium">Checking</p>
                </div>
                <div>
                  <p className="text-xs text-[#A1BEAD] mb-1">Current</p>
                  <p className="text-sm text-white font-medium">$0.00</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2A4D3C]">
              <button className="text-sm text-[#30D158] font-medium inline-flex items-center gap-1 hover:text-[#28B34B] transition-colors">
                Set up an auto transfer rule
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Account details */}
        <Card className="bg-[#0F2A20] border-[#1E3D2F]">
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-[#A1BEAD]">Routing number</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white tracking-wider">121145433</span>
                  <button className="text-[#30D158] hover:text-[#28B34B] transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-[#A1BEAD]">Account number</p>
                  <Eye className="h-4 w-4 text-[#A1BEAD]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white tracking-wider">•••••••••3168</span>
                  <button className="text-[#30D158] hover:text-[#28B34B] transition-colors">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1 pt-1">
                  <p className="text-sm text-[#A1BEAD]">Bank</p>
                  <Info className="h-4 w-4 text-[#A1BEAD]" />
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-white font-medium">Column N.A.</span>
                    <button className="text-[#30D158] hover:text-[#28B34B] transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-[#A1BEAD]">1 Letterman Drive</span>
                    <button className="text-[#30D158] hover:text-[#28B34B] transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-[#A1BEAD] leading-relaxed">
                    Building A, Suite A4-700
                    <br />
                    San Francisco, CA 94129
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1E3D2F] flex justify-end">
              <button className="text-sm text-white font-medium inline-flex items-center gap-1 hover:text-[#30D158] transition-colors">
                Documents
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <div className="mt-2">
        <TransactionDatatable title="Transactions" showViewAll={false} />
      </div>
    </div>
  );
}
