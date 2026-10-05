import React, { useState, useEffect } from 'react';
import { Question, CognitiveLevel, QuestionType, EducationLevel } from '../../types/exam';
import { X, Library, Search, Filter, Plus, Trash2, Copy, Edit, Check } from 'lucide-react';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToExam: (question: Question) => void;
  currentQuestions: Question[];
}

const STORAGE_KEY = 'ai_exam_question_bank_v1';

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  onInsertToExam,
  currentQuestions,
}) => {
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBankQuestions(JSON.parse(saved));
      } else {
        // Seed initial items if empty
        const initialSeed: Question[] = [
          {
            id: 'BANK_01',
            subject: 'Toán',
            grade: 'Lớp 12',
            topic: 'Khảo sát hàm số',
            questionType: 'mcq_4',
            questionTypeName: 'Trắc nghiệm 4 lựa chọn',
            level: 'Nhận biết',
            question: 'Cho hàm số y = f(x) có bảng biến thiên trên [-3; 3]. Giá trị cực đại của hàm số đã cho bằng bao nhiêu?',
            options: ['A. y = 3', 'B. y = -2', 'C. x = 1', 'D. x = -3'],
            correctAnswer: 'A',
            explanation: 'Dựa vào bảng biến thiên, giá trị cực đại đạt được tại x = 1 và y_CĐ = 3.',
            score: 0.25,
          },
          {
            id: 'BANK_02',
            subject: 'Ngữ văn',
            grade: 'Lớp 9',
            topic: 'Thơ hiện đại Việt Nam',
            questionType: 'reading_comp',
            questionTypeName: 'Đọc hiểu',
            level: 'Thông hiểu',
            question: 'Nêu ý nghĩa biểu tượng của hình ảnh "ánh trăng" trong bài thơ cùng tên của nhà thơ Nguyễn Duy.',
            correctAnswer: 'Hình ảnh ánh trăng biểu tượng cho quá khứ nghĩa tình, vẹn nguyên, cho thiên nhiên tươi đẹp và sự bao dung nhân hậu.',
            explanation: 'Học sinh phân tích được ý nghĩa tả thực và ý nghĩa triết lý sâu xa của hình tượng vầng trăng.',
            score: 1.0,
          },
          {
            id: 'BANK_03',
            subject: 'Tiếng Việt',
            grade: 'Lớp 5',
            topic: 'Mở rộng vốn từ Nhân dân',
            questionType: 'mcq_4',
            questionTypeName: 'Trắc nghiệm 4 lựa chọn',
            level: 'Nhận biết',
            question: 'Từ nào dưới đây đồng nghĩa với từ "đồng bào"?',
            options: ['A. Nhân dân', 'B. Bà con', 'C. Quê hương', 'D. Đất nước'],
            correctAnswer: 'A',
            explanation: 'Đồng bào là những người cùng chung một giống nòi, một dân tộc, đồng nghĩa với nhân dân.',
            score: 0.5,
          },
        ];
        setBankQuestions(initialSeed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  const saveToStorage = (qs: Question[]) => {
    setBankQuestions(qs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(qs));
  };

  if (!isOpen) return null;

  // Filter items
  const filtered = bankQuestions.filter((q) => {
    const matchSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubj = filterSubject === 'all' || q.subject === filterSubject;
    const matchGrade = filterGrade === 'all' || q.grade.includes(filterGrade);
    const matchLevel = filterLevel === 'all' || q.level === filterLevel;
    const matchType = filterType === 'all' || q.questionType === filterType;
    return matchSearch && matchSubj && matchGrade && matchLevel && matchType;
  });

  const handleDelete = (id: string) => {
    const updated = bankQuestions.filter((q) => q.id !== id);
    saveToStorage(updated);
  };

  const handleDuplicate = (q: Question) => {
    const copy: Question = {
      ...q,
      id: `BANK_${Date.now()}`,
      question: `${q.question} (Bản sao)`,
    };
    saveToStorage([copy, ...bankQuestions]);
  };

  const handleInsert = (q: Question) => {
    onInsertToExam(q);
    setAddedIds(new Set(addedIds).add(q.id));
  };

  const handleSaveCurrentExamQuestionsToBank = () => {
    if (currentQuestions.length === 0) return;
    const newItems = [...bankQuestions];
    currentQuestions.forEach((q) => {
      if (!newItems.some((b) => b.question === q.question)) {
        newItems.unshift({
          ...q,
          id: `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        });
      }
    });
    saveToStorage(newItems);
  };

  // Distinct values for filters
  const subjects = Array.from(new Set(bankQuestions.map((q) => q.subject))).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                NGÂN HÀNG CÂU HỎI THI ĐÃ LƯU ({bankQuestions.length} câu)
              </h3>
              <p className="text-xs text-slate-500">
                Lưu trữ, tái sử dụng, nhân bản và chèn nhanh vào các đề kiểm tra
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleSaveCurrentExamQuestionsToBank}
                className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                title="Lưu tất cả câu hỏi của đề hiện tại vào kho"
              >
                + Lưu đề hiện tại vào kho ({currentQuestions.length} câu)
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung, chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-white border border-slate-300 rounded-lg"
            />
          </div>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
          >
            <option value="all">Tất cả môn</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="Nhận biết">Nhận biết</option>
            <option value="Thông hiểu">Thông hiểu</option>
            <option value="Vận dụng">Vận dụng</option>
            <option value="Vận dụng cao">Vận dụng cao</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
          >
            <option value="all">Tất cả dạng câu</option>
            <option value="mcq_4">Trắc nghiệm 4 lựa chọn</option>
            <option value="true_false">Đúng / Sai</option>
            <option value="short_answer">Trả lời ngắn</option>
            <option value="essay_solve">Tự luận giải bài</option>
            <option value="reading_comp">Đọc hiểu</option>
          </select>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
            </div>
          ) : (
            filtered.map((q) => {
              const isAdded = addedIds.has(q.id);
              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xs transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                        {q.subject} - {q.grade}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {q.topic}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                        {q.level} • {q.score}đ
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {q.questionTypeName || q.questionType}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleInsert(q)}
                        disabled={isAdded}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {isAdded ? 'Đã thêm' : 'Chèn vào đề'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(q)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                        title="Nhân bản câu hỏi"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(q.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Xóa câu hỏi khỏi ngân hàng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {q.question}
                  </p>

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-slate-600 pl-2">
                      {q.options.map((opt, i) => (
                        <div key={i} className="truncate">
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <strong className="text-blue-700">Đáp án: {q.correctAnswer}</strong> • Giải thích: {q.explanation}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
          <span className="text-xs text-slate-500">
            Tổng cộng: {filtered.length} câu hỏi hiển thị
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
