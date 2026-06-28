export function formatCurrency(
   value: number,
   locale: string = 'pt-BR',
   currency: string = 'BRL',
): string {
   return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
   }).format(value / 100);
}
