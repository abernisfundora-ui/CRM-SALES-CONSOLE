import { z } from 'zod';

export const dashboardSchema = z.object({
  kpis: z.array(
    z.object({
      label: z.string(),
      value: z.string()
    })
  )
});

export type DashboardData = z.infer<typeof dashboardSchema>;
