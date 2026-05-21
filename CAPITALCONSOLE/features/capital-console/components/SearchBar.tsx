'use client';

import { useLanguage } from '@/providers/LanguageProvider';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const { t } = useLanguage();

  return (
    <label className="block rounded-[14px] border border-[rgba(47,61,31,0.12)] bg-white/75 px-3 py-2.5 transition focus-within:border-[#6F873E]/45 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(143,168,90,0.12)]">
      <span className="sr-only">{t('search.label')}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent text-sm font-medium text-[#10170D] placeholder:text-[rgba(16,23,13,0.42)] focus:outline-none"
        placeholder={placeholder ?? t('search.placeholder')}
      />
    </label>
  );
}
