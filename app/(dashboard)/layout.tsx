'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useHasLoaded, useIsAuthenticated } from '@/store/user.store';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { SidebarNav } from '@/components/navigation/sidebar-nav';
import { PageHeader } from '@/components/navigation/page-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const hasLoaded = useHasLoaded();

  useEffect(() => {
    if (!hasLoaded) return;

    if (!isAuthenticated) {
      router.push('/signin');
    }
  }, [router, hasLoaded, isAuthenticated]);

  if (!hasLoaded) {
    return null;
  }

  const excludePaths = ['/onboarding'];
  if (excludePaths.includes(pathname)) {
    return <>{children}</>;
  }

  const containerClassName = 'container mx-auto px-4 md:px-6 lg:max-w-6xl';

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className={containerClassName}>
          <PageHeader />
        </div>

        <div className={`${containerClassName} py-6`}>{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
