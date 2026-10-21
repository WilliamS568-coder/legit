#!/usr/bin/env node
/**
 * Export ALOC past questions to JSON files on disk.
 *
 * Usage (run from the server/ directory):
 *   node export-questions.js                      # current year, all subjects
 *   node export-questions.js --from 2020          # 2020 .. current year
 *   node export-questions.js --from 2026 --to 2026 --subject physics --subject chemistry
 *   node export-questions.js --exam waec --from 2024
 *   node export-questions.js --from 2026 --dry-run
 *
 * Output: server/exports/<exam>/<year>/<subject>.json plus exports/manifest.json
 *
 * Cost: ALOC bills list-questions at 1 credit per request and caps each page at
 * 15 questions, so a 40-question paper costs 3 credits. Rapid pagination can
 * trigger escalated credits, which this script reports if the API flags it.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

const API_BASE = 'https://dev.aloc.com.ng/api/v1';
const PAGE_LIMIT = 15; // ALOC rejects anything above 15
const MAX_PAGES_PER_YEAR = 40;

const args = process.argv.slice(2);

function flagValue(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function flagValues(name) {
  return args.reduce((values, arg, index) => {
    if (arg === `--${name}` && args[index + 1]) values.push(args[index + 1]);
    return values;
  }, []);
}

const currentYear = new Date().getFullYear();
const fromYear = Number.parseInt(flagValue('from', String(currentYear)), 10);
const toYear = Number.parseInt(flagValue('to', String(currentYear)), 10);
const examType = flagValue('exam', 'jamb');
const outDir = path.resolve(__dirname, flagValue('out', 'exports'));
const delayMs = Number.parseInt(flagValue('delay', '400'), 10);
const subjectFilters = flagValues('subject').map((subject) => subject.toLowerCase());
const dryRun = args.includes('--dry-run');

const apiKey = process.env.ALOC_API_KEY;

if (!apiKey) {
  console.error('ALOC_API_KEY is missing. Add it to server/.env before exporting.');
  process.exit(1);
}

if (Number.isNaN(fromYear) || Number.isNaN(toYear) || fromYear > toYear) {
  console.error('Invalid year range. Use --from YYYY --to YYYY with from <= to.');
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let creditsUsed = 0;
let creditsRemaining = null;
let escalated = false;

async function aloc(pathname, searchParams = {}) {
  const url = new URL(`${API_BASE}${pathname}`);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url.toString(), {
      headers: { Accept: 'application/json', 'X-API-Key': apiKey },
    });

    if (response.status === 429) {
      const retryAfter = Number.parseInt(response.headers.get('retry-after') || '60', 10);
      console.warn(`  rate limited, waiting ${retryAfter}s...`);
      await sleep(retryAfter * 1000);
      continue;
    }

    creditsUsed += Number.parseInt(response.headers.get('x-credits-used') || '0', 10) || 0;
    const remaining = response.headers.get('x-credits-remaining');
    if (remaining !== null) creditsRemaining = Number.parseInt(remaining, 10);
    if (response.headers.get('x-cursor-sweep-escalated') === 'true') escalated = true;

    const text = await response.text();

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status} for ${url.pathname}${url.search}`);
      error.status = response.status;
      error.body = text.slice(0, 300);
      throw error;
    }

    await sleep(delayMs);
    return JSON.parse(text);
  }

  throw new Error(`Gave up after repeated rate limiting on ${url.pathname}${url.search}`);
}

async function fetchAllQuestions(subject, year) {
  const collected = [];
  let cursor = null;

  for (let page = 0; page < MAX_PAGES_PER_YEAR; page += 1) {
    const body = await aloc('/questions', {
      subject,
      examType,
      year,
      limit: PAGE_LIMIT,
      cursor: cursor || undefined,
    });

    const rows = Array.isArray(body.data) ? body.data : [];
    collected.push(...rows);

    cursor = body?.pagination?.nextCursor || body?.meta?.nextCursor || null;
    if (!cursor || rows.length === 0) break;
  }

  return collected;
}

async function main() {
  console.log(`Exporting ${examType.toUpperCase()} questions for ${fromYear}-${toYear}`);
  console.log(`Output: ${outDir}${dryRun ? ' (dry run - nothing written)' : ''}\n`);

  const subjectList = await aloc('/subjects');
  const subjects = (subjectList.data || [])
    .filter((subject) => !subjectFilters.length || subjectFilters.includes(subject.name.toLowerCase()))
    .filter((subject) => Array.isArray(subject.examTypes) && subject.examTypes.includes(examType));

  if (subjects.length === 0) {
    console.error('No subjects matched the requested filters.');
    process.exit(1);
  }

  const manifest = {
    exportedAt: new Date().toISOString(),
    examType,
    fromYear,
    toYear,
    files: [],
  };

  for (const subject of subjects) {
    let coverage;
    try {
      coverage = await aloc(`/subjects/${encodeURIComponent(subject.name)}/years`);
    } catch (error) {
      console.warn(`${subject.name}: could not read year coverage (${error.message}) - skipped`);
      continue;
    }

    const years = (coverage.data || [])
      .filter((row) => row.year >= fromYear && row.year <= toYear)
      .filter((row) => (row.breakdown?.[examType] ?? 0) > 0)
      .map((row) => row.year)
      .sort((a, b) => b - a);

    if (years.length === 0) {
      console.log(`${subject.name.padEnd(30)} no questions in ${fromYear}-${toYear}`);
      continue;
    }

    for (const year of years) {
      if (dryRun) {
        const planned = coverage.data.find((row) => row.year === year)?.breakdown?.[examType] ?? 0;
        manifest.files.push({
          subject: subject.name,
          year,
          count: planned,
          path: path.join(examType, String(year), `${subject.name}.json`),
        });
        console.log(`${subject.name.padEnd(30)} ${year}  ${String(planned).padStart(3)} questions (planned)`);
        continue;
      }

      try {
        const questions = await fetchAllQuestions(subject.name, year);
        const target = path.join(outDir, examType, String(year), `${subject.name}.json`);

        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(
          target,
          `${JSON.stringify(
            {
              subject: subject.name,
              displayName: subject.displayName,
              examType,
              year,
              exportedAt: manifest.exportedAt,
              count: questions.length,
              questions,
            },
            null,
            2
          )}\n`
        );

        manifest.files.push({ subject: subject.name, year, count: questions.length, path: path.relative(outDir, target) });
        console.log(`${subject.name.padEnd(30)} ${year}  ${String(questions.length).padStart(3)} questions`);
      } catch (error) {
        console.error(`${subject.name} ${year}: ${error.message}${error.body ? ` - ${error.body}` : ''}`);
      }
    }
  }

  manifest.totals = {
    files: manifest.files.length,
    questions: manifest.files.reduce((total, file) => total + file.count, 0),
    creditsUsed,
  };

  if (!dryRun) {
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  }

  console.log(`\nDone. ${manifest.totals.files} files, ${manifest.totals.questions} questions, ${creditsUsed} credits used.`);
  if (creditsRemaining !== null) console.log(`Credits remaining: ${creditsRemaining}`);
  if (escalated) {
    console.warn('ALOC flagged escalated credits for fast pagination - raise --delay to slow down next run.');
  }
}

main().catch((error) => {
  console.error('Export failed:', error.message);
  process.exit(1);
});
