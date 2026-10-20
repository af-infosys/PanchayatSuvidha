export default function toGujaratiNumber(num, format) {
  // English to Gujarati digit mapping
  const gujaratiDigits = {
    0: "૦",
    1: "૧",
    2: "૨",
    3: "૩",
    4: "૪",
    5: "૫",
    6: "૬",
    7: "૭",
    8: "૮",
    9: "૯",
  };

  let str = String(num);

  if (format) {
    // Handle negative numbers
    const isNegative = str.startsWith("-");
    if (isNegative) str = str.slice(1);

    // Split integer & decimal parts
    const [integerPart, decimalPart] = str.split(".");

    // Indian number formatting
    let last3 = integerPart.slice(-3);
    let rest = integerPart.slice(0, -3);

    if (rest.length > 0) {
      rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      str = rest + "," + last3;
    } else {
      str = last3;
    }

    if (decimalPart) {
      str += "." + decimalPart;
    }

    if (isNegative) {
      str = "-" + str;
    }
  }

  // Convert number to string, then map each digit
  return str
    .split("")
    .map((char) => gujaratiDigits[char] || char)
    .join("");
}
