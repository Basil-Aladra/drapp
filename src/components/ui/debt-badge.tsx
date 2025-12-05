import { AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebtBadgeProps {
  amount: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DebtBadge({ amount, showIcon = true, size = 'md' }: DebtBadgeProps) {
  const hasDebt = amount > 0;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        hasDebt ? 'debt-alert border' : 'success-badge border'
      )}
    >
      {showIcon && (
        hasDebt ? (
          <AlertTriangle className="w-3.5 h-3.5" />
        ) : (
          <CheckCircle className="w-3.5 h-3.5" />
        )
      )}
      {hasDebt ? `$${amount.toFixed(2)} Debt` : 'Paid'}
    </span>
  );
}
