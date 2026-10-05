import { ExamConfig, ExamMatrix, MatrixRow, SpecificationItem, Question, CognitiveLevel, QuestionType } from '../types/exam';
import { QUESTION_TYPES_META } from '../constants/curriculum';

export function calculateTotalQuestions(counts: Record<QuestionType, number>): number {
  return Object.values(counts).reduce((acc, count) => acc + (Number(count) || 0), 0);
}

export function calculateLevelCounts(config: ExamConfig): {
  recognition: number;
  comprehension: number;
  application: number;
  highApplication: number;
} {
  const total = calculateTotalQuestions(config.questionCounts);
  if (total === 0) {
    return { recognition: 0, comprehension: 0, application: 0, highApplication: 0 };
  }

  const { mode, values } = config.cognitiveDistribution;
  if (mode === 'count') {
    return {
      recognition: Math.max(0, values.recognition || 0),
      comprehension: Math.max(0, values.comprehension || 0),
      application: Math.max(0, values.application || 0),
      highApplication: Math.max(0, values.highApplication || 0),
    };
  }

  // Percentage mode: distribute proportional to percentages ensuring sum equals total
  const recRaw = (values.recognition / 100) * total;
  const comRaw = (values.comprehension / 100) * total;
  const appRaw = (values.application / 100) * total;
  const highRaw = (values.highApplication / 100) * total;

  let rec = Math.round(recRaw);
  let com = Math.round(comRaw);
  let app = Math.round(appRaw);
  let high = Math.round(highRaw);

  const diff = total - (rec + com + app + high);
  if (diff !== 0) {
    // Adjust difference on the highest remaining fraction
    if (diff > 0) {
      rec += diff;
    } else {
      if (rec + diff >= 0) rec += diff;
      else if (com + diff >= 0) com += diff;
      else if (app + diff >= 0) app += diff;
      else high = Math.max(0, high + diff);
    }
  }

  return { recognition: rec, comprehension: com, application: app, highApplication: high };
}

export function generateExamMatrix(config: ExamConfig, questions: Question[]): ExamMatrix {
  const totalScore = config.scoreScale || 10;
  const totalQ = questions.length || calculateTotalQuestions(config.questionCounts);

  // Group questions by topic or default
  const topicMap = new Map<string, { trac_nghiem: Question[]; tu_luan: Question[] }>();
  const defaultTopic = config.topic.trim() || 'Nội dung kiến thức trọng tâm';

  if (questions.length === 0) {
    // Generate placeholder based on config
    const levelCounts = calculateLevelCounts(config);
    const scorePerQ = totalQ > 0 ? Number((totalScore / totalQ).toFixed(2)) : 0;
    
    const recScore = Number((levelCounts.recognition * scorePerQ).toFixed(2));
    const comScore = Number((levelCounts.comprehension * scorePerQ).toFixed(2));
    const appScore = Number((levelCounts.application * scorePerQ).toFixed(2));
    const highAppScore = Number((totalScore - (recScore + comScore + appScore)).toFixed(2));

    const singleRow: MatrixRow = {
      topic: defaultTopic,
      content: config.testedContent || config.scope || 'Toàn bộ nội dung chương trình',
      formatCategory: 'trac_nghiem',
      cells: {
        recognitionCount: levelCounts.recognition,
        recognitionScore: recScore,
        comprehensionCount: levelCounts.comprehension,
        comprehensionScore: comScore,
        applicationCount: levelCounts.application,
        applicationScore: appScore,
        highApplicationCount: levelCounts.highApplication,
        highApplicationScore: highAppScore,
        totalCount: totalQ,
        totalScore: totalScore,
        percentage: 100,
      },
    };

    return {
      rows: [singleRow],
      totals: {
        recognitionCount: levelCounts.recognition,
        recognitionScore: recScore,
        recognitionPercent: totalQ ? Math.round((levelCounts.recognition / totalQ) * 100) : 0,

        comprehensionCount: levelCounts.comprehension,
        comprehensionScore: comScore,
        comprehensionPercent: totalQ ? Math.round((levelCounts.comprehension / totalQ) * 100) : 0,

        applicationCount: levelCounts.application,
        applicationScore: appScore,
        applicationPercent: totalQ ? Math.round((levelCounts.application / totalQ) * 100) : 0,

        highApplicationCount: levelCounts.highApplication,
        highApplicationScore: highAppScore,
        highApplicationPercent: totalQ ? Math.round((levelCounts.highApplication / totalQ) * 100) : 0,

        totalCount: totalQ,
        totalScore: totalScore,
        totalPercent: 100,
      },
    };
  }

  // Populate from actual questions
  questions.forEach((q) => {
    const t = q.topic?.trim() || defaultTopic;
    if (!topicMap.has(t)) {
      topicMap.set(t, { trac_nghiem: [], tu_luan: [] });
    }
    const meta = QUESTION_TYPES_META.find((m) => m.id === q.questionType);
    const cat = meta?.category || (q.options && q.options.length > 0 ? 'trac_nghiem' : 'tu_luan');
    topicMap.get(t)![cat].push(q);
  });

  const rows: MatrixRow[] = [];
  let sumRecCount = 0, sumRecScore = 0;
  let sumComCount = 0, sumComScore = 0;
  let sumAppCount = 0, sumAppScore = 0;
  let sumHighCount = 0, sumHighScore = 0;
  let sumTotalScore = 0;

  topicMap.forEach((groups, topic) => {
    (['trac_nghiem', 'tu_luan'] as const).forEach((cat) => {
      const qList = groups[cat];
      if (qList.length === 0) return;

      const rec = qList.filter((q) => q.level === 'Nhận biết');
      const com = qList.filter((q) => q.level === 'Thông hiểu');
      const app = qList.filter((q) => q.level === 'Vận dụng');
      const high = qList.filter((q) => q.level === 'Vận dụng cao');

      const recS = rec.reduce((s, q) => s + (q.score || 0), 0);
      const comS = com.reduce((s, q) => s + (q.score || 0), 0);
      const appS = app.reduce((s, q) => s + (q.score || 0), 0);
      const highS = high.reduce((s, q) => s + (q.score || 0), 0);
      const rowScore = recS + comS + appS + highS;

      sumRecCount += rec.length;
      sumRecScore += recS;
      sumComCount += com.length;
      sumComScore += comS;
      sumAppCount += app.length;
      sumAppScore += appS;
      sumHighCount += high.length;
      sumHighScore += highS;
      sumTotalScore += rowScore;

      rows.push({
        topic: topic,
        content: cat === 'trac_nghiem' ? 'Phần Trắc nghiệm khách quan' : 'Phần Tự luận',
        formatCategory: cat,
        cells: {
          recognitionCount: rec.length,
          recognitionScore: Number(recS.toFixed(2)),
          comprehensionCount: com.length,
          comprehensionScore: Number(comS.toFixed(2)),
          applicationCount: app.length,
          applicationScore: Number(appS.toFixed(2)),
          highApplicationCount: high.length,
          highApplicationScore: Number(highS.toFixed(2)),
          totalCount: qList.length,
          totalScore: Number(rowScore.toFixed(2)),
          percentage: totalScore ? Math.round((rowScore / totalScore) * 100) : 0,
        },
      });
    });
  });

  return {
    rows,
    totals: {
      recognitionCount: sumRecCount,
      recognitionScore: Number(sumRecScore.toFixed(2)),
      recognitionPercent: totalScore ? Math.round((sumRecScore / totalScore) * 100) : 0,

      comprehensionCount: sumComCount,
      comprehensionScore: Number(sumComScore.toFixed(2)),
      comprehensionPercent: totalScore ? Math.round((sumComScore / totalScore) * 100) : 0,

      applicationCount: sumAppCount,
      applicationScore: Number(sumAppScore.toFixed(2)),
      applicationPercent: totalScore ? Math.round((sumAppScore / totalScore) * 100) : 0,

      highApplicationCount: sumHighCount,
      highApplicationScore: Number(sumHighScore.toFixed(2)),
      highApplicationPercent: totalScore ? Math.round((sumHighScore / totalScore) * 100) : 0,

      totalCount: questions.length,
      totalScore: Number(sumTotalScore.toFixed(2)),
      totalPercent: 100,
    },
  };
}

export function generateSpecifications(config: ExamConfig, questions: Question[]): SpecificationItem[] {
  if (!questions || questions.length === 0) return [];

  // Group by topic, level, and questionType
  const specMap = new Map<string, {
    topic: string;
    knowledgeUnit: string;
    learningOutcome: string;
    level: CognitiveLevel;
    questionType: string;
    questionNumbers: number[];
    totalScore: number;
  }>();

  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const topic = q.topic || config.topic || 'Nội dung kiến thức';
    const unit = q.chapter || config.chapter || topic;
    const outcome = q.learningOutcome || config.learningOutcomes || 'Nắm vững kiến thức trọng tâm và vận dụng giải quyết vấn đề';
    const typeMeta = QUESTION_TYPES_META.find((m) => m.id === q.questionType);
    const typeName = typeMeta?.name || q.questionTypeName || 'Câu hỏi';

    const key = `${topic}__${q.level}__${q.questionType}`;
    if (!specMap.has(key)) {
      specMap.set(key, {
        topic,
        knowledgeUnit: unit,
        learningOutcome: outcome,
        level: q.level,
        questionType: typeName,
        questionNumbers: [qNum],
        totalScore: q.score || 0,
      });
    } else {
      const existing = specMap.get(key)!;
      existing.questionNumbers.push(qNum);
      existing.totalScore += q.score || 0;
    }
  });

  const specs: SpecificationItem[] = [];
  let counter = 1;
  specMap.forEach((val) => {
    const qNumStr = val.questionNumbers.length === 1
      ? `Câu ${val.questionNumbers[0]}`
      : `Câu ${val.questionNumbers.join(', ')}`;

    specs.push({
      id: `SPEC_${counter++}`,
      topic: val.topic,
      knowledgeUnit: val.knowledgeUnit,
      learningOutcome: val.learningOutcome,
      level: val.level,
      questionType: val.questionType,
      questionNumbers: qNumStr,
      questionCount: val.questionNumbers.length,
      totalScore: Number(val.totalScore.toFixed(2)),
    });
  });

  return specs;
}
