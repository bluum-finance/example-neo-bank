'use client';

import { usePlaidLink } from 'react-plaid-link';
import { useEffect, useState } from 'react';
import { PlaidService } from '@/services/plaid.service';
import { Button } from '@/components/ui/button';

interface PlaidLinkProps {
  accountId: string;
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: (error: any, metadata: any) => void;
  onEvent?: (eventName: string, metadata: any) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PlaidLink({
  accountId,
  onSuccess,
  onExit,
  onEvent,
  className,
  children,
}: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setError(null);
        const token = await PlaidService.getLinkToken(accountId);
        setLinkToken(token);
      } catch (err: any) {
        console.error('Failed to get link token:', err);
        setError(err.response?.data?.error || 'Failed to initialize Plaid Link');
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchLinkToken();
    }
  }, [accountId]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      onSuccess(publicToken, metadata);
    },
    onExit: (err, metadata) => {
      onExit?.(err, metadata);
    },
    onEvent: (eventName, metadata) => {
      onEvent?.(eventName, metadata);
    },
  });

  if (loading) {
    return (
      <Button disabled className={className}>
        Loading...
      </Button>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!linkToken) {
    return (
      <div className="text-sm text-red-600">
        Failed to initialize Plaid Link
      </div>
    );
  }

  return (
    <Button
      onClick={() => open()}
      disabled={!ready}
      className={className}
    >
      {children || 'Connect Bank Account'}
    </Button>
  );
}

