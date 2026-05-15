/** Extract numeric amount from marketplace price strings like "₹500/hr" or "₹800/consult". */
export function parsePriceAmount(priceLabel: string): number {
  const match = priceLabel.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? Math.round(Number(match[1])) : 999;
}
