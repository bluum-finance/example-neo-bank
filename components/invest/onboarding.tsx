import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, TrendingUp, ArrowRight, ArrowLeft, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { AccountService } from '@/services/account.service';
import { toast } from 'sonner';
import { InvestmentChoice, useUser } from '@/store/user.store';

interface InvestOnboardingProps {
  onAccept: (accountId?: string) => void;
  initialStep?: number;
  investmentChoice: InvestmentChoice;
}

interface OnboardingState {
  profile: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  financialProfile: {
    annualIncome: string;
    netWorth: string;
    liquidAssets: string;
    fundingSource: string;
  };
  employmentInfo: {
    employmentStatus: string;
    employer: string;
    position: string;
    jobFunction: string;
    employerAddress: string;
  };
  disclosures: {
    isControlPerson: boolean;
    isAffiliatedExchangeOrFinra: boolean;
    isPoliticallyExposed: boolean;
    immediateFamilyExposed: boolean;
  };
  agreements: {
    accountAgreement: boolean;
  };
}

const INITIAL_STATE: OnboardingState = {
  profile: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  },
  financialProfile: {
    annualIncome: '',
    netWorth: '',
    liquidAssets: '',
    fundingSource: '',
  },
  employmentInfo: {
    employmentStatus: '',
    employer: '',
    position: '',
    jobFunction: '',
    employerAddress: '',
  },
  disclosures: {
    isControlPerson: false,
    isAffiliatedExchangeOrFinra: false,
    isPoliticallyExposed: false,
    immediateFamilyExposed: false,
  },
  agreements: {
    accountAgreement: false,
  },
};

export function InvestOnboarding({ onAccept, initialStep = 0, investmentChoice }: InvestOnboardingProps) {
  const router = useRouter();
  const user = useUser();
  const [step, setStep] = useState(initialStep);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [formData, setFormData] = useState<OnboardingState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Initialize profile data from auth
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          firstName: user.firstName || user.name?.split(' ')[0] || 'Oluwatosin',
          lastName: user.lastName || user.name?.split(' ')[1] || 'Einstein',
          dateOfBirth: user.dateOfBirth || '01/09/1908',
          phoneNumber: user.phoneNumber || '+1 (341) 213–8356',
          address: user.streetAddress?.[0] || '000 MB Bush Way',
          city: user.city || 'Senal',
          state: user.state || 'CA',
          zip: user.postalCode || '12122',
        },
      }));
    }
  }, []);

  const updateField = useCallback(
    (section: keyof OnboardingState, field: string, value: any) => {
      setFormData((prev: OnboardingState) => {
        const sectionData = prev[section];
        return {
          ...prev,
          [section]: typeof sectionData === 'object' && sectionData !== null ? { ...sectionData, [field]: value } : value,
        };
      });
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    },
    [errors]
  );

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string | undefined> = {};
    const { financialProfile, employmentInfo, agreements } = formData;

    if (stepNum === 0) {
      // Profile step - mostly read-only for now as per JSX
      return true;
    } else if (stepNum === 1) {
      if (!employmentInfo.employmentStatus) newErrors.employmentStatus = 'Employment Status is required';
      if (employmentInfo.employmentStatus === 'employed') {
        if (!employmentInfo.employer.trim()) newErrors.employer = 'Employer is required';
        if (!employmentInfo.position.trim()) newErrors.position = 'Position is required';
      }
    } else if (stepNum === 2) {
      if (!financialProfile.annualIncome) newErrors.annualIncome = 'Annual Income is required';
      if (!financialProfile.netWorth) newErrors.netWorth = 'Net Worth is required';
      if (!financialProfile.liquidAssets) newErrors.liquidAssets = 'Liquid Assets is required';
      // fundingSource is no longer in the UI, so we remove its validation
    } else if (stepNum === 3) {
      // Disclosure step - no validation required as user can select any combination
      // Completing the form implies agreement
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateStep(3)) return;

    setIsCreatingAccount(true);
    try {
      if (!user) throw new Error('Please sign in first');

      const payload = {
        account_type: 'trading',
        contact: {
          email_address: user.email,
          phone_number: formData.profile.phoneNumber,
          street_address: [formData.profile.address],
          city: formData.profile.city,
          state: formData.profile.state,
          postal_code: formData.profile.zip,
          country: user.country || 'US',
        },
        identity: {
          first_name: formData.profile.firstName,
          last_name: formData.profile.lastName,
          date_of_birth: formData.profile.dateOfBirth,
          tax_id: '000-00-0000', // Default or handled by backend
          tax_id_type: 'SSN',
          country_of_citizenship: 'US',
          country_of_birth: user.countryOfBirth || 'US',
          country_of_tax_residence: 'US',
          funding_source: ['employment_income'], // Default funding source
        },
        disclosures: {
          is_control_person: formData.disclosures.isControlPerson,
          is_affiliated_exchange_or_finra: formData.disclosures.isAffiliatedExchangeOrFinra,
          is_politically_exposed: formData.disclosures.isPoliticallyExposed,
          immediate_family_exposed: formData.disclosures.immediateFamilyExposed,
        },
        agreements: [
          {
            agreement: 'account_agreement',
            agreed: true, // Implied by completing the onboarding flow
            signed_at: new Date().toISOString(),
            ip_address: '127.0.0.1',
          },
        ],
      };

      const account = await AccountService.createAccount(payload as any);
      toast.success('Account created successfully!');
      onAccept(account.id);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const totalSteps = 4; // 0 to 3

  const handleBack = () => {
    if (step === 0) {
      router.push(`/invest?choice=${investmentChoice.toLowerCase()}`);
      return;
    }

    setStep((s: number) => s - 1);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none bg-transparent shadow-none">
        <CardContent className="p-0">
          <div className="w-full px-10 bg-[#0F2A20] border border-[#1E3D2F] rounded-xl flex flex-col py-12">
            <>
              {step === 0 && <PersonalInfoStep data={formData.profile} />}

              {step === 1 && <EmploymentStep data={formData.employmentInfo} update={updateField} errors={errors} />}

              {step === 2 && <FinancialStep data={formData.financialProfile} update={updateField} errors={errors} />}

              {step === 3 && <DisclosureStep data={formData} update={updateField} errors={errors} />}
            </>

            <div className="flex items-center justify-between pt-8 gap-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                className={'w-[146px] bg-[#1A3A2C] hover:bg-[#1A3A2C]/80! text-white rounded-full h-12'}
              >
                Back
              </Button>

              {step < totalSteps - 1 ? (
                <Button
                  onClick={() => validateStep(step) && setStep((s: number) => s + 1)}
                  className="flex-1 bg-[#57B75C] hover:bg-[#57B75C]/90 text-white rounded-full h-12"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleCreateAccount}
                  disabled={isCreatingAccount}
                  className="flex-1 bg-[#57B75C] hover:bg-[#57B75C]/90 text-white rounded-full h-12"
                >
                  {isCreatingAccount ? 'Creating Account...' : 'Continue'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-components for cleaner structure

function PersonalInfoStep({ data }: { data: any }) {
  return (
    <div className="">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h2 className="text-[25px] font-medium leading-[27.5px] text-white">
            Let’s get you started with an individual Invest
            <br />
            account.
          </h2>
          <p className="text-base text-[#B0B8BD]">Are these details still accurate?</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1BEAD]">Personal information</h3>
            <div className="space-y-1 text-sm text-white">
              <p className="font-medium">
                {data.firstName} {data.lastName}
              </p>
              <p className="font-normal">{data.dateOfBirth}</p>
              <p className="font-normal">{data.phoneNumber}</p>
            </div>
          </div>

          <div className="h-px w-full border-t border-[#1E3D2F]" />

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1BEAD]">Home address</h3>
            <div className="flex gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#1E3D2F] bg-white">
                <img src="/images/map-snippet.png" alt="Address map" className="h-full w-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-green-500/20 mix-blend-overlay" />
              </div>
              <div className="flex flex-col justify-center text-sm text-white">
                <p>{data.address}</p>
                <p>
                  {data.city}, {data.state}
                </p>
                <p>{data.zip}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl bg-[#124031] p-4 pr-8">
          <AlertTriangle className="h-5 w-5 text-[#30D158] shrink-0 mt-0.5" />
          <p className="text-xs leading-[19.5px] text-white">
            If something is out of date, <span className="font-medium text-[#30D158]">contact us</span>
            <br />
            before you start your application.
          </p>
        </div>
      </div>
    </div>
  );
}

function FinancialStep({ data, update, errors }: any) {
  return (
    <div className="flex w-full flex-col items-start justify-start gap-6">
      <div className="flex w-full flex-col items-start justify-start pb-2">
        <h2 className="flex w-full flex-col justify-center font-sans text-[25px] font-medium leading-[27.50px] text-white">
          What’s your current financial situation?
        </h2>
      </div>

      {/* Annual Income */}
      <div className="flex w-full flex-col items-start justify-start gap-1">
        <Label className="flex items-center justify-start font-sans text-base font-normal leading-6 text-white">Annual Income</Label>
        <div className="relative w-full">
          <select
            value={data.annualIncome}
            onChange={(e) => update('financialProfile', 'annualIncome', e.target.value)}
            className="flex w-full items-center justify-between rounded-xl border border-[#1E3D2F] bg-[#0E231F] px-4 py-3 font-sans text-base font-normal leading-6 text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="">Select range</option>
            <option value="under_25000">Less than $25,000</option>
            <option value="25000_99999">$25,000 - $99,999</option>
            <option value="100000_249999">$100,000 - $249,999</option>
            <option value="over_250000">Over $250,000</option>
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#B0B8BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {errors.annualIncome && <p className="mt-1 text-xs text-destructive">{errors.annualIncome}</p>}
      </div>

      {/* Estimated Net Worth */}
      <div className="flex w-full flex-col items-start justify-start gap-1">
        <Label className="flex items-center justify-start font-sans text-base font-normal leading-6 text-white">Estimated net worth</Label>
        <div className="relative w-full">
          <select
            value={data.netWorth}
            onChange={(e) => update('financialProfile', 'netWorth', e.target.value)}
            className="flex w-full items-center justify-between rounded-xl border border-[#1E3D2F] bg-[#0E231F] px-4 py-3 font-sans text-base font-normal leading-6 text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="">Select range</option>
            <option value="under_205000">Less than $205,000</option>
            <option value="205000_499999">$205,000 - $499,999</option>
            <option value="over_500000">Over $500,000</option>
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#B0B8BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {errors.netWorth && <p className="mt-1 text-xs text-destructive">{errors.netWorth}</p>}
      </div>

      {/* Estimated Liquid Net Worth */}
      <div className="flex w-full flex-col items-start justify-start gap-1">
        <Label className="flex items-center justify-start font-sans text-base font-normal leading-6 text-white">
          Estimated Liquid net worth
        </Label>
        <div className="relative w-full">
          <select
            value={data.liquidAssets}
            onChange={(e) => update('financialProfile', 'liquidAssets', e.target.value)}
            className="flex w-full items-center justify-between rounded-xl border border-[#1E3D2F] bg-[#0E231F] px-4 py-3 font-sans text-base font-normal leading-6 text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="">Select range</option>
            <option value="under_50000">Less than $50,000</option>
            <option value="50000_199999">$50,000 - $199,999</option>
            <option value="over_200000">Over $200,000</option>
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#B0B8BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {errors.liquidAssets && <p className="mt-1 text-xs text-destructive">{errors.liquidAssets}</p>}
      </div>
    </div>
  );
}

function EmploymentStep({ data, update, errors }: any) {
  return (
    <div className="flex w-full flex-col items-start justify-start gap-6">
      <div className="flex w-full flex-col items-start justify-start pb-2">
        <h2 className="flex w-full flex-col justify-center font-sans text-[25px] font-medium leading-[27.50px] text-white">
          What’s your employment status
        </h2>
      </div>

      {/* Employment Status */}
      <div className="flex w-full flex-col items-start justify-start gap-1">
        <Label className="flex items-center justify-start font-sans text-base font-normal leading-6 text-white">Employment status</Label>
        <div className="relative w-full">
          <select
            value={data.employmentStatus}
            onChange={(e) => update('employmentInfo', 'employmentStatus', e.target.value)}
            className="flex w-full items-center justify-between rounded-xl border border-[#1E3D2F] bg-[#0E231F] px-4 py-3 font-sans text-base font-normal leading-6 text-white outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            <option value="">Select status</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
            <option value="student">Student</option>
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#B0B8BD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {errors.employmentStatus && <p className="mt-1 text-xs text-destructive">{errors.employmentStatus}</p>}
      </div>

      {/* Employer and Job Title - Only shown if employed */}
      {data.employmentStatus === 'employed' && (
        <>
          {/* Employer */}
          <div className="flex w-full flex-col items-start justify-start gap-1">
            <Label className="flex items-center justify-start font-sans text-base font-normal leading-6 text-white">Employer</Label>
            <div className="flex w-full flex-col items-start justify-center gap-3 rounded-xl border border-[#1E3D2F] bg-[#0E231F] px-4 py-3">
              <input
                type="text"
                placeholder="Company name"
                value={data.employer}
                onChange={(e) => update('employmentInfo', 'employer', e.target.value)}
                className="w-full bg-transparent font-sans text-base font-normal leading-6 text-white placeholder:text-[#A1BEAD]/50 outline-none"
              />
            </div>
            {errors.employer && <p className="mt-1 text-xs text-destructive">{errors.employer}</p>}
          </div>

          {/* Job Title */}
          <div className="flex w-full flex-col items-start justify-start gap-1">
            <Label className="flex items-center justify-start font-sans text-base font-normal leading-6 text-white">Job title</Label>
            <div className="flex w-full flex-col items-start justify-center gap-3 rounded-xl border border-[#1E3D2F] bg-[#0E231F] px-4 py-3">
              <input
                type="text"
                placeholder="Position"
                value={data.position}
                onChange={(e) => update('employmentInfo', 'position', e.target.value)}
                className="w-full bg-transparent font-sans text-base font-normal leading-6 text-white placeholder:text-[#A1BEAD]/50 outline-none"
              />
            </div>
            {errors.position && <p className="mt-1 text-xs text-destructive">{errors.position}</p>}
          </div>
        </>
      )}
    </div>
  );
}

function DisclosureStep({ data, update }: any) {
  const { disclosures } = data;
  const isNoneChecked = !disclosures.isControlPerson && !disclosures.isAffiliatedExchangeOrFinra && !disclosures.isPoliticallyExposed;

  const options = [
    {
      id: 'isControlPerson',
      title: 'Has a control holding in a publicly traded company',
      description: "For example, serving as a director, officer, or owning 10% or more of the company's voting shares",
      checked: disclosures.isControlPerson,
    },
    {
      id: 'isAffiliatedExchangeOrFinra',
      title: 'Is personally registered with FINRA/SEC by a broker-dealer or investment adviser',
      checked: disclosures.isAffiliatedExchangeOrFinra,
    },
    {
      id: 'isPoliticallyExposed',
      title: 'Is a senior political figure',
      description: 'Someone with significant political influence or experience',
      checked: disclosures.isPoliticallyExposed,
    },
    {
      id: 'none',
      title: 'None of the above',
      checked: isNoneChecked,
    },
  ];

  const handleToggle = (id: string) => {
    if (id === 'none') {
      update('disclosures', 'isControlPerson', false);
      update('disclosures', 'isAffiliatedExchangeOrFinra', false);
      update('disclosures', 'isPoliticallyExposed', false);
    } else {
      update('disclosures', id, !disclosures[id]);
    }
  };

  return (
    <div className="flex w-full flex-col items-start justify-start gap-6">
      <div className="flex w-full flex-col items-start justify-start pb-2">
        <h2 className="flex w-full flex-col justify-center font-sans text-[25px] font-normal leading-normal text-white">
          Do any of the following categories apply to you or a family member?
        </h2>
      </div>

      <div className="flex w-full flex-col gap-6">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => handleToggle(option.id)}
            className={`flex w-full cursor-pointer items-center justify-start rounded-xl border p-4 transition-all ${
              option.checked ? 'border-[#30D158] bg-[#1A3A2C]' : 'border-[#2A4D3C] bg-transparent'
            }`}
          >
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-6 items-center justify-start">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                    option.checked ? 'border-[#30D158] bg-[#30D158]' : 'border-[#A1BEAD]'
                  }`}
                >
                  {option.checked && <Check className="h-3.5 w-3.5 text-[#0F2A20] stroke-[3]" />}
                </div>
              </div>
              <div className="flex flex-1 flex-col items-start justify-start">
                <div className="flex flex-col justify-center font-sans text-base font-normal leading-6 text-[#D1D5DB]">{option.title}</div>
                {option.description && (
                  <div className="flex w-full flex-col items-start justify-start">
                    <div className="flex w-full flex-col justify-center font-sans text-[14px] font-normal leading-[22.75px] text-[#8DA69B]">
                      {option.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
