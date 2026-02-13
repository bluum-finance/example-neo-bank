'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Plus, Snowflake, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCards, type Card as CardType } from '@/lib/mock-data';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Cards() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await getCards();
        setCards(data);
      } catch (error) {
        toast.error('Failed to fetch cards');
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cards</h1>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Card
        </Button>
      </div>

      {/* Tabs (Manage, Subscriptions) */}
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="w-full h-auto bg-transparent border-b border-[#1E3D2F] rounded-none p-0 flex justify-start gap-8">
          <TabsTrigger
            value="manage"
            className="bg-transparent rounded-none border-b-2 border-transparent px-1 py-4 text-sm font-medium text-[#A1BEAD] data-[state=active]:border-[#30D158] data-[state=active]:text-[#30D158] hover:text-foreground transition-all"
          >
            Manage
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="bg-transparent rounded-none border-b-2 border-transparent px-1 py-4 text-sm font-medium text-[#A1BEAD] data-[state=active]:border-[#30D158] data-[state=active]:text-[#30D158] hover:text-foreground transition-all"
          >
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="mt-6">
          <div className="w-full overflow-hidden rounded-xl border border-[#1E3D2F] bg-[#0F2A20]">
            {/* Table Header */}
            <div className="flex items-center bg-[#0E231F] px-6 py-3">
              <div className="w-[240px] text-[10px] font-bold uppercase tracking-[0.1em] text-[#8DA69B]">
                Cardholder
              </div>
              <div className="w-[178px] text-[10px] font-bold uppercase tracking-[0.1em] text-[#8DA69B]">
                Card
              </div>
              <div className="flex-1 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#8DA69B]">
                Spent this month
              </div>
              <div className="w-[126px] text-center text-[10px] font-bold uppercase tracking-[0.1em] text-[#8DA69B]">
                Type
              </div>
              <div className="w-[198px] text-[10px] font-bold uppercase tracking-[0.1em] text-[#8DA69B]">
                Account
              </div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CreditCard className="mb-4 h-12 w-12 opacity-20" />
                  <p>No cards found</p>
                </div>
              ) : (
                cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center border-t border-[#2A4D3C] px-6 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-[240px] flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {card.cardholderName}
                      </span>
                    </div>
                    <div className="w-[178px] flex items-center gap-3">
                      <div className="flex h-6 w-9 items-center justify-center rounded bg-[#124031] border border-[#1E3D2F]">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#D1D5DB]" />
                      </div>
                      <span className="text-sm text-white">••{card.last4}</span>
                    </div>
                    <div className="flex-1 text-right text-sm text-white">
                      ${card.spentThisMonth.toFixed(2)}
                    </div>
                    <div className="w-[126px] text-center text-sm text-white capitalize">
                      {card.type}
                    </div>
                    <div className="w-[198px] text-sm text-white">{card.accountName}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <div className="text-foreground">Manage your subscriptions here</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
