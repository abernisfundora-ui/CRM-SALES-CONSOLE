import { dashboardSchema } from '@/lib/mock/dashboard';

export const getDashboardMock = () => dashboardSchema.parse({
  kpis: [
    { label: 'Appointments', value: '12' },
    { label: 'Conversion', value: '28%' },
    { label: 'Revenue', value: '$14,900' }
  ]
});
