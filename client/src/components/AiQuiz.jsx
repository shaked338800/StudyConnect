import { useState } from 'react';
import { generateAiQuiz } from '../api/postsApi';
import { getErrorMessage } from '../jquery/ajaxSetup';

const LETTERS = ['A', 'B', 'C', 'D'];

// [AI feature] "Generate AI Quiz" on a post page.
// The quiz lives only in React state - it is not saved anywhere.
function AiQuiz({ postId }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);   // chosen option index per question
  const [checked, setChecked] = useState(false);

  async function handleGenerate() {
    setStatus('loading');
    setError('');
    try {
      const data = await generateAiQuiz(postId);
      setQuiz(data.quiz);
      setAnswers(data.quiz.questions.map(() => null));
      setChecked(false);
      setStatus('ready');
    } catch (xhr) {
      setError(getErrorMessage(xhr, xhr.statusText));
      setStatus(quiz ? 'ready' : 'error'); // keep showing an old quiz if we had one
    }
  }

  function choose(questionIndex, optionIndex) {
    if (checked) return;
    // Functional update: always start from the latest answers, even if
    // two clicks happen before React re-renders
    setAnswers((prev) => prev.map((a, i) => (i === questionIndex ? optionIndex : a)));
  }

  function handleTryAgain() {
    setAnswers(quiz.questions.map(() => null));
    setChecked(false);
  }

  const allAnswered = answers.length > 0 && answers.every((a) => a !== null);
  const score = quiz ? quiz.questions.filter((q, i) => answers[i] === q.correctIndex).length : 0;

  return (
    <section className="card ai-quiz">
      <div className="card-title-row">
        <h3>AI Quiz</h3>
        <button className="btn" onClick={handleGenerate} disabled={status === 'loading'}>
          {status === 'loading' ? 'Generating quiz...' : quiz ? 'Generate a new quiz' : 'Generate AI Quiz'}
        </button>
      </div>
      <p className="muted small">
        An AI model writes 3 multiple-choice questions from this post's title, course and content.
        AI can make mistakes - check against the post.
      </p>

      {status === 'loading' && <p className="ai-loading">Generating quiz... this can take a few seconds.</p>}
      {error && <p className="ai-error">{error}</p>}

      {quiz && status !== 'loading' && (
        <>
          <ol className="quiz-questions">
            {quiz.questions.map((q, qi) => (
              <li key={qi} className="quiz-question">
                <p className="quiz-question-text">{q.question}</p>
                <div className="quiz-options">
                  {q.options.map((option, oi) => {
                    let className = 'quiz-option';
                    if (answers[qi] === oi) className += ' selected';
                    if (checked && oi === q.correctIndex) className += ' correct';
                    if (checked && answers[qi] === oi && oi !== q.correctIndex) className += ' wrong';
                    return (
                      <button key={oi} type="button" className={className} onClick={() => choose(qi, oi)} disabled={checked}>
                        <span className="quiz-letter">{LETTERS[oi]}</span> {option}
                      </button>
                    );
                  })}
                </div>
                {checked && (
                  <p className={answers[qi] === q.correctIndex ? 'quiz-result good' : 'quiz-result bad'}>
                    {answers[qi] === q.correctIndex ? 'Correct!' : `Incorrect - the answer is ${LETTERS[q.correctIndex]}.`}
                    {q.explanation && <span className="quiz-explanation"> {q.explanation}</span>}
                  </p>
                )}
              </li>
            ))}
          </ol>

          {!checked ? (
            <button className="btn" onClick={() => setChecked(true)} disabled={!allAnswered}>
              {allAnswered ? 'Check answers' : 'Answer all questions to check'}
            </button>
          ) : (
            <div className="quiz-score-row">
              <span className="quiz-score">Score: {score}/{quiz.questions.length}</span>
              <button className="btn btn-secondary" onClick={handleTryAgain}>Try again</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default AiQuiz;
