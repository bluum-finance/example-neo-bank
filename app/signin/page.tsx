'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isAuthenticated } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_EMAIL } from '@/lib/constants';
import { setAuth } from '@/lib/auth';
import { mockUserAccount } from '@/lib/mock-data';

export default function SignIn() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  // Generate a unique email to avoid email constraint violations
  const generateUniqueEmail = (baseEmail: string): string => {
    const [localPart, domain] = baseEmail.split('@');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${localPart}+${timestamp}-${randomSuffix}@${domain}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Demo login: check if email matches default and password is at least 8 characters
    const isEmailValid = email === DEFAULT_EMAIL;
    const isPasswordValid = password.length >= 8;

    if (isEmailValid && isPasswordValid) {
      // Generate a unique email to avoid email constraint violations
      const uniqueEmail = generateUniqueEmail(email);

      setAuth({
        email: uniqueEmail,
        name: mockUserAccount.name,
        // Include all user account fields
        phoneNumber: mockUserAccount.phoneNumber,
        streetAddress: mockUserAccount.streetAddress,
        city: mockUserAccount.city,
        state: mockUserAccount.state,
        postalCode: mockUserAccount.postalCode,
        country: mockUserAccount.country,
        firstName: mockUserAccount.firstName,
        lastName: mockUserAccount.lastName,
        dateOfBirth: mockUserAccount.dateOfBirth,
        countryOfBirth: mockUserAccount.countryOfBirth,
      });
      toast.success('Signed in successfully!');
      router.push('/dashboard');
    } else {
      toast.error('Invalid email or password.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary"
              >
                <rect width="40" height="40" rx="8" fill="currentColor" opacity="0.1" />
                <path
                  d="M20 10L12 14V16H28V14L20 10ZM12 18V28H28V18H12ZM14 20H26V26H14V20Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-2xl font-bold">Neo Bank</span>
            </div>
          </div>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={'name@example.com'}
                defaultValue={DEFAULT_EMAIL}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
