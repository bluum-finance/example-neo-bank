'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { SidebarNav } from '@/components/navigation/sidebar-nav';
import { PageHeader } from '@/components/navigation/page-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const authStatus = isAuthenticated();
    setAuthenticated(authStatus);
    if (!authStatus) {
      router.push('/signin');
    }
  }, [router]);

  // Don't render anything until we're on the client side
  if (!mounted) {
    return null;
  }

  if (!authenticated) {
    return null;
  }

  const containerClassName = 'container mx-auto px-4 md:px-6 lg:max-w-5xl';

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
