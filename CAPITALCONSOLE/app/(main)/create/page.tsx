import Link from 'next/link';

const createOptions = [
  { label: '+ Activo', description: 'Registra activos y su rendimiento.', href: '/create/asset' },
  { label: '+ Pasivo', description: 'Añade deudas y pagos recurrentes.', href: '/create/liability' },
  { label: '+ Ingreso manual', description: 'Registra entradas operativas no ligadas a activos.', href: '/create/income' },
  { label: '+ Gasto manual', description: 'Carga salidas operativas no ligadas a pasivos.', href: '/create/expense' },
  { label: '+ Cuenta / efectivo / banco', description: 'Registra liquidez real disponible hoy.', href: '/create/account' },
  { label: '+ Recordatorio', description: 'Agenda eventos financieros y alertas.', href: '/create/event' },
  { label: '+ Meta financiera', description: 'Define objetivos y seguimiento de avance.', href: '/create/goal' }
];

export default function CreateSelectorPage() {
  return (
    <div className="create-form-shell" data-accent="asset">
      <section className="create-form-header">
        <p className="create-form-kicker">Creación dedicada</p>
        <h1 className="create-form-title">¿Qué deseas crear?</h1>
        <p className="create-form-subtitle">Selecciona una categoría para continuar al formulario.</p>
      </section>

      <section className="create-form-body grid grid-cols-1 gap-3 md:grid-cols-2">
        {createOptions.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="create-form-section transition-colors hover:border-[rgba(47,61,31,0.18)]"
          >
            <p className="text-sm font-extrabold text-[#10170D]">{option.label}</p>
            <p className="mt-1 text-xs font-medium text-[rgba(16,23,13,0.60)]">{option.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
