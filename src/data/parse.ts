/**
 * Validate data against a zod schema in development, trust it in production.
 *
 * Every data file is validated at build time by `npm run data:validate` (which
 * CI gates on), so re-running the same schema over ~6,000 item objects on the
 * main thread at every page load buys the visitor nothing - it only delays first
 * paint. In development the check still runs, so a bad edit is caught while
 * editing rather than in CI.
 */
export function devParse<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  return import.meta.env.DEV ? schema.parse(data) : (data as T);
}
