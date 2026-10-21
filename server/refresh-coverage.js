/**
 * Builds server/data/coverage.json: how many JAMB questions each subject has
 * per exam year, across both ALOC providers.
 *
 * The CBT year picker reads this file, so refreshing it is the only time the
 * app spends calls on coverage. Station's `/subjects/:subject/years` endpoint
 * is free; legacy probes cost one call per subject/year that Station reports
 * empty (and are rate limited, so they run sequentially).
 *
 *   npm run refresh-coverage
 *   npm run refresh-coverage -- --min-year 2022
 *   npm run refresh-coverage -- --subject physics,chemistry
 *   npm run refresh-coverage -- --no-legacy
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  LEGACY_PROBE_MIN_YEAR,
  LEGACY_SUBJECT_NAMES,
  SUBJECT_SLUGS,
  countLegacyYear,
  fetchStationYears,
  hasLegacyToken,
} from './aloc.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, 'data', 'coverage.json');

function parseArgs(argv) {
  const options = {
    minYear: LEGACY_PROBE_MIN_YEAR,
    subjects: SUBJECT_SLUGS,
    useLegacy: hasLegacyToken(),
    maxYear: new Date().getFullYear(),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--no-legacy') options.useLegacy = false;
    else if (arg === '--min-year') options.minYear = Number.parseInt(argv[++index], 10);
    else if (arg === '--max-year') options.maxYear = Number.parseInt(argv[++index], 10);
    else if (arg === '--subject') {
      options.subjects = argv[++index]
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node refresh-coverage.js [--min-year 2019] [--max-year 2026] [--subject physics,chemistry] [--no-legacy]');
      process.exit(0);
    }
  }

  if (!Number.isFinite(options.minYear) || !Number.isFinite(options.maxYear)) {
    throw new Error('--min-year and --max-year must be numbers');
  }

  const unknown = options.subjects.filter((subject) => !LEGACY_SUBJECT_NAMES[subject]);
  if (unknown.length > 0) {
    throw new Error(`Unknown subject(s): ${unknown.join(', ')}\nKnown: ${SUBJECT_SLUGS.join(', ')}`);
  }

  return options;
}

async function stationCounts(subject) {
  const rows = await fetchStationYears(subject);
  return rows.reduce((counts, row) => {
    const jamb = row?.breakdown?.jamb;
    if (typeof jamb === 'number' && jamb > 0) counts[Number(row.year)] = jamb;
    return counts;
  }, {});
}

async function buildCoverage(options) {
  const snapshot = {
    generatedAt: new Date().toISOString(),
    minYear: options.minYear,
    maxYear: options.maxYear,
    legacyProbed: options.useLegacy,
    subjects: {},
  };

  let legacyCalls = 0;
  let stationFailures = 0;

  for (const subject of options.subjects) {
    let counts = {};

    try {
      counts = await stationCounts(subject);
    } catch (error) {
      stationFailures += 1;
      console.warn(`${subject}: station coverage failed (${error.message}) - legacy only`);
    }

    if (options.useLegacy) {
      const legacySubject = LEGACY_SUBJECT_NAMES[subject];
      const missingYears = [];

      for (let year = options.maxYear; year >= options.minYear; year -= 1) {
        if (!counts[year]) missingYears.push(year);
      }

      for (const year of missingYears) {
        const count = await countLegacyYear(legacySubject, year);
        legacyCalls += 1;
        if (count > 0) counts[year] = count;
      }
    }

    const sorted = Object.keys(counts)
      .map(Number)
      .sort((a, b) => b - a)
      .reduce((out, year) => {
        out[year] = counts[year];
        return out;
      }, {});

    snapshot.subjects[subject] = sorted;

    const recent = Object.entries(sorted)
      .filter(([year]) => Number(year) >= options.minYear)
      .map(([year, count]) => `${year}:${count}`)
      .join(' ');

    console.log(`${subject.padEnd(30)} ${recent || '(nothing in range)'}`);
  }

  snapshot.legacyCalls = legacyCalls;
  snapshot.stationFailures = stationFailures;
  return snapshot;
}

const options = parseArgs(process.argv.slice(2));
console.log(
  `Building coverage for ${options.subjects.length} subject(s), ${options.minYear}-${options.maxYear}` +
    `${options.useLegacy ? ' (station + legacy)' : ' (station only)'}\n`
);

const snapshot = await buildCoverage(options);

await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);

const totals = Object.values(snapshot.subjects).reduce(
  (sum, years) => sum + Object.values(years).reduce((inner, count) => inner + count, 0),
  0
);

console.log(`\nWrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
console.log(`Subjects: ${Object.keys(snapshot.subjects).length} | questions indexed: ${totals}`);
console.log(`Legacy calls spent: ${snapshot.legacyCalls}${snapshot.stationFailures ? ` | station failures: ${snapshot.stationFailures}` : ''}`);
