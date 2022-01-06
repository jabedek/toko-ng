export function roundToTwo(num: any): string {
  let numFormatted = (Math.round(num * 100) / 100).toFixed(2);

  if (numFormatted.length === 4) {
    numFormatted = '000' + numFormatted;
  } else if (numFormatted.length === 5) {
    numFormatted = '00' + numFormatted;
  } else if (numFormatted.length === 6) {
    numFormatted = '0' + numFormatted;
  }
  return numFormatted;
}
