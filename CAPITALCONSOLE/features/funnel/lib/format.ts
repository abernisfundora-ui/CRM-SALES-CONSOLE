export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);
}

export function formatRate(value: number) {
  return `${(value * 100).toFixed(2)}¢/kWh`;
}
