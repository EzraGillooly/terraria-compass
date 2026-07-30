/**
 * Validate data against a zod schema and return the parsed result.
 *
 * This runs in production as well as development, and deliberately so: parsing
 * is not only validation, it is also what applies the schema's defaults
 * (`ammo`, `tools`, `accessoryPool`, `tags`, ...). Skipping it in production
 * once seemed a free win, but it left those defaults unapplied - 80 Calamity
 * loadouts omit `ammo`, so `loadout.ammo.length` threw only in the built site,
 * never in dev. Parsing runs once, when a pack's chunk is lazily loaded (not on
 * first paint), so the cost is a one-time hitch behind the loading splash rather
 * than something every visitor pays up front.
 */
export function parseData<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  return schema.parse(data);
}
