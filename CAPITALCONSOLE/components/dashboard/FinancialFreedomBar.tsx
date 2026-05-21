'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const FINANCIAL_FREEDOM_BACKGROUND_SRC = '/images/financial-freedom-banner.webp';

type FinancialFreedomBarProps = {
  passiveIncome: number;
  monthlyExpenses: number;
  /** Place the final image at `/public/images/financial-freedom-banner.webp` or pass another public image route. */
  backgroundImageSrc?: string;
};

export function FinancialFreedomBar({ passiveIncome, monthlyExpenses, backgroundImageSrc = FINANCIAL_FREEDOM_BACKGROUND_SRC }: FinancialFreedomBarProps) {
  const [backgroundImageFailed, setBackgroundImageFailed] = useState(false);
  const pct = monthlyExpenses > 0 ? (passiveIncome / monthlyExpenses) * 100 : 0;
  const progress = Math.max(0, Math.min(100, pct));
  const level = pct >= 100 ? 'Eres financieramente libre.' : pct >= 70 ? 'Estás cerca de ser libre.' : pct >= 30 ? 'Vas construyendo tu libertad.' : 'Dependes de ingresos activos.';

  useEffect(() => {
    setBackgroundImageFailed(false);
  }, [backgroundImageSrc]);

  return (
    <section className="group relative col-span-full w-full min-w-0 overflow-hidden rounded-[30px] border border-[rgba(2,21,38,0.08)] bg-[linear-gradient(135deg,#F9FAF5_0%,#E8EFE4_48%,#D9E4D1_100%)] text-[#071827] shadow-[0_18px_45px_rgba(2,21,38,0.085),inset_0_1px_0_rgba(255,255,255,0.82)] [grid-column:1/-1] min-h-[190px] md:min-h-[168px] xl:min-h-[176px]">
      {/* Place the final image manually at /public/images/financial-freedom-banner.webp; the CSS gradient remains visible until then. */}
      {!backgroundImageFailed && backgroundImageSrc ? (
        <Image
          src={backgroundImageSrc}
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 1180px, (min-width: 768px) 720px, 100vw"
          className="object-cover object-center md:object-right transition-opacity duration-700"
          aria-hidden
          onError={() => setBackgroundImageFailed(true)}
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.82)_38%,rgba(255,255,255,0.35)_70%,rgba(255,255,255,0.12)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(255,255,255,0.68),transparent_30%),radial-gradient(circle_at_76%_108%,rgba(10,122,47,0.14),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.16),rgba(7,24,39,0.06))]" />

      <div className="relative z-10 flex min-h-[190px] w-full flex-col justify-center px-5 py-5 md:min-h-[168px] md:px-7 xl:min-h-[176px]">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#63707A]">Libertad Financiera</p>
          <p className="mt-2 text-[clamp(3.1rem,12vw,4.25rem)] font-black leading-[0.84] tracking-[-0.085em] text-[#0A7A2F] drop-shadow-[0_10px_24px_rgba(10,122,47,0.12)] md:text-[4.45rem]">{pct.toFixed(1)}%</p>
        </div>

        <div className="mt-4 w-full">
          <div className="relative h-2.5 w-full overflow-visible rounded-full bg-[rgba(72,92,75,0.16)] shadow-[inset_0_1px_2px_rgba(2,21,38,0.10)] backdrop-blur-sm">
            <div
              className="h-2.5 rounded-full bg-[linear-gradient(90deg,#0A7A2F_0%,#2F8C53_54%,#A5B66F_100%)] shadow-[0_5px_14px_rgba(10,122,47,0.20)] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
            <span
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/85 bg-[#F9FFF5] shadow-[0_6px_16px_rgba(10,122,47,0.22),0_0_0_5px_rgba(10,122,47,0.08)] transition-all duration-700"
              style={{ left: `calc(${progress}% + ${progress === 0 ? '8px' : progress === 100 ? '-8px' : '0px'})` }}
            />
          </div>
        </div>

        <div className="mt-3 max-w-[590px]">
          <p className="text-sm font-black leading-5 text-[#243929]">{level}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#53616A] md:text-[13px]">
            Ingresos pasivos cubren {monthlyExpenses > 0 ? `${((passiveIncome / monthlyExpenses) * 100).toFixed(1)}%` : '0%'} de tus gastos mensuales. Vas por buen camino. ¡Sigue así!
          </p>
        </div>
      </div>
    </section>
  );
}
