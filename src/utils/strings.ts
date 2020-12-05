export function joinStrings(l: any[], delimiter: string) {
  if (!l) {
    return "";
  }
  return l.reduce((a, b) => `${a}${delimiter}${b}`);
}
