'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Plus, Snowflake, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCards, type Card as CardType } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function Cards() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCards().then((data) => {
      setCards(data);
      setLoading(false);
    });
  }, []);

  const handleRequestCard = () => {
    toast.info('Request card feature coming soon');
  };

  const handleFreeze = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? { ...card, status: card.status === 'frozen' ? 'active' : 'frozen' }
          : card
      )
    );
    const card = cards.find((c) => c.id === cardId);
    toast.success(
      `Card ${card?.status === 'frozen' ? 'unfrozen' : 'frozen'} successfully`
    );
  };

  const handleSetLimit = (cardId: string) => {
    toast.info('Set spending limit feature coming soon');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cards</h1>
          <p className="text-muted-foreground mt-1">
            Manage your debit cards
          </p>
        </div>
        <Button onClick={handleRequestCard}>
          <Plus className="h-4 w-4 mr-2" />
          Request Card
        </Button>
      </div>

      {/* Cards List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Cards</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading cards...
            </div>
          ) : cards.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="mb-4">No cards yet.</p>
              <Button onClick={handleRequestCard} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Request Your First Card
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card, index) => (
                <div key={card.id}>
                  <div className="space-y-4">
                    {/* Card Display */}
                    <div
                      className={`relative overflow-hidden rounded-xl p-6 text-white ${
                        card.type === 'physical'
                          ? 'bg-gradient-to-br from-blue-600 to-blue-800'
                          : 'bg-gradient-to-br from-purple-600 to-purple-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <p className="text-sm opacity-80 mb-1">Card Type</p>
                          <Badge
                            variant="outline"
                            className="bg-white/20 text-white border-white/30"
                          >
                            {card.type === 'physical' ? 'Physical' : 'Virtual'}
                          </Badge>
                        </div>
                        <CreditCard className="h-8 w-8 opacity-50" />
                      </div>
                      <div>
                        <p className="text-sm opacity-80 mb-2">Card Number</p>
                        <p className="text-2xl font-mono tracking-wider mb-4">
                          •••• •••• •••• {card.last4}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs opacity-80">Cardholder</p>
                            <p className="text-sm font-medium">
                              {card.cardholderName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs opacity-80">Expires</p>
                            <p className="text-sm font-medium">
                              {card.expiryDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Status
                        </span>
                        <Badge
                          variant={
                            card.status === 'active'
                              ? 'default'
                              : card.status === 'frozen'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {card.status.charAt(0).toUpperCase() +
                            card.status.slice(1)}
                        </Badge>
                      </div>
                      {card.spendingLimit && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Spending Limit
                          </span>
                          <span className="text-sm font-medium">
                            ${card.spendingLimit.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleFreeze(card.id)}
                      >
                        <Snowflake className="h-4 w-4 mr-2" />
                        {card.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSetLimit(card.id)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Set Limit
                      </Button>
                    </div>
                  </div>
                  {index < cards.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

