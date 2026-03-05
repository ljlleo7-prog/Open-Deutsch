import React from 'react';
import { ExerciseItem, ExerciseType, generateExercises, Level } from '../lib/generator';
import { updateOfficialLevel, updateUserInterests } from '../lib/db';
import { Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useI18n } from '../hooks/useI18n';

type PlacementResult = {
  accuracy: number;
  placementScore: number;
  placementLevel: Level;
  answered: number;
  total: number;
};

const placementPlan: { level: Level; type: ExerciseType; count: number }[] = [
  { level: 'A0', type: 'vocabulary', count: 3 },
  { level: 'A1', type: 'multiple_choice', count: 3 },
  { level: 'A2', type: 'fill_blank', count: 3 },
  { level: 'B1', type: 'tense', count: 3 }
];

const levelOrder: Level[] = ['A0', 'A1', 'A2', 'B1'];

const surveyOptions = [
  { id: 'travel', labelKey: 'survey.topic.travel' },
  { id: 'work', labelKey: 'survey.topic.work' },
  { id: 'study', labelKey: 'survey.topic.study' },
  { id: 'daily_life', labelKey: 'survey.topic.daily_life' },
  { id: 'culture', labelKey: 'survey.topic.culture' },
  { id: 'food', labelKey: 'survey.topic.food' },
  { id: 'sports', labelKey: 'survey.topic.sports' },
  { id: 'technology', labelKey: 'survey.topic.technology' },
  { id: 'health', labelKey: 'survey.topic.health' },
  { id: 'history', labelKey: 'survey.topic.history' },
  { id: 'news', labelKey: 'survey.topic.news' },
  { id: 'transport', labelKey: 'survey.topic.transport' }
];

function buildPlacementExercises() {
  return placementPlan.flatMap(plan => generateExercises({ count: plan.count, level: plan.level, type: plan.type }));
}

function scoreToLevel(score: number): Level {
  if (score >= 80) return 'B1';
  if (score >= 60) return 'A2';
  if (score >= 40) return 'A1';
  return 'A0';
}

function clampLevelByEscape(scoreLevel: Level, escapeLevel: Level): Level {
  const scoreIndex = levelOrder.indexOf(scoreLevel);
  const escapeIndex = levelOrder.indexOf(escapeLevel);
  return levelOrder[Math.min(scoreIndex, escapeIndex)];
}

export default function PlacementTest() {
  const { t } = useI18n();
  const [exercises, setExercises] = React.useState<ExerciseItem[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<'correct' | 'incorrect' | null>(null);
  const [showQuitConfirm, setShowQuitConfirm] = React.useState(false);
  const [result, setResult] = React.useState<PlacementResult | null>(null);
  const [surveySelections, setSurveySelections] = React.useState<string[]>([]);
  const [surveySaved, setSurveySaved] = React.useState(false);
  const correctCountRef = React.useRef(0);
  const answeredCountRef = React.useRef(0);

  const startTest = React.useCallback(() => {
    const generated = buildPlacementExercises();
    setExercises(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback(null);
    correctCountRef.current = 0;
    answeredCountRef.current = 0;
    setResult(null);
    setShowQuitConfirm(false);
    setSurveySelections([]);
    setSurveySaved(false);
  }, []);

  React.useEffect(() => {
    startTest();
  }, [startTest]);

  const finalize = React.useCallback(async () => {
    if (result) return;
    const total = exercises.length;
    const answered = answeredCountRef.current;
    const correct = correctCountRef.current;
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    const placementScore = total > 0 ? Math.round((correct / total) * 100) : 0;
    const escapeIndex = Math.max(0, answered - 1);
    const escapeLevel = exercises[escapeIndex]?.level ?? 'A0';
    const scoreLevel = scoreToLevel(placementScore);
    const placementLevel = clampLevelByEscape(scoreLevel, escapeLevel);
    const payload: PlacementResult = {
      accuracy,
      placementScore,
      placementLevel,
      answered,
      total
    };
    setResult(payload);
    setShowQuitConfirm(false);
    await updateOfficialLevel(placementLevel);
  }, [exercises, result]);

  const currentExercise = exercises[currentIndex];

  const promptLabel = currentExercise?.type === 'multiple_choice'
    ? t('exercises.choose_translation')
    : currentExercise?.type === 'fill_blank'
      ? t('exercises.fill_blank_prompt')
      : currentExercise?.type === 'vocabulary'
        ? t('exercises.vocab_prompt')
        : currentExercise?.type === 'tense'
          ? t('exercises.tense_prompt')
          : t('exercises.choose_translation');

  const canCheck = selectedOption !== null && feedback === null;

  const checkAnswer = () => {
    if (!currentExercise || feedback) return;
    const isCorrect = selectedOption === currentExercise.answer;
    const nextAnswered = answeredCountRef.current + 1;
    const nextCorrect = correctCountRef.current + (isCorrect ? 1 : 0);
    answeredCountRef.current = nextAnswered;
    correctCountRef.current = nextCorrect;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
  };

  const nextQuestion = () => {
    if (currentIndex < exercises.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
      setFeedback(null);
    } else {
      finalize();
    }
  };

  if (exercises.length === 0) {
    return <div className="p-8 text-center">{t('exercises.loading')}</div>;
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('placement.result_title')}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground">{t('placement.accuracy_label')}</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{result.accuracy}%</div>
            </div>
            <div className="bg-gray-50 dark:bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground">{t('placement.placement_score_label')}</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{result.placementScore}%</div>
            </div>
            <div className="bg-gray-50 dark:bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground">{t('placement.level_label')}</div>
              <div className="text-2xl font-semibold text-primary">{result.placementLevel}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-4">
            {t('placement.answered_label', { answered: result.answered, total: result.total })}
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('survey.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('survey.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {surveyOptions.map(option => {
              const isSelected = surveySelections.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setSurveySelections(prev =>
                      prev.includes(option.id)
                        ? prev.filter(item => item !== option.id)
                        : [...prev, option.id]
                    );
                    setSurveySaved(false);
                  }}
                  className={clsx(
                    "px-3 py-2 rounded-full border text-sm font-medium transition-colors",
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-card border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                  )}
                >
                  {t(option.labelKey)}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await updateUserInterests(surveySelections);
                setSurveySaved(true);
              }}
              disabled={surveySelections.length === 0}
              className={clsx(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                surveySelections.length > 0
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {t('survey.save')}
            </button>
            {surveySaved && (
              <span className="text-sm text-green-600">{t('survey.saved')}</span>
            )}
          </div>
        </div>
        <button
          onClick={startTest}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t('placement.restart')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('placement.title')}</h1>
            <p className="text-muted-foreground">{t('placement.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="px-3 py-2 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-gray-900 hover:border-gray-300 dark:hover:text-white"
          >
            {t('placement.quit')}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>{t('exercises.question_progress', { current: currentIndex + 1, total: exercises.length })}</div>
          <div>{t('exercises.level_label', { level: currentExercise.level })}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">{promptLabel}</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">{currentExercise.prompt}</div>
        </div>

        {currentExercise.type === 'tense' && currentExercise.targetTense && (
          <div className="text-sm text-muted-foreground">
            {t('exercises.tense_target', {
              tense: currentExercise.targetTense === 'past' ? t('exercises.tense_past') : t('exercises.tense_present')
            })}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(currentExercise.options || []).map(option => (
            <button
              key={option}
              onClick={() => setSelectedOption(option)}
              disabled={feedback !== null}
              className={clsx(
                "px-4 py-3 rounded-lg border text-left transition-colors",
                selectedOption === option
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/40 hover:bg-primary/5 text-gray-800 dark:text-gray-200",
                feedback !== null && option === currentExercise.answer && "border-green-500 bg-green-50 text-green-700",
                feedback === 'incorrect' && option === selectedOption && option !== currentExercise.answer && "border-red-500 bg-red-50 text-red-700"
              )}
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={clsx(
            "rounded-lg px-4 py-3 flex items-center gap-2 text-sm font-medium",
            feedback === 'correct' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          )}>
            {feedback === 'correct' ? <Check size={18} /> : <X size={18} />}
            <span>{feedback === 'correct' ? t('exercises.correct') : t('exercises.incorrect')}</span>
            {feedback === 'incorrect' && (
              <span className="text-gray-600">
                {t('exercises.correct_answer')} {currentExercise.answer}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={checkAnswer}
            disabled={!canCheck}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              canCheck
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {t('exercises.check_answer')}
          </button>
          {feedback && (
            <button
              onClick={nextQuestion}
              className="px-4 py-2 rounded-lg font-medium bg-german-gold text-black hover:bg-german-gold/90 transition-colors"
            >
              {currentIndex < exercises.length - 1 ? t('exercises.next_question') : t('placement.finish')}
            </button>
          )}
        </div>
      </div>

      {showQuitConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-border p-6 max-w-md w-full space-y-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{t('placement.quit_confirm_title')}</div>
            <div className="text-sm text-muted-foreground">{t('placement.quit_confirm_body')}</div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-gray-900 dark:hover:text-white"
              >
                {t('placement.continue')}
              </button>
              <button
                onClick={finalize}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
              >
                {t('placement.confirm_quit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
