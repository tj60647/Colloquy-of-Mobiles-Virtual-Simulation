/**
 * Formats a numeric value with a sign (+ or -), specified decimal places, and optional padding for alignment.
 *
 * @param {number} value - The value to be formatted.
 * @param {number} [decimalPlaces=3] - The number of decimal places to retain. Defaults to 3.
 * @param {number} [padWidth=1] - The minimum width for the integer part of the number. Defaults to 1.
 * @param {boolean} [leadingZeroes=false] - Whether to pad the integer part with leading zeroes (true) or spaces (false). Defaults to false.
 * @returns {string} The formatted value as a string, with a sign (+ or -), padded integer part, and decimal portion if applicable.
 *
 * @example
 * // Returns "+012.345"
 * formatValue(12.345, 3, 3, true);
 *
 * @example
 * // Returns "-  5.00"
 * formatValue(-5, 2, 3, false);
 */
export function formatValue(
  value,
  decimalPlaces = 3,
  padWidth = 1,
  leadingZeroes = false
) {
  // Ensure the numeric value has the specified number of decimal places
  let numericValue = Math.abs(value).toFixed(decimalPlaces);

  // Split the numeric value into integer and decimal parts
  let [integerPart, decimalPart] = numericValue.split(".");

  // Pad the integer part to ensure it reaches at least the specified pad width
  if (leadingZeroes) {
    // Pad with leading zeroes if `leadingZeroes` is true
    integerPart = integerPart.padStart(padWidth, "0");
  } else {
    // Pad with spaces if `leadingZeroes` is false (for better alignment in output)
    integerPart = integerPart.padStart(padWidth, " ");
  }

  // Combine the integer and decimal parts
  // Add a "+" or "-" sign depending on the value of `value`
  // If there is no decimal part, we omit the decimal point
  return `${value < 0 ? "-" : "+"}${integerPart}${
    decimalPart ? `.${decimalPart}` : ""
  }`;
}

// Utility to parse color from hex to rgba,
export function hexToRgba(hex, alpha = 1.0, intensity = 1.0) {
  let red = (hex >> 16) & 0xff;
  let green = (hex >> 8) & 0xff;
  let blue = hex & 0xff;
  red = Math.floor(red * intensity);
  green = Math.floor(green * intensity);
  blue = Math.floor(blue * intensity);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
