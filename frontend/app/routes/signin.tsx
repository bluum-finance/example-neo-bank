import { useNavigate } from 'react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Route } from './+types/signin';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { DEFAULT_EMAIL, PASSWORD_PATTERN } from '~/lib/constants';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Sign In' }, { name: 'description', content: 'Sign in to your account' }];
}

export default function SignIn() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Demo login: check if email matches default and password is 8 digits
    const isEmailValid = email === DEFAULT_EMAIL;
    const isPasswordValid = PASSWORD_PATTERN.test(password);

    if (isEmailValid && isPasswordValid) {
      toast.success('Signed in successfully!');
      navigate('/');
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
