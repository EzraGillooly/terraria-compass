import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, 'src', 'data');
const loadoutsDir = path.join(dataDir, 'loadouts');

const phaseId = z.enum([
  'pre-bosses',
  'pre-skeletron',
  'pre-wof',
  'pre-mech',
  'pre-plantera',
  'pre-golem',
  'pre-cultist',
  'pre-moonlord',
  'endgame',
]);

const classId = z.enum(['melee', 'ranger', 'mage', 'summoner']);
const itemSlot = z.enum(['weapon', 'armor', 'accessory', 'buff']);

const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slot: itemSlot,
  icon: z.string(),
  source: z.string(),
  why: z.string(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  topPick: z.boolean().default(false),
  subclass: z.string().optional(),
  wikiUrl: z.string().url().optional(),
});

const loadoutSchema = z.object({
  phase: phaseId,
  class: classId,
  weapons: z.array(itemSchema),
  armor: z.array(itemSchema),
  accessories: z.array(itemSchema),
  buffs: z.array(itemSchema),
});

const phaseSchema = z.array(
  z.object({
    id: phaseId,
    order: z.number(),
    name: z.string(),
    triggeredBy: z.string(),
    bossIcon: z.string().optional(),
    cues: z.array(z.string()),
    description: z.string(),
  }),
);

const classSchema = z.array(
  z.object({
    id: classId,
    name: z.string(),
    blurb: z.string(),
    subclasses: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
      }),
    ),
  }),
);

async function parseJsonFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function formatIssue(filePath, issue) {
  const relativePath = path.relative(repoRoot, filePath);
  const issuePath = issue.path.length > 0 ? issue.path.join('.') : '(root)';
  return `${relativePath}: ${issuePath} - ${issue.message}`;
}

async function validateStaticFiles() {
  const phaseFile = path.join(dataDir, 'phases.json');
  const classFile = path.join(dataDir, 'classes.json');

  phaseSchema.parse(await parseJsonFile(phaseFile));
  classSchema.parse(await parseJsonFile(classFile));
}

async function validateLoadoutFiles() {
  const entries = await readdir(loadoutsDir, { withFileTypes: true });
  const jsonFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(loadoutsDir, entry.name));

  if (jsonFiles.length === 0) {
    console.log('no loadout files to validate yet');
    return;
  }

  for (const filePath of jsonFiles) {
    const parsed = await parseJsonFile(filePath);
    z.array(loadoutSchema).parse(parsed);
  }
}

try {
  await validateStaticFiles();
  await validateLoadoutFiles();
  console.log('data validation passed');
} catch (error) {
  if (error instanceof z.ZodError) {
    for (const issue of error.issues) {
      console.error(formatIssue(repoRoot, issue));
    }
    process.exit(1);
  }

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown validation error');
  }

  process.exit(1);
}
