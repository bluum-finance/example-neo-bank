'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Clock3, ShieldX, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { appendParamToUrl, getInvestRedirectUri } from '@/lib/utils';
import { AccountService } from '@/services/account.service';
import { useUser } from '@/store/user.store';
import { useAccountStore, type OnboardingGateStatus } from '@/store/account.store';
import type { ComplianceInitiationResponse } from '@/lib/bluum-api.types';

/** Route group `(invest)` + integration surfaces — not home/transactions/cards. */
const INVEST_PAGE_PREFIXES = ['/invest', '/auto-invest', '/financial-plan', '/trade', '/assets', '/chat'] as const;

function isInvestRelatedPage(pathname: string): boolean {
  return INVEST_PAGE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function pickVerificationUrl(data: ComplianceInitiationResponse): string | undefined {
  for (const check of data.complianceChecks ?? []) {
    const raw = (check.verificationUrl ?? (check as { verification_url?: string }).verification_url)?.trim();
    if (raw) return raw;
  }
  return undefined;
}

export function OnboardingStatusGate({
  status,
  accountId,
  onAccountRefresh,
}: {
  status: OnboardingGateStatus;
  accountId: string;
  onAccountRefresh: () => Promise<void>;
}) {
  const isRejected = status === 'REJECTED';
  const [restarting, setRestarting] = useState(false);

  const handleRestartCompliance = async () => {
    setRestarting(true);
    try {
      const data = await AccountService.restartComplianceWorkflow(accountId);
      const url = pickVerificationUrl(data);
      if (url) {
        const target = appendParamToUrl(url, 'redirect-uri', getInvestRedirectUri());
        toast.success('Retry verification to complete onboarding.');
        await onAccountRefresh();
        window.location.assign(target);
      } else {
        toast.message('Verification workflow updated', {
          description: 'Use Refresh to check your account status.',
        });
        await onAccountRefresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not start verification';
      toast.error(message);
    } finally {
      setRestarting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 backdrop-blur-md lg:inset-y-0 lg:left-64 lg:right-0 lg:top-0 lg:bottom-0"
      style={{ backgroundColor: 'rgba(5, 18, 12, 0.70)' }}
    >
      <div className="mx-auto w-full max-w-md shrink-0 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden rounded-2xl border border-[#1E3D2F] bg-[#0A1F16] shadow-2xl">
          <div
            className={`absolute inset-x-0 top-0 h-px ${isRejected ? 'bg-linear-to-r from-transparent via-[#FF8EA1]/60 to-transparent' : 'bg-linear-to-r from-transparent via-[#57B75C]/60 to-transparent'}`}
          />

          <div className="p-7">
            <div className="mb-5 flex items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  isRejected ? 'bg-[#7A1E2A]/30 ring-1 ring-[#FF8EA1]/20' : 'bg-[#1A3A2C] ring-1 ring-[#57B75C]/20'
                }`}
              >
                {isRejected ? <ShieldX className="h-5 w-5 text-[#FF8EA1]" /> : <Clock3 className="h-5 w-5 text-[#57B75C]" />}
              </div>

              <span className="px-2 py-0.5 text-sm font-medium tracking-wide">{isRejected ? 'Not Approved' : 'Under Review'}</span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-white">
              {isRejected ? 'Onboarding was not approved' : 'Your account is under review'}
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-[#8BA59A]">
              {isRejected
                ? "We couldn't approve your application at this time. Please reach out to our support team for next steps."
                : "We're verifying your information. You account will be active once your information is verified."}
            </p>

            <div className="my-5 h-px bg-[#1E3D2F]" />

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {!isRejected && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors active:scale-95 ${
                    isRejected
                      ? 'border border-[#2A4D3C] bg-transparent text-white hover:bg-[#1A3A2C]'
                      : 'bg-[#57B75C] text-white hover:bg-[#4ca651]'
                  }`}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </button>
              )}

              <button
                type="button"
                disabled={restarting}
                onClick={() => void handleRestartCompliance()}
                className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#57B75C] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4ca651] active:scale-95 disabled:pointer-events-none disabled:opacity-60
                   ${!isRejected ? 'bg-transparent border border-[#2A4D3C] text-white hover:bg-[#1A3A2C]' : 'bg-[#57B75C] text-white hover:bg-[#4ca651]'}`}
              >
                {restarting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                Retry verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders the onboarding overlay on invest/integration routes when `onboardingGateStatus` is set.
 * Status is updated by `fetchAccount`
 */
export function DashboardOnboardingGate() {
  const pathname = usePathname();
  const user = useUser();
  const onboardingGateStatus = useAccountStore((s) => s.onboardingGateStatus);
  const setOnboardingGateStatus = useAccountStore((s) => s.setOnboardingGateStatus);
  const fetchAccount = useAccountStore((s) => s.fetchAccount);

  const externalAccountId = user?.externalAccountId;
  const onInvestIntegration = isInvestRelatedPage(pathname);

  useEffect(() => {
    if (!externalAccountId) setOnboardingGateStatus(null);
  }, [externalAccountId, setOnboardingGateStatus]);

  if (!onboardingGateStatus || !externalAccountId || !onInvestIntegration) return null;

  return (
    <OnboardingStatusGate
      status={onboardingGateStatus}
      accountId={externalAccountId}
      onAccountRefresh={async () => {
        await fetchAccount(externalAccountId);
      }}
    />
  );
}
