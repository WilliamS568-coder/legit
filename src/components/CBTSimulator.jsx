import { useRef, useState } from 'react';
import { normalizeQuestion, OPTION_LETTERS } from '../lib/cbtQuestions';

const SUBJECTS = [
  'English',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Literature-in-English',
  'CRS',
  'Accounting',
  'Commerce',
  'Geography',
  'History',
];

// Maps UI subject names to ALOC API subject names
const SUBJECT_API_MAP = {
  'English': 'english-language',
  'Mathematics': 'mathematics',
  'Physics': 'physics',
  'Chemistry': 'chemistry',
  'Biology': 'biology',
  'Economics': 'economics',
  'Government': 'government',
  'Literature-in-English': 'literature-in-english',
  'CRS': 'christian-religious-studies',
  'Accounting': 'accounting',
  'Commerce': 'commerce',
  'Geography': 'geography',
  'History': 'history',
};

const YEARS = [
  2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
  2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005
];

const QUESTION_COUNTS = [5, 10, 20, 40];

export default function CBTSimulator({ onClose }) {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [yearAvailability, setYearAvailability] = useState(null);
  const [yearsLoading, setYearsLoading] = useState(false);
  const availabilityCache = useRef(new Map());

  const loadYearAvailability = async (subject) => {
    const apiSubject = SUBJECT_API_MAP[subject] || subject.toLowerCase();
    const cached = availabilityCache.current.get(apiSubject);

    if (cached) {
      setYearAvailability(cached);
      setYearsLoading(false);
      return;
    }

    setYearAvailability(null);
    setYearsLoading(true);

    try {
      const response = await fetch(`/api/subject-years?subject=${encodeURIComponent(apiSubject)}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const body = await response.json();
      const rows = Array.isArray(body?.data) ? body.data : [];

      if (rows.length > 0) {
        const counts = rows.reduce((accumulator, row) => {
          const jambCount = row?.breakdown?.jamb;
          const fromBreakdown = typeof jambCount === 'number' ? jambCount : null;
          const fromExamTypes = Array.isArray(row?.examTypes) && row.examTypes.includes('jamb')
            ? Number(row?.questionCount) || 0
            : 0;
          accumulator[row.year] = fromBreakdown ?? fromExamTypes;
          return accumulator;
        }, {});

        availabilityCache.current.set(apiSubject, counts);
        setYearAvailability(counts);
      }
    } catch (availabilityError) {
      // Availability is a nicety: on failure every year stays selectable.
      console.warn('[CBT Frontend] Year availability lookup failed:', availabilityError.message);
    } finally {
      setYearsLoading(false);
    }
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    loadYearAvailability(subject);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setYearAvailability(null);
    setYearsLoading(false);
  };

  const resetQuiz = () => {
    setSelectedSubject(null);
    setSelectedYear(null);
    setQuestionCount(null);
    setQuestions([]);
    setLoading(false);
    setError('');
    setYearAvailability(null);
    setYearsLoading(false);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowReview(false);
  };

  const closeSimulator = () => {
    resetQuiz();
    onClose?.();
  };

  const fetchQuestions = async (subject, year, count) => {
    setLoading(true);
    setError('');
    setQuestions([]);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setShowReview(false);

    try {
      const params = new URLSearchParams({
        subject: SUBJECT_API_MAP[subject] || subject.toLowerCase(),
        examType: 'jamb',
        year: String(year),
        limit: String(count),
      });

      const proxyUrl = `/api/questions?${params.toString()}`;

      console.log('[CBT Frontend] Calling proxy:', proxyUrl);

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('[CBT Frontend] Proxy status:', response.status);
      console.log('[CBT Frontend] Proxy response preview:', responseText.substring(0, 500));

      if (!response.ok) {
        let detail = responseText;
        try {
          const errJson = JSON.parse(responseText);
          const upstream = errJson.detail ? String(errJson.detail) : '';
          // The upstream 404 body is JSON-in-a-string; prefer its human message.
          let upstreamMessage = '';
          try {
            const parsedUpstream = JSON.parse(upstream);
            upstreamMessage = parsedUpstream.message || '';
          } catch {
            // Upstream detail was not JSON; fall through to the raw text.
          }
          detail = upstreamMessage || errJson.error || errJson.message || detail;
        } catch {
          // Proxy returned a non-JSON body; keep it as the detail.
        }

        if (response.status === 404) {
          throw new Error('No questions are available for this subject and year yet. Try another year.');
        }

        if (response.status === 429) {
          throw new Error('The question service is busy right now. Please wait a minute and try again.');
        }

        throw new Error(
          response.status === 401 || response.status === 403
            ? `Authentication failed: ${detail}`
            : `Server error (${response.status}): ${detail}`
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[CBT Frontend] Failed to parse proxy JSON:', parseError);
        throw new Error('Invalid response from server', { cause: parseError });
      }

      console.log('[CBT Frontend] Parsed data:', data);

      if (!data?.data) {
        throw new Error('No questions were returned for this selection. Choose another year or try again.');
      }

      const rawQuestions = Array.isArray(data.data) ? data.data : [data.data];

      const formattedQuestions = rawQuestions
        .map((question, index) => normalizeQuestion(question, index))
        .filter((question) => question.question && Object.keys(question.options).length > 0)
        // The upstream API sometimes returns a full page regardless of `count`.
        .slice(0, count);

      if (formattedQuestions.length === 0) {
        throw new Error('No usable questions were returned for this selection. Choose another year or try again.');
      }

      setQuestions(formattedQuestions);
    } catch (requestError) {
      console.error('Failed to fetch questions:', requestError);
      setError(requestError.message || 'Unable to load questions. Please check the browser console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCountSelect = (count) => {
    setQuestionCount(count);
    fetchQuestions(selectedSubject, selectedYear, count);
  };

  const handleSelect = (optionLetter) => {
    setSelectedAnswers((previous) => ({
      ...previous,
      [currentIdx]: optionLetter
    }));
  };

  const score = questions.reduce(
    (total, question, index) => total + (selectedAnswers[index] === question.answer ? 1 : 0),
    0
  );
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const currentQuestion = questions[currentIdx];

  // Availability also introduces years newer than the built-in list (e.g. 2026).
  const yearOptions = yearAvailability
    ? [...new Set([...YEARS, ...Object.keys(yearAvailability).map(Number)])].sort((a, b) => b - a)
    : YEARS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-85 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cbt-title"
    >
      <div className="my-auto flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-white shadow-2xl sm:p-6">
        <div className="mb-4 flex shrink-0 items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 id="cbt-title" className="text-base font-bold text-yellow-500 sm:text-lg">
              JAMB CBT Live Practice
            </h3>
            <p className="text-[11px] text-neutral-400 sm:text-xs">Computer Based Test Simulator</p>
          </div>
          <button
            type="button"
            onClick={closeSimulator}
            aria-label="Close practice simulator"
            className="px-2 text-xl font-bold text-neutral-400 hover:text-white"
          >
            ×
          </button>
        </div>

        {!selectedSubject ? (
          <div className="overflow-y-auto py-4 pr-1 text-center sm:py-6">
            <h4 className="mb-2 text-lg font-semibold sm:text-xl">Select a Subject</h4>
            <p className="mb-4 text-xs text-neutral-400 sm:text-sm">Choose any JAMB subject to start your practice test:</p>
            <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleSubjectSelect(subject)}
                  className="truncate rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-sm font-bold text-yellow-400 transition-all hover:border-yellow-500 sm:text-base"
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        ) : !selectedYear ? (
          <div className="overflow-y-auto py-4 pr-1 text-center sm:py-6">
            <h4 className="mb-2 text-lg font-semibold sm:text-xl">Select Exam Year</h4>
            <p className="mb-1 text-xs text-neutral-400 sm:text-sm">
              Choose the past question year for <span className="font-bold text-yellow-500">{selectedSubject}</span>:
            </p>
            <p className="mb-4 h-4 text-[11px] text-neutral-500 sm:text-xs">
              {yearsLoading ? 'Checking which years have questions…' : ''}
              {yearAvailability && !yearOptions.some((year) => (yearAvailability[year] ?? 0) > 0)
                ? 'No questions are available for this subject yet.'
                : ''}
            </p>
            <div className="mx-auto grid max-h-[50vh] max-w-lg grid-cols-3 gap-2.5 overflow-y-auto p-1 sm:grid-cols-4">
              {yearOptions.map((year) => {
                const available = yearAvailability ? yearAvailability[year] ?? 0 : null;
                const isUnavailable = available === 0;

                return (
                  <button
                    key={year}
                    type="button"
                    disabled={isUnavailable}
                    title={isUnavailable ? `No JAMB questions for ${year} yet` : undefined}
                    onClick={() => setSelectedYear(year)}
                    className={[
                      'rounded-xl border p-3 text-sm font-bold transition-all sm:text-base',
                      isUnavailable
                        ? 'cursor-not-allowed border-neutral-800 bg-neutral-800/40 text-neutral-600'
                        : 'border-neutral-700 bg-neutral-800 text-yellow-400 hover:border-yellow-500'
                    ].join(' ')}
                  >
                    {year}
                    {available != null && (
                      <span
                        className={[
                          'mt-0.5 block text-[10px] font-normal',
                          isUnavailable ? 'text-neutral-600' : 'text-neutral-400'
                        ].join(' ')}
                      >
                        {isUnavailable ? 'None yet' : `${available} Qs`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={handleBackToSubjects} className="mt-6 text-xs text-neutral-400 underline hover:text-white">
              ← Back to Subjects
            </button>
          </div>
        ) : !questionCount ? (
          <div className="overflow-y-auto py-4 pr-1 text-center sm:py-6">
            <h4 className="mb-2 text-lg font-semibold sm:text-xl">Select Number of Questions</h4>
            <p className="mb-4 text-xs text-neutral-400 sm:text-sm">
              How many questions for <span className="font-bold text-yellow-500">{selectedSubject} ({selectedYear})</span>?
            </p>
            <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleCountSelect(count)}
                  className="rounded-xl border border-neutral-700 bg-neutral-800 p-4 text-base font-bold text-yellow-400 transition-all hover:border-yellow-500"
                >
                  {count} Questions
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setSelectedYear(null)} className="mt-6 text-xs text-neutral-400 underline hover:text-white">
              ← Back to Years
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-white">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            <h4 className="mb-1 text-base font-semibold sm:text-lg">Loading {questionCount} questions...</h4>
            <p className="text-xs text-neutral-400 sm:text-sm">Fetching {selectedSubject} ({selectedYear}) past questions.</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <h4 className="mb-2 text-lg font-semibold text-red-400">Questions could not be loaded</h4>
            <p className="mx-auto mb-6 max-w-lg text-sm text-neutral-300">{error}</p>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => fetchQuestions(selectedSubject, selectedYear, questionCount)} className="rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-yellow-400">
                Try Again
              </button>
              <button type="button" onClick={() => setQuestionCount(null)} className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm hover:bg-neutral-700">
                Change Count
              </button>
            </div>
          </div>
        ) : !isSubmitted && currentQuestion ? (
          <div className="flex flex-1 flex-col justify-between overflow-y-auto pr-1">
            <div>
              <div className="mb-3 flex justify-between text-xs text-neutral-400">
                <span>Subject: <strong className="text-yellow-500">{selectedSubject} ({selectedYear})</strong></span>
                <span>Question {currentIdx + 1} of {questions.length}</span>
              </div>

              {currentQuestion.section && (
                <p className="mb-3 max-h-[25vh] overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-800/80 p-3 text-xs text-neutral-300 whitespace-pre-line">
                  {currentQuestion.section}
                </p>
              )}

              <div className="mb-4 max-h-[30vh] overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-800/50 p-3.5 sm:p-4">
                {currentQuestion.instruction && (
                  <p className="mb-1 text-xs font-semibold text-yellow-400 sm:text-sm">{currentQuestion.instruction}</p>
                )}
                <p className="whitespace-pre-line text-xs font-medium leading-relaxed sm:text-sm md:text-base">{currentQuestion.question}</p>
              </div>

              <div className="mb-4 space-y-2">
                {OPTION_LETTERS.filter((letter) => currentQuestion.options[letter]).map((letter) => {
                  const isSelected = selectedAnswers[currentIdx] === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleSelect(letter)}
                      aria-pressed={isSelected}
                      className={[
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs transition-all sm:text-sm',
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500 font-bold text-black'
                          : 'border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700'
                      ].join(' ')}
                    >
                      <span className={[
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold sm:h-6 sm:w-6 sm:text-xs',
                        isSelected ? 'border-black bg-black text-yellow-500' : 'border-neutral-600 bg-neutral-900 text-neutral-400'
                      ].join(' ')}>
                        {letter.toUpperCase()}
                      </span>
                      <span className="leading-tight">{currentQuestion.options[letter]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2 flex shrink-0 justify-between border-t border-neutral-800 pt-3">
              <button type="button" disabled={currentIdx === 0} onClick={() => setCurrentIdx((index) => index - 1)} className="rounded-xl bg-neutral-800 px-4 py-2 text-xs hover:bg-neutral-700 disabled:opacity-40 sm:text-sm">
                Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button type="button" onClick={() => setCurrentIdx((index) => index + 1)} className="rounded-xl bg-yellow-500 px-5 py-2 text-xs font-bold text-black hover:bg-yellow-400 sm:text-sm">
                  Next
                </button>
              ) : (
                <button type="button" onClick={() => setIsSubmitted(true)} className="rounded-xl bg-green-600 px-5 py-2 text-xs font-bold text-white hover:bg-green-500 sm:text-sm">
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        ) : !showReview ? (
          <div className="overflow-y-auto py-6 pr-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500 bg-yellow-500/10 text-xl font-bold text-yellow-500 sm:h-20 sm:w-20 sm:text-2xl">
              {score} / {questions.length}
            </div>
            <h4 className="mb-1 text-xl font-bold sm:text-2xl">Exam Submitted!</h4>
            <p className="mb-6 text-xs text-neutral-400 sm:text-sm">
              You scored <span className="font-bold text-yellow-500">{percentage}%</span> in {selectedSubject} ({selectedYear}).
            </p>
            <div className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-3">
              <button type="button" onClick={() => setShowReview(true)} className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-xs font-medium hover:bg-neutral-700 sm:text-sm">
                View Corrections
              </button>
              <button type="button" onClick={resetQuiz} className="rounded-xl bg-yellow-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-yellow-400 sm:text-sm">
                Start Another Test
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            <div className="mb-1 flex items-center justify-between">
              <h4 className="text-xs font-bold text-yellow-500 sm:text-sm">Correct Answers & Explanations</h4>
              <button type="button" onClick={() => setShowReview(false)} className="text-xs text-neutral-400 underline">Back</button>
            </div>
            {questions.map((question, index) => {
              const userChoice = selectedAnswers[index];
              const isCorrect = userChoice === question.answer;
              return (
                <div key={question.id || index} className="space-y-1.5 rounded-xl border border-neutral-800 bg-neutral-800/40 p-3.5 text-xs">
                  <p className="font-semibold">{index + 1}. {question.question}</p>
                  <p className="text-neutral-300">
                    Your Choice: <span className={isCorrect ? 'font-bold text-green-400' : 'font-bold text-yellow-400'}>
                      {userChoice ? userChoice.toUpperCase() + '. ' + (question.options[userChoice] || '') : 'Not Answered'}
                    </span>
                  </p>
                  <p className="font-semibold text-green-400">
                    Correct Answer: {question.answer ? question.answer.toUpperCase() + '. ' + (question.options[question.answer] || '') : 'Not available'}
                  </p>
                  <p className="rounded-lg border border-neutral-800 bg-neutral-900 p-2.5 text-neutral-400">
                    Explanation: {question.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


