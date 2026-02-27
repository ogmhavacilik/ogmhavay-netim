function parseGoogleSheetsDateToHours(dateStr: string) {
  const d = new Date(dateStr);
  // Google Sheets epoch is Dec 30, 1899.
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const diffMs = d.getTime() - epoch.getTime();
  return diffMs / (1000 * 60 * 60);
}

console.log(parseGoogleSheetsDateToHours("1900-01-26T15:48:04.000Z"));
console.log(parseGoogleSheetsDateToHours("1900-01-27T12:33:04.000Z"));
console.log(parseGoogleSheetsDateToHours("1900-02-07T22:03:04.000Z"));
