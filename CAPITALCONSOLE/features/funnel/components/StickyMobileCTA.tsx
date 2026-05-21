import { WhatsappButton } from '@/features/funnel/components/WhatsappButton';
import type { WhatsappPayload } from '@/features/funnel/lib/whatsapp';

export function StickyMobileCTA({ payload, onClick }: { payload: WhatsappPayload; onClick?: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-sm md:hidden">
      <WhatsappButton payload={payload} onClick={onClick} label="Abrir WhatsApp con datos cargados" />
    </div>
  );
}
