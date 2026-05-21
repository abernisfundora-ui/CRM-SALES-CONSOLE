import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type PremiumFloatingPanelProps = HTMLAttributes<HTMLDivElement>;

export const PremiumFloatingPanel = forwardRef<HTMLDivElement, PremiumFloatingPanelProps>(function PremiumFloatingPanel({ children, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'premium-menu-fade premium-scrollbar rounded-[18px] border border-[rgba(143,168,90,0.18)] bg-[rgba(10,18,28,0.94)] text-white shadow-[0_20px_58px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.035),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-[18px] backdrop-saturate-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
