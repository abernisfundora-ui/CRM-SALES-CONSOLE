export function CssUmbrellaShield() {
  return (
    <svg viewBox="0 0 160 64" className="h-12 w-full" fill="none" aria-hidden>
      <path d="M40 38c5-12 17-20 32-20s27 8 32 20H40Z" fill="url(#umb)" />
      <path d="M72 38v15c0 4 6 4 6 0" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M116 14 126 18v8c0 4-2.8 7.5-10 11-7.2-3.5-10-7-10-11v-8l10-4Z" fill="rgba(96,165,250,0.24)" stroke="#93c5fd" strokeWidth="1.2" />
      <defs><linearGradient id="umb" x1="40" y1="18" x2="104" y2="44"><stop stopColor="#3b82f6" /><stop offset="1" stopColor="#8b5cf6" /></linearGradient></defs>
    </svg>
  );
}
