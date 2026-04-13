'use client';

import { TrendingUp, TrendingDown, Home, Flame, Users, DollarSign } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ label, value, change, icon, description }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {Math.abs(change)}% vs last year
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className="w-10 h-10 bg-hearth-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface PermitStatsProps {
  stats: {
    totalPermits: number;
    newThisMonth: number;
    avgValue: number;
    hotLeads: number;
    yearOverYearChange?: number;
    conversionRate?: number;
  };
}

export default function PermitStats({ stats }: PermitStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Permits"
        value={stats.totalPermits.toLocaleString()}
        change={stats.yearOverYearChange}
        icon={<Home className="w-5 h-5 text-hearth-600" />}
        description="New residential construction"
      />
      <StatCard
        label="New This Month"
        value={stats.newThisMonth}
        icon={<TrendingUp className="w-5 h-5 text-hearth-600" />}
        description="Permits filed in last 30 days"
      />
      <StatCard
        label="Avg. Construction Value"
        value={`$${Math.round(stats.avgValue / 1000)}K`}
        icon={<DollarSign className="w-5 h-5 text-hearth-600" />}
        description="Average new home permit value"
      />
      <StatCard
        label="Hot Leads"
        value={stats.hotLeads}
        icon={<Flame className="w-5 h-5 text-hearth-600" />}
        description="Score 75+ ready for outreach"
      />
    </div>
  );
}

interface PublicStatsProps {
  totalPermitsThisYear: number;
  monthlyAverage: number;
  yearOverYearChange: number;
}

export function PublicPermitStats({ totalPermitsThisYear, monthlyAverage, yearOverYearChange }: PublicStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="text-center">
        <p className="text-4xl font-bold text-hearth-600">{totalPermitsThisYear}+</p>
        <p className="text-sm text-gray-600 mt-1">New Home Permits This Year</p>
        <p className="text-xs text-gray-400">Greene & Christian County</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-hearth-600">{monthlyAverage}</p>
        <p className="text-sm text-gray-600 mt-1">Permits Per Month</p>
        <p className="text-xs text-gray-400">Average monthly new construction</p>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-4xl font-bold text-hearth-600">
            {yearOverYearChange >= 0 ? '+' : ''}{yearOverYearChange}%
          </p>
          {yearOverYearChange >= 0 ? (
            <TrendingUp className="w-6 h-6 text-green-500" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-500" />
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">Year-Over-Year Growth</p>
        <p className="text-xs text-gray-400">Construction activity trend</p>
      </div>
    </div>
  );
}
