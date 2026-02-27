'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Flag, Calendar, Landmark, Plus, ChevronDown, ChevronRight, Pencil, Goal } from 'lucide-react';
import { PersonalizedStrategyPanel } from '@/components/ai-wealth/personalized-strategy-panel';
import { GoalModal, LifeEventModal, ExternalAccountModal } from '@/components/ai-wealth/personalized-strategy-modals';
import { useUser } from '@/store/user.store';
import { WidgetService, type FinancialGoal } from '@/services/widget.service';
import { LifeEventService, type LifeEvent } from '@/services/life-event.service';
import { ExternalAccountService, type ExternalAccount } from '@/services/external-account.service';

const formatCurrency = (value?: string | number): string => {
  if (!value) return '—';
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatGoalType = (type?: string): string => {
  if (!type) return 'Custom';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatPriority = (priority?: number): string => {
  if (priority === undefined || priority === null) return '—';
  if (priority === 1) return 'High';
  if (priority === 2) return 'Medium';
  if (priority === 3) return 'Low';
  if (priority === 4) return 'Very Low';
  return `P${priority}`;
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'Ongoing';
  try {
    const date = new Date(dateStr);
    return String(date.getFullYear());
  } catch {
    return 'Ongoing';
  }
};

const formatEventType = (type?: string): string => {
  if (!type) return 'Custom';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatAccountType = (type?: string): string => {
  if (!type) return '—';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function PersonalizedStrategyCTA2() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [goalsExpanded, setGoalsExpanded] = useState(false);
  const [lifeEventsExpanded, setLifeEventsExpanded] = useState(false);
  const [externalAccountsExpanded, setExternalAccountsExpanded] = useState(false);

  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([]);
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccount[]>([]);

  const [goalsLoading, setGoalsLoading] = useState(false);
  const [lifeEventsLoading, setLifeEventsLoading] = useState(false);
  const [externalAccountsLoading, setExternalAccountsLoading] = useState(false);

  // Modal states
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [lifeEventModalOpen, setLifeEventModalOpen] = useState(false);
  const [externalAccountModalOpen, setExternalAccountModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);
  const [editingAccount, setEditingAccount] = useState<ExternalAccount | null>(null);

  const user = useUser();

  useEffect(() => {
    const loadData = async () => {
      const accountId = user?.externalAccountId;
      if (!accountId) return;

      // Load goals
      setGoalsLoading(true);
      try {
        const goalsData = await WidgetService.getFinancialGoals(accountId);
        setGoals(goalsData);
      } catch (error) {
        console.error('Failed to load goals:', error);
        setGoals([]);
      } finally {
        setGoalsLoading(false);
      }

      // Load life events
      setLifeEventsLoading(true);
      try {
        const response = await LifeEventService.listLifeEvents(accountId, { status: 'active' });
        setLifeEvents(response.life_events || []);
      } catch (error) {
        console.error('Failed to load life events:', error);
        setLifeEvents([]);
      } finally {
        setLifeEventsLoading(false);
      }

      // Load external accounts
      setExternalAccountsLoading(true);
      try {
        const response = await ExternalAccountService.listExternalAccounts(accountId, { status: 'active' });
        setExternalAccounts(response.external_accounts || []);
      } catch (error) {
        console.error('Failed to load external accounts:', error);
        setExternalAccounts([]);
      } finally {
        setExternalAccountsLoading(false);
      }
    };

    loadData();
  }, [user?.externalAccountId]);

  const goalsPreview =
    goals.length > 0
      ? goals
          .slice(0, 3)
          .map((g) => `${g.name}${g.target_date ? ` (${new Date(g.target_date).getFullYear()})` : ''}`)
          .join(', ')
      : 'No Goals added yet';

  const lifeEventsPreview =
    lifeEvents.length > 0
      ? lifeEvents
          .slice(0, 3)
          .map((e) => `${e.name}${e.expected_date ? ` (${new Date(e.expected_date).getFullYear()})` : ''}`)
          .join(', ')
      : 'No Events added yet';

  const externalAccountsPreview =
    externalAccounts.length > 0
      ? externalAccounts
          .slice(0, 3)
          .map((a) => a.name)
          .join(', ')
      : 'No Connected banks yet';

  const handleEditGoal = (goal?: FinancialGoal) => {
    setEditingGoal(goal || null);
    setGoalModalOpen(true);
  };

  const handleEditEvent = (event?: LifeEvent) => {
    setEditingEvent(event || null);
    setLifeEventModalOpen(true);
  };

  const handleEditAccount = (account?: ExternalAccount) => {
    setEditingAccount(account || null);
    setExternalAccountModalOpen(true);
  };

  const handleSaveGoal = async () => {
    const accountId = user?.externalAccountId;
    if (!accountId) return;
    const goalsData = await WidgetService.getFinancialGoals(accountId);
    setGoals(goalsData);
  };

  const handleSaveEvent = async () => {
    const accountId = user?.externalAccountId;
    if (!accountId) return;
    const response = await LifeEventService.listLifeEvents(accountId, { status: 'active' });
    setLifeEvents(response.life_events || []);
  };

  const handleSaveAccount = async () => {
    const accountId = user?.externalAccountId;
    if (!accountId) return;
    const response = await ExternalAccountService.listExternalAccounts(accountId, { status: 'active' });
    setExternalAccounts(response.external_accounts || []);
  };

  const AddNewButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <div className="p-8">
      <button
        onClick={onClick}
        className="w-full px-6 py-4 opacity-50 bg-[#0E231F] rounded-2xl border border-[#B0B8BD] border-dashed flex items-center justify-center gap-2 hover:opacity-70 transition-opacity"
      >
        <Plus className="h-4 w-4 text-[#B0B8BD]" />
        <span className="text-sm font-medium text-[#B0B8BD]">{label}</span>
      </button>
    </div>
  );

  return (
    <>
      <div className="flex w-full flex-col">
        <div className="flex w-full items-center gap-4 my-4">
          <h2 className="text-xl font-normal leading-[32px] text-white">Financial Profile</h2>

          <div className="rounded-full bg-[#124031] py-1.5 px-3 flex items-center justify-center">
            <span className="text-[10px] font-normal uppercase text-[#30D158]">For Profile Personalization</span>
          </div>
        </div>

        {/* Header Section */}
        <section className="flex items-center justify-between gap-4 rounded-t-3xl border border-[#1E3D2F] bg-[#07120F] p-6">
          <div className="flex flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-8">
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#124031]">
                  <Sparkles className="h-3.5 w-3.5 text-[#57B75C]" />
                </div>
                <h2 className="text-base font-semibold text-[#D1D5DB]">Get a personalized investment strategy</h2>
              </div>
              <p className="max-w-[640px] text-[13px] text-[#A1BEAD]">
                Answer a few questions about your goals, life events, and finances — and we will tailor your portfolio strategy to match.
              </p>
            </div>

            <button
              onClick={() => setIsPanelOpen(true)}
              className="group flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#57B75C] px-10 transition-all hover:bg-[#4ca651] active:scale-95"
            >
              <span className="text-xs font-semibold text-white">Get Started</span>
              <ArrowRight className="h-3.5 w-3.5 text-white transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </section>

        {/* Content Section */}
        <section className="flex flex-col rounded-b-2xl border-x border-b border-white/5 bg-[#0F2A20] shadow-sm overflow-hidden">
          {/* Goals Section */}
          <div className="flex flex-col border-b border-white/5">
            <button
              onClick={() => setGoalsExpanded(!goalsExpanded)}
              className="flex items-center justify-between p-5 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A3A2C]">
                  <Goal className="h-4 w-4 text-[#30D158]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium text-white">Goals</span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-[#8DA69B]">
                    {goalsLoading ? '...' : goals.length}
                  </div>
                </div>
                <span className="ml-4 text-sm text-[#8DA69B]">{goals.length === 0 ? 'No Goals added yet' : ''}</span>
              </div>
              <ChevronDown className={`h-5 w-5 text-[#B0B8BD] transition-transform ${goalsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {goalsExpanded && (
              <div className="flex flex-col">
                {/* Table Header */}
                <div className="flex px-4 pr-8 overflow-hidden">
                  <div className="flex flex-1 gap-4 items-start">
                    <div className="flex-1 px-4 py-5 min-w-0">
                      <div className="text-sm font-bold text-[#8DA69B]">Name</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[140px]">
                      <div className="text-sm font-bold text-[#8DA69B]">Type</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[140px]">
                      <div className="text-sm font-bold text-[#8DA69B]">Amount</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[100px]">
                      <div className="text-sm font-bold text-[#8DA69B]">Date</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[100px]">
                      <div className="text-sm font-bold text-[#8DA69B]">Priority</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[100px]">
                      <div className="text-sm font-bold text-[#8DA69B]"></div>
                    </div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col">
                  {goals.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-[#8DA69B]">No goals added yet</div>
                  ) : (
                    goals.map((goal, index) => (
                      <div key={goal.goal_id} className={`flex px-4 pr-8 ${index === 0 ? '' : 'border-t border-white/5'} items-start`}>
                        <div className="flex flex-1 gap-4">
                          <div className="flex-1 px-4 py-[22px] min-w-0">
                            <div className="text-sm font-semibold text-white">{goal.name}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[140px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{formatGoalType(goal.goal_type)}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[140px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{formatCurrency(goal.target_amount)}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[100px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{formatDate(goal.target_date)}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[100px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{formatPriority(goal.priority)}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[100px] flex items-center justify-start">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditGoal(goal);
                              }}
                              className="flex items-center gap-1 text-sm font-normal text-[#8DA69B] hover:text-white transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Button */}
                <AddNewButton onClick={() => handleEditGoal()} label="Add new" />
              </div>
            )}
          </div>

          {/* Life Events Section */}
          <div className="flex flex-col border-b border-[#1E3D2F]">
            <button
              onClick={() => setLifeEventsExpanded(!lifeEventsExpanded)}
              className={`flex items-center justify-between px-5 py-5 ${lifeEventsExpanded ? 'border-b border-[#1E3D2F]' : ''}`}
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#1A3A2C] flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-[#30D158]" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-medium text-white">Life Events</span>
                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-medium text-[#8DA69B]">
                      {lifeEvents.length}
                    </div>
                  </div>
                </div>
                <div className="pl-4">
                  <div className="text-sm font-normal text-[#8DA69B]">{lifeEventsPreview}</div>
                </div>
              </div>
              <ChevronRight className={`h-5 w-5 text-[#B0B8BD] transition-transform ${lifeEventsExpanded ? 'rotate-90' : ''}`} />
            </button>

            {lifeEventsExpanded && (
              <div className="flex flex-col">
                {/* Table Header */}
                <div className="flex px-4 pr-8 overflow-hidden">
                  <div className="flex flex-1 gap-4 items-start">
                    <div className="flex-1 px-4 py-5 min-w-0">
                      <div className="text-sm font-bold text-[#8DA69B]">Name</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[140px]">
                      <div className="text-sm font-bold text-[#8DA69B]">Type</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[140px]">
                      <div className="text-sm font-semibold text-[#8DA69B]">Est. Cost</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[120px]">
                      <div className="text-sm font-semibold text-[#8DA69B]">Projected date</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[100px]">
                      <div className="text-sm font-semibold text-[#8DA69B]"></div>
                    </div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col">
                  {lifeEvents.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-[#8DA69B]">No events added yet</div>
                  ) : (
                    lifeEvents.map((event, index) => (
                      <div key={event.event_id} className={`flex px-4 pr-8 ${index === 0 ? '' : 'border-t border-white/5'} items-start`}>
                        <div className="flex flex-1 gap-4">
                          <div className="flex-1 px-4 py-[22px] min-w-0">
                            <div className="text-sm font-semibold text-white">{event.name}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[140px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{formatEventType(event.event_type)}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[140px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{formatCurrency(event.estimated_cost)}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[120px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{formatDate(event.expected_date)}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[100px] flex items-center justify-start">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEvent(event);
                              }}
                              className="flex items-center gap-1 text-sm font-normal text-[#8DA69B] hover:text-white transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Button */}
                <AddNewButton onClick={() => handleEditEvent()} label="Add new" />
              </div>
            )}
          </div>

          {/* External Accounts Section */}
          <div className="flex flex-col">
            <button
              onClick={() => setExternalAccountsExpanded(!externalAccountsExpanded)}
              className="flex items-center justify-between px-5 py-5"
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[#1A3A2C] flex items-center justify-center">
                  <Landmark className="h-4 w-4 text-[#30D158]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium text-white">External Accounts</span>
                  <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-medium text-[#8DA69B]">
                    {externalAccounts.length}
                  </div>
                </div>
                <div className="pl-4">
                  <div className="text-sm font-normal text-[#8DA69B]">{externalAccountsPreview}</div>
                </div>
              </div>
              <ChevronRight className={`h-5 w-5 text-[#B0B8BD] transition-transform ${externalAccountsExpanded ? 'rotate-90' : ''}`} />
            </button>

            {externalAccountsExpanded && (
              <div className="flex flex-col">
                {/* Table Header */}
                <div className="flex px-4 pr-8 overflow-hidden">
                  <div className="flex flex-1 gap-4 items-start">
                    <div className="flex-1 px-4 py-5 min-w-0">
                      <div className="text-sm font-semibold text-[#8DA69B]">Name</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[120px]">
                      <div className="text-sm font-bold text-[#8DA69B]">Type</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[140px]">
                      <div className="text-sm font-bold text-[#8DA69B]">Amount</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[140px]">
                      <div className="text-sm font-semibold text-[#8DA69B]">Institution</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[120px]">
                      <div className="text-sm font-semibold text-[#8DA69B]">Asset/Liability</div>
                    </div>
                    <div className="shrink-0 px-4 py-5 min-w-[100px]">
                      <div className="text-sm font-semibold text-[#8DA69B]"></div>
                    </div>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col">
                  {externalAccounts.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-[#8DA69B]">No accounts added yet</div>
                  ) : (
                    externalAccounts.map((account, index) => (
                      <div
                        key={account.external_account_id}
                        className={`flex px-4 pr-8 ${index === 0 ? '' : 'border-t border-white/5'} items-start`}
                      >
                        <div className="flex flex-1 gap-4">
                          <div className="flex-1 px-4 py-[22px] min-w-0">
                            <div className="text-sm font-semibold text-white">{account.name}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[120px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{formatAccountType(account.account_type)}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[140px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{formatCurrency(account.balance)}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] max-w-[150px] w-full">
                            <div className="text-sm font-normal text-[#B0B8BD]">{account.institution || '—'}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[120px]">
                            <div className="text-sm font-normal text-[#B0B8BD]">{account.is_asset ? 'Asset' : 'Liability'}</div>
                          </div>
                          <div className="shrink-0 px-4 py-[22px] min-w-[100px] flex items-center justify-start">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAccount(account);
                              }}
                              className="flex items-center gap-1 text-sm font-normal text-[#8DA69B] hover:text-white transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Button */}
                <AddNewButton onClick={() => handleEditAccount()} label="Add account" />
              </div>
            )}
          </div>
        </section>
      </div>

      <PersonalizedStrategyPanel open={isPanelOpen} onOpenChange={setIsPanelOpen} />

      {/* Modals */}
      <GoalModal open={goalModalOpen} onOpenChange={setGoalModalOpen} goal={editingGoal} onSave={handleSaveGoal} />
      <LifeEventModal open={lifeEventModalOpen} onOpenChange={setLifeEventModalOpen} event={editingEvent} onSave={handleSaveEvent} />
      <ExternalAccountModal
        open={externalAccountModalOpen}
        onOpenChange={setExternalAccountModalOpen}
        account={editingAccount}
        onSave={handleSaveAccount}
      />
    </>
  );
}
