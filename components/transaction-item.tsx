import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { type Transaction } from '@/lib/mock-data';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isCredit = transaction.type === 'credit';
  const Icon = isCredit ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            isCredit
              ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <p className="font-medium">{transaction.description}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(transaction.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p
          className={cn(
            'font-semibold',
            isCredit ? 'text-green-600 dark:text-green-400' : 'text-foreground'
          )}
        >
          {isCredit ? '+' : '-'}₦{transaction.amount.toLocaleString()}
        </p>
        <Badge
          variant={
            transaction.status === 'completed'
              ? 'success'
              : transaction.status === 'pending'
                ? 'secondary'
                : 'destructive'
          }
          className="text-xs"
        >
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
}

