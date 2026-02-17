import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FileText, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { AccountService } from '@/services/account.service';
import { getAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface InvestOnboardingProps {
  onAccept: (accountId?: string) => void;
  initialStep?: number;
}

interface OnboardingState {
  financialProfile: {
    annualIncome: string;
    netWorth: string;
    liquidAssets: string;
    fundingSource: string;
  };
  taxInfo: {
    taxId: string;
    taxIdType: string;
    countryOfCitizenship: string;
    countryOfTaxResidence: string;
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
  financialProfile: {
    annualIncome: '',
    netWorth: '',
    liquidAssets: '',
    fundingSource: '',
  },
  taxInfo: {
    taxId: '',
    taxIdType: 'SSN',
    countryOfCitizenship: 'US',
    countryOfTaxResidence: 'US',
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

const FIELD_CLASS =
  'h-11 rounded-md border border-border bg-background px-3 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-0 dark:bg-card dark:border-border dark:text-foreground';

export function InvestOnboarding({ onAccept, initialStep = 1 }: InvestOnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [formData, setFormData] = useState<OnboardingState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const updateField = useCallback(
    (section: keyof OnboardingState, field: string, value: any) => {
      setFormData((prev) => {
        const sectionData = prev[section];
        return {
          ...prev,
          [section]:
            typeof sectionData === 'object' && sectionData !== null
              ? { ...sectionData, [field]: value }
              : value,
        };
      });
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    },
    [errors],
  );

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string | undefined> = {};
    const { financialProfile, taxInfo, employmentInfo, agreements } = formData;

    if (stepNum === 1) {
      if (!financialProfile.annualIncome) newErrors.annualIncome = 'Annual Income is required';
      if (!financialProfile.netWorth) newErrors.netWorth = 'Net Worth is required';
      if (!financialProfile.liquidAssets) newErrors.liquidAssets = 'Liquid Assets is required';
      if (!financialProfile.fundingSource)
        newErrors.fundingSource = 'Funding Source is required';
    } else if (stepNum === 2) {
      if (!taxInfo.taxId.trim()) newErrors.taxId = 'Tax ID is required';
      if (!taxInfo.taxIdType) newErrors.taxIdType = 'Tax ID Type is required';
    } else if (stepNum === 3) {
      if (!employmentInfo.employmentStatus)
        newErrors.employmentStatus = 'Employment Status is required';
      if (employmentInfo.employmentStatus === 'employed') {
        if (!employmentInfo.employer.trim()) newErrors.employer = 'Employer is required';
        if (!employmentInfo.position.trim()) newErrors.position = 'Position is required';
        if (!employmentInfo.jobFunction) newErrors.jobFunction = 'Function is required';
        if (!employmentInfo.employerAddress.trim())
          newErrors.employerAddress = 'Address is required';
      }
    } else if (stepNum === 4) {
      if (!agreements.accountAgreement) newErrors.accountAgreement = 'Agreement required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateStep(4)) return;

    setIsCreatingAccount(true);
    try {
      const user = getAuth();
      if (!user) throw new Error('Please sign in first');

      const payload = {
        account_type: 'trading',
        contact: {
          email_address: user.email,
          phone_number: user.phoneNumber,
          street_address: user.streetAddress,
          city: user.city,
          state: user.state,
          postal_code: user.postalCode,
          country: user.country || 'US',
        },
        identity: {
          first_name: user.firstName,
          last_name: user.lastName,
          date_of_birth: user.dateOfBirth,
          tax_id: formData.taxInfo.taxId,
          tax_id_type: formData.taxInfo.taxIdType,
          country_of_citizenship: formData.taxInfo.countryOfCitizenship,
          country_of_birth: user.countryOfBirth || 'US',
          country_of_tax_residence: formData.taxInfo.countryOfTaxResidence,
          funding_source: [formData.financialProfile.fundingSource],
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
            agreed: formData.agreements.accountAgreement,
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

  const totalSteps = 4;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2 dark:bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary dark:text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl text-foreground">Start Investing</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Step {step} of {totalSteps}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full transition-colors ${i < step ? 'bg-primary dark:bg-white/50' : 'bg-muted/70 dark:bg-muted/40'}`}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <FinancialStep
              data={formData.financialProfile}
              update={updateField}
              errors={errors}
            />
          )}
          {step === 2 && (
            <TaxStep data={formData.taxInfo} update={updateField} errors={errors} />
          )}
          {step === 3 && (
            <EmploymentStep
              data={formData.employmentInfo}
              update={updateField}
              errors={errors}
            />
          )}
          {step === 4 && (
            <DisclosureStep data={formData} update={updateField} errors={errors} />
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < totalSteps ? (
              <Button
                onClick={() => validateStep(step) && setStep((s) => s + 1)}
                className="flex items-center gap-2"
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateAccount}
                size="lg"
                disabled={isCreatingAccount}
                className="flex items-center gap-2"
              >
                {isCreatingAccount ? 'Creating Account...' : 'Continue'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-components for cleaner structure

function FinancialStep({ data, update, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Financial Profile</h2>
        <p className="text-sm text-muted-foreground">
          Help us understand your financial situation
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Annual Income *</Label>
          <Select
            value={data.annualIncome}
            onChange={(e) => update('financialProfile', 'annualIncome', e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">Select range</option>
            <option value="under_25000">Under $25,000</option>
            <option value="25000_99999">$25,000 - $99,999</option>
            <option value="100000_249999">$100,000 - $249,999</option>
            <option value="over_250000">Over $250,000</option>
          </Select>
          {errors.annualIncome && (
            <p className="text-xs text-destructive">{errors.annualIncome}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Net Worth *</Label>
          <Select
            value={data.netWorth}
            onChange={(e) => update('financialProfile', 'netWorth', e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">Select range</option>
            <option value="under_50000">Under $50,000</option>
            <option value="50000_249999">$50,000 - $249,999</option>
            <option value="over_250000">Over $250,000</option>
          </Select>
          {errors.netWorth && <p className="text-xs text-destructive">{errors.netWorth}</p>}
        </div>
        <div className="space-y-2">
          <Label>Funding Source *</Label>
          <Select
            value={data.fundingSource}
            onChange={(e) => update('financialProfile', 'fundingSource', e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">Select source</option>
            <option value="employment_income">Employment Income</option>
            <option value="savings">Savings</option>
            <option value="investment_returns">Investment Returns</option>
          </Select>
          {errors.fundingSource && (
            <p className="text-xs text-destructive">{errors.fundingSource}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function TaxStep({ data, update, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Tax Information</h2>
        <p className="text-sm text-muted-foreground">Required for regulatory compliance</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tax ID *</Label>
          <Input
            placeholder="SSN / ITIN"
            value={data.taxId}
            onChange={(e) => update('taxInfo', 'taxId', e.target.value)}
            className={FIELD_CLASS}
          />
          {errors.taxId && <p className="text-xs text-destructive">{errors.taxId}</p>}
        </div>
        <div className="space-y-2">
          <Label>Tax ID Type *</Label>
          <Select
            value={data.taxIdType}
            onChange={(e) => update('taxInfo', 'taxIdType', e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="SSN">SSN</option>
            <option value="ITIN">ITIN</option>
          </Select>
        </div>
      </div>
    </div>
  );
}

function EmploymentStep({ data, update, errors }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Employment Status</h2>
        <p className="text-sm text-muted-foreground">Tell us about your current employment</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Status *</Label>
          <Select
            value={data.employmentStatus}
            onChange={(e) => update('employmentInfo', 'employmentStatus', e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">Select status</option>
            <option value="employed">Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
          </Select>
          {errors.employmentStatus && (
            <p className="text-xs text-destructive">{errors.employmentStatus}</p>
          )}
        </div>
        {data.employmentStatus === 'employed' && (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Employer *</Label>
              <Input
                value={data.employer}
                onChange={(e) => update('employmentInfo', 'employer', e.target.value)}
                className={FIELD_CLASS}
              />
              {errors.employer && (
                <p className="text-xs text-destructive">{errors.employer}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Position *</Label>
              <Input
                value={data.position}
                onChange={(e) => update('employmentInfo', 'position', e.target.value)}
                className={FIELD_CLASS}
              />
              {errors.position && (
                <p className="text-xs text-destructive">{errors.position}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DisclosureStep({ data, update, errors }: any) {
  const { disclosures, agreements } = data;
  const isNoneChecked =
    !disclosures.isControlPerson &&
    !disclosures.isAffiliatedExchangeOrFinra &&
    !disclosures.isPoliticallyExposed &&
    !disclosures.immediateFamilyExposed;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Disclosures & Agreements</h2>
        <p className="text-sm text-muted-foreground">
          Regulatory compliance and account agreement
        </p>
      </div>
      <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
        <Checkbox
          id="none"
          checked={isNoneChecked}
          onChange={(e) =>
            (e.target.checked && update('disclosures', 'isControlPerson', false)) ||
            update('disclosures', 'isAffiliatedExchangeOrFinra', false) ||
            update('disclosures', 'isPoliticallyExposed', false) ||
            update('disclosures', 'immediateFamilyExposed', false)
          }
          label="None of the below applies to me"
        />
        <Separator />
        <Checkbox
          id="affiliated"
          checked={disclosures.isAffiliatedExchangeOrFinra}
          onChange={(e) =>
            update('disclosures', 'isAffiliatedExchangeOrFinra', e.target.checked)
          }
          label="Affiliated with a broker dealer"
        />
        <Checkbox
          id="control"
          checked={disclosures.isControlPerson}
          onChange={(e) => update('disclosures', 'isControlPerson', e.target.checked)}
          label="Senior executive of a public company"
        />
      </div>
      <div className="pt-4">
        <Checkbox
          id="agreement"
          checked={agreements.accountAgreement}
          onChange={(e) => update('agreements', 'accountAgreement', e.target.checked)}
          label="I agree to the Account Agreement *"
        />
        {errors.accountAgreement && (
          <p className="text-xs text-destructive mt-2">{errors.accountAgreement}</p>
        )}
      </div>
    </div>
  );
}
