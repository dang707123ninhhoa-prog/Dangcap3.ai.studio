import { Question, TestCodeExam } from '../types/exam';

// Fisher-Yates shuffle with seed or deterministic variation
function shuffleArray<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let m = result.length;
  let t: T;
  let i: number;

  let s = seed;
  const pseudoRandom = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  while (m) {
    i = Math.floor(pseudoRandom() * m--);
    t = result[m];
    result[m] = result[i];
    result[i] = t;
  }
  return result;
}

export function generateTestCodes(
  baseQuestions: Question[],
  testCodeCount: 1 | 2 | 3 | 4
): TestCodeExam[] {
  const codeLabels = ['101', '102', '103', '104'];
  const testCodes: TestCodeExam[] = [];

  for (let c = 0; c < testCodeCount; c++) {
    const code = codeLabels[c];
    if (c === 0) {
      // Base test code 101 keeps original order
      const answerKey = baseQuestions.map((q, idx) => ({
        questionId: q.id,
        questionNumber: idx + 1,
        correctAnswer: q.correctAnswer,
        score: q.score,
        explanation: q.explanation,
        type: q.questionType,
      }));

      testCodes.push({
        code,
        questions: [...baseQuestions],
        answerKey,
      });
      continue;
    }

    // For codes 102, 103, 104:
    // Separate into MCQ parts and Essay parts so essay questions remain at the end in typical Vietnamese exam format
    const mcqQuestions = baseQuestions.filter(
      (q) => q.questionType === 'mcq_4' || q.questionType === 'true_false' || q.questionType === 'short_answer' || q.questionType === 'mcq_multi' || q.questionType === 'matching' || q.questionType === 'fill_blank'
    );
    const essayQuestions = baseQuestions.filter(
      (q) => !mcqQuestions.includes(q)
    );

    // Shuffle mcq questions deterministically based on code
    const shuffledMcq = shuffleArray(mcqQuestions, c * 1337 + 42);

    // Also for 4-option MCQs (mcq_4), shuffle the options A, B, C, D while updating the correctAnswer correctly
    const processedMcq = shuffledMcq.map((q, qIdx) => {
      if (q.questionType === 'mcq_4' && q.options && q.options.length === 4) {
        // Parse options text without prefix A., B., C., D.
        const cleanOptions = q.options.map((opt) => opt.replace(/^[A-D]\.\s*/, '').trim());
        const letters = ['A', 'B', 'C', 'D'];
        const origCorrectLetter = q.correctAnswer.trim().toUpperCase();
        const origCorrectIdx = letters.indexOf(origCorrectLetter);

        // Map pairs: { cleanText, isCorrect }
        const pairs = cleanOptions.map((text, idx) => ({
          text,
          isCorrect: idx === origCorrectIdx,
        }));

        // Shuffle options
        const shuffledPairs = shuffleArray(pairs, (c + 1) * 7919 + qIdx);
        const newCorrectIdx = shuffledPairs.findIndex((p) => p.isCorrect);
        const newCorrectLetter = newCorrectIdx !== -1 ? letters[newCorrectIdx] : q.correctAnswer;

        const newOptions = shuffledPairs.map((p, idx) => `${letters[idx]}. ${p.text}`);

        return {
          ...q,
          options: newOptions,
          correctAnswer: newCorrectLetter,
        };
      }
      return { ...q };
    });

    const combinedQuestions = [...processedMcq, ...essayQuestions];

    const answerKey = combinedQuestions.map((q, idx) => ({
      questionId: q.id,
      questionNumber: idx + 1,
      correctAnswer: q.correctAnswer,
      score: q.score,
      explanation: q.explanation,
      type: q.questionType,
    }));

    testCodes.push({
      code,
      questions: combinedQuestions,
      answerKey,
    });
  }

  return testCodes;
}
