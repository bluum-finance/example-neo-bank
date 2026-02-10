import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#66D07A] mb-4" style={{ fontFamily: 'Inter' }}>
            404
          </h1>
          <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: 'Inter' }}>
            Page Not Found
          </h2>
          <p className="text-[#9CA3AF] text-base leading-6" style={{ fontFamily: 'Inter' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            asChild
          >
            <Link href="/portfolio">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
