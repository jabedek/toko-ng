export function roundToTwo(num: any): string {
  // return +(Math.round((num + 'e+2') as any) + 'e-2');
  return (Math.round(num * 100) / 100).toFixed(2);
}
