import { buildWhatsappLink, type WhatsappPayload } from '@/features/funnel/lib/whatsapp';

type WhatsappButtonProps = {
  payload: WhatsappPayload;
  onClick?: () => void;
  label?: string;
};

export function WhatsappButton({ payload, onClick, label = 'Enviar por WhatsApp' }: WhatsappButtonProps) {
  return (
    <a
      href={buildWhatsappLink(payload)}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1fb85a]"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M19.05 4.94A9.77 9.77 0 0 0 12.1 2C6.7 2 2.3 6.4 2.3 11.8c0 1.7.45 3.37 1.3 4.84L2 22l5.52-1.45a9.76 9.76 0 0 0 4.58 1.16h.01c5.4 0 9.8-4.4 9.8-9.8a9.7 9.7 0 0 0-2.86-6.97Zm-6.94 15.1h-.01a8.14 8.14 0 0 1-4.14-1.13l-.3-.17-3.27.86.87-3.19-.2-.33a8.1 8.1 0 0 1-1.25-4.28c0-4.48 3.64-8.13 8.12-8.13 2.16 0 4.19.84 5.72 2.37a8.02 8.02 0 0 1 2.38 5.72c0 4.48-3.65 8.13-8.12 8.13Zm4.46-6.09c-.24-.12-1.42-.7-1.64-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.2-.7-.62-1.17-1.39-1.31-1.62-.14-.24-.01-.36.1-.48.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.79-.2-.47-.41-.4-.54-.41l-.46-.01c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.68 2.57 4.08 3.6.57.25 1.02.4 1.37.51.57.18 1.09.16 1.5.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
      </svg>
      {label}
    </a>
  );
}
