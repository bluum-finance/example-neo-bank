'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  useUserStore,
  useIsAuthenticated,
  INVESTOR_EMAIL1,
} from '@/store/user.store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { login, isLoading } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [router, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await login(email, password);

    if (result.success) {
      toast.success('Signed in successfully!');
      router.push('/dashboard');
    } else {
      toast.error(result.error || 'Invalid email or password.');
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-start bg-transparent">
        <div className="header container mx-auto px-4 py-4 md:px-12 xl:px-4 flex justify-between items-center">
          <Link href="/">
            <img
              src="/bluum-logo.svg"
              alt="Bluum Finance"
              className="h-8 lg:h-10"
            />
          </Link>
          <Link
            href="/#"
            className="text-white py-2 text-base font-light leading-6"
          >
            Open Account
          </Link>
        </div>

        <div className="w-full flex-1 flex items-center justify-center py-16 max-w-[86em]">
          <div className="flex flex-1 flex-col lg:flex-row items-center lg:justify-around p-4 lg:p-0 gap-6">
            {/* Sign in card */}
            <div
              className="w-full max-w-[582px] py-12 rounded-xl outline-1 -outline-offset-1 inline-flex flex-col justify-center items-start gap-6"
              style={{ backgroundColor: '#0F2A20', outlineColor: '#1E3D2F' }}
            >
              {/* Form Section */}
              <div className="self-stretch px-6 lg:px-12 flex flex-col justify-start items-start gap-6">
                {/* Header */}
                <div className="pb-2 flex flex-col justify-start items-start w-full">
                  <h1 className="self-stretch text-white text-[25px] font-normal leading-[25px]">
                    Login
                  </h1>
                </div>

                {/* Form */}
                <form
                  id="signin-form"
                  onSubmit={handleSubmit}
                  className="self-stretch flex flex-col justify-start items-start gap-6"
                >
                  {/* Email Field */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    <Label
                      htmlFor="email"
                      className="text-white text-base font-light leading-6"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Email
                    </Label>
                    <div className="self-stretch">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="youremail@company.com"
                        defaultValue={INVESTOR_EMAIL1}
                        required
                        autoComplete="email"
                        className="w-full rounded-[12px] bg-[#0E231F] px-4 py-3 outline-[#1E3D2F] outline-1 outline-offset-1
                       text-white text-base font-light leading-6 focus-visible:outline-primary/30 placeholder:text-[#A1BEAD] placeholder:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    <Label
                      htmlFor="password"
                      className="text-white text-base font-light leading-6"
                      style={{ fontFamily: 'Inter' }}
                    >
                      Password
                    </Label>
                    <div className="self-stretch relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        required
                        autoComplete="current-password"
                        className="w-full rounded-[12px] bg-[#0E231F] px-4 py-3 pr-11 outline-[#1E3D2F] outline-1 outline-offset-1
                       text-white text-base font-light leading-6 focus-visible:outline-primary/30 placeholder:text-[#8DA69B] placeholder:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 opacity-50 hover:opacity-40 transition-opacity"
                      >
                        {showPassword ? (
                          <Eye className="w-6 h-6 text-[#B0B8BD]" />
                        ) : (
                          <EyeOff className="w-6 h-6 text-[#B0B8BD]" />
                        )}
                      </button>
                    </div>
                    <div className="inline-flex my-2 w-full">
                      <button
                        type="button"
                        className="text-sm text-[#8DA69B] font-light leading-5 hover:opacity-80 transition-opacity"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {/* Submit Button Section */}
                  <div className="w-full mt-2">
                    <Button
                      type="submit"
                      form="signin-form"
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-[32px] inline-flex justify-center items-center gap-2 h-auto hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#57B75C', color: 'white' }}
                    >
                      <span className="text-base font-normal leading-6">
                        {isLoading ? 'Signing in...' : 'Log In'}
                      </span>
                    </Button>
                  </div>
                </form>
              </div>

              {/* Divider */}
              <div
                className="w-full my-1 h-px"
                style={{ backgroundColor: '#1E3D2F' }}
              />

              {/* Passkey Section */}
              <div className="px-6 lg:px-12 flex flex-col justify-center items-start gap-3 w-full">
                <button
                  type="button"
                  className="max-w-[300px] px-4 py-3 rounded-[32px] inline-flex justify-center items-center gap-2 hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: '#1A3A2C' }}
                >
                  <span>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.9998 2L18.9998 4M18.9998 4L21.9998 7L18.4998 10.5L15.4998 7.5M18.9998 4L15.4998 7.5M11.3898 11.61C11.9061 12.1195 12.3166 12.726 12.5975 13.3948C12.8785 14.0635 13.0244 14.7813 13.0268 15.5066C13.0292 16.232 12.8882 16.9507 12.6117 17.6213C12.3352 18.2919 11.9288 18.9012 11.4159 19.4141C10.903 19.9271 10.2937 20.3334 9.62309 20.6099C8.95247 20.8864 8.23379 21.0275 7.50842 21.025C6.78305 21.0226 6.06533 20.8767 5.39658 20.5958C4.72782 20.3148 4.12125 19.9043 3.61179 19.388C2.60992 18.3507 2.05555 16.9614 2.06808 15.5193C2.08061 14.0772 2.65904 12.6977 3.67878 11.678C4.69853 10.6583 6.078 10.0798 7.52008 10.0673C8.96216 10.0548 10.3515 10.6091 11.3888 11.611L11.3898 11.61ZM11.3898 11.61L15.4998 7.5"
                        stroke="white"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="flex-1 text-white text-base font-light leading-6">
                    Continue with passkey
                  </span>
                </button>

                <div className="self-stretch flex flex-col justify-center items-start gap-1">
                  <p className="text-sm text-[#B0B8BD] font-light leading-5">
                    Log in securely using one click, your face, or finger print.
                  </p>
                  <button
                    type="button"
                    className="text-sm text-[#30D158] font-light underline leading-5 hover:opacity-80 transition-opacity"
                  >
                    Learn how to set it up
                  </button>
                </div>
              </div>
            </div>

            {/* Sign in Image */}
            <div className="flex flex-1 items-center justify-center w-full max-w-[582px] lg:max-w-[530px]">
              <img
                src="/images/login-poster.png"
                alt="Sign in"
                className="w-full h-auto object-cover rounded-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
