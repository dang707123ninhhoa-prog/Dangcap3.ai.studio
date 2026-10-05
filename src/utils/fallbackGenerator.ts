import { ExamConfig, Question, GeneratedExamPackage } from '../types/exam';
import { generateExamMatrix, generateSpecifications } from './matrixGenerator';
import { generateTestCodes } from './testCodeGenerator';
import { runAutomaticQualityCheck } from './qualityChecker';
import { QUESTION_TYPES_META } from '../constants/curriculum';

export function createFallbackExamPackage(config: ExamConfig): GeneratedExamPackage {
  const { subject, grade, level, topic, questionCounts, scoreScale, teacherQuestions, keepTeacherQuestions } = config;

  const totalScoreTarget = scoreScale || 10;
  const questions: Question[] = [];

  // Include teacher questions if requested
  if (Array.isArray(teacherQuestions) && keepTeacherQuestions && teacherQuestions.length > 0) {
    questions.push(...teacherQuestions);
  }

  // Generate question items for configured types
  let qCounter = questions.length + 1;
  const levels = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'] as const;

  Object.entries(questionCounts).forEach(([typeKey, count]) => {
    const num = Number(count) || 0;
    if (num <= 0) return;

    const meta = QUESTION_TYPES_META.find((m) => m.id === typeKey);
    const typeName = meta?.name || 'Câu hỏi';

    for (let i = 0; i < num; i++) {
      const assignedLevel = levels[(qCounter - 1) % 4];
      const qId = `Q${String(qCounter).padStart(2, '0')}`;

      if (typeKey === 'mcq_4') {
        questions.push({
          id: qId,
          subject,
          grade: `Lớp ${grade}`,
          topic: topic || 'Nội dung kiến thức trọng tâm',
          questionType: 'mcq_4',
          questionTypeName: typeName,
          level: assignedLevel,
          question: `Cho kiến thức về "${topic || subject}". Khẳng định nào sau đây là đúng về đặc điểm cốt lõi của nội dung bài học?`,
          options: [
            'A. Đảm bảo tính khoa học, chính xác và có quy luật chung.',
            'B. Luôn biến đổi ngẫu nhiên và không thể dự đoán được.',
            'C. Chỉ áp dụng trong điều kiện lý thuyết thuần túy.',
            'D. Phụ thuộc hoàn toàn vào các yếu tố ngoại cảnh không cố định.',
          ],
          correctAnswer: 'A',
          explanation: `Khẳng định A là phát biểu chính xác theo quy chuẩn kiến thức của chương trình môn ${subject} Lớp ${grade}.`,
          score: 0.25,
          learningOutcome: `Học sinh nắm vững định nghĩa và bản chất của ${topic || subject}.`,
        });
      } else if (typeKey === 'true_false') {
        questions.push({
          id: qId,
          subject,
          grade: `Lớp ${grade}`,
          topic: topic || 'Nội dung trọng tâm',
          questionType: 'true_false',
          questionTypeName: typeName,
          level: assignedLevel,
          question: `Xét các nhận định sau đây liên quan đến kiến thức "${topic || subject}":`,
          subItems: [
            { id: 'a', statement: 'Nội dung kiến thức mang tính quy luật và hệ thống logic.', isCorrect: true },
            { id: 'b', statement: 'Có thể áp dụng trực tiếp để giải thích các bài toán thực tiễn.', isCorrect: true },
            { id: 'c', statement: 'Chỉ có ý nghĩa về mặt lịch sử mà không áp dụng trong hiện tại.', isCorrect: false },
            { id: 'd', statement: 'Cần tuân thủ đúng các bước và điều kiện tiên quyết khi vận dụng.', isCorrect: true },
          ],
          correctAnswer: 'a-Đ, b-Đ, c-S, d-Đ',
          explanation: 'Ý a, b, d là các nhận định khoa học đúng đắn; ý c là nhận định sai.',
          score: 1.0,
          learningOutcome: 'Phân biệt đúng sai các mệnh đề khoa học cơ bản.',
        });
      } else if (typeKey === 'short_answer') {
        questions.push({
          id: qId,
          subject,
          grade: `Lớp ${grade}`,
          topic: topic || 'Nội dung trọng tâm',
          questionType: 'short_answer',
          questionTypeName: typeName,
          level: assignedLevel,
          question: `Trong điều kiện chuẩn của bài toán "${topic || subject}", giá trị của thông số chính là bao nhiêu? (Điền số nguyên hoặc giá trị cụ thể)`,
          correctAnswer: '10',
          explanation: 'Áp dụng công thức và dữ kiện chuẩn để tính ra kết quả bằng 10.',
          score: 0.5,
          learningOutcome: 'Tính toán chính xác thông số định lượng.',
        });
      } else {
        // Essay questions
        questions.push({
          id: qId,
          subject,
          grade: `Lớp ${grade}`,
          topic: topic || 'Nội dung trọng tâm',
          questionType: typeKey as any,
          questionTypeName: typeName,
          level: assignedLevel,
          question: `Trình bày phương pháp giải quyết và lập luận chi tiết cho bài toán / vấn đề sau trong chủ đề "${topic || subject}": Phân tích bản chất và nêu rõ các bước thực hiện.`,
          correctAnswer: 'Học sinh trình bày đầy đủ định nghĩa, vẽ sơ đồ/viết công thức, chứng minh hoặc tính toán và kết luận thỏa đáng.',
          explanation: `- Nêu đúng bản chất và giả thiết: 40% số điểm.\n- Lập luận logic và các bước biến đổi: 40% số điểm.\n- Kết luận và nhận xét thực tiễn: 20% số điểm.`,
          score: 1.0,
          learningOutcome: 'Vận dụng kiến thức tổng hợp để giải bài tập hoặc giải thích hiện tượng.',
        });
      }
      qCounter++;
    }
  });

  // Re-scale question scores so total score matches scoreScale exactly
  if (questions.length > 0) {
    const basePerQ = Number((totalScoreTarget / questions.length).toFixed(2));
    questions.forEach((q) => {
      q.score = basePerQ;
    });
    const currentSum = Number(questions.reduce((s, q) => s + q.score, 0).toFixed(2));
    const diff = Number((totalScoreTarget - currentSum).toFixed(2));
    if (diff !== 0) {
      questions[questions.length - 1].score = Number(
        (questions[questions.length - 1].score + diff).toFixed(2)
      );
    }
  }

  // Generate Matrix
  const matrix = generateExamMatrix(config, questions);
  // Generate Specifications
  const specifications = generateSpecifications(config, questions);
  // Generate Test codes (101, 102...)
  const testCodes = generateTestCodes(questions, config.testCodeCount || 2);
  // Run Quality Check
  const qualityCheck = runAutomaticQualityCheck(config, questions, matrix);

  return {
    id: `EXAM_${Date.now()}`,
    createdAt: new Date().toISOString(),
    config,
    matrix,
    specifications,
    testCodes,
    currentTestCode: '101',
    qualityCheck,
    gradingGuide: [
      {
        criteria: 'Chuẩn kiến thức và năng lực bộ môn',
        scoreBreakdown: [
          { item: 'Phần trắc nghiệm khách quan', score: Number((totalScoreTarget * 0.7).toFixed(1)) },
          { item: 'Phần tự luận / vận dụng', score: Number((totalScoreTarget * 0.3).toFixed(1)) },
        ],
        notes: ['Chấm theo từng bước', 'Không trừ điểm lỗi chính tả nhỏ nếu không làm sai lệch ý nghĩa'],
      },
    ],
  };
}
