'use client';

import {
  Shield,
  Clock,
  Droplets,
  DollarSign,
  Target,
  RotateCcw,
  Ban,
  CheckCircle2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { type InvestmentPolicy } from '@/services/widget.service';

interface InvestmentPolicyWidgetProps {
  policy?: InvestmentPolicy;
}

// Custom label for donut chart - showing percentage in center
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function InvestmentPolicyWidget({ policy }: InvestmentPolicyWidgetProps) {
  // Use default policy if none provided
  const defaultPolicy: InvestmentPolicy = {
    riskTolerance: {
      level: 'Moderate-High',
      position: 75,
      description: 'Growth-oriented portfolio',
    },
    timeHorizon: {
      range: '15-20 Years',
      description: 'Long-term investment horizon',
    },
    liquidity: {
      percentage: 5,
      description: 'Maintain 5% in cash/equivalents for operational needs.',
    },
    taxConsiderations: 'Prioritize tax-advantaged accounts; harvest losses annually.',
    objectives: [
      { text: 'Capital appreciation', tag: 'PRIMARY', tagColor: 'bg-red-500' },
      { text: 'Income generation', tag: 'SECONDARY', tagColor: 'bg-orange-500' },
      { text: 'Tax efficiency', tag: 'TERTIARY', tagColor: 'bg-blue-500' },
    ],
    targetAllocation: [
      { name: 'Stocks', value: 50, color: '#22C55E' },
      { name: 'Bonds', value: 25, color: '#3B82F6' },
      { name: 'Treasury', value: 20, color: '#9333EA' },
      { name: 'Alternatives', value: 5, color: '#F97316' },
    ],
    restrictions: 'No individual stocks; ESG screening on all holdings.',
    rebalancing: 'Quarterly review; rebalance when drift exceeds ±5%.',
  };

  const currentPolicy = policy || defaultPolicy;
  const allocationData = currentPolicy.targetAllocation;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div
          className="text-base font-semibold text-gray-900 dark:text-foreground"
          style={{ fontSize: 16, fontFamily: 'Inter', fontWeight: 600 }}
        >
          Investment Policy
        </div>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {/* 1. Risk Tolerance */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <div
              className="text-sm font-semibold text-gray-900 dark:text-foreground"
              style={{ fontSize: 14, fontFamily: 'Inter', fontWeight: 600 }}
            >
              Risk Tolerance
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Slider */}
            <div className="relative h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500 rounded-full">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-card rounded-full border-2 border-gray-300 dark:border-border shadow-sm"
                style={{ left: `${currentPolicy.riskTolerance.position}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-muted-foreground">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
            <div className="text-sm font-semibold text-orange-600 dark:text-orange-500">{currentPolicy.riskTolerance.level}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground">{currentPolicy.riskTolerance.description}</div>
          </div>
        </div>

        {/* 2. Time Horizon */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div
              className="text-sm font-semibold text-gray-900 dark:text-foreground"
              style={{ fontSize: 14, fontFamily: 'Inter', fontWeight: 600 }}
            >
              Time Horizon
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Time bars */}
            <div className="flex gap-1">
              {['Now', '5yr', '10yr', '15yr', '20yr+'].map((period, index) => (
                <div key={period} className="flex-1 flex flex-col gap-1">
                  <div
                    className={`h-8 rounded ${index < 4 ? 'bg-blue-500' : index === 4 ? 'bg-blue-500/30' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  />
                  <span className="text-xs text-gray-600 dark:text-muted-foreground text-center">{period}</span>
                </div>
              ))}
            </div>
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">{currentPolicy.timeHorizon.range}</div>
            <div className="text-xs text-gray-500 dark:text-muted-foreground">{currentPolicy.timeHorizon.description}</div>
          </div>
        </div>

        {/* 5. Objectives */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div
              className="text-sm font-semibold text-gray-900 dark:text-foreground"
              style={{ fontSize: 14, fontFamily: 'Inter', fontWeight: 600 }}
            >
              Objectives
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {currentPolicy.objectives.map((obj) => (
              <div key={obj.text} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-foreground flex-1">{obj.text}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium text-white ${obj.tagColor}`}
                >
                  {obj.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Target Allocation */}
        <div className="p-4 rounded-xl bg-card border border-gray-200 dark:border-border flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
              <RotateCcw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div
              className="text-sm font-semibold text-gray-900 dark:text-foreground"
              style={{ fontSize: 14, fontFamily: 'Inter', fontWeight: 600 }}
            >
              Target Allocation
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Donut Chart */}
            <div className="relative">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={allocationData as any[]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={50}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-xs font-semibold text-gray-700 dark:text-foreground">IPS Target</div>
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-1.5">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700 dark:text-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Within ±3% of target allocation</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
