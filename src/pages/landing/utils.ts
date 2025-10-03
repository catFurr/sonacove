
/**
 * Extracts the numeric value and currency symbol from a formatted price string,
 * truncates the value to 2 decimal places (without rounding), and returns the components.
 *
 * @param {string} formattedPrice - The price string, e.g. "$19.99" or "€20.50".
 * @returns {{ numeric: number, currencySymbol: string, formatted: string }} 
 */
export function floorPrice(formattedPrice: string) {
  const numeric = parseFloat(formattedPrice.replace(/[^0-9.]/g, ''));
  const currencySymbol = formattedPrice.trim().charAt(0);
  const truncated = Math.floor(numeric * 100) / 100;
  return {
    numeric,
    currencySymbol,
    formatted: `${currencySymbol}${truncated.toFixed(2)}`,
  };
}

/**
 * Applies a percentage discount to a given price.
 *
 * @param {number} price - The original price before discount.
 * @param {number} discountPercent - The discount percentage (e.g. 0.2 for 20% off).
 * @returns {number} The discounted price.
 */
export function applyDiscount(price: number, discountPercent: number) {
  return price - price * discountPercent;
}