/** Local calendar date at UTC midnight — keeps MySQL DATE lookups consistent */
export function calendarDateOnly(d = new Date()): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
