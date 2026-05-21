import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  leftIcon?: ReactNode;
};

export function Button({ className, variant = 'primary', leftIcon, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
        variant === 'primary' && 'bg-[#2B3A1F] text-white hover:bg-[#3A4A28] hover:shadow-[0_0_24px_rgba(143,168,90,0.25)]',
        variant === 'ghost' && 'border border-[rgba(31,42,23,0.10)] bg-white/60 text-[#2B3A1F] hover:bg-[#EFF4E8]',
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  );
}
