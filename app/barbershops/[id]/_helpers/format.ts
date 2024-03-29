export function formatCurrencyToBRL(currency: number): string {
  return Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(currency));
}
