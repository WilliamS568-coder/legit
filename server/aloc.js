import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

export const STATION_BASE_URL = 'https://dev.aloc.com.ng/api/v1';

/**
 * Legacy ALOC Endpoints (questions.aloc.com.ng/api/v2).
 *
 * The batch endpoint returns up to 40 questions for one exam year in a single
 * call, with worked `solution` text, and bills against a separate free quota.
 * It silently pads with questions from other years when the requested year has
 * no data, so every response is filtered down to the exact year.
 * The service is rate limited (bursts answer HTTP 406) and shuts down on
 * 2027-07-31, which is why Station stays in the routing path.
 */
export const LEGACY_BASE_URL = 'https://questions.aloc.com.ng/api/v2';
export const LEGACY_BATCH_SIZE = 40;
export const LEGACY_CALL_GAP_MS = 400;
export const LEGACY_YEAR_CACHE_TTL_MS = 30 * 60 * 1000;
// Only the recent window is worth probing; older years are covered upstream.
export const LEGACY_PROBE_MIN_YEAR = 2019;

// Station subject slugs -> legacy subject slugs (legacy has no `literature`).
export const LEGACY_SUBJECT_NAMES = {
  'english-language': 'english',
  english: 'english',
  mathematics: 'mathematics',
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
  economics: 'economics',
  government: 'government',
  accounting: 'accounting',
  commerce: 'commerce',
  geography: 'geography',
  history: 'history',
  'literature-in-english': 'englishlit',
  'christian-religious-studies': 'crk',
};

// Matches the subject buttons in the CBT simulator.
export const SUBJECT_SLUGS = Object.keys(LEGACY_SUBJECT_NAMES).filter(
  (slug) => slug !== 'english'
);

const legacyYearCache = new Map();
let legacyGate = Promise.resolve();

// Serialise legacy calls and leave a gap between them; bursts get HTTP 406.
function scheduleLegacyCall(work) {
  const run = legacyGate.then(async () => {
    try {
      return await work();
    } finally {
      await new Promise((resolve) => setTimeout(resolve, LEGACY_CALL_GAP_MS));
    }
  });
  legacyGate = run.catch(() => {});
  return run;
}

export function hasLegacyToken() {
  return Boolean(process.env.ALOC_LEGACY_TOKEN);
}

export async function requestLegacyBatch(legacySubject, year) {
  const token = process.env.ALOC_LEGACY_TOKEN;
  if (!token) return { status: 0, rows: [] };

  const url = new URL(`${LEGACY_BASE_URL}/m`);
  url.searchParams.set('subject', legacySubject);
  url.searchParams.set('type', 'utme');
  url.searchParams.set('year', String(year));

  return scheduleLegacyCall(async () => {
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Accept: 'application/json', AccessToken: token },
      });
      const responseText = await response.text();

      if (!response.ok) {
        // 406 means either a throttled request or an unsupported subject.
        console.warn('[ALOC Legacy] status', response.status, responseText.substring(0, 160));
        return { status: response.status, rows: [] };
      }

      let payload;
      try {
        payload = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('[ALOC Legacy] invalid JSON:', parseError.message);
        return { status: 502, rows: [] };
      }

      return { status: 200, rows: Array.isArray(payload?.data) ? payload.data : [] };
    } catch (error) {
      console.warn('[ALOC Legacy] network error:', error.message);
      return { status: 502, rows: [] };
    }
  });
}

function countExactYear(rows, year) {
  return rows.filter((row) => String(row.examyear) === String(year)).length;
}

export function mapLegacyQuestion(question, subject, year) {
  return {
    id: `legacy-${question?.id ?? Math.random().toString(36).slice(2)}`,
    text: question?.question || '',
    options: question?.option && typeof question.option === 'object' ? question.option : {},
    correctAnswer: question?.answer || '',
    solution: question?.solution || null,
    section: question?.section || null,
    imageUrl: question?.image || null,
    examType: 'jamb',
    subject,
    year,
    source: 'legacy',
  };
}

export async function countLegacyYear(legacySubject, year) {
  const cacheKey = `${legacySubject}|${year}`;
  const cached = legacyYearCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.count;

  const { status, rows } = await requestLegacyBatch(legacySubject, year);
  const count = status === 200 ? countExactYear(rows, year) : 0;

  legacyYearCache.set(cacheKey, { count, expiresAt: Date.now() + LEGACY_YEAR_CACHE_TTL_MS });
  return count;
}

export async function fetchLegacyYearQuestions(subject, examType, year) {
  const legacySubject = LEGACY_SUBJECT_NAMES[String(subject).toLowerCase()];
  const yearNumber = Number.parseInt(year, 10);
  if (!legacySubject || String(examType).toLowerCase() !== 'jamb' || !Number.isFinite(yearNumber)) return [];

  const { status, rows } = await requestLegacyBatch(legacySubject, yearNumber);
  if (status !== 200) return [];

  // Legacy pads an empty year with questions from other years; keep the exact year only.
  return rows
    .filter((row) => String(row.examyear) === String(yearNumber))
    .slice(0, LEGACY_BATCH_SIZE)
    .map((row) => mapLegacyQuestion(row, subject, yearNumber));
}

/**
 * Station year coverage: [{ year, breakdown: { jamb: n, ... } }].
 * The endpoint is free, so no credits are spent by refreshing the snapshot.
 */
export async function fetchStationYears(subject) {
  const apiKey = process.env.ALOC_API_KEY;
  if (!apiKey) throw new Error('ALOC_API_KEY is not set on the server');

  const url = new URL(`${STATION_BASE_URL}/subjects/${encodeURIComponent(subject)}/years`);
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json', 'X-API-Key': apiKey },
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Station years request failed (${response.status}): ${responseText.substring(0, 200)}`);
  }

  const payload = JSON.parse(responseText);
  return Array.isArray(payload?.data) ? payload.data : [];
}
