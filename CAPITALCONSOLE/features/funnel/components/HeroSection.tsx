import { Button } from '@/components/ui/Button';
import { SectionContainer } from '@/features/funnel/components/SectionContainer';

type HeroSectionProps = {
  onStart: () => void;
  whatsappHref: string;
};

export function HeroSection({ onStart, whatsappHref }: HeroSectionProps) {
  return (
    <SectionContainer>
      <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-white to-sky-50 p-7 shadow-sm sm:p-10">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-sky-100/60" aria-hidden="true" />

        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Descubre en 30 segundos si estás pagando de más en tu factura de luz ⚡
        </h1>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={onStart}
            className="w-full justify-center bg-[#0077c8] px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-[#0063a7] sm:w-auto"
          >
            🔍 Calcular mi ahorro ahora
          </Button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center rounded-xl border border-[#0077c8] bg-white px-6 py-3 text-base font-semibold text-[#0077c8] transition hover:bg-[#e6f2fb] sm:w-auto"
          >
            Hablar por WhatsApp
          </a>
        </div>

        <p className="mt-3 text-xs font-medium text-slate-600">👉 Solo necesitas tu consumo aproximado (ej: 800 – 1500 kWh)</p>

        <p className="mt-5 max-w-2xl text-slate-700 sm:text-lg">
          Simula tu consumo y te mostramos cuánto podrías ahorrar — sin compromiso
        </p>

        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          <li>✔ Cientos de personas ya han reducido su factura este mes</li>
          <li>✔ No necesitas cambiar instalación</li>
          <li>✔ Resultado inmediato</li>
        </ul>
      </div>
    </SectionContainer>
  );
}
