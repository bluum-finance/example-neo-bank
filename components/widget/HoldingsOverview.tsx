'use client';

import { FC } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface HoldingData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

export const HoldingsOverview: FC<{ data: HoldingData[] }> = ({ data }) => {
  return (
    <div className="h-full w-full relative rounded-xl bg-card border border-border flex flex-col items-start p-6 text-left font-sans text-white">
      <div className="w-full flex flex-col items-start pb-4">
        <div className="self-stretch flex flex-col items-start">
          <div className="self-stretch relative leading-6 font-normal">Allocation</div>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
        <div className="w-full h-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="flex flex-col items-start">
              <b className="text-2xl leading-8 flex items-center font-bold font-mono">12</b>
            </div>
            <div className="flex flex-col items-start text-xs text-[#A1BEAD]">
              <div className="tracking-[0.6px] leading-4 uppercase flex items-center">Assets</div>
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch flex flex-col items-start pt-6 text-sm text-[#A1BEAD]">
        <div className="self-stretch flex flex-col items-start gap-3">
          {data.map((item) => (
            <div key={item.name} className="self-stretch flex items-center justify-between gap-5">
              <div className="flex items-center">
                <div className="h-3 w-5 flex flex-col items-start pr-2">
                  <div className="w-3 h-3 relative rounded-full" style={{ backgroundColor: item.color }} />
                </div>
                <div className="flex flex-col items-start">
                  <div className="leading-5 flex items-center text-[#A1BEAD]">{item.name}</div>
                </div>
              </div>
              <div className="flex flex-col items-start text-white">
                <div className="leading-5 font-medium flex items-center">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HoldingsOverview;
