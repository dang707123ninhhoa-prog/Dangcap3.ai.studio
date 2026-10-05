import React from 'react';
import { Question, ExamConfig, TestCodeExam } from '../../types/exam';
import { RotateCcw, Edit, Trash2, Plus, AlertTriangle, Check, Award } from 'lucide-react';

interface ExamSheetProps {
  config: ExamConfig;
  currentTestCode: string;
  testCodes: TestCodeExam[];
  onSelectTestCode: (code: string) => void;
  onRegenerateQuestion: (q: Question) => void;
  onEditQuestion: (q: Question) => void;
  onDeleteQuestion: (qId: string) => void;
  onAddQuestion: () => void;
}

export const ExamSheet: React.FC<ExamSheetProps> = ({
  config,
  currentTestCode,
  testCodes,
  onSelectTestCode,
  onRegenerateQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onAddQuestion,
}) => {
  const currentExam = testCodes.find((t) => t.code === currentTestCode) || testCodes[0];
  const questions = currentExam?.questions || [];

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'Nhận biết':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Thông hiểu':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Vận dụng':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Vận dụng cao':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-10 text-slate-900 font-sans print:p-0 print:border-none print:shadow-none">
      {/* Test code selector bar (Hidden when printing) */}
      {testCodes.length > 1 && (
        <div className="mb-6 p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-900">Chọn mã đề hiển thị:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {testCodes.map((tc) => (
              <button
                key={tc.code}
                onClick={() => onSelectTestCode(tc.code)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  currentTestCode === tc.code
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Mã đề {tc.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Official Vietnamese Exam Header */}
      <div className="border-b-2 border-slate-800 pb-5 mb-6">
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold leading-relaxed">
          <div className="text-center sm:text-left">
            <p className="uppercase tracking-wider">SỞ GIÁO DỤC VÀ ĐÀO TẠO</p>
            <p className="uppercase font-bold tracking-wide text-blue-900">
              {config.schoolName || 'TRƯỜNG PHỔ THÔNG VIỆT NAM'}
            </p>
            <p className="text-[11px] text-slate-500 italic mt-0.5">(Đề thi có {questions.length} câu)</p>
          </div>

          <div className="text-center sm:text-right">
            <p className="uppercase font-bold text-sm tracking-wide text-slate-900">
              {config.examTitle || 'ĐỀ KIỂM TRA ĐỊNH KỲ'}
            </p>
            <p className="font-semibold text-slate-700">
              NĂM HỌC 2025 - 2026
            </p>
            <p className="text-xs font-bold text-blue-700">
              MÔN: {config.subject.toUpperCase()} - KHỐI {config.grade}
            </p>
            <p className="text-[11px] text-slate-500 italic">
              Thời gian làm bài: {config.durationMinutes} phút (không kể thời gian phát đề)
            </p>
          </div>
        </div>

        {/* Exam Code & Student Info */}
        <div className="mt-4 pt-3 border-t border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <span>Họ và tên thí sinh: ....................................................</span>
            <span>Lớp: .............</span>
            <span>Số báo danh: .............</span>
          </div>
          <div className="px-3 py-1 bg-slate-100 border border-slate-400 rounded text-xs font-bold tracking-widest text-slate-900">
            MÃ ĐỀ: {currentExam.code}
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const qNumber = idx + 1;
          return (
            <div
              key={q.id}
              className="group relative rounded-xl transition-all p-3 -mx-3 hover:bg-slate-50/80 border border-transparent hover:border-slate-200"
            >
              {/* Question header info & action buttons */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">
                    Câu {qNumber} ({q.score} điểm)
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelBadgeClass(
                      q.level
                    )}`}
                  >
                    {q.level}
                  </span>

                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {q.questionTypeName || q.questionType}
                  </span>

                  {q.needsReview && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300"
                      title={q.reviewReason || 'Cần giáo viên đối soát'}
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      ⚠ Cần giáo viên kiểm tra
                    </span>
                  )}

                  {q.isTeacherProvided && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Câu của giáo viên
                    </span>
                  )}
                </div>

                {/* Per-question Action Buttons (Hidden when printing) */}
                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity print:hidden">
                  <button
                    type="button"
                    onClick={() => onRegenerateQuestion(q)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100/70 rounded-md transition-colors"
                    title="Chỉ tạo lại riêng câu này bằng AI"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Tạo lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEditQuestion(q)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200/70 rounded-md transition-colors"
                    title="Chỉnh sửa nội dung câu hỏi"
                  >
                    <Edit className="w-3 h-3" />
                    <span className="hidden sm:inline">Sửa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteQuestion(q.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Xóa câu này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Reading Passage if any */}
              {q.readingPassage && (
                <div className="mb-3 p-3 bg-slate-50 border-l-4 border-blue-400 rounded-r-lg text-xs leading-relaxed text-slate-700 italic">
                  <span className="font-bold not-italic block text-blue-900 mb-1">
                    Đọc đoạn trích / ngữ liệu sau và trả lời:
                  </span>
                  {q.readingPassage}
                </div>
              )}

              {/* Question Text */}
              <div className="text-xs leading-relaxed text-slate-900 font-medium whitespace-pre-line mb-3">
                {q.question}
              </div>

              {/* Sub-items for True/False (format GDPT 2018 4 sub-items a, b, c, d) */}
              {q.subItems && q.subItems.length > 0 && (
                <div className="space-y-1.5 pl-4 mb-3">
                  {q.subItems.map((sub) => (
                    <div key={sub.id} className="text-xs text-slate-800 flex items-start gap-2">
                      <span className="font-bold text-slate-700">{sub.id})</span>
                      <span>{sub.statement}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Options for MCQ */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pl-4">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className="text-xs text-slate-800 p-2 rounded-lg bg-slate-50/50 border border-slate-100"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add question button (Hidden when printing) */}
      <div className="mt-8 pt-4 border-t border-dashed border-slate-200 flex justify-center print:hidden">
        <button
          type="button"
          onClick={onAddQuestion}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Thêm câu hỏi mới vào đề
        </button>
      </div>

      {/* Official Exam Footer */}
      <div className="mt-12 pt-6 border-t-2 border-slate-800 text-center text-xs space-y-2">
        <p className="font-bold tracking-widest uppercase">----------------- HẾT -----------------</p>
        <p className="italic text-slate-500">(Cán bộ coi thi không giải thích gì thêm)</p>

        {/* Academic Safety Notice Requirement #28 */}
        <div className="pt-6 text-[11px] text-slate-400 italic text-center print:hidden border-t border-slate-100 mt-6">
          <p>
            Đề được AI hỗ trợ tạo. Giáo viên cần kiểm duyệt nội dung, đáp án và mức độ phù hợp trước khi sử dụng chính thức.
          </p>
        </div>
      </div>
    </div>
  );
};
