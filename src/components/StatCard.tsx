import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  detail?: string;
  className?: string;
  accent?: 'orange' | 'green' | 'blue' | 'red' | 'purple';
}

const accentColors = {
  orange: 'bg-orange-100 text-orange-600',
  green: 'bg-green-100 text-green-600',
  blue: 'bg-blue-100 text-blue-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
};

export default function StatCard({ label, value, change, changeLabel, icon, detail, className, accent = 'orange' }: StatCardProps) {
  return (
    <div className={cn('card p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', change >= 0 ? 'text-green-600' : 'text-red-500')}>
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change > 0 ? '+' : ''}{change}% {changeLabel || 'vs last period'}
            </div>
          )}
          {detail && <p className="text-[11px] text-gray-400 mt-1">{detail}</p>}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', accentColors[accent])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
