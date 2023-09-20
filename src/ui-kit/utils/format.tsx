import { BigNumber } from "bignumber.js"

export const formatAddress = (address:string = "", offset:number = 5): string => {  
  if (address.length > offset) {
    return `${address.slice(0, offset )}...${address.slice(address.length - offset)}`
  }

  return address
}

export const formatAmount = (amount: number | string): string => {
  if (!amount) return ""

  const parts = amount.toString().split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  
  const output = parts.join(".")

  return output
}

export const maxDecimals = (
  num: number | string,
  decPlaces: number = 2,
  method: "round" | "floor" | "ceil" = "round"
): number => {
  if (typeof num !== "number") num = new BigNumber(num).toNumber()

  const decFactor = 10 ** decPlaces

  return Math[method]((num + Number.EPSILON) * decFactor) / decFactor
}

export const formatHumanAmount = (value: number | string, decPlaces: number = 2): string => {
  if (typeof value === "string") {
    value = value.replaceAll(",", "")
  }
  let amount = new BigNumber(value);

  if (amount.isNaN()) return amount.toString();
  if (amount.isZero()) return "0";

  const decPowOfTen = Math.pow(10, decPlaces);
  const abbrev = ["k", "M", "B", "T"];

  for (let i = abbrev.length - 1; i >= 0; i--) {
    const size = Math.pow(10, (i + 1) * 3)

    if(amount.isGreaterThanOrEqualTo(size)) {
      amount = amount.times(decPowOfTen).dividedBy(size).integerValue().dividedBy(decPowOfTen);

      if (amount.isEqualTo(1000) && (i < abbrev.length - 1)) {
        amount = new BigNumber(1);
        i += 1;
      }

      return `${amount.toString()} ${abbrev[i]}`;
    }
  }

  if (amount.isLessThan(1 / decPowOfTen)) {
    const exponentialNotation = amount.toExponential();
    const parts = exponentialNotation.split(/e/i);
    const coefficient = Math.round(parseFloat(parts[0]) * decPlaces) / decPlaces;
    const exponent = parseInt(parts[1]);
    return `${coefficient}e${exponent}`;
  }

  return String(amount.toFixed(decPlaces));
}
