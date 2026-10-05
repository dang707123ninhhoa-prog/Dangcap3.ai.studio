import { EducationLevel, QuestionType, ExamConfig } from '../types/exam';

export interface SubjectOption {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

export const EDUCATION_LEVELS: { id: EducationLevel; name: string; subtitle: string; grades: number[] }[] = [
  {
    id: 'tieuhoc',
    name: 'TIỂU HỌC',
    subtitle: 'Lớp 1 đến Lớp 5 • Chương trình GDPT 2018',
    grades: [1, 2, 3, 4, 5],
  },
  {
    id: 'thcs',
    name: 'THCS',
    subtitle: 'Lớp 6 đến Lớp 9 • Phát triển năng lực tư duy',
    grades: [6, 7, 8, 9],
  },
  {
    id: 'thpt',
    name: 'THPT',
    subtitle: 'Lớp 10 đến Lớp 12 • Định hướng nghề nghiệp & thi TN THPT',
    grades: [10, 11, 12],
  },
];

export const SUBJECTS_BY_LEVEL: Record<EducationLevel, SubjectOption[]> = {
  tieuhoc: [
    { id: 'toan', name: 'Toán' },
    { id: 'tieng_viet', name: 'Tiếng Việt' },
    { id: 'tieng_anh', name: 'Tiếng Anh' },
    { id: 'tnxh', name: 'Tự nhiên và Xã hội' },
    { id: 'khoa_hoc', name: 'Khoa học' },
    { id: 'ls_dl_th', name: 'Lịch sử và Địa lí' },
    { id: 'tin_hoc', name: 'Tin học' },
    { id: 'cong_nghe', name: 'Công nghệ' },
    { id: 'dao_duc', name: 'Đạo đức' },
    { id: 'am_nhac', name: 'Âm nhạc' },
    { id: 'mi_thuat', name: 'Mĩ thuật' },
    { id: 'hdtn', name: 'Hoạt động trải nghiệm' },
  ],
  thcs: [
    { id: 'toan', name: 'Toán' },
    { id: 'ngu_van', name: 'Ngữ văn' },
    { id: 'tieng_anh', name: 'Tiếng Anh' },
    { id: 'khtn', name: 'Khoa học tự nhiên' },
    { id: 'ls_dl', name: 'Lịch sử và Địa lí' },
    { id: 'tin_hoc', name: 'Tin học' },
    { id: 'cong_nghe', name: 'Công nghệ' },
    { id: 'gdcd', name: 'Giáo dục công dân' },
    { id: 'am_nhac', name: 'Âm nhạc' },
    { id: 'mi_thuat', name: 'Mĩ thuật' },
    { id: 'hdtn_hn', name: 'Hoạt động trải nghiệm, hướng nghiệp' },
  ],
  thpt: [
    { id: 'toan', name: 'Toán' },
    { id: 'ngu_van', name: 'Ngữ văn' },
    { id: 'tieng_anh', name: 'Tiếng Anh' },
    { id: 'vat_li', name: 'Vật lí' },
    { id: 'hoa_hoc', name: 'Hóa học' },
    { id: 'sinh_hoc', name: 'Sinh học' },
    { id: 'lich_su', name: 'Lịch sử' },
    { id: 'dia_li', name: 'Địa lí' },
    { id: 'gdkt_pl', name: 'Giáo dục kinh tế và pháp luật' },
    { id: 'tin_hoc', name: 'Tin học' },
    { id: 'cong_nghe', name: 'Công nghệ' },
    { id: 'am_nhac', name: 'Âm nhạc' },
    { id: 'mi_thuat', name: 'Mĩ thuật' },
  ],
};

export const EXAM_TYPES = [
  'Kiểm tra thường xuyên',
  'Kiểm tra 15 phút',
  'Kiểm tra giữa kỳ',
  'Kiểm tra cuối kỳ',
  'Đề ôn tập',
  'Đề luyện tập',
  'Đề khảo sát',
  'Đề tuyển chọn học sinh',
  'Đề tự tạo',
];

export const DURATION_OPTIONS = [10, 15, 30, 45, 60, 90, 120];

export interface QuestionTypeMeta {
  id: QuestionType;
  name: string;
  category: 'trac_nghiem' | 'tu_luan';
  description: string;
  defaultCount: number;
}

export const QUESTION_TYPES_META: QuestionTypeMeta[] = [
  // Trắc nghiệm
  {
    id: 'mcq_4',
    name: 'Trắc nghiệm 4 lựa chọn (A/B/C/D)',
    category: 'trac_nghiem',
    description: 'Dạng chọn 1 phương án đúng trong 4 phương án',
    defaultCount: 12,
  },
  {
    id: 'true_false',
    name: 'Trắc nghiệm Đúng/Sai (Đ/S)',
    category: 'trac_nghiem',
    description: 'Mỗi câu gồm 4 ý a, b, c, d chuẩn format GDPT 2018',
    defaultCount: 4,
  },
  {
    id: 'short_answer',
    name: 'Trắc nghiệm trả lời ngắn',
    category: 'trac_nghiem',
    description: 'Học sinh điền số, giá trị hoặc từ ngữ ngắn gọn',
    defaultCount: 4,
  },
  {
    id: 'mcq_multi',
    name: 'Nhiều đáp án đúng',
    category: 'trac_nghiem',
    description: 'Học sinh chọn 2 hoặc nhiều phương án đúng',
    defaultCount: 0,
  },
  {
    id: 'matching',
    name: 'Ghép nối',
    category: 'trac_nghiem',
    description: 'Nối các cặp tương ứng ở Cột 1 và Cột 2',
    defaultCount: 0,
  },
  {
    id: 'fill_blank',
    name: 'Điền khuyết',
    category: 'trac_nghiem',
    description: 'Điền từ ngữ thích hợp vào chỗ trống',
    defaultCount: 0,
  },
  // Tự luận
  {
    id: 'essay_solve',
    name: 'Giải bài tập / Toán',
    category: 'tu_luan',
    description: 'Trình bày lời giải chi tiết, tính toán từng bước',
    defaultCount: 2,
  },
  {
    id: 'essay_short',
    name: 'Câu hỏi ngắn tự luận',
    category: 'tu_luan',
    description: 'Trả lời ngắn gọn từ 2-4 câu',
    defaultCount: 0,
  },
  {
    id: 'reading_comp',
    name: 'Đọc hiểu văn bản',
    category: 'tu_luan',
    description: 'Cho đoạn trích / ngữ liệu và trả lời câu hỏi đọc hiểu',
    defaultCount: 0,
  },
  {
    id: 'essay_explain',
    name: 'Giải thích / Phân tích',
    category: 'tu_luan',
    description: 'Giải thích nguyên nhân, phân tích nội dung, nhận định',
    defaultCount: 0,
  },
  {
    id: 'essay_writing',
    name: 'Viết đoạn / Viết bài văn',
    category: 'tu_luan',
    description: 'Viết đoạn văn ngắn 200 chữ hoặc bài văn hoàn chỉnh',
    defaultCount: 0,
  },
  {
    id: 'essay_apply',
    name: 'Vận dụng thực tế',
    category: 'tu_luan',
    description: 'Giải quyết bài toán / tình huống thực tiễn đời sống',
    defaultCount: 0,
  },
  {
    id: 'essay_present',
    name: 'Trình bày',
    category: 'tu_luan',
    description: 'Trình bày khái niệm, định lí, quy trình',
    defaultCount: 0,
  },
  {
    id: 'essay_compare',
    name: 'So sánh',
    category: 'tu_luan',
    description: 'So sánh điểm giống và khác nhau',
    defaultCount: 0,
  },
  {
    id: 'essay_proof',
    name: 'Chứng minh',
    category: 'tu_luan',
    description: 'Chứng minh đẳng thức, hình học hoặc nhận định',
    defaultCount: 0,
  },
  {
    id: 'essay_analyze',
    name: 'Phân tích tổng hợp',
    category: 'tu_luan',
    description: 'Phân tích dữ liệu, số liệu, hiện tượng',
    defaultCount: 0,
  },
];

export const INITIAL_QUESTION_COUNTS: Record<QuestionType, number> = {
  mcq_4: 12,
  true_false: 4,
  short_answer: 4,
  mcq_multi: 0,
  matching: 0,
  fill_blank: 0,
  essay_solve: 2,
  essay_short: 0,
  reading_comp: 0,
  essay_explain: 0,
  essay_writing: 0,
  essay_apply: 0,
  essay_present: 0,
  essay_compare: 0,
  essay_proof: 0,
  essay_analyze: 0,
};

export const DEFAULT_EXAM_CONFIG: ExamConfig = {
  level: 'thpt',
  grade: 12,
  subject: 'Toán',
  isCustomSubject: false,
  topic: 'Khảo sát hàm số và ứng dụng đạo hàm',
  chapter: 'Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
  scope: 'Đồng biến, nghịch biến, cực trị, giá trị lớn nhất, giá trị nhỏ nhất, tiệm cận',
  testedContent: 'Nhận diện đồ thị, tìm cực trị của hàm phân thức và hàm đa thức, bài toán tối ưu thực tế',
  learningOutcomes: 'Học sinh nhận biết được tính đơn điệu, tìm được cực trị và giải được bài toán thực tế',
  teacherNotes: 'Đề bám sát cấu trúc đề thi tốt nghiệp THPT 2025-2026, câu hỏi vận dụng cao liên quan thực tế kinh tế',
  lessonContent: '',
  referenceDocuments: [],
  referenceMode: 'reference_and_curriculum',
  examType: 'Kiểm tra giữa kỳ',
  examTitle: 'ĐỀ KIỂM TRA ĐỊNH KỲ GIỮA HỌC KỲ I',
  schoolName: 'TRƯỜNG THPT CHUYÊN LÊ QUÝ ĐÔN',
  durationMinutes: 45,
  questionCounts: { ...INITIAL_QUESTION_COUNTS },
  cognitiveDistribution: {
    mode: 'percentage',
    values: {
      recognition: 40,
      comprehension: 30,
      application: 20,
      highApplication: 10,
    },
  },
  scoreScale: 10,
  teacherQuestions: [],
  keepTeacherQuestions: true,
  testCodeCount: 2,
};
