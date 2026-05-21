export type CalendarPeriod = '7d' | '30d' | '90d';
export type CalendarEventType = 'ingreso' | 'gasto' | 'recordatorio' | 'evento_financiero';
export type CalendarSourceType =
  | 'manual'
  | 'derived-income'
  | 'derived-expense'
  | 'liability-payment'
  | 'goal-reminder'
  | 'asset-review'
  | 'google-synced';

export type ReminderOption = 'none' | '10m' | '30m' | '1h' | '1d';
export type GoogleCalendarSyncStatus = 'none' | 'pending' | 'synced' | 'failed';

export type CalendarItem = {
  id: string;
  date: string;
  title: string;
  description?: string;
  amount?: number;
  startDateTime?: string;
  endDateTime?: string;
  allDay?: boolean;
  type: CalendarEventType;
  source: 'income' | 'expense' | 'asset' | 'liability' | 'goal' | 'manual';
  sourceType?: CalendarSourceType;
  sourceId?: string;
  editable?: boolean;
  deletable?: boolean;
  syncToGoogleCalendar?: boolean;
  googleCalendarEventId?: string | null;
  googleCalendarStatus?: GoogleCalendarSyncStatus;
  reminderConfig?: ReminderOption;
};
