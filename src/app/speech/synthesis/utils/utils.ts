export function roundToTwo(num: any): number {
  return +(Math.round((num + 'e+2') as any) + 'e-2');
}
