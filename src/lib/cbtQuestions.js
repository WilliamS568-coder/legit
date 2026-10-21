export const OPTION_LETTERS = ['a', 'b', 'c', 'd'];

export function toPlainText(value) {
  if (value == null) return '';

  // Deliberately render API content as text, never as executable HTML.
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatMathText(value) {
  return toPlainText(value)
    .replace(/([A-Za-z0-9])\^2/g, '$1²')
    .replace(/([A-Za-z0-9])\^3/g, '$1³')
    .replace(/\bpi\b/gi, 'π');
}

export function normalizeAnswer(value) {
  const answer = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^option[_\s-]?/, '');

  const match = answer.match(/[a-d]/);
  return match ? match[0] : '';
}

function toOptionMap(source) {
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch {
      // Malformed JSON string: treat as no options.
      return {};
    }
  }

  if (Array.isArray(source)) {
    // Some payloads send options as a list, e.g. ["5", "6", "7", "8"]
    source = source.reduce((mapped, value, index) => {
      const letter = OPTION_LETTERS[index];
      if (letter) mapped[letter] = value;
      return mapped;
    }, {});
  }

  if (!source || typeof source !== 'object') return {};

  return Object.entries(source).reduce((options, [key, value]) => {
    const normalizedKey = normalizeAnswer(key);
    if (OPTION_LETTERS.includes(normalizedKey) && value != null && String(value).trim() !== '') {
      options[normalizedKey] = formatMathText(value);
    }
    return options;
  }, {});
}

export function normalizeOptions(question) {
  // The ALOC API returns `options: { A: ..., B: ... }`; older shapes used
  // `option` (a JSON string) or flat `option_a`..`option_d` columns.
  const candidates = [
    question.options,
    question.option,
    {
      a: question.option_a,
      b: question.option_b,
      c: question.option_c,
      d: question.option_d
    }
  ];

  for (const candidate of candidates) {
    const options = toOptionMap(candidate);
    if (Object.keys(options).length > 0) return options;
  }

  return {};
}

export function normalizeQuestion(question, index = 0) {
  return {
    id: question.id || 'question-' + index,
    section: formatMathText(question.section || question.passage),
    instruction: formatMathText(question.instruction),
    question: formatMathText(question.text || question.question),
    options: normalizeOptions(question),
    answer: normalizeAnswer(question.correctAnswer || question.answer),
    explanation: formatMathText(question.solution || 'No explanation provided.')
  };
}
