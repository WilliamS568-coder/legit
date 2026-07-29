import React, { useState } from 'react';

const API_TOKEN = 'ALOC-4f56e66ca205556ccddc';

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
  'Agricultural Science'
];

const YEARS = [
  2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
  2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005
];

const QUESTION_COUNTS = [5, 10, 20, 40];
const OPTION_LETTERS = ['a', 'b', 'c', 'd'];

function toPlainText(value) {
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

function formatMathText(value) {
  return toPlainText(value)
    .replace(/([A-Za-z0-9])\^2/g, '$1²')
    .replace(/([A-Za-z0-9])\^3/g, '$1³')
    .replace(/\bpi\b/gi, 'π');
}

function normalizeAnswer(value) {
  const answer = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^option[_\s-]?/, '');

  const match = answer.match(/[a-d]/);
  return match ? match[0] : '';
}

function normalizeOptions(question) {
  let source = question.option;

  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch {
      source = null;
    }
  }

  if (!source || typeof source !== 'object') {
    source = {
      a: question.option_a,
      b: question.option_b,
      c: question.option_c,
      d: question.option_d
    };
  }

  return Object.entries(source).reduce((options, [key, value]) => {
    const normalizedKey = normalizeAnswer(key);
    if (OPTION_LETTERS.includes(normalizedKey) && value) {
      options[normalizedKey] = formatMathText(value);
    }
    return options;
  }, {});
}

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

  const resetQuiz = () => {
    setSelectedSubject(null);
    setSelectedYear(null);
    setQuestionCount(null);
    setQuestions([]);
    setLoading(false);
    setError('');
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
        subject: subject.toLowerCase(),
        year: String(year),
        type: 'utme',
        random: 'true'
      });
      const response = await fetch(
        'https://questions.aloc.com.ng/api/v2/m/' + count + '?' + params.toString(),
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            AccessToken: API_TOKEN
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? 'The questions service rejected the request.'
            : 'Could not load questions. Please try again.'
        );
      }

      const data = await response.json();
      if (!data?.data) {
        throw new Error('No questions were returned for this selection. Choose another year or try again.');
      }

      const rawQuestions = Array.isArray(data.data) ? data.data : [data.data];

      const formattedQuestions = rawQuestions
        .map((question, index) => ({
          id: question.id || 'question-' + index,
          section: formatMathText(question.section || question.passage),
          instruction: formatMathText(question.instruction),
          question: formatMathText(question.question),
          options: normalizeOptions(question),
          answer: normalizeAnswer(question.answer),
          explanation: formatMathText(question.solution || 'No explanation provided.')
        }))
        .filter((question) => question.question && Object.keys(question.options).length > 0);

      if (formattedQuestions.length === 0) {
        throw new Error('No usable questions were returned for this selection. Choose another year or try again.');
      }

      setQuestions(formattedQuestions);
    } catch (requestError) {
      console.error('Failed to fetch questions:', requestError);
      setError(requestError.message || 'Unable to load questions. Please try again.');
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
                  onClick={() => setSelectedSubject(subject)}
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
            <p className="mb-4 text-xs text-neutral-400 sm:text-sm">
              Choose the past question year for <span className="font-bold text-yellow-500">{selectedSubject}</span>:
            </p>
            <div className="mx-auto grid max-h-[50vh] max-w-lg grid-cols-3 gap-2.5 overflow-y-auto p-1 sm:grid-cols-4">
              {YEARS.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className="rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-sm font-bold text-yellow-400 transition-all hover:border-yellow-500 sm:text-base"
                >
                  {year}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setSelectedSubject(null)} className="mt-6 text-xs text-neutral-400 underline hover:text-white">
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
