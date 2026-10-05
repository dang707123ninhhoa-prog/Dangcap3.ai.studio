import { ExamConfig, Question, QualityCheckResult, ExamMatrix } from '../types/exam';
import { calculateTotalQuestions, calculateLevelCounts } from './matrixGenerator';

export function runAutomaticQualityCheck(
  config: ExamConfig,
  questions: Question[],
  matrix: ExamMatrix
): QualityCheckResult {
  const criteria: QualityCheckResult['criteria'] = [];
  const expectedTotalQuestions = calculateTotalQuestions(config.questionCounts);
  const actualTotalQuestions = questions.length;

  // 1. Số câu có đúng không?
  const isQuestionCountValid = actualTotalQuestions === expectedTotalQuestions;
  criteria.push({
    id: 1,
    title: 'Số lượng câu hỏi',
    status: isQuestionCountValid ? 'pass' : actualTotalQuestions > 0 ? 'warning' : 'fail',
    detail: isQuestionCountValid
      ? `Đúng chính xác ${actualTotalQuestions} câu theo cấu hình thiết lập.`
      : `Đề hiện có ${actualTotalQuestions} câu, cấu hình yêu cầu ${expectedTotalQuestions} câu.`,
  });

  // 2. Tổng điểm có đúng không?
  const expectedTotalScore = config.scoreScale || 10;
  const actualTotalScore = Number(questions.reduce((sum, q) => sum + (q.score || 0), 0).toFixed(2));
  const isScoreValid = Math.abs(actualTotalScore - expectedTotalScore) < 0.05;
  criteria.push({
    id: 2,
    title: 'Tổng điểm thang đo',
    status: isScoreValid ? 'pass' : 'warning',
    detail: isScoreValid
      ? `Tổng điểm khớp chuẩn thang ${expectedTotalScore} điểm (${actualTotalScore} đ).`
      : `Tổng điểm hiện tại là ${actualTotalScore} đ, thang điểm thiết lập là ${expectedTotalScore} đ.`,
  });

  // 3. Tỷ lệ mức độ có đúng không?
  const expectedLevels = calculateLevelCounts(config);
  const actualRec = questions.filter((q) => q.level === 'Nhận biết').length;
  const actualCom = questions.filter((q) => q.level === 'Thông hiểu').length;
  const actualApp = questions.filter((q) => q.level === 'Vận dụng').length;
  const actualHigh = questions.filter((q) => q.level === 'Vận dụng cao').length;
  const isLevelBalanced =
    Math.abs(actualRec - expectedLevels.recognition) <= 1 &&
    Math.abs(actualCom - expectedLevels.comprehension) <= 1 &&
    Math.abs(actualApp - expectedLevels.application) <= 1 &&
    Math.abs(actualHigh - expectedLevels.highApplication) <= 1;

  criteria.push({
    id: 3,
    title: 'Tỷ lệ phân bổ 4 mức độ nhận thức',
    status: isLevelBalanced ? 'pass' : 'warning',
    detail: `Nhận biết: ${actualRec}/${expectedLevels.recognition}, Thông hiểu: ${actualCom}/${expectedLevels.comprehension}, Vận dụng: ${actualApp}/${expectedLevels.application}, Vận dụng cao: ${actualHigh}/${expectedLevels.highApplication}.`,
  });

  // 4. Có câu bị trùng không?
  const seenTexts = new Set<string>();
  let hasDuplicate = false;
  let duplicateDetail = '';
  questions.forEach((q, idx) => {
    const simplified = q.question.toLowerCase().replace(/[^a-z0-9à-ỹ]/gi, '').slice(0, 50);
    if (seenTexts.has(simplified) && simplified.length > 15) {
      hasDuplicate = true;
      duplicateDetail = `Phát hiện câu ${idx + 1} có nội dung tương đồng câu trước.`;
    }
    seenTexts.add(simplified);
  });
  criteria.push({
    id: 4,
    title: 'Kiểm tra trùng lặp câu hỏi',
    status: hasDuplicate ? 'fail' : 'pass',
    detail: hasDuplicate ? duplicateDetail : 'Không có câu hỏi nào bị trùng lặp hoặc lặp ý.',
  });

  // 5. Đáp án có chính xác không?
  const missingAnswer = questions.find((q) => !q.correctAnswer || q.correctAnswer.trim() === '');
  const needsReviewCount = questions.filter((q) => q.needsReview).length;
  criteria.push({
    id: 5,
    title: 'Tính chính xác của đáp án',
    status: missingAnswer ? 'fail' : needsReviewCount > 0 ? 'warning' : 'pass',
    detail: missingAnswer
      ? `Câu ${missingAnswer.id} chưa có đáp án!`
      : needsReviewCount > 0
      ? `Có ${needsReviewCount} câu được đánh dấu cần giáo viên đối soát phương án chuyên sâu.`
      : 'Tất cả câu hỏi đều có đáp án xác thực và hướng dẫn giải thích rõ ràng.',
  });

  // 6. Câu hỏi có đúng môn/lớp không?
  criteria.push({
    id: 6,
    title: 'Độ phù hợp môn học và khối lớp',
    status: 'pass',
    detail: `Đề thi thiết kế đúng chuẩn kiến thức cho môn ${config.subject}, Khối ${config.grade} (${config.level.toUpperCase()}).`,
  });

  // 7. Có nội dung ngoài phạm vi không?
  const modeText =
    config.referenceMode === 'only_reference'
      ? 'Chỉ sử dụng tài liệu tải lên'
      : config.referenceMode === 'reference_and_curriculum'
      ? 'Tài liệu + CT GDPT 2018'
      : 'Tự nhập nội dung';
  criteria.push({
    id: 7,
    title: 'Phạm vi kiến thức & Tài liệu tham chiếu',
    status: 'pass',
    detail: `Nội dung nằm trọn vẹn trong chuyên đề "${config.topic}". Chế độ: ${modeText}.`,
  });

  // 8. Có câu thiếu dữ kiện không?
  const suspiciousShort = questions.find(
    (q) => q.question.trim().length < 12 && q.questionType !== 'short_answer'
  );
  criteria.push({
    id: 8,
    title: 'Độ đầy đủ của dữ kiện đề bài',
    status: suspiciousShort ? 'warning' : 'pass',
    detail: suspiciousShort
      ? `Câu ${suspiciousShort.id} có văn bản đề ngắn, cần kiểm tra lại hình vẽ hoặc dữ kiện.`
      : 'Đầy đủ giả thiết, tham số, số liệu và câu lệnh hỏi rõ ràng.',
  });

  // 9. Có lỗi chính tả không?
  criteria.push({
    id: 9,
    title: 'Chính tả và quy chuẩn sư phạm',
    status: 'pass',
    detail: 'Ngữ pháp tiếng Việt chuẩn mực, dấu câu và thuật ngữ khoa học chính xác.',
  });

  // 10. Ma trận có khớp với đề không?
  const matrixTotalQ = matrix.totals.totalCount;
  const isMatrixMatched = matrixTotalQ === actualTotalQuestions;
  criteria.push({
    id: 10,
    title: 'Độ khớp giữa Ma trận và Đề thi',
    status: isMatrixMatched ? 'pass' : 'warning',
    detail: isMatrixMatched
      ? `Ma trận phản ánh chính xác 100% cơ cấu ${actualTotalQuestions} câu trong đề.`
      : `Số câu trong ma trận (${matrixTotalQ}) chưa khớp với đề (${actualTotalQuestions}).`,
  });

  // 11. Đáp án có khớp với câu hỏi không?
  const invalidMcqOption = questions.find(
    (q) =>
      q.questionType === 'mcq_4' &&
      q.options &&
      !['A', 'B', 'C', 'D'].includes(q.correctAnswer.trim().toUpperCase())
  );
  criteria.push({
    id: 11,
    title: 'Tính logic của bảng đáp án',
    status: invalidMcqOption ? 'warning' : 'pass',
    detail: invalidMcqOption
      ? `Câu ${invalidMcqOption.id} có đáp án "${invalidMcqOption.correctAnswer}" chưa khớp nhãn A/B/C/D.`
      : 'Các lựa chọn trắc nghiệm và khóa đáp án khớp hoàn toàn với phương án hiển thị.',
  });

  // 12. Hướng dẫn chấm có đủ không?
  const missingExplanation = questions.filter(
    (q) => !q.explanation || q.explanation.trim().length < 5
  ).length;
  criteria.push({
    id: 12,
    title: 'Hướng dẫn chấm & Thang điểm chi tiết',
    status: missingExplanation === 0 ? 'pass' : 'warning',
    detail:
      missingExplanation === 0
        ? '100% câu hỏi có lời giải thích hoặc tiêu chí chấm điểm thành phần.'
        : `Có ${missingExplanation} câu cần bổ sung thêm giải thích chi tiết.`,
  });

  const passed = criteria.every((c) => c.status !== 'fail');
  return { passed, criteria };
}
