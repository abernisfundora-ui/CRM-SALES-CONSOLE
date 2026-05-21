export type Language = 'es' | 'en';

export type TranslationKey =
  | 'nav.home'
  | 'nav.assets'
  | 'nav.liabilities'
  | 'nav.income'
  | 'nav.expenses'
  | 'nav.goals'
  | 'nav.calendar'
  | 'nav.projection'
  | 'action.new'
  | 'action.newAsset'
  | 'action.newLiability'
  | 'action.newIncome'
  | 'action.newExpense'
  | 'action.newEvent'
  | 'search.label'
  | 'search.placeholder'
  | 'summary.balanceGeneral'
  | 'summary.totalIncome'
  | 'summary.totalExpenses'
  | 'form.generatesIncome'
  | 'form.generatesExpense'
  | 'language.es'
  | 'language.en'
  | 'header.console'
  | 'header.financialControl'
  | 'chart.timeframe.day'
  | 'chart.timeframe.week'
  | 'chart.timeframe.month'
  | 'chart.timeframe.year'
  | 'chart.cashFlow.eyebrow'
  | 'chart.cashFlow.title'
  | 'chart.cashFlow.subtitle'
  | 'chart.cashFlow.income'
  | 'chart.cashFlow.expenses'
  | 'chart.cashFlow.netFlow'
  | 'chart.cashFlow.surplus'
  | 'chart.cashFlow.deficit'
  | 'chart.cashFlow.deficitHint'
  | 'chart.cashFlow.deficitInsight'
  | 'chart.cashFlow.emptyTitle'
  | 'chart.cashFlow.emptyBody'
  | 'chart.distribution.eyebrow'
  | 'chart.distribution.title'
  | 'chart.distribution.subtitle'
  | 'chart.distribution.assets'
  | 'chart.distribution.liabilities'
  | 'chart.distribution.income'
  | 'chart.distribution.expenses'
  | 'chart.distribution.assets.description'
  | 'chart.distribution.liabilities.description'
  | 'chart.distribution.income.description'
  | 'chart.distribution.expenses.description'
  | 'chart.distribution.centerDefault'
  | 'chart.distribution.insightTitle'
  | 'chart.distribution.insightBody'
  | 'chart.distribution.emptyTitle'
  | 'chart.distribution.emptyBody';

type Dictionary = Record<Language, Record<TranslationKey, string>>;

export const dictionary: Dictionary = {
  es: {
    'nav.home': 'Inicio',
    'nav.assets': 'Activos',
    'nav.liabilities': 'Pasivos',
    'nav.income': 'Ingresos',
    'nav.expenses': 'Gastos',
    'nav.goals': 'Metas',
    'nav.calendar': 'Calendario',
    'nav.projection': 'Proyección',
    'action.new': '+ Nuevo',
    'action.newAsset': '+ Nuevo Activo',
    'action.newLiability': '+ Nuevo Pasivo',
    'action.newIncome': '+ Nuevo Ingreso',
    'action.newExpense': '+ Nuevo Gasto',
    'action.newEvent': '+ Nuevo Evento',
    'search.label': 'Buscar',
    'search.placeholder': 'Buscar actividad, cliente o categoría',
    'summary.balanceGeneral': 'Balance general',
    'summary.totalIncome': 'Total ingresos',
    'summary.totalExpenses': 'Total gastos',
    'form.generatesIncome': 'Genera ingreso',
    'form.generatesExpense': 'Genera gasto',
    'language.es': 'Español',
    'language.en': 'English',
    'header.console': 'Capital Console',
    'header.financialControl': 'Control financiero',
    'chart.timeframe.day': 'Día',
    'chart.timeframe.week': 'Semana',
    'chart.timeframe.month': 'Mes',
    'chart.timeframe.year': 'Año',
    'chart.cashFlow.eyebrow': 'Inteligencia de flujo',
    'chart.cashFlow.title': 'Flujo neto',
    'chart.cashFlow.subtitle': 'Ingresos, gastos y resultado neto con eje limpio para lectura ejecutiva.',
    'chart.cashFlow.income': 'Ingresos',
    'chart.cashFlow.expenses': 'Gastos',
    'chart.cashFlow.netFlow': 'Flujo neto',
    'chart.cashFlow.surplus': 'Superávit',
    'chart.cashFlow.deficit': 'Déficit',
    'chart.cashFlow.deficitHint': 'Déficits marcados como alerta',
    'chart.cashFlow.deficitInsight': 'Hay pérdida en este periodo: se conserva el eje limpio y se señala como alerta de tendencia.',
    'chart.cashFlow.emptyTitle': 'Aún no registras movimientos financieros.',
    'chart.cashFlow.emptyBody': 'Agrega ingresos y gastos para visualizar tu flujo ejecutivo.',
    'chart.distribution.eyebrow': 'Distribución financiera',
    'chart.distribution.title': 'Distribución financiera',
    'chart.distribution.subtitle': 'Lectura contextual de activos, pasivos, ingresos y gastos del mes.',
    'chart.distribution.assets': 'Activos',
    'chart.distribution.liabilities': 'Pasivos',
    'chart.distribution.income': 'Ingresos',
    'chart.distribution.expenses': 'Gastos',
    'chart.distribution.assets.description': 'Bienes y cuentas que generan valor patrimonial.',
    'chart.distribution.liabilities.description': 'Compromisos financieros que reducen patrimonio disponible.',
    'chart.distribution.income.description': 'Entradas netas que sostienen el flujo mensual.',
    'chart.distribution.expenses.description': 'Salidas mensuales que consumen liquidez operativa.',
    'chart.distribution.centerDefault': 'Patrimonio',
    'chart.distribution.insightTitle': 'Insight financiero',
    'chart.distribution.insightBody': 'Pasa el cursor sobre una categoría para ver porcentaje, monto y lectura ejecutiva.',
    'chart.distribution.emptyTitle': 'Aún no hay distribución patrimonial.',
    'chart.distribution.emptyBody': 'Agrega registros para construir el mapa financiero.'
  },
  en: {
    'nav.home': 'Home',
    'nav.assets': 'Assets',
    'nav.liabilities': 'Liabilities',
    'nav.income': 'Income',
    'nav.expenses': 'Expenses',
    'nav.goals': 'Goals',
    'nav.calendar': 'Calendar',
    'nav.projection': 'Projection',
    'action.new': '+ New',
    'action.newAsset': '+ New Asset',
    'action.newLiability': '+ New Liability',
    'action.newIncome': '+ New Income',
    'action.newExpense': '+ New Expense',
    'action.newEvent': '+ New Event',
    'search.label': 'Search',
    'search.placeholder': 'Search activity, client, or category',
    'summary.balanceGeneral': 'Overall balance',
    'summary.totalIncome': 'Total income',
    'summary.totalExpenses': 'Total expenses',
    'form.generatesIncome': 'Generates income',
    'form.generatesExpense': 'Generates expense',
    'language.es': 'Spanish',
    'language.en': 'English',
    'header.console': 'Capital Console',
    'header.financialControl': 'Financial control',
    'chart.timeframe.day': 'Day',
    'chart.timeframe.week': 'Week',
    'chart.timeframe.month': 'Month',
    'chart.timeframe.year': 'Year',
    'chart.cashFlow.eyebrow': 'Flow intelligence',
    'chart.cashFlow.title': 'Net flow',
    'chart.cashFlow.subtitle': 'Income, expenses, and net result with a clean axis for executive reading.',
    'chart.cashFlow.income': 'Income',
    'chart.cashFlow.expenses': 'Expenses',
    'chart.cashFlow.netFlow': 'Net flow',
    'chart.cashFlow.surplus': 'Surplus',
    'chart.cashFlow.deficit': 'Deficit',
    'chart.cashFlow.deficitHint': 'Deficits marked as alerts',
    'chart.cashFlow.deficitInsight': 'This period has a loss: the main axis stays clean and the trend is shown as an alert.',
    'chart.cashFlow.emptyTitle': 'No financial movements yet.',
    'chart.cashFlow.emptyBody': 'Add income and expenses to visualize your executive cash flow.',
    'chart.distribution.eyebrow': 'Financial distribution',
    'chart.distribution.title': 'Financial distribution',
    'chart.distribution.subtitle': 'Contextual reading of assets, liabilities, income, and monthly expenses.',
    'chart.distribution.assets': 'Assets',
    'chart.distribution.liabilities': 'Liabilities',
    'chart.distribution.income': 'Income',
    'chart.distribution.expenses': 'Expenses',
    'chart.distribution.assets.description': 'Accounts and property that create patrimonial value.',
    'chart.distribution.liabilities.description': 'Financial commitments that reduce available net worth.',
    'chart.distribution.income.description': 'Net inflows that sustain monthly cash flow.',
    'chart.distribution.expenses.description': 'Monthly outflows that consume operating liquidity.',
    'chart.distribution.centerDefault': 'Net worth',
    'chart.distribution.insightTitle': 'Financial insight',
    'chart.distribution.insightBody': 'Hover a category to see percentage, amount, and executive reading.',
    'chart.distribution.emptyTitle': 'No patrimonial distribution yet.',
    'chart.distribution.emptyBody': 'Add records to build your financial map.'
  }
};
