import React from 'react';
import { TestCodeExam, Question } from '../../types/exam';
import { Award, CheckCircle2, FileQuestion } from 'lucide-react';

interface AnswerKeyTableProps {
  currentTestCode: string;
  testCodes: TestCodeExam[];
  onSelectTestCode: (code: string) => void;
}

export const AnswerKeyTable: React.FC<AnswerKeyTableProps> = ({
  currentTestCode,
  testCodes,
  onSelectTestCode,
}) => {
  const currentExam = testCodes.find((t) => t.code === currentTestCode) || testCodes[0];
  const { questions, answerKey } = currentExam;

  const mcqQuestions = questions.filter(
    (q) => q.questionType === 'mcq_4' || q.questionType === 'mcq_multi' || q.questionType === 'true_false' || q.questionType === 'short_answer' || q.questionType === 'matching' || q.questionType === 'fill_blank'
  );
  const essayQuestions = questions.filter((q) => !mcqQuestions.includes(q));

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 md:p-8 space-y-6">
      {/* Code switcher */}
      {testCodes.length > 1 && (
        <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-900">Xem đáp án mã đề:</span>
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
                Mã {tc.code}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          BẢNG ĐÁP ÁN TRẮC NGHIỆM – MÃ ĐỀ {currentExam.code}
        </h3>
        <p className="text-xs text-slate-500">
          Tra cứu nhanh đáp án chính xác và điểm số của từng câu hỏi trắc nghiệm
        </p>
      </div>

      {/* Grid of MCQ Answers */}
      {mcqQuestions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                <th className="py-2.5 px-3 border-r border-slate-200 w-16 text-center">Câu</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-28 text-center">Đáp án</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-20 text-center">Điểm</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-28">Dạng câu</th>
                <th className="py-2.5 px-3 border-r border-slate-200 w-28">Mức độ</th>
                <th className="py-2.5 px-4">Hướng dẫn giải / Căn cứ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mcqQuestions.map((q, idx) => {
                const qNum = questions.indexOf(q) + 1;
                return (
                  <tr key={q.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-slate-900">
                      {qNum}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-extrabold text-blue-700 bg-blue-50/50">
                      {q.correctAnswer}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-semibold text-slate-700">
                      {q.score}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600">
                      {q.questionTypeName || q.questionType}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100">
                        {q.level}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 leading-relaxed text-[11px]">
                      {q.explanation || 'Đáp án chính xác theo quy chuẩn chương trình.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Đề thi này không có câu hỏi trắc nghiệm.</p>
      )}

      {/* Essay Answers & Detailed Guidelines */}
      {essayQuestions.length > 0 && (
        <div className="pt-6 border-t border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 mb-1">
              <FileQuestion className="w-4 h-4 text-indigo-600" />
              ĐÁP ÁN & LỜI GIẢI CHI TIẾT PHẦN TỰ LUẬN
            </h3>
            <p className="text-xs text-slate-500">
              Gợi ý các bước giải, tiêu chí đạt và thang điểm thành phần
            </p>
          </div>

          <div className="space-y-4">
            {essayQuestions.map((q) => {
              const qNum = questions.indexOf(q) + 1;
              return (
                <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      Câu {qNum} ({q.score} điểm) - {q.level}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {q.questionTypeName || 'Tự luận'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">{q.question}</p>

                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] font-bold text-indigo-900 block mb-1">
                      Lời giải / Gợi ý chấm chi tiết:
                    </span>
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200">
                      {q.explanation || q.correctAnswer || 'Học sinh trình bày đúng các bước theo chuẩn đáp án.'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
