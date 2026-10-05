export type EducationLevel = 'tieuhoc' | 'thcs' | 'thpt';

export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export type QuestionFormatCategory = 'trac_nghiem' | 'tu_luan';

export type QuestionType =
  // Trắc nghiệm
  | 'mcq_4'          // 4 lựa chọn A/B/C/D
  | 'mcq_multi'      // Nhiều đáp án đúng
  | 'true_false'     // Đúng / Sai (Bộ 4 ý a,b,c,d hoặc câu đơn)
  | 'matching'       // Ghép nối cột A và cột B
  | 'fill_blank'     // Điền khuyết
  | 'short_answer'   // Trả lời ngắn
  // Tự luận
  | 'essay_short'    // Câu hỏi ngắn
  | 'essay_explain'  // Giải thích
  | 'essay_present'  // Trình bày
  | 'essay_solve'    // Giải bài tập
  | 'essay_analyze'  // Phân tích
  | 'essay_compare'  // So sánh
  | 'essay_proof'    // Chứng minh
  | 'essay_apply'    // Vận dụng thực tế
  | 'reading_comp'   // Đọc hiểu
  | 'essay_writing'; // Viết đoạn / Viết bài

export interface QuestionSubItem {
  id: string; // a, b, c, d
  statement: string;
  isCorrect: boolean; // For true_false: true = Đúng, false = Sai
}

export interface QuestionMatchPair {
  left: string;
  right: string;
}

export interface Question {
  id: string; // Q01, Q02...
  subject: string;
  grade: string;
  topic: string;
  chapter?: string;
  questionType: QuestionType;
  questionTypeName: string;
  level: CognitiveLevel;
  question: string;
  readingPassage?: string; // Ngữ liệu đọc hiểu nếu có
  options?: string[]; // ['A. ...', 'B. ...', 'C. ...', 'D. ...']
  correctAnswer: string;
  explanation: string;
  score: number;
  learningOutcome?: string; // Yêu cầu cần đạt
  subItems?: QuestionSubItem[]; // Dành cho câu hỏi Đúng/Sai (chuẩn GD 2018 4 ý a,b,c,d)
  matchingPairs?: QuestionMatchPair[]; // Dành cho ghép nối
  needsReview?: boolean; // Cảnh báo "⚠ Cần giáo viên kiểm tra"
  reviewReason?: string;
  isTeacherProvided?: boolean; // Giữ nguyên câu hỏi giáo viên nhập
}

export interface ReferenceDocument {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'image' | 'text';
  content?: string; // text content or base64
  mimeType?: string;
  size?: number;
}

export type ReferenceMode =
  | 'only_reference'              // Chỉ sử dụng tài liệu đã cung cấp
  | 'reference_and_curriculum'   // Tài liệu tải lên + kiến thức chương trình phổ thông
  | 'teacher_custom';            // Giáo viên tự nhập nội dung

export interface CognitiveDistribution {
  mode: 'percentage' | 'count';
  values: {
    recognition: number;      // Nhận biết
    comprehension: number;    // Thông hiểu
    application: number;      // Vận dụng
    highApplication: number;  // Vận dụng cao
  };
}

export interface ExamConfig {
  level: EducationLevel;
  grade: number; // 1-12
  subject: string;
  isCustomSubject?: boolean;
  
  // Kiến thức
  topic: string;
  chapter: string;
  scope: string;
  testedContent: string;
  learningOutcomes: string;
  teacherNotes: string;
  lessonContent: string; // Raw pasted lesson / textbook text

  // Tài liệu tham chiếu
  referenceDocuments: ReferenceDocument[];
  referenceMode: ReferenceMode;

  // Loại đề
  examType: string;
  examTitle: string;
  schoolName: string;
  durationMinutes: number;

  // Hình thức câu hỏi & số lượng
  questionCounts: Record<QuestionType, number>;

  // Mức độ câu hỏi
  cognitiveDistribution: CognitiveDistribution;

  // Thang điểm
  scoreScale: number; // 10, 20, 100, or custom

  // Câu hỏi giáo viên nhập sẵn
  teacherQuestions: Question[];
  keepTeacherQuestions: boolean;

  // Số lượng mã đề
  testCodeCount: 1 | 2 | 3 | 4;
}

export interface MatrixCell {
  recognitionCount: number;
  recognitionScore: number;
  comprehensionCount: number;
  comprehensionScore: number;
  applicationCount: number;
  applicationScore: number;
  highApplicationCount: number;
  highApplicationScore: number;
  totalCount: number;
  totalScore: number;
  percentage: number;
}

export interface MatrixRow {
  topic: string;
  content: string;
  formatCategory: QuestionFormatCategory;
  cells: MatrixCell;
}

export interface ExamMatrix {
  rows: MatrixRow[];
  totals: {
    recognitionCount: number;
    recognitionScore: number;
    recognitionPercent: number;

    comprehensionCount: number;
    comprehensionScore: number;
    comprehensionPercent: number;

    applicationCount: number;
    applicationScore: number;
    applicationPercent: number;

    highApplicationCount: number;
    highApplicationScore: number;
    highApplicationPercent: number;

    totalCount: number;
    totalScore: number;
    totalPercent: number;
  };
}

export interface SpecificationItem {
  id: string;
  topic: string;
  knowledgeUnit: string;
  learningOutcome: string;
  level: CognitiveLevel;
  questionType: string;
  questionNumbers: string; // "Câu 1, 2"
  questionCount: number;
  totalScore: number;
}

export interface TestCodeExam {
  code: string; // '101', '102', '103', '104'
  questions: Question[];
  answerKey: {
    questionId: string;
    questionNumber: number;
    correctAnswer: string;
    score: number;
    explanation: string;
    type: QuestionType;
  }[];
}

export interface QualityCheckResult {
  passed: boolean;
  criteria: {
    id: number;
    title: string;
    status: 'pass' | 'warning' | 'fail';
    detail: string;
  }[];
}

export interface GeneratedExamPackage {
  id: string;
  createdAt: string;
  config: ExamConfig;
  matrix: ExamMatrix;
  specifications: SpecificationItem[];
  testCodes: TestCodeExam[]; // 101, 102...
  currentTestCode: string; // '101'
  qualityCheck: QualityCheckResult;
  generalNotes?: string;
  gradingGuide: {
    criteria: string;
    scoreBreakdown: { item: string; score: number }[];
    notes: string[];
  }[];
}
