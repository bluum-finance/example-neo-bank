import { useState } from 'react';
import {
  FileText,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { AccountService } from '@/services/account.service';
import { getAuth, setAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface InvestOnboardingProps {
  onAccept: (accountId?: string) => void;
}

interface FinancialProfile {
  annualIncome: string;
  netWorth: string;
  liquidAssets: string;
  fundingSource: string;
}

interface TaxInfo {
  taxId: string;
  taxIdType: string;
  countryOfCitizenship: string;
  countryOfTaxResidence: string;
}

interface EmploymentInfo {
  employmentStatus: string;
  employer: string;
  position: string;
  function: string;
  employerAddress: string;
}

interface Disclosures {
  isControlPerson: boolean;
  isAffiliatedExchangeOrFinra: boolean;
  isPoliticallyExposed: boolean;
  immediateFamilyExposed: boolean;
}

interface Agreements {
  accountAgreement: boolean;
}

export function InvestOnboarding({ onAccept }: InvestOnboardingProps) {
  const [step, setStep] = useState(0);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile>({
    annualIncome: '',
    netWorth: '',
    liquidAssets: '',
    fundingSource: '',
  });
  const [taxInfo, setTaxInfo] = useState<TaxInfo>({
    taxId: '',
    taxIdType: 'SSN',
    countryOfCitizenship: 'US',
    countryOfTaxResidence: 'US',
  });
  const [employmentInfo, setEmploymentInfo] = useState<EmploymentInfo>({
    employmentStatus: '',
    employer: '',
    position: '',
    function: '',
    employerAddress: '',
  });
  const [disclosures, setDisclosures] = useState<Disclosures>({
    isControlPerson: false,
    isAffiliatedExchangeOrFinra: false,
    isPoliticallyExposed: false,
    immediateFamilyExposed: false,
  });
  const [agreements, setAgreements] = useState<Agreements>({
    accountAgreement: false,
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string | undefined> = {};

    if (stepNum === 1) {
      // Financial Profile
      if (!financialProfile.annualIncome.trim()) {
        newErrors.annualIncome = 'Annual Income is required';
      }
      if (!financialProfile.netWorth.trim()) {
        newErrors.netWorth = 'Estimated Net Worth is required';
      }
      if (!financialProfile.liquidAssets.trim()) {
        newErrors.liquidAssets = 'Investible / Liquid Assets is required';
      }
      if (!financialProfile.fundingSource) {
        newErrors.fundingSource = 'Account Funding Source is required';
      }
    } else if (stepNum === 2) {
      // Tax Information
      if (!taxInfo.taxId.trim()) {
        newErrors.taxId = 'Tax ID is required';
      }
      if (!taxInfo.taxIdType) {
        newErrors.taxIdType = 'Tax ID Type is required';
      }
      if (!taxInfo.countryOfCitizenship) {
        newErrors.countryOfCitizenship = 'Country of Citizenship is required';
      }
      if (!taxInfo.countryOfTaxResidence) {
        newErrors.countryOfTaxResidence = 'Country of Tax Residence is required';
      }
    } else if (stepNum === 3) {
      // Employment Information
      if (!employmentInfo.employmentStatus) {
        newErrors.employmentStatus = 'Employment Status is required';
      }
      if (employmentInfo.employmentStatus === 'employed') {
        if (!employmentInfo.employer.trim()) {
          newErrors.employer = 'Employer is required';
        }
        if (!employmentInfo.position.trim()) {
          newErrors.position = 'Position is required';
        }
        if (!employmentInfo.function) {
          newErrors.function = 'Function is required';
        }
        if (!employmentInfo.employerAddress.trim()) {
          newErrors.employerAddress = 'Employer Address is required';
        }
      }
    } else if (stepNum === 4) {
      // Disclosures and Agreements
      if (!agreements.accountAgreement) {
        newErrors.accountAgreement = 'You must agree to the Account Agreement';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step >= 1 && step < 4) {
      if (validateStep(step)) {
        setStep(step + 1);
      }
    } else if (step === 4) {
      handleCreateAccount();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinancialProfileChange = (field: keyof FinancialProfile, value: string) => {
    setFinancialProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTaxInfoChange = (field: keyof TaxInfo, value: string) => {
    setTaxInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleEmploymentInfoChange = (field: keyof EmploymentInfo, value: string) => {
    setEmploymentInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDisclosureChange = (field: keyof Disclosures, value: boolean) => {
    setDisclosures((prev) => ({ ...prev, [field]: value }));
  };

  const handleAgreementChange = (field: keyof Agreements, value: boolean) => {
    setAgreements((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const mapFundingSource = (source: string): string => {
    const mapping: Record<string, string> = {
      employment_income: 'employment_income',
      business_income: 'business_income',
      savings: 'other',
      inheritance: 'inheritance',
      investment_returns: 'investment_income',
      other: 'other',
    };
    return mapping[source] || 'other';
  };

  const handleCreateAccount = async () => {
    if (!validateStep(4)) {
      return;
    }

    setIsCreatingAccount(true);
    try {
      const user = getAuth();
      if (!user) {
        toast.error('Please sign in first');
        return;
      }

      // Build account creation payload using user data
      const accountPayload = {
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
          tax_id: taxInfo.taxId,
          tax_id_type: taxInfo.taxIdType as
            | 'SSN'
            | 'ITIN'
            | 'EIN'
            | 'SIN'
            | 'NINO'
            | 'TFN'
            | 'VAT'
            | 'TIN'
            | 'OTHER',
          country_of_citizenship: taxInfo.countryOfCitizenship || 'US',
          country_of_birth: user.countryOfBirth || 'US',
          country_of_tax_residence: taxInfo.countryOfTaxResidence || 'US',
          funding_source: financialProfile.fundingSource
            ? [mapFundingSource(financialProfile.fundingSource) as any]
            : undefined,
        },
        disclosures: {
          is_control_person: disclosures.isControlPerson,
          is_affiliated_exchange_or_finra: disclosures.isAffiliatedExchangeOrFinra,
          is_politically_exposed: disclosures.isPoliticallyExposed,
          immediate_family_exposed: disclosures.immediateFamilyExposed,
        },
        agreements: [
          {
            agreement: 'account_agreement',
            agreed: agreements.accountAgreement,
            signed_at: new Date().toISOString(),
            ip_address: '127.0.0.1', // In production, fetch actual client IP
          },
        ],
      };

      const account = await AccountService.createAccount(accountPayload);

      toast.success('Investment account created successfully!');
      onAccept(account.id);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      toast.error(errorMessage);
      console.error('Account creation error:', error);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const totalSteps = 5; // Welcome (0), Financial (1), Tax (2), Employment (3), Disclosures & Agreements (4)

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className={step === 0 ? 'text-center' : ''}>
          {step === 0 ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <TrendingUp className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl">Start Investing</CardTitle>
              <CardDescription className="text-base mt-2">
                Invest in U.S. and Nigerian stocks and grow your wealth. <br /> Powered by
                Bluum Finance
              </CardDescription>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Start Investing</CardTitle>
                  <CardDescription className="text-sm">
                    Step {step} of {totalSteps - 1}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: totalSteps - 1 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-8 rounded-full transition-colors ${
                      i + 1 <= step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 0: Welcome/Splash Screen */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your investments are protected
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <TrendingUp className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Diversified</h3>
                  <p className="text-sm text-muted-foreground">Access to U.S. stock market</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Easy</h3>
                  <p className="text-sm text-muted-foreground">Start with as little as $20</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Financial Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Financial Profile</h2>
                <p className="text-sm text-muted-foreground">
                  Help us understand your financial situation
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">
                    Annual Income <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="annualIncome"
                    value={financialProfile.annualIncome}
                    onChange={(e) =>
                      handleFinancialProfileChange('annualIncome', e.target.value)
                    }
                    aria-invalid={!!errors.annualIncome}
                    placeholder="Select annual income range"
                  >
                    <option value="under_25000">Under $25,000</option>
                    <option value="25000_99999">$25,000 - $99,999</option>
                    <option value="100000_249999">$100,000 - $249,999</option>
                    <option value="250000_499999">$250,000 - $499,999</option>
                    <option value="500000_999999">$500,000 - $999,999</option>
                    <option value="over_1000000">Over $1,000,000</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Your total annual income from all sources
                  </p>
                  {errors.annualIncome && (
                    <p className="text-xs text-destructive">{errors.annualIncome}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="netWorth">
                    Estimated Net Worth <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="netWorth"
                    value={financialProfile.netWorth}
                    onChange={(e) => handleFinancialProfileChange('netWorth', e.target.value)}
                    aria-invalid={!!errors.netWorth}
                    placeholder="Select net worth range"
                  >
                    <option value="under_25000">Under $25,000</option>
                    <option value="25000_99999">$25,000 - $99,999</option>
                    <option value="100000_499999">$100,000 - $499,999</option>
                    <option value="500000_999999">$500,000 - $999,999</option>
                    <option value="1000000_4999999">$1,000,000 - $4,999,999</option>
                    <option value="over_5000000">Over $5,000,000</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Your total assets minus total liabilities
                  </p>
                  {errors.netWorth && (
                    <p className="text-xs text-destructive">{errors.netWorth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liquidAssets">
                    Investible / Liquid Assets <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="liquidAssets"
                    value={financialProfile.liquidAssets}
                    onChange={(e) =>
                      handleFinancialProfileChange('liquidAssets', e.target.value)
                    }
                    aria-invalid={!!errors.liquidAssets}
                    placeholder="Select liquid assets range"
                  >
                    <option value="under_25000">Under $25,000</option>
                    <option value="25000_99999">$25,000 - $99,999</option>
                    <option value="100000_249999">$100,000 - $249,999</option>
                    <option value="250000_499999">$250,000 - $499,999</option>
                    <option value="500000_999999">$500,000 - $999,999</option>
                    <option value="over_1000000">Over $1,000,000</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Assets readily available for investment (cash, stocks, bonds, etc.)
                  </p>
                  {errors.liquidAssets && (
                    <p className="text-xs text-destructive">{errors.liquidAssets}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingSource">
                    Account Funding Source <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="fundingSource"
                    value={financialProfile.fundingSource}
                    onChange={(e) =>
                      handleFinancialProfileChange('fundingSource', e.target.value)
                    }
                    aria-invalid={!!errors.fundingSource}
                    placeholder="Select funding source"
                  >
                    <option value="employment_income">Employment Income</option>
                    <option value="business_income">Business Income</option>
                    <option value="savings">Savings / Personal Funds</option>
                    <option value="inheritance">Inheritance / Gift</option>
                    <option value="investment_returns">Investment Returns</option>
                    <option value="other">Other</option>
                  </Select>
                  {errors.fundingSource && (
                    <p className="text-xs text-destructive">{errors.fundingSource}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tax Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Tax Information</h2>
                <p className="text-sm text-muted-foreground">
                  Required for regulatory compliance
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">
                    Tax ID <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="taxId"
                    type="text"
                    placeholder="123-45-6789"
                    value={taxInfo.taxId}
                    onChange={(e) => handleTaxInfoChange('taxId', e.target.value)}
                    aria-invalid={!!errors.taxId}
                  />
                  {errors.taxId && <p className="text-xs text-destructive">{errors.taxId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxIdType">
                    Tax ID Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="taxIdType"
                    value={taxInfo.taxIdType}
                    onChange={(e) => handleTaxInfoChange('taxIdType', e.target.value)}
                    aria-invalid={!!errors.taxIdType}
                    placeholder="Select tax ID type"
                  >
                    <option value="SSN">SSN</option>
                    <option value="ITIN">ITIN</option>
                    <option value="EIN">EIN</option>
                    <option value="SIN">SIN</option>
                    <option value="NINO">NINO</option>
                    <option value="TFN">TFN</option>
                    <option value="VAT">VAT</option>
                    <option value="TIN">TIN</option>
                    <option value="OTHER">Other</option>
                  </Select>
                  {errors.taxIdType && (
                    <p className="text-xs text-destructive">{errors.taxIdType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryOfCitizenship">
                    Country of Citizenship <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="countryOfCitizenship"
                    value={taxInfo.countryOfCitizenship}
                    onChange={(e) =>
                      handleTaxInfoChange('countryOfCitizenship', e.target.value)
                    }
                    aria-invalid={!!errors.countryOfCitizenship}
                  >
                    <option value="NG">Nigeria</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </Select>
                  {errors.countryOfCitizenship && (
                    <p className="text-xs text-destructive">{errors.countryOfCitizenship}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="countryOfTaxResidence">
                    Country of Tax Residence <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="countryOfTaxResidence"
                    value={taxInfo.countryOfTaxResidence}
                    onChange={(e) =>
                      handleTaxInfoChange('countryOfTaxResidence', e.target.value)
                    }
                    aria-invalid={!!errors.countryOfTaxResidence}
                  >
                    <option value="NG">Nigeria</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </Select>
                  {errors.countryOfTaxResidence && (
                    <p className="text-xs text-destructive">{errors.countryOfTaxResidence}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Employment Information */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Employment Status</h2>
                <p className="text-sm text-muted-foreground">
                  Tell us about your current employment
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employmentStatus">
                    Employment Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    id="employmentStatus"
                    value={employmentInfo.employmentStatus}
                    onChange={(e) =>
                      handleEmploymentInfoChange('employmentStatus', e.target.value)
                    }
                    aria-invalid={!!errors.employmentStatus}
                    placeholder="Select employment status"
                  >
                    <option value="employed">Employed</option>
                    <option value="unemployed">Unemployed</option>
                    <option value="retired">Retired</option>
                    <option value="student">Student</option>
                  </Select>
                  {errors.employmentStatus && (
                    <p className="text-xs text-destructive">{errors.employmentStatus}</p>
                  )}
                </div>

                {employmentInfo.employmentStatus === 'employed' && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-4">Employment Details</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="employer">
                            Employer <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="employer"
                            type="text"
                            placeholder="Company Name"
                            value={employmentInfo.employer}
                            onChange={(e) =>
                              handleEmploymentInfoChange('employer', e.target.value)
                            }
                            aria-invalid={!!errors.employer}
                          />
                          {errors.employer && (
                            <p className="text-xs text-destructive">{errors.employer}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="position">
                            Position <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="position"
                            type="text"
                            placeholder="Software Engineer, Manager, etc."
                            value={employmentInfo.position}
                            onChange={(e) =>
                              handleEmploymentInfoChange('position', e.target.value)
                            }
                            aria-invalid={!!errors.position}
                          />
                          {errors.position && (
                            <p className="text-xs text-destructive">{errors.position}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="function">
                            Function <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            id="function"
                            value={employmentInfo.function}
                            onChange={(e) =>
                              handleEmploymentInfoChange('function', e.target.value)
                            }
                            aria-invalid={!!errors.function}
                            placeholder="Select your job function"
                          >
                            <option value="engineering">Engineering</option>
                            <option value="management">Management</option>
                            <option value="sales">Sales</option>
                            <option value="marketing">Marketing</option>
                            <option value="finance">Finance</option>
                            <option value="operations">Operations</option>
                            <option value="hr">Human Resources</option>
                            <option value="legal">Legal</option>
                            <option value="other">Other</option>
                          </Select>
                          {errors.function && (
                            <p className="text-xs text-destructive">{errors.function}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="employerAddress">
                            Employer Address <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="employerAddress"
                            type="text"
                            placeholder="Enter employer address"
                            value={employmentInfo.employerAddress}
                            onChange={(e) =>
                              handleEmploymentInfoChange('employerAddress', e.target.value)
                            }
                            aria-invalid={!!errors.employerAddress}
                          />
                          {errors.employerAddress && (
                            <p className="text-xs text-destructive">
                              {errors.employerAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Disclosures & Agreements */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Disclosures & Agreements</h2>
                <p className="text-sm text-muted-foreground">
                  Regulatory compliance disclosures and account agreement
                </p>
              </div>

              <div className="space-y-6">
                {/* Regulatory Disclosures */}
                <div className="space-y-4">
                  <p className="text-sm font-medium">
                    Do any of the following apply to you or your family?{' '}
                    <span className="text-destructive">*</span>
                  </p>

                  <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
                    <Checkbox
                      id="none"
                      checked={
                        !disclosures.isControlPerson &&
                        !disclosures.isAffiliatedExchangeOrFinra &&
                        !disclosures.isPoliticallyExposed &&
                        !disclosures.immediateFamilyExposed
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDisclosures({
                            isControlPerson: false,
                            isAffiliatedExchangeOrFinra: false,
                            isPoliticallyExposed: false,
                            immediateFamilyExposed: false,
                          });
                        }
                      }}
                      label="None of the below applies to me or my family"
                    />

                    <Separator />

                    <Checkbox
                      id="affiliated"
                      checked={disclosures.isAffiliatedExchangeOrFinra}
                      onChange={(e) => {
                        handleDisclosureChange(
                          'isAffiliatedExchangeOrFinra',
                          e.target.checked
                        );
                      }}
                      label="Affiliated or work with a US registered broker dealer or FINRA."
                    />

                    <Checkbox
                      id="controlPerson"
                      checked={disclosures.isControlPerson}
                      onChange={(e) => {
                        handleDisclosureChange('isControlPerson', e.target.checked);
                      }}
                      label="Senior executive at or 10% shareholder of a publicly traded company."
                    />

                    <Checkbox
                      id="politicallyExposed"
                      checked={disclosures.isPoliticallyExposed}
                      onChange={(e) => {
                        handleDisclosureChange('isPoliticallyExposed', e.target.checked);
                      }}
                      label="I am a senior political figure."
                    />

                    <Checkbox
                      id="familyExposed"
                      checked={disclosures.immediateFamilyExposed}
                      onChange={(e) => {
                        handleDisclosureChange('immediateFamilyExposed', e.target.checked);
                      }}
                      label="I am a family member or relative of a senior political figure."
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    These disclosures are required for regulatory compliance. Your information
                    will be kept confidential and used only for account verification purposes.
                  </p>
                </div>

                <Separator />

                {/* Account Agreement */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold">Terms and Conditions</h3>
                        <div className="text-sm text-muted-foreground space-y-2">
                          <p>
                            Investing in stocks involves risk, including the possible loss of
                            principal. Past performance does not guarantee future results.
                          </p>
                          <p>
                            By proceeding, you acknowledge that you understand the risks
                            associated with stock market investing and agree to our Terms of
                            Service and Privacy Policy.
                          </p>
                          <Separator />
                          <div>
                            <p className="font-medium mb-2">Important Information:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>Minimum deposit: $20</li>
                              <li>Minimum withdrawal: $5</li>
                              <li>Market hours: 9:30 AM - 4:00 PM EST</li>
                              <li>All investments are subject to market volatility</li>
                              <li>You may lose some or all of your investment</li>
                              <li>Past performance is not indicative of future results</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Checkbox
                      id="accountAgreement"
                      checked={agreements.accountAgreement}
                      onChange={(e) =>
                        handleAgreementChange('accountAgreement', e.target.checked)
                      }
                      label="I have read and agree to the Account Agreement *"
                    />
                    {errors.accountAgreement && (
                      <p className="text-xs text-destructive">{errors.accountAgreement}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            {step === 0 ? (
              <div className="w-full">
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                {step < totalSteps - 1 ? (
                  <Button onClick={handleNext} className="flex items-center gap-2">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleCreateAccount}
                    size="lg"
                    className="flex items-center gap-2"
                    disabled={isCreatingAccount}
                  >
                    {isCreatingAccount ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Creating Account...
                      </>
                    ) : (
                      <>Continue</>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
