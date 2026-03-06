import React, { useState, useEffect } from 'react';
import { ExerciseItem, ExerciseType, generateExercises, Level } from '../lib/generator';
import { awardXp, saveExerciseProgress } from '../lib/db';
import { RefreshCw, Check, X, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../hooks/useI18n';

export default function Exercises() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exerciseType, setExerciseType] = useState<ExerciseType>('sentence_reconstruction');
  const [level, setLevel] = useState<Level>('A1');
  const [questionCount, setQuestionCount] = useState(5);
  const [userAnswer, setUserAnswer] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [shuffledParts, setShuffledParts] = useState<string[]>([]);
  const { t } = useI18n();

  const resetQuestion = (exercise: ExerciseItem) => {
    setUserAnswer([]);
    setSelectedOption(null);
    setTextAnswer('');
    setFeedback(null);
    if (exercise.type === 'sentence_reconstruction') {
      setShuffledParts([...exercise.sentence.parts].sort(() => Math.random() - 0.5));
    } else {
      setShuffledParts([]);
    }
  };

  const startNewSession = React.useCallback(async (
    nextType: ExerciseType = exerciseType,
    nextLevel: Level = level,
    nextCount: number = questionCount
  ) => {
    const newExercises = await generateExercises({ count: nextCount, level: nextLevel, type: nextType });
    setExercises(newExercises);
    setCurrentIndex(0);
    if (newExercises[0]) {
      resetQuestion(newExercises[0]);
    }
  }, [exerciseType, level, questionCount]);

  useEffect(() => {
    void startNewSession();
  }, [startNewSession]);

  const handleWordClick = (word: string) => {
    if (feedback) return;
    setUserAnswer([...userAnswer, word]);
    setShuffledParts(shuffledParts.filter(p => p !== word));
  };

  const handleUndo = (word: string) => {
    if (feedback) return;
    setUserAnswer(userAnswer.filter(w => w !== word));
    setShuffledParts([...shuffledParts, word]);
  };

  const normalizeInput = (value: string) => value.replace(/\s+/g, ' ').trim();

  const checkAnswer = () => {
    const currentExercise = exercises[currentIndex];
    const constructedSentence = userAnswer.join(' ') + '.';
    const isCorrect = currentExercise.type === 'sentence_reconstruction'
      ? constructedSentence === currentExercise.answer
      : currentExercise.type === 'sentence_writing'
        ? normalizeInput(textAnswer) === normalizeInput(currentExercise.answer)
        : selectedOption === currentExercise.answer;

    if (isCorrect) {
      setFeedback('correct');
      saveExerciseProgress({
        exercise_type: currentExercise.type,
        completed: true,
        score: 100,
        lesson_id: 'practice_mode'
      });
      const basePoints = currentExercise.type === 'sentence_reconstruction' ? 10
        : currentExercise.type === 'fill_blank' ? 12
        : currentExercise.type === 'tense' ? 12
        : currentExercise.type === 'sentence_writing' ? 15
        : 8;
      awardXp({
        source: currentExercise.type,
        basePoints,
        metadata: {
          lesson_id: 'practice_mode',
          exercise_type: currentExercise.type
        }
      });
    } else {
      setFeedback('incorrect');
    }
  };

  const nextQuestion = () => {
    if (currentIndex < exercises.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      resetQuestion(exercises[nextIndex]);
    } else {
      alert(t('exercises.session_complete'));
      void startNewSession();
    }
  };

  if (exercises.length === 0) return <div className="p-8 text-center">{t('exercises.loading')}</div>;

  const currentExercise = exercises[currentIndex];
  const typeLabel = currentExercise.type === 'sentence_reconstruction'
    ? t('exercises.type_sentence_reconstruction')
    : currentExercise.type === 'multiple_choice'
      ? t('exercises.type_multiple_choice')
      : currentExercise.type === 'fill_blank'
        ? t('exercises.type_fill_blank')
        : currentExercise.type === 'vocabulary'
          ? t('exercises.type_vocabulary')
          : currentExercise.type === 'tense'
            ? t('exercises.type_tense')
            : t('exercises.type_sentence_writing');
  const promptLabel = currentExercise.type === 'sentence_reconstruction'
    ? t('exercises.translate_prompt')
    : currentExercise.type === 'multiple_choice'
      ? t('exercises.choose_translation')
      : currentExercise.type === 'fill_blank'
        ? t('exercises.fill_blank_prompt')
        : currentExercise.type === 'vocabulary'
          ? t('exercises.vocab_prompt')
          : currentExercise.type === 'tense'
            ? t('exercises.tense_prompt')
            : t('exercises.writing_prompt');
  const canCheck = currentExercise.type === 'sentence_reconstruction'
    ? userAnswer.length > 0
    : currentExercise.type === 'sentence_writing'
      ? textAnswer.trim().length > 0
      : selectedOption !== null;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
        <div className="text-lg font-semibold mb-4">{t('exercises.practice_title')}</div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="text-sm font-semibold mb-2">{t('exercises.level_select')}</div>
            <div className="flex flex-wrap gap-2">
              {(['A0', 'A1', 'A2', 'B1'] as Level[]).map(option => (
                <button
                  key={option}
                  onClick={() => setLevel(option)}
                  className={clsx(
                    "px-3 py-2 rounded-md border text-sm font-medium",
                    level === option
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-card border-border text-muted-foreground hover:text-primary"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">{t('exercises.type_label')}</div>
            <div className="flex flex-wrap gap-2">
              {(['sentence_reconstruction', 'multiple_choice', 'fill_blank', 'vocabulary', 'tense', 'sentence_writing'] as ExerciseType[]).map(option => (
                <button
                  key={option}
                  onClick={() => setExerciseType(option)}
                  className={clsx(
                    "px-3 py-2 rounded-md border text-sm font-medium",
                    exerciseType === option
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-card border-border text-muted-foreground hover:text-primary"
                  )}
                >
                  {option === 'sentence_reconstruction'
                    ? t('exercises.type_sentence_reconstruction')
                    : option === 'multiple_choice'
                      ? t('exercises.type_multiple_choice')
                      : option === 'fill_blank'
                        ? t('exercises.type_fill_blank')
                        : option === 'vocabulary'
                          ? t('exercises.type_vocabulary')
                          : option === 'tense'
                            ? t('exercises.type_tense')
                            : t('exercises.type_sentence_writing')}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-2">{t('exercises.count_label')}</div>
            <div className="flex flex-wrap gap-2">
              {[5, 10, 15].map(option => (
                <button
                  key={option}
                  onClick={() => setQuestionCount(option)}
                  className={clsx(
                    "px-3 py-2 rounded-md border text-sm font-medium",
                    questionCount === option
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-card border-border text-muted-foreground hover:text-primary"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => startNewSession(exerciseType, level, questionCount)}
            className="px-5 py-2 rounded-md font-semibold text-white bg-primary hover:bg-red-700"
          >
            {t('exercises.start_session')}
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('exercises.title', { type: typeLabel, level })}
        </h1>
        <div className="text-sm font-medium text-muted-foreground">
          {t('exercises.question_progress', { current: currentIndex + 1, total: exercises.length })}
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2">
          <div 
            className="bg-primary h-2 transition-all duration-300" 
            style={{ width: `${((currentIndex) / exercises.length) * 100}%` }}
          ></div>
        </div>

        <div className="p-8">
          <div className="mb-8 text-center">
            <h2 className="text-lg text-muted-foreground mb-2">{promptLabel}</h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              "{currentExercise.prompt}"
            </p>
            {currentExercise.type === 'tense' && currentExercise.targetTense && (
              <p className="mt-2 text-sm text-muted-foreground">
                {t('exercises.tense_target', {
                  tense: currentExercise.targetTense === 'past'
                    ? t('exercises.tense_past')
                    : t('exercises.tense_present')
                })}
              </p>
            )}
          </div>

          {currentExercise.type === 'sentence_reconstruction' && (
            <div className="min-h-[80px] p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 mb-8 flex flex-wrap gap-2 items-center justify-center">
              {userAnswer.length === 0 && !feedback && (
                <span className="text-gray-400 italic">{t('exercises.tap_words')}</span>
              )}
              {userAnswer.map((word, idx) => (
                <button
                  key={`${word}-${idx}`}
                  onClick={() => handleUndo(word)}
                  className="px-4 py-2 bg-white dark:bg-card border border-border shadow-sm rounded-md font-medium hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  {word}
                </button>
              ))}
              {userAnswer.length === currentExercise.sentence.parts.length && (
                <span className="text-2xl font-bold text-gray-400">.</span>
              )}
            </div>
          )}

          {!feedback && currentExercise.type === 'sentence_reconstruction' && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {shuffledParts.map((word, idx) => (
                <button
                  key={`${word}-${idx}`}
                  onClick={() => handleWordClick(word)}
                  className="px-4 py-2 bg-white dark:bg-card border border-border shadow-sm rounded-md font-medium hover:bg-primary/10 hover:border-primary transition-colors active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>
          )}

          {!feedback && currentExercise.type !== 'sentence_reconstruction' && currentExercise.type !== 'sentence_writing' && (
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {(currentExercise.options || []).map((option, idx) => (
                <button
                  key={`${option}-${idx}`}
                  onClick={() => setSelectedOption(option)}
                  className={clsx(
                    "px-4 py-2 rounded-md border font-medium transition-colors",
                    selectedOption === option
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-card border-border hover:bg-primary/10 hover:border-primary"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {!feedback && currentExercise.type === 'sentence_writing' && (
            <div className="mb-8">
              <input
                value={textAnswer}
                onChange={(event) => setTextAnswer(event.target.value)}
                placeholder={t('exercises.writing_placeholder')}
                className="w-full px-4 py-3 rounded-md border border-border bg-white dark:bg-card text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {feedback && (
            <div className={clsx(
              "mb-8 p-4 rounded-lg flex items-start gap-3",
              feedback === 'correct' ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"
            )}>
              <div className={clsx(
                "p-1 rounded-full",
                feedback === 'correct' ? "bg-green-200" : "bg-red-200"
              )}>
                {feedback === 'correct' ? <Check size={16} /> : <X size={16} />}
              </div>
              <div>
                <p className="font-bold">
                  {feedback === 'correct' ? t('exercises.correct') : t('exercises.incorrect')}
                </p>
                {feedback === 'incorrect' && (
                  <p className="mt-1">
                    {t('exercises.correct_answer')} <span className="font-mono font-bold">{currentExercise.answer}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            {!feedback ? (
              <button
                onClick={checkAnswer}
                disabled={!canCheck}
                className={clsx(
                  "px-8 py-3 rounded-lg font-bold text-white transition-all",
                  canCheck
                    ? "bg-primary hover:bg-red-700 shadow-md" 
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                {t('exercises.check_answer')}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white bg-german-gold hover:bg-yellow-500 shadow-md text-yellow-900"
              >
                {t('exercises.next_question')} <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
          <span>{t('exercises.level_label', { level })}</span>
          <button onClick={() => startNewSession()} className="flex items-center gap-1 hover:text-primary">
            <RefreshCw size={14} /> {t('exercises.restart')}
          </button>
        </div>
      </div>
    </div>
  );
}
