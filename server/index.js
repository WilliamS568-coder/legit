import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  LEGACY_PROBE_MIN_YEAR,
  LEGACY_SUBJECT_NAMES,
  countLegacyYear,
  fetchLegacyYearQuestions,
  hasLegacyToken,
} from './aloc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Security: Only allow your Vite dev server origin
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com']
    : ['http://localhost:5173'],
  credentials: true,
}));

/**
 * Proxy endpoint for ALOC API questions.
 * Frontend calls /api/questions?subject=...&examType=...&year=...&limit=...
 * This server injects the X-API-Key header and forwards to ALOC.
 *
 * ALOC caps `limit` at 15 per page, so larger requests are paginated here
 * with the upstream cursor and stitched back into one response.
 */
const MAX_UPSTREAM_PAGE_SIZE = 15;
const MAX_TOTAL_QUESTIONS = 100; // guards against accidental bulk scraping

app.get('/api/questions', async (req, res) => {
  const { subject, examType, year, count, limit } = req.query;
  // ALOC expects `limit`; `count` is accepted from older clients.
  const requestedLimit = limit ?? count;

  // Validate required parameters
  if (!subject || !examType || !year) {
    console.error('[ALOC Proxy] Missing required parameters:', { subject, examType, year });
    return res.status(400).json({
      error: 'Missing required parameters',
      required: ['subject', 'examType', 'year'],
      received: { subject, examType, year },
    });
  }

  let requestedTotal = Number.parseInt(requestedLimit ?? '10', 10);
  if (!Number.isFinite(requestedTotal) || requestedTotal < 1) requestedTotal = 10;
  requestedTotal = Math.min(requestedTotal, MAX_TOTAL_QUESTIONS);

  // Legacy first: one call for a whole exam year, and it carries explanations.
  try {
    const legacyQuestions = await fetchLegacyYearQuestions(subject, examType, year);
    if (legacyQuestions.length > 0) {
      console.log('[ALOC Proxy] Serving', legacyQuestions.length, 'legacy questions for', { subject, year });
      return res.status(200).json({
        data: legacyQuestions.slice(0, requestedTotal),
        source: 'legacy',
        pagination: {
          requested: requestedTotal,
          returned: Math.min(legacyQuestions.length, requestedTotal),
          pages: 1,
          hasMore: false,
        },
      });
    }
  } catch (legacyError) {
    console.warn('[ALOC Proxy] Legacy provider failed, falling back to Station:', legacyError.message);
  }

  // Check server-side API key exists
  const apiKey = process.env.ALOC_API_KEY;
  if (!apiKey) {
    console.error('[ALOC Proxy] ALLOC_API_KEY is not set on the server');
    return res.status(500).json({
      error: 'Server configuration error',
      detail: 'ALOC_API_KEY is missing on the server',
    });
  }

  // Log key prefix (never log full key)
  console.log('[ALOC Proxy] Using API key prefix:', apiKey.substring(0, 7) + '...');

  const buildPageUrl = (pageSize, cursor) => {
    const pageUrl = new URL('https://dev.aloc.com.ng/api/v1/questions');
    pageUrl.searchParams.set('subject', String(subject).toLowerCase());
    pageUrl.searchParams.set('examType', String(examType));
    pageUrl.searchParams.set('year', String(year));
    pageUrl.searchParams.set('limit', String(pageSize));
    if (cursor) pageUrl.searchParams.set('cursor', cursor);
    return pageUrl;
  };

  console.log('[ALOC Proxy] Fetching', { subject, examType, year, requestedTotal });

  try {
    const collected = [];
    let cursor = null;
    let pages = 0;

    while (collected.length < requestedTotal && pages < 10) {
      const pageSize = Math.min(MAX_UPSTREAM_PAGE_SIZE, requestedTotal - collected.length);
      const pageUrl = buildPageUrl(pageSize, cursor);

      const response = await fetch(pageUrl.toString(), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-API-Key': apiKey,
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error('[ALOC Proxy] Upstream status:', response.status);
        console.error('[ALOC Proxy] Upstream response preview:', responseText.substring(0, 500));
        return res.status(response.status).json({
          error: 'ALOC upstream error',
          upstreamStatus: response.status,
          detail: responseText,
        });
      }

      let page;
      try {
        page = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[ALOC Proxy] Failed to parse upstream JSON:', parseError.message);
        return res.status(502).json({
          error: 'Invalid JSON from ALOC API',
          detail: responseText.substring(0, 1000),
        });
      }

      const rows = Array.isArray(page.data) ? page.data : page.data ? [page.data] : [];
      collected.push(...rows);
      pages += 1;

      cursor = page?.pagination?.nextCursor || page?.meta?.nextCursor || null;

      if (!cursor || rows.length === 0) break;
    }

    return res.status(200).json({
      data: collected.slice(0, requestedTotal),
      source: 'station',
      pagination: {
        requested: requestedTotal,
        returned: Math.min(collected.length, requestedTotal),
        pages,
        hasMore: Boolean(cursor),
      },
    });
  } catch (error) {
    console.error('[ALOC Proxy] Network error:', error.message);
    return res.status(502).json({
      error: 'Network error contacting ALOC API',
      detail: error.message,
    });
  }
});

/**
 * Proxy for ALOC subject year coverage.
 * Frontend calls /api/subject-years?subject=... to learn which years actually
 * have questions, so the picker never offers an empty year.
 */
const subjectYearsCache = new Map();
const SUBJECT_YEARS_TTL_MS = 10 * 60 * 1000;

/**
 * Fill recent years that Station reports as empty with legacy counts, so the
 * picker reflects both providers. Runs sequentially because legacy throttles
 * bursts; results are cached per subject/year for 30 minutes.
 */
async function mergeLegacyCoverage(subject, stationPayload) {
  const legacySubject = LEGACY_SUBJECT_NAMES[subject];
  if (!legacySubject || !hasLegacyToken()) return stationPayload;

  const rows = Array.isArray(stationPayload?.data) ? stationPayload.data : [];
  const byYear = new Map(rows.map((row) => [Number(row.year), row]));

  const currentYear = new Date().getFullYear();
  const oldestProbe = Math.max(LEGACY_PROBE_MIN_YEAR, currentYear - 8);
  const missingYears = [];

  for (let year = currentYear; year >= oldestProbe; year -= 1) {
    const jambCount = byYear.get(year)?.breakdown?.jamb ?? 0;
    if (!jambCount) missingYears.push(year);
  }

  for (const year of missingYears) {
    const count = await countLegacyYear(legacySubject, year);
    if (!count) continue;

    const existingRow = byYear.get(year);
    if (existingRow) {
      existingRow.breakdown = { ...(existingRow.breakdown || {}), jamb: count };
    } else {
      byYear.set(year, { year, breakdown: { jamb: count } });
    }
  }

  return {
    ...stationPayload,
    data: [...byYear.values()].sort((a, b) => Number(b.year) - Number(a.year)),
  };
}

/**
 * Coverage snapshot written by `npm run refresh-coverage`.
 * Serving the picker from this file keeps year availability free: without it,
 * every first visit to a subject spends up to 9 legacy calls probing.
 */
const COVERAGE_SNAPSHOT_PATH = path.join(__dirname, 'data', 'coverage.json');
const COVERAGE_SNAPSHOT_RECHECK_MS = 60 * 1000;
let coverageSnapshotCache = { data: null, mtimeMs: 0, checkedAt: 0 };

function loadCoverageSnapshot() {
  try {
    const { mtimeMs } = fs.statSync(COVERAGE_SNAPSHOT_PATH);
    const now = Date.now();
    const fresh = now - coverageSnapshotCache.checkedAt < COVERAGE_SNAPSHOT_RECHECK_MS;

    if (coverageSnapshotCache.data && coverageSnapshotCache.mtimeMs === mtimeMs && fresh) {
      return coverageSnapshotCache.data;
    }

    const data = JSON.parse(fs.readFileSync(COVERAGE_SNAPSHOT_PATH, 'utf8'));
    coverageSnapshotCache = { data, mtimeMs, checkedAt: now };
    return data;
  } catch {
    // No snapshot yet: fall back to the live probe path below.
    return null;
  }
}

function buildSnapshotRows(snapshot, subject) {
  const counts = snapshot?.subjects?.[subject];
  if (!counts) return null;

  return Object.entries(counts)
    .map(([year, count]) => ({ year: Number(year), breakdown: { jamb: Number(count) } }))
    .sort((a, b) => b.year - a.year);
}

app.get('/api/subject-years', async (req, res) => {
  const subject = String(req.query.subject || '').trim().toLowerCase();

  if (!subject) {
    return res.status(400).json({ error: 'Missing required parameter', required: ['subject'] });
  }

  const snapshot = loadCoverageSnapshot();
  const snapshotRows = buildSnapshotRows(snapshot, subject);
  if (snapshotRows) {
    return res.status(200).json({
      data: snapshotRows,
      source: 'snapshot',
      generatedAt: snapshot.generatedAt || null,
    });
  }

  const apiKey = process.env.ALOC_API_KEY;
  if (!apiKey) {
    console.error('[ALOC Proxy] ALOC_API_KEY is not set on the server');
    return res.status(500).json({
      error: 'Server configuration error',
      detail: 'ALOC_API_KEY is missing on the server',
    });
  }

  const cached = subjectYearsCache.get(subject);
  if (cached && cached.expiresAt > Date.now()) {
    return res.status(200).json(cached.payload);
  }

  const upstreamUrl = new URL(
    `https://dev.aloc.com.ng/api/v1/subjects/${encodeURIComponent(subject)}/years`
  );

  try {
    const response = await fetch(upstreamUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-API-Key': apiKey,
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('[ALOC Proxy] Subject years upstream status:', response.status);
      return res.status(response.status).json({
        error: 'ALOC upstream error',
        upstreamStatus: response.status,
        detail: responseText,
      });
    }

    let payload;
    try {
      payload = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[ALOC Proxy] Failed to parse subject years JSON:', parseError.message);
      return res.status(502).json({
        error: 'Invalid JSON from ALOC API',
        detail: responseText.substring(0, 1000),
      });
    }

    const merged = await mergeLegacyCoverage(subject, payload);

    subjectYearsCache.set(subject, {
      payload: merged,
      expiresAt: Date.now() + SUBJECT_YEARS_TTL_MS,
    });

    return res.status(200).json(merged);
  } catch (error) {
    console.error('[ALOC Proxy] Subject years network error:', error.message);
    return res.status(502).json({
      error: 'Network error contacting ALOC API',
      detail: error.message,
      attemptedUrl: upstreamUrl.toString(),
    });
  }
});

app.listen(PORT, () => {
  console.log(`[ALOC Proxy] Server running on http://localhost:${PORT}`);
  console.log(`[ALOC Proxy] Forwarding to: https://dev.aloc.com.ng/api/v1/questions`);
  console.log(`[ALOC Proxy] Subject years: https://dev.aloc.com.ng/api/v1/subjects/:subject/years`);
  console.log(
    `[ALOC Proxy] Legacy fallback: ${hasLegacyToken() ? 'enabled' : 'disabled (ALOC_LEGACY_TOKEN not set)'}`
  );
  console.log(
    `[ALOC Proxy] Coverage snapshot: ${loadCoverageSnapshot() ? COVERAGE_SNAPSHOT_PATH : 'not found (live probing)'}`
  );
  console.log(`[ALOC Proxy] Allowed origin: ${process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173'}`);
});