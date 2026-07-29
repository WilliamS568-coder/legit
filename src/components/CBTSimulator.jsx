import React, { useState } from 'react';

const API_TOKEN = 'ALOC-4f56e66ca205556ccddc';

export default function CBTSimulator({ onClose }) {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const fetchQuestions = async (subject, count) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://questions.aloc.com.ng/api/v2/m/${count}?subject=${subject.toLowerCase()}&type=utme&random=true`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'AccessToken': API_TOKEN
          }
        }
      );
      const data = await response.json();
      
      if (data && data.data) {
        const formatted = data.data.map((q) => {
          let opts = {};
          if (q.option) {
            opts = q.option;
          } else {
            opts = { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d };
          }

          return {
            id: q.id,
            section: q.section || q.passage || null,
            question: q.question,
            options: opts,
            answer: q.answer ? q.answer.trim().toLowerCase() : '',
            explanation: q.solution || "No explanation provided."
          };
        });
        setQuestions(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleCountSelect = (count) => {
    setQuestionCount(count);
    fetchQuestions(selectedSubject, count);
  };

  const handleSelect = (optionLetter) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIdx]: optionLetter.toLowerCase() });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      const userChoice = selectedAnswers[idx];
      if (userChoice && userChoice === q.answer) {
        score++;
      }
    });
    return score;
  };

  // Advanced formatting to clean up math symbols, superscripts, and html tags
  const formatMathText = (text) => {
    if (!text) return '';
    
    // Replace standard text representations with proper HTML tags if missing
    let formatted = text
      .replace(/(\b[A-Za-z0-9])\^2/g, '$1<sup>2</sup>')
      .replace(/(\b[A-Za-z0-9])\^3/g, '$1<sup>3</sup>')
      .replace(/pi/gi, 'π');

    return formatted;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl p-4 sm:p-6 text-white shadow-2xl flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-neutral-800 mb-4 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-yellow-500">JAMB CBT Live Practice</h3>
            <p className="text-[11px] sm:text-xs text-neutral-400">Computer Based Test Simulator</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white font-bold text-xl px-2">✕</button>
        </div>

        {/* Step 1: Subject Selection */}
        {!selectedSubject ? (
          <div className="py-4 sm:py-6 text-center overflow-y-auto pr-1">
            <h4 className="text-lg sm:text-xl font-semibold mb-2">Select a Subject</h4>
            <p className="text-xs sm:text-sm text-neutral-400 mb-4">Choose a subject to start your practice test:</p>
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {['English', 'Mathematics', 'Physics', 'Chemistry', 'Biology'].map((subj) => (
                <button
                  key={subj}
                  onClick={() => handleSubjectSelect(subj)}
                  className="p-4 bg-neutral-800 border border-neutral-700 hover:border-yellow-500 rounded-xl font-bold text-base sm:text-lg transition-all text-yellow-400"
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>
        ) : !questionCount ? (
          /* Step 2: Question Count Selection */
          <div className="py-4 sm:py-6 text-center overflow-y-auto pr-1">
            <h4 className="text-lg sm:text-xl font-semibold mb-2">Select Number of Questions</h4>
            <p className="text-xs sm:text-sm text-neutral-400 mb-4">How many questions do you want for <span className="text-yellow-500 font-bold">{selectedSubject}</span>?</p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {[5, 10, 20, 40].map((count) => (
                <button
                  key={count}
                  onClick={() => handleCountSelect(count)}
                  className="p-4 bg-neutral-800 border border-neutral-700 hover:border-yellow-500 rounded-xl font-bold text-base transition-all text-yellow-400"
                >
                  {count} Questions
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedSubject(null)}
              className="mt-6 text-xs text-neutral-400 underline hover:text-white"
            >
              ← Back to Subjects
            </button>
          </div>
        ) : loading ? (
          /* Step 3 (Loading State): Smooth Spinner */
          <div className="flex flex-col items-center justify-center py-16 text-white text-center">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h4 className="text-base sm:text-lg font-semibold mb-1">Loading {questionCount} questions...</h4>
            <p className="text-xs sm:text-sm text-neutral-400">Please wait while we set up your {selectedSubject} CBT session.</p>
          </div>
        ) : !isSubmitted ? (
          /* Step 4: Active Exam Questions & Options */
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-3">
                <span>Subject: <strong className="text-yellow-500">{selectedSubject}</strong></span>
                <span>Question {currentIdx + 1} of {questions.length}</span>
              </div>

              {/* Instruction / Passage Context */}
              {questions[currentIdx]?.section && (
                <div 
                  className="bg-neutral-800/80 p-3 rounded-xl border border-neutral-700 text-xs text-neutral-300 mb-3" 
                  dangerouslySetInnerHTML={{ __html: questions[currentIdx].section }}
                ></div>
              )}

              <div className="bg-neutral-800/50 p-3.5 sm:p-4 rounded-xl border border-neutral-800 mb-4">
                <h4 
                  className="text-xs sm:text-sm md:text-base font-medium leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: formatMathText(questions[currentIdx]?.question) }}
                ></h4>
              </div>

              {/* Options List */}
              <div className="space-y-2.5 mb-4">
                {Object.entries(questions[currentIdx]?.options || {}).map(([key, optionText]) => {
                  if (!optionText) return null;
                  const optionLetter = key.toLowerCase();
                  const isSelected = selectedAnswers[currentIdx] === optionLetter;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelect(optionLetter)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl border transition-all text-xs sm:text-sm flex items-center gap-3 ${
                        isSelected
                          ? 'bg-yellow-500 text-black border-yellow-500 font-bold'
                          : 'bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-750'
                      }`}
                    >
                      <span className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold border ${isSelected ? 'border-black bg-black text-yellow-500' : 'border-neutral-600 bg-neutral-900 text-neutral-400'}`}>
                        {optionLetter.toUpperCase()}
                      </span>
                      <span 
                        className="leading-tight"
                        dangerouslySetInnerHTML={{ __html: formatMathText(optionText) }}
                      ></span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-3 border-t border-neutral-800 mt-2 shrink-0">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 bg-neutral-800 rounded-xl text-xs sm:text-sm disabled:opacity-40 hover:bg-neutral-700"
              >
                Previous
              </button>
              
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-5 py-2 bg-yellow-500 text-black font-bold rounded-xl text-xs sm:text-sm hover:bg-yellow-400"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-green-600 text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-green-500"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        ) : !showReview ? (
          /* Step 5: Total Score Summary Displayed Only After Submission */
          <div className="text-center py-6 overflow-y-auto pr-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-500/10 border border-yellow-500 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl font-bold">
              {calculateScore()} / {questions.length}
            </div>
            <h4 className="text-xl sm:text-2xl font-bold mb-1">Exam Submitted!</h4>
            <p className="text-xs sm:text-sm text-neutral-400 mb-6">
              You scored <span className="text-yellow-500 font-bold">{Math.round((calculateScore() / questions.length) * 100)}%</span> in {selectedSubject}.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowReview(true)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs sm:text-sm border border-neutral-700 font-medium"
              >
                View Corrections
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-yellow-500 text-black font-bold rounded-xl text-xs sm:text-sm hover:bg-yellow-400"
              >
                Close Practice
              </button>
            </div>
          </div>
        ) : (
          /* Step 6: Review Corrections */
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-bold text-xs sm:text-sm text-yellow-500">Correct Answers & Explanations</h4>
              <button onClick={() => setShowReview(false)} className="text-xs text-neutral-400 underline">Back</button>
            </div>
            {questions.map((q, idx) => {
              const userChoice = selectedAnswers[idx];
              const isCorrect = userChoice === q.answer;

              return (
                <div key={q.id} className="bg-neutral-800/40 border border-neutral-800 p-3.5 rounded-xl text-xs space-y-1.5">
                  <p className="font-semibold" dangerouslySetInnerHTML={{ __html: `${idx + 1}. ${formatMathText(q.question)}` }}></p>
                  <p className="text-neutral-300">
                    Your Choice: <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-yellow-400'}`}>
                      {userChoice ? `${userChoice.toUpperCase()}. ${q.options[userChoice] || ''}` : 'Not Answered'}
                    </span>
                  </p>
                  <p className="text-green-400 font-semibold">
                    Correct Answer: {q.answer.toUpperCase()}. {q.options[q.answer] || ''}
                  </p>
                  <div className="bg-neutral-900 p-2.5 rounded-lg text-neutral-400 border border-neutral-800" dangerouslySetInnerHTML={{ __html: `Explanation: ${formatMathText(q.explanation)}` }}></div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}