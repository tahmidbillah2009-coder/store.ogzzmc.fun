export const USD_TO_RS_RATE = 84;

/**
 * Formats a USD price into a combined USD and RS string.
 * Example: 9.99, 800 -> "$9.99 (Rs. 800)"
 */
export function formatPrice(priceUSD: number, priceRSDirect?: number): string {
  if (typeof priceUSD !== 'number' || isNaN(priceUSD)) {
    return '$0.00 (Rs. 0)';
  }
  const priceRS = typeof priceRSDirect === 'number' && !isNaN(priceRSDirect) && priceRSDirect >= 0
    ? priceRSDirect 
    : priceUSD * USD_TO_RS_RATE;
  return `$${priceUSD.toFixed(2)} (Rs. ${Math.round(priceRS).toLocaleString()})`;
}

/**
 * Formats a USD price with Rs. as a slash-separated string.
 * Example: 9.99, 800 -> "$9.99 / Rs. 800"
 */
export function formatPriceSlash(priceUSD: number, priceRSDirect?: number): string {
  if (typeof priceUSD !== 'number' || isNaN(priceUSD)) {
    return '$0.00 / Rs. 0';
  }
  const priceRS = typeof priceRSDirect === 'number' && !isNaN(priceRSDirect) && priceRSDirect >= 0
    ? priceRSDirect 
    : priceUSD * USD_TO_RS_RATE;
  return `$${priceUSD.toFixed(2)} / Rs. ${Math.round(priceRS).toLocaleString()}`;
}

/**
 * Returns the equivalent price in Rupees (RS) as a numeric value.
 */
export function getRSValue(priceUSD: number, priceRSDirect?: number): number {
  if (typeof priceRSDirect === 'number' && !isNaN(priceRSDirect) && priceRSDirect >= 0) {
    return priceRSDirect;
  }
  return priceUSD * USD_TO_RS_RATE;
}

/**
 * Returns the formatted Rupee value alone.
 * Example: 9.99, 800 -> "Rs. 800"
 */
export function formatRS(priceUSD: number, priceRSDirect?: number): string {
  const priceRS = typeof priceRSDirect === 'number' && !isNaN(priceRSDirect) && priceRSDirect >= 0
    ? priceRSDirect 
    : priceUSD * USD_TO_RS_RATE;
  return `Rs. ${Math.round(priceRS).toLocaleString()}`;
}
